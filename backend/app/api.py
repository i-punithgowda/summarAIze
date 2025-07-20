from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
import os
from git import Repo, InvalidGitRepositoryError, GitCommandError
from .summarize import extract_diff, generate_summary

def safe_utf8(text):
    if not isinstance(text, str):
        text = str(text)
    return text.encode('utf-8', 'replace').decode('utf-8')

router = APIRouter()

class RepoPathRequest(BaseModel):
    path: str

class CompareBranchesRequest(BaseModel):
    path: str
    base_branch: str
    compare_branch: str

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

@router.post("/compare-branches")
async def compare_branches(request: CompareBranchesRequest):
    path = request.path
    base_branch = request.base_branch
    compare_branch = request.compare_branch
    if not path or not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Invalid project path.")
    try:
        repo = Repo(path)
        # Find the full ref names for the branches
        def find_full_ref(branch):
            # Try local first
            for head in repo.heads:
                if branch == 'main' and head.name == 'main':
                    return head.name
                if '/'.join(head.name.split('/')[-2:]) == branch:
                    return head.name
            # Try remotes
            for remote in repo.remotes:
                for ref in remote.refs:
                    if '/'.join(ref.name.split('/')[-2:]) == branch:
                        return ref.name
            return None
        base_ref = find_full_ref(base_branch)
        compare_ref = find_full_ref(compare_branch)
        if not base_ref or not compare_ref:
            raise HTTPException(status_code=404, detail="Branch not found.")
        # Get the diff between the two branches (name-status to get changed files)
        diff_index = repo.git.diff(f'{base_ref}..{compare_ref}', name_status=True)
        changed_files = []
        for line in diff_index.splitlines():
            parts = line.strip().split('\t')
            if len(parts) == 2:
                status, file_path = parts
            elif len(parts) == 3:  # e.g., R100	src/oldname.py	src/newname.py
                status, _, file_path = parts
            else:
                continue
            # Get old and new content
            try:
                old_blob = repo.git.show(f'{base_ref}:{file_path}') if status != 'A' else ''
            except Exception:
                old_blob = ''
            try:
                new_blob = repo.git.show(f'{compare_ref}:{file_path}') if status != 'D' else ''
            except Exception:
                new_blob = ''
            # Summarize changes for this file
            diff_text = repo.git.diff(f'{base_ref}..{compare_ref}', '--', file_path)
            summary, suggestions = generate_summary(diff_text)
            changed_files.append({
                "file": safe_utf8(file_path),
                "old_content": safe_utf8(old_blob),
                "new_content": safe_utf8(new_blob),
                "summary": safe_utf8(summary),
                "suggestions": [safe_utf8(s) for s in suggestions]
            })
        return {"files": changed_files}
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=404, detail="Not a git repository.")
    except GitCommandError as e:
        raise HTTPException(status_code=400, detail=f"Git error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing branches: {e}")

@router.post("/summarize-pr")
async def summarize_pr(file: UploadFile = File(...)):
    content = await file.read()
    diff = extract_diff(content, file.filename)
    summary, suggestions = generate_summary(diff)
    return {"summary": summary, "suggestions": suggestions, "diff": diff} 