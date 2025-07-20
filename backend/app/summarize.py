import difflib
import zipfile
import io
import requests

def extract_diff(content: bytes, filename: str) -> str:
    if filename.endswith('.diff'):
        return content.decode()
    elif filename.endswith('.zip'):
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            files = sorted(z.namelist())
            if len(files) < 2:
                return "Not enough files in zip."
            old = z.read(files[0]).decode().splitlines()
            new = z.read(files[1]).decode().splitlines()
            diff = difflib.unified_diff(old, new, fromfile=files[0], tofile=files[1])
            return '\n'.join(diff)
    return "Unsupported file type."

def generate_summary(diff: str):
    prompt = f"Summarize the following git diff and provide suggestions for improvement:\n\n{diff}"
    try:
        print("starting")
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "phi3:mini", "prompt": prompt, "stream": False},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        summary = result.get("response", "")
        suggestions = []  # Optionally parse suggestions from summary or add logic
        return summary, suggestions
    except Exception as e:
        return f"LLM error: {e}", [] 