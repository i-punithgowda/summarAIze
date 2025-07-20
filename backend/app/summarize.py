import difflib
import zipfile
import io

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
    # Stub: Replace with LLM call (e.g., Ollama) if available
    summary = f"Summary for diff:\n{diff[:200]}..."
    suggestions = ["Suggestion 1", "Suggestion 2"]
    return summary, suggestions 