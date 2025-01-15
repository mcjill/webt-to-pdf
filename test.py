from main import Web2PDFConverter
import asyncio

async def test_conversion():
    converter = Web2PDFConverter()
    url = "https://www.wireshark.org/"  # Simple test URL
    try:
        pdf_path = await converter.capture_page_content(url)
        print(f"Success! PDF saved at: {pdf_path}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_conversion())
