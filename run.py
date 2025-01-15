from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from main import Web2PDFConverter
import asyncio
import validators
from typing import Optional

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

@app.post("/convert")
async def convert_url(request: URLRequest):
    try:
        # Validate URL
        if not validators.url(request.url):
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Initialize converter
        converter = Web2PDFConverter()
        
        try:
            # Convert URL to PDF
            pdf_path = await converter.capture_page_content(request.url)
            
            if not pdf_path or not os.path.exists(pdf_path):
                raise HTTPException(status_code=500, detail="Failed to generate PDF")

            return {"pdf_path": os.path.basename(pdf_path)}

        except Exception as e:
            error_msg = str(e)
            if "net::ERR_NAME_NOT_RESOLVED" in error_msg:
                raise HTTPException(status_code=400, detail="Could not resolve the website URL. Please check if the URL is correct.")
            elif "net::ERR_CONNECTION_TIMED_OUT" in error_msg:
                raise HTTPException(status_code=408, detail="Connection to the website timed out. Please try again.")
            elif "net::ERR_CONNECTION_REFUSED" in error_msg:
                raise HTTPException(status_code=503, detail="Website is not accessible at the moment.")
            else:
                raise HTTPException(status_code=500, detail=f"Failed to convert webpage: {error_msg}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_pdf(filename: str):
    pdf_dir = os.path.join(os.getcwd(), 'pdfs')
    file_path = os.path.join(pdf_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
        
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename,
        background=asyncio.create_task(delete_file(file_path))
    )

async def delete_file(file_path: str):
    """Delete the file after it has been downloaded"""
    await asyncio.sleep(5)  # Wait a bit to ensure download completes
    try:
        os.remove(file_path)
    except:
        pass  # Ignore deletion errors

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
