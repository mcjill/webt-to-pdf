#!/usr/bin/python

from playwright.async_api import async_playwright
import asyncio
from rich.console import Console
from rich import print
import typer
import validators
import os
from rich.progress import Progress, SpinnerColumn, TextColumn
from urllib.parse import urlparse
import re
from datetime import datetime

class Web2PDFConverter:
    def __init__(self):
        self.console = Console()
        # Create pdfs directory if it doesn't exist
        self.pdf_dir = os.path.join(os.getcwd(), 'pdfs')
        os.makedirs(self.pdf_dir, exist_ok=True)
        
    def generate_filename(self, url, title=None):
        """Generate a unique filename for the PDF"""
        # Use title if available, otherwise use domain name
        if title:
            # Clean the title to make it filesystem-friendly
            name = re.sub(r'[^\w\s-]', '', title)
            name = re.sub(r'[-\s]+', '-', name).strip('-')
        else:
            # Use domain name from URL
            domain = urlparse(url).netloc
            name = domain.replace('.', '-')
        
        # Add timestamp to ensure uniqueness
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{name}_{timestamp}.pdf"
        
    async def capture_page_content(self, url):
        """Capture page content using Playwright with JavaScript rendering"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ]
                )
                
                context = await browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                
                page = await context.new_page()
                
                try:
                    # Set default timeout
                    page.set_default_timeout(30000)
                    
                    # First try with domcontentloaded
                    try:
                        await page.goto(url, wait_until='domcontentloaded', timeout=30000)
                    except Exception as e:
                        print(f"Warning: Initial load failed, retrying with commit: {str(e)}")
                        # If that fails, try with commit
                        await page.goto(url, wait_until='commit', timeout=30000)
                    
                    # Try to wait for network idle, but don't fail if it times out
                    try:
                        await page.wait_for_load_state('networkidle', timeout=5000)
                    except:
                        print("Warning: Network did not reach idle state")
                    
                    # Wait for body with a shorter timeout
                    try:
                        await page.wait_for_selector('body', timeout=5000)
                    except:
                        print("Warning: Could not find body element")
                    
                    # Short wait for any remaining renders
                    await asyncio.sleep(2)
                    
                    # Get page title
                    try:
                        title = await page.title()
                    except:
                        title = None
                        print("Warning: Could not get page title")
                    
                    # Get page dimensions with fallback
                    try:
                        dimensions = await page.evaluate('''() => {
                            return {
                                width: Math.min(
                                    Math.max(
                                        document.documentElement.scrollWidth,
                                        document.documentElement.clientWidth,
                                        1024
                                    ),
                                    1920
                                ),
                                height: Math.min(
                                    Math.max(
                                        document.documentElement.scrollHeight,
                                        document.documentElement.clientHeight,
                                        768
                                    ),
                                    20000
                                )
                            }
                        }''')
                    except:
                        print("Warning: Using fallback dimensions")
                        dimensions = {'width': 1024, 'height': 768}
                    
                    # Set viewport
                    await page.set_viewport_size({
                        'width': dimensions['width'],
                        'height': dimensions['height']
                    })
                    
                    # Generate filename
                    filename = self.generate_filename(url, title)
                    pdf_path = os.path.join(self.pdf_dir, filename)
                    
                    # Save PDF
                    await page.pdf(
                        path=pdf_path,
                        width=f"{dimensions['width']}px",
                        height=f"{dimensions['height']}px",
                        print_background=True,
                        margin={'top': '0px', 'right': '0px', 'bottom': '0px', 'left': '0px'}
                    )
                    
                    return pdf_path
                    
                except Exception as e:
                    print(f"Error during page processing: {str(e)}")
                    raise
                finally:
                    await page.close()
                    await context.close()
                    await browser.close()
                    
        except Exception as e:
            print(f"Error capturing page content: {e}")
            raise Exception(f"Failed to convert webpage: {str(e)}")
    
    async def _scroll_page(self, page):
        """Scroll through the page to trigger lazy loading"""
        try:
            await page.evaluate('''async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.documentElement.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        
                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }''')
        except Exception as e:
            print(f"Warning: Error during page scrolling: {e}")
            
    async def process_urls(self, url_list):
        """Process URLs and convert to PDF"""
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                transient=True,
            ) as progress:
                progress.add_task(
                    description="[green]Converting webpages to PDF...", total=None)
                
                # Process each URL
                for url in url_list:
                    pdf_path = await self.capture_page_content(url)
                    if pdf_path:
                        self.console.print(f"\nPDF saved as: [green]{os.path.basename(pdf_path)}[/green] in [blue]pdfs/[/blue] folder \n")
                    else:
                        self.console.print(f"\n[red]Failed to convert {url} to PDF[/red]\n")

        except Exception as e:
            print(f"Error processing URLs: {e}")

    def get_valid_urls(self):
        """Get valid URLs from the user"""
        try:
            urls = input("\nEnter the URL(s) separated by comma (,): ")
            url_list = [url.strip() for url in urls.split(',')]
            
            valid_urls = []
            for url in url_list:
                if validators.url(url):
                    valid_urls.append(url)
                else:
                    self.console.print(
                        f"\n[red]Invalid URL: {url}[/red]")
            
            return valid_urls
        except Exception as e:
            print(f"Error getting valid URLs: {e}")
            return []

    def main(self):
        """
        Convert web pages to a PDF File.
        Provide list of URL's as command line.
        """
        try:
            self.console.print(
                "\n[bold Green]Welcome to Web2PDF! By @dvcoolarun [/bold Green]",
                "\n[bold Yellow]If this CLI is helpful to you, please consider supporting me by buying me a coffee :coffee: https://www.buymeacoffee.com/web2pdf[/bold Yellow]")
            self.console.print(
                "\n[bold red]Please provide the list of URLs to convert to PDF. :link:[/bold red]")

            valid_urls = self.get_valid_urls()

            if valid_urls:
                asyncio.run(self.process_urls(valid_urls))
            else:
                self.console.print(
                    "\n[red]No URLs provided. Exiting... :bye:[/red]")

        except KeyboardInterrupt:
            self.console.print(
                "[red]Process interrupted by user. Exiting...[/red]")
            raise typer.Exit()

if __name__ == "__main__":
    typer.run(Web2PDFConverter().main)
