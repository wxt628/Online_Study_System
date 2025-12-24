from datetime import datetime
import os
import shutil
from fastapi import UploadFile

BASE_UPLOAD_DIR = "uploads"
SUBMISSIONS_DIR = os.path.join(BASE_UPLOAD_DIR, "submissions")
FILES_DIR = os.path.join(BASE_UPLOAD_DIR, "files")

os.makedirs(SUBMISSIONS_DIR, exist_ok=True)
os.makedirs(FILES_DIR, exist_ok=True)


def _local_path_from_url(url: str) -> str:
    # Expect URLs like /uploads/files/<name> or /files/submissions/<id>/<name>
    if url.startswith('/'):
        url = url[1:]
    return os.path.join(os.getcwd(), url.replace('/', os.sep))


def save_submission_file(upload_file: UploadFile, submission_id: int) -> tuple[str, int]:
    filename = f"{submission_id}_{upload_file.filename}"
    path = os.path.join(SUBMISSIONS_DIR, filename)
    with open(path, 'wb') as f:
        shutil.copyfileobj(upload_file.file, f)
    file_url = f"/uploads/submissions/{filename}"
    size = os.path.getsize(path)
    return file_url, size


def save_uploaded_file(upload_file: UploadFile) -> tuple[str, int, str]:
    ts = int(datetime.utcnow().timestamp())
    filename = f"{ts}_{upload_file.filename}"
    path = os.path.join(FILES_DIR, filename)
    with open(path, 'wb') as f:
        shutil.copyfileobj(upload_file.file, f)
    file_url = f"/uploads/files/{filename}"
    size = os.path.getsize(path)
    return file_url, size, filename


def delete_by_url(file_url: str) -> bool:
    # delete local file by url if exists
    local = _local_path_from_url(file_url)
    if os.path.exists(local):
        os.remove(local)
        return True
    return False
