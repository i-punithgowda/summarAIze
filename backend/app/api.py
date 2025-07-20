from fastapi import APIRouter, UploadFile, File
from .summarize import extract_diff, generate_summary

router = APIRouter()

@router.post("/summarize-pr")
async def summarize_pr(file: UploadFile = File(...)):
    content = await file.read()
    diff = extract_diff(content, file.filename)
    summary, suggestions = generate_summary(diff)
    return {"summary": summary, "suggestions": suggestions, "diff": diff} 