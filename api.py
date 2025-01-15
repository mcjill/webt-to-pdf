from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from main import Web2PDFConverter
import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

@app.post("/convert")
async def convert_url(request: URLRequest):
    try:
        converter = Web2PDFConverter()
        pdf_path = await converter.capture_page_content(request.url)
        if not pdf_path:
            raise HTTPException(status_code=500, detail="Failed to convert URL to PDF")
        return {"status": "success", "pdf_path": os.path.basename(pdf_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_pdf(filename: str):
    pdf_dir = os.path.join(os.getcwd(), 'pdfs')
    pdf_path = os.path.join(pdf_dir, filename)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
        
    # Create a response with the PDF file
    response = FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=filename
    )
    
    # Schedule the file to be deleted after sending
    async def delete_file():
        await asyncio.sleep(1)  # Wait a bit to ensure file is sent
        try:
            os.remove(pdf_path)
        except Exception as e:
            print(f"Error deleting file {pdf_path}: {e}")
            
    asyncio.create_task(delete_file())
    
    return response
