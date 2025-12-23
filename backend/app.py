from fastapi.middleware.cors import CORSMiddleware

from fastapi import Depends, Header, FastAPI, Query, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Enum, ForeignKey, DECIMAL, and_, or_, asc, desc
from sqlalchemy.orm import sessionmaker, relationship, joinedload, declarative_base
from typing import Optional
import math

from src.security import create_access_token, get_current_user

import hashlib, src.database as database


app = FastAPI(title="Campus Platform API", version="1.0.0")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)

""" 登录模块 """
class LoginRequest(BaseModel):
	student_id: str
	password: str

class LoginResponse(BaseModel):
	token: str
	user_id: str
	student_id: str

LOGIN_LOCK_DURATION = timedelta(minutes=5)
MAX_FAILED_ATTEMPTS = 5

def hash_password(salt: str, password: str) -> str:
	return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
	db = database.SessionLocal()
	try:
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
	finally:
		db.close()

""" 查看个人信息 """
class UserInfomation(BaseModel):
	user_id: str
	student_id: str
	name: str
	email: str
	phone: str
	avatar_url: str
	created_at: str
	updated_at: str

@app.get("/api/v1/me", response_model=UserInfomation)
def me(current_user: database.User = Depends(get_current_user)):
	return UserInfomation(
		user_id=current_user.user_id,
		student_id=current_user.student_id,
		name=current_user.name,
		email=current_user.email,
		phone=current_user.phone,
		avatar_url=current_user.avatar_url,
		created_at=current_user.created_at,
		updated_at=current_user.updated_at,
	)

"""修改个人信息"""
class UpdateRequest(BaseModel):
	name: Optional[str] = None
	email: Optional[str] = None
	phone: Optional[str] = None
	avatar_url: Optional[str] = None
	old_password: Optional[str] = None
	new_password: Optional[str] = None

@app.put("/api/v1/users/me")
def update_user_info(
	payload: UpdateRequest,
	current_user: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		user = db.query(database.User).filter(database.User.user_id == current_user.user_id).first()
		if payload.name:
			user.name = payload.name
		if payload.email:
			user.email = payload.email
		if payload.phone:
			user.phone = payload.phone
		if payload.avatar_url:
			user.avatar_url = payload.avatar_url

		if payload.old_password and payload.new_password:
			if hash_password(user.salt, payload.old_password) != user.password_hash:
				raise HTTPException(status_code=400, detail="旧密码错误")
			user.password_hash = hash_password(user.salt, payload.new_password)

		user.updated_at = datetime.utcnow()
		db.commit()
		return {
			"code": 200,
			"message": "更新成功",
			"data": {
				"user_id": current_user.user_id,
				"student_id": current_user.student_id,
				"name": current_user.name,
				"email": current_user.email,
				"phone": current_user.phone,
				"avatar_url": current_user.avatar_url,
				"created_at": current_user.created_at,
				"updated_at": current_user.updated_at,
			}
		}
	finally:
		db.close()
