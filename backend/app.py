from fastapi.middleware.cors import CORSMiddleware

from fastapi import Depends, Header, FastAPI, Query, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Enum, ForeignKey, DECIMAL, and_, or_, asc, desc
from sqlalchemy.orm import sessionmaker, relationship, joinedload, declarative_base
from typing import Optional
import os, shutil
import math

from src.security import create_access_token, get_current_user

import hashlib, src.database as database


app = FastAPI(title="Campus Platform API", version="1.0.0")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:5173"],
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
	user_id: int
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

"""获取小程序列表"""
class MiniProgramOut(BaseModel):
	program_id: int
	name: str
	icon_url: str
	description: str
	url: str
	category: str
	is_active: bool
	display_order: int
	created_at: str

class MiniProgramList(BaseModel):
	mini_programs_list: list[MiniProgramOut]
	page: int
	page_size: int
	page_count: int

@app.get("/api/v1/mini-programs", response_model=list[MiniProgramOut])
def get_mini_programs(
	category: str | None = None,
	_: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		query = db.query(database.MiniProgram)
		if category:
			query = query.filter(database.MiniProgram.category == category)
		items = query.all()
		
		return [MiniProgramOut( x.program_id, x.name, x.icon_url, x.description, x.url, x.category, x.is_active, x.display_order, x.created_at ) for x in items ],
	finally:
		db.close()

"""获取当前课程列表"""
class CourseOut(BaseModel):
	course_id: int
	course_code: str
	name: str
	teacher: str
	semester: str

@app.get("/api/v1/courses", response_model=list[CourseOut])
def get_courses(
	semester: str | None = None,
	_: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		query = db.query(database.Course)
		if semester:
			query = query.filter(database.Course.semester == semester)
		items = query.all()
		
		return [MiniProgramOut( x.course_id, x.course_code, x.name, x.teacher, x.semester ) for x in items ],
	finally:
		db.close()

"""获取课程详细信息"""
@app.get("/api/v1/courses/{course_id}", response_model=CourseOut)
def get_course_detail(course_id: int, _: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		course = db.query(database.Course).filter(database.Course.course_id == course_id).first()
		if not course:
			raise HTTPException(status_code=401, detail={
				"error": { "message": "课程不存在" }
			})
		
		return MiniProgramOut(
			course.course_id,
			course.course_code,
			course.name,
			course.teacher,
			course.semester,
		)
	finally:
		db.close()

"""获取课程作业列表"""
class AssignmentOut(BaseModel):
	assignment_id: int
	course_id: int
	title: str
	description: str
	attachment_url: str
	deadline: str
	created_at: str

@app.get("/api/v1/courses/{course_id}/assignments", response_model=list[AssignmentOut])
def get_course_assignments(
	course_id: int,
	_: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		# 1. 确认课程存在
		course = db.query(database.Course).filter(database.Course.course_id == course_id).first()
		if not course:
			raise HTTPException(
				status_code=404,
				detail={"error": {"message": "课程不存在"}}
			)

		# 2. 查询该课程的作业
		assignments = db.query(database.Assignment).filter(database.Assignment.course_id == course_id).order_by(database.Assignment.deadline).all()

		# 3. 返回作业列表
		return [AssignmentOut( x.assignment_id, x.course_id, x.title, x.description, x.attachment_url, x.deadline, x.created_at ) for x in assignments ]
	finally:
		db.close()

"""根据作业编号获取作业详细"""
@app.get("/api/v1/assignments/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
	assignment_id: int,
	_: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		x = db.query(database.Assignment).filter(database.Assignment.course_id == assignment_id).order_by(database.Assignment.deadline).first()

		return AssignmentOut( x.assignment_id, x.course_id, x.title, x.description, x.attachment_url, x.deadline, x.created_at )
	finally:
		db.close()

"""提交作业"""
class SubmissionOut(BaseModel):
	submission_id: int
	assignment_id: int
	user_id: int
	file_url: str
	submitted_at: datetime
	score: int | None
	feedback: str | None

UPLOAD_DIR = "uploads/submissions"

@app.post(
	"/api/v1/assignments/{assignment_id}/submit",
	response_model=SubmissionOut
)
def submit_assignment(
	assignment_id: int,
	file: UploadFile = File(...),
	comment: str | None = Form(None),
	current_user: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		assignment = db.query(database.Assignment).filter(database.Assignment.assignment_id == assignment_id).first()

		if not assignment:
			raise HTTPException(
				status_code=404,
				detail={"error": {"message": "作业不存在"}}
			)

		submission = database.Submission(
			assignment_id=assignment_id,
			user_id=current_user.user_id,
			comment=comment,
			submitted_at=datetime.utcnow()
		)
		db.add(submission)
		db.commit()
		db.refresh(submission)

		os.makedirs(UPLOAD_DIR, exist_ok=True)
		file_path = f"{UPLOAD_DIR}/{submission.submission_id}_{file.filename}"

		with open(file_path, "wb") as f:
			shutil.copyfileobj(file.file, f)

		file_url = f"/files/submissions/{submission.submission_id}/{file.filename}"

		submission.file_url = file_url
		db.commit()
		db.refresh(submission)

		return SubmissionOut(
			submission_id=submission.submission_id,
			assignment_id=submission.assignment_id,
			user_id=current_user.user_id,
			file_url=submission.file_url,
			submitted_at=submission.submitted_at,
			score=submission.score,
			feedback=submission.feedback
		)
	finally:
		db.close()
