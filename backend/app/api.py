from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
import os
from git import Repo, InvalidGitRepositoryError
from .summarize import extract_diff, generate_summary

router = APIRouter()

class RepoPathRequest(BaseModel):
    path: str

@router.post("/check-repo")
async def check_repo(request: RepoPathRequest):
    path = request.path
    if not path or not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Invalid project path.")
    git_dir = os.path.join(path, ".git")
    if not os.path.isdir(git_dir):
        raise HTTPException(status_code=404, detail="Not a git repository.")
    project_name = os.path.basename(os.path.normpath(path))
    try:
        repo = Repo(path)
        # Get all local branches
        local_branches = [head.name for head in repo.heads]
        # Get all remote branches (if any remotes exist)
        remote_branches = []
        if repo.remotes:
            for remote in repo.remotes:
                remote_branches += [ref.name for ref in remote.refs]
        # Combine and deduplicate
        all_branches = sorted(set(local_branches + remote_branches))
        # Format branch names: 'main' as is, else last two segments
        def format_branch(branch):
            if branch == 'main':
                return 'main'
            parts = branch.split('/')
            if len(parts) >= 2:
                return '/'.join(parts[-2:])
            return branch
        formatted_branches = sorted(set(format_branch(b) for b in all_branches))
        print(f"Local branches: {local_branches}")
        print(f"Remote branches: {remote_branches}")
        print(f"All branches: {all_branches}")
        print(f"Formatted branches: {formatted_branches}")
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=404, detail="Not a git repository.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading branches: {e}")
    return {"project_name": project_name, "branches": formatted_branches}

@router.post("/summarize-pr")
async def summarize_pr(file: UploadFile = File(...)):
    content = await file.read()
    diff = extract_diff(content, file.filename)
    summary, suggestions = generate_summary(diff)
    return {"summary": summary, "suggestions": suggestions, "diff": diff} 