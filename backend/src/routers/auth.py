from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
import secrets
from src import database
from src.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest
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

@router.post("/auth/register", response_model=LoginResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
	existing = db.query(database.User).filter(database.User.student_id == payload.student_id).first()
	if existing:
		raise HTTPException(status_code=409, detail={"error": {"code": "USER_EXISTS", "message": "学号已存在"}})
	if payload.email:
		existing_email = db.query(database.User).filter(database.User.email == payload.email).first()
		if existing_email:
			raise HTTPException(status_code=409, detail={"error": {"code": "EMAIL_EXISTS", "message": "邮箱已被使用"}})
	if not payload.phone.strip():
		raise HTTPException(status_code=422, detail={"error": {"code": "PHONE_REQUIRED", "message": "手机号不能为空"}})
	salt = secrets.token_hex(16)
	password_hash = hashlib.sha256((salt + payload.password).encode('utf-8')).hexdigest()
	user = database.User(
		student_id=payload.student_id,
		password_hash=password_hash,
		salt=salt,
		name=payload.name,
		email=payload.email,
		phone=payload.phone.strip()
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	token = create_access_token(data={"sub": str(user.student_id)})
	return LoginResponse(token=token, user_id=user.user_id, student_id=user.student_id)

@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
	user = db.query(database.User).filter(database.User.student_id == payload.student_id).first()
	if not user:
		raise HTTPException(status_code=404, detail={"error": {"code": "USER_NOT_FOUND", "message": "用户不存在"}})
	
	if user.phone != payload.phone:
		raise HTTPException(status_code=403, detail={"error": {"code": "PHONE_MISMATCH", "message": "手机号不匹配"}})

	# Generate new salt and hash
	salt = secrets.token_hex(16)
	password_hash = hashlib.sha256((salt + payload.new_password).encode('utf-8')).hexdigest()
	
	user.salt = salt
	user.password_hash = password_hash
	# Reset lock status as well since password is reset
	user.failed_attempts = 0
	user.locked_until = None
	
	db.commit()
	
	return {"code": 200, "message": "密码重置成功"}
