from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
from src import database
from src.schemas.auth import LoginRequest, LoginResponse
from src.security import create_access_token
from src.dependencies import get_db

router = APIRouter()

LOGIN_LOCK_DURATION = timedelta(minutes=5)
MAX_FAILED_ATTEMPTS = 5

def hash_password(salt: str, password: str) -> str:
	return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
	user = db.query(database.User).filter(database.User.student_id == payload.student_id).first()

	if not user:
		raise HTTPException(status_code=401, detail={
			"error": { "message": "用户不存在" }
		})

	now = datetime.utcnow()
	if user.locked_until and user.locked_until > now:
		raise HTTPException(status_code=423, detail={
			"error": {"code": "ACCOUNT_LOCKED", "message": "账户已锁定，请在 5 分钟后重试。"}
		})

	expected_hash = user.password_hash
	salt = user.salt
	if hash_password(salt, payload.password) != expected_hash:
		user.failed_attempts = int(user.failed_attempts) + 1
		db.commit()
		if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
			user.locked_until = now + LOGIN_LOCK_DURATION
			db.commit()
			raise HTTPException(status_code=423, detail={
				"error": {"code": "ACCOUNT_LOCKED", "message": "账户已锁定，请在 5 分钟后重试。"}
			})
		raise HTTPException(status_code=401, detail={
			"error": {"code": "UNAUTHORIZED", "message": "用户名或密码错误。"}
		})

	user.failed_attempts = 0
	user.locked_until = None
	db.commit()

	token = create_access_token(
		data={ "sub": str(user.student_id) }
	)
	return LoginResponse(
		token=token,
		user_id=user.user_id,
		student_id=user.student_id
	)
