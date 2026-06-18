# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/convert")
async def convert_to_webp(file: UploadFile = File(...), quality: int = 80):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=quality)
    output.seek(0)
    
    return Response(
        content=output.read(),
        media_type="image/webp",
        headers={"Content-Disposition": "attachment; filename=converted.webp"}
    )