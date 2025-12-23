from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Query, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
# from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Enum, ForeignKey, DECIMAL, and_, or_, asc, desc
from sqlalchemy.orm import sessionmaker, relationship, joinedload, declarative_base
import math


import hashlib, secrets, db_struct


app = FastAPI(title="Campus Platform API", version="1.0.0")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)

@app.get("/api/v1/test")
def test():
	return {
		"code": 200,
		"message": "这个 API 还活着",
		"data": {
			"thephix",
			114514,
			"傻逼"
		}
	}

class LoginRequest(BaseModel):
	student_id: str
	password: str

class LoginUserInfo(BaseModel):
	id: int
	student_id: str
	role: str
	force_password_change: bool = True

class LoginResponse(BaseModel):
	token: str
	user: LoginUserInfo

LOGIN_LOCK_DURATION = timedelta(minutes=5)
MAX_FAILED_ATTEMPTS = 5

def hash_password(salt: str, password: str) -> str:
	return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
	db = db_struct.SessionLocal()
	try:
		user = db.query(db_struct.User).filter(db_struct.User.student_id == payload.student_id).first()

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

		# 生成演示用令牌（生产环境请使用 JWT 并设置过期时间等）
		token = secrets.token_urlsafe(32)
		return LoginResponse(
			token=token,
			user=LoginUserInfo(
				id=user.user_id,
				student_id=user.student_id,
				role=user.role,
				force_password_change=bool(user.force_password_change)
			)
		)
	finally:
		db.close()

student_id = "lyk"
password = "123456"
salt = "szuacm2024"
print(hash_password(salt, password))
