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
from sqlalchemy import func


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
		
		return [MiniProgramOut( x.program_id, x.name, x.icon_url, x.description, x.url, x.category, x.is_active, x.display_order, x.created_at ) for x in items ]
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
		
		return [CourseOut( x.course_id, x.course_code, x.name, x.teacher, x.semester ) for x in items ]
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
		
		return CourseOut(
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
		x = db.query(database.Assignment).filter(database.Assignment.assignment_id == assignment_id).first()

		if not x:
			raise HTTPException(status_code=404, detail={"error": {"message": "作业不存在"}})
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

FILES_UPLOAD_DIR = "uploads/files"

# Ensure any new tables (e.g., post_likes) are created
try:
	database.Base.metadata.create_all(bind=database.engine)
except Exception:
	pass

### 帖子 / 评论 / 点赞 实现 ###

@app.get("/api/v1/posts")
def list_posts(
	category: str | None = None,
	sort_by: str | None = Query("created_at"),
	order: str | None = Query("desc"),
	page: int = Query(1, ge=1),
	pageSize: int = Query(20, ge=1, le=200),
	_: database.User = Depends(get_current_user)
):
	db = database.SessionLocal()
	try:
		q = db.query(database.Post)
		if category:
			q = q.filter(database.Post.category == category)

		total = q.count()
		if sort_by == 'like_count':
			order_col = database.Post.like_count
		elif sort_by == 'view_count':
			order_col = database.Post.view_count
		else:
			order_col = database.Post.created_at

		if order == 'asc':
			q = q.order_by(asc(order_col))
		else:
			q = q.order_by(desc(order_col))

		items = q.offset((page-1)*pageSize).limit(pageSize).all()

		result_items = []
		for p in items:
			comment_count = db.query(func.count(database.Comment.comment_id)).filter(database.Comment.post_id == p.post_id).scalar()
			result_items.append({
				'post_id': p.post_id,
				'title': p.title,
				'content_preview': (p.content[:120] + '...') if p.content and len(p.content) > 120 else p.content,
				'author': { 'user_id': p.user_id },
				'category': p.category,
				'like_count': p.like_count,
				'view_count': p.view_count,
				'comment_count': comment_count,
				'created_at': p.created_at,
			})

		return { 'code': 200, 'message': '成功', 'data': { 'items': result_items, 'pagination': { 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total / pageSize) } } }
	finally:
		db.close()


@app.get("/api/v1/posts/{post_id}")
def get_post(post_id: int, page: int = Query(1, ge=1), pageSize: int = Query(20, ge=1), _: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
		if not post:
			raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})

		# increment view count
		post.view_count = int(post.view_count) + 1
		db.commit()

		# comments pagination (top-level comments)
		comments_q = db.query(database.Comment).filter(database.Comment.post_id == post_id, database.Comment.parent_id == None).order_by(database.Comment.created_at.desc())
		total_comments = comments_q.count()
		comments = comments_q.offset((page-1)*pageSize).limit(pageSize).all()

		def to_comment_obj(c):
			replies = []
			for r in c.replies:
				replies.append({ 'comment_id': r.comment_id, 'post_id': r.post_id, 'user_id': r.user_id, 'content': r.content, 'parent_id': r.parent_id, 'created_at': r.created_at })
			return { 'comment_id': c.comment_id, 'post_id': c.post_id, 'user_id': c.user_id, 'content': c.content, 'parent_id': c.parent_id, 'created_at': c.created_at, 'replies': replies }

		comment_items = [ to_comment_obj(c) for c in comments ]

		return { 'code': 200, 'message': '成功', 'data': { 'post': { 'post_id': post.post_id, 'title': post.title, 'content': post.content, 'user_id': post.user_id, 'category': post.category, 'like_count': post.like_count, 'view_count': post.view_count, 'created_at': post.created_at, 'updated_at': post.updated_at }, 'comments': { 'items': comment_items, 'pagination': { 'total': total_comments, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total_comments / pageSize) } } } }
	finally:
		db.close()


@app.post("/api/v1/posts")
def create_post(title: str = Form(...), content: str = Form(...), category: str | None = Form(None), current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		p = database.Post(user_id=current_user.user_id, title=title, content=content, category=(category or '校园'))
		db.add(p)
		db.commit()
		db.refresh(p)
		return { 'code': 200, 'message': '帖子发布成功', 'data': { 'post_id': p.post_id, 'user_id': p.user_id, 'title': p.title, 'content': p.content, 'category': p.category, 'like_count': p.like_count, 'view_count': p.view_count, 'created_at': p.created_at } }
	finally:
		db.close()


@app.put("/api/v1/posts/{post_id}")
def edit_post(post_id: int, title: str | None = Form(None), content: str | None = Form(None), category: str | None = Form(None), current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
		if not post:
			raise HTTPException(status_code=404, detail="帖子不存在")
		if post.user_id != current_user.user_id:
			raise HTTPException(status_code=403, detail="没有权限")
		if title:
			post.title = title
		if content:
			post.content = content
		if category:
			post.category = category
		post.updated_at = datetime.utcnow()
		db.commit()
		return { 'code': 200, 'message': '更新成功', 'data': { 'post_id': post.post_id } }
	finally:
		db.close()


@app.delete("/api/v1/posts/{post_id}")
def delete_post(post_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
		if not post:
			raise HTTPException(status_code=404, detail="帖子不存在")
		if post.user_id != current_user.user_id:
			raise HTTPException(status_code=403, detail="没有权限")
		db.delete(post)
		db.commit()
		return { 'code': 200, 'message': '删除成功', 'data': None }
	finally:
		db.close()


@app.post("/api/v1/posts/{post_id}/comments")
def create_comment(post_id: int, content: str = Form(...), parent_id: int | None = Form(None), current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
		if not post:
			raise HTTPException(status_code=404, detail="帖子不存在")
		c = database.Comment(post_id=post_id, user_id=current_user.user_id, content=content, parent_id=parent_id)
		db.add(c)
		db.commit()
		db.refresh(c)
		return { 'code': 200, 'message': '评论发表成功', 'data': { 'comment_id': c.comment_id, 'post_id': c.post_id, 'user_id': c.user_id, 'content': c.content, 'parent_id': c.parent_id, 'created_at': c.created_at } }
	finally:
		db.close()


@app.delete("/api/v1/comments/{comment_id}")
def delete_comment(comment_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		c = db.query(database.Comment).filter(database.Comment.comment_id == comment_id).first()
		if not c:
			raise HTTPException(status_code=404, detail="评论不存在")
		if c.user_id != current_user.user_id:
			raise HTTPException(status_code=403, detail="没有权限")
		db.delete(c)
		db.commit()
		return { 'code': 200, 'message': '删除成功', 'data': None }
	finally:
		db.close()


@app.post("/api/v1/posts/{post_id}/like")
def toggle_like(post_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
		if not post:
			raise HTTPException(status_code=404, detail="帖子不存在")

		# 使用 post_likes 表切换点赞
		existing = None
		try:
			existing = db.query(database.PostLike).filter(database.PostLike.post_id == post_id, database.PostLike.user_id == current_user.user_id).first()
		except Exception:
			existing = None

		if existing:
			db.delete(existing)
			post.like_count = max(0, int(post.like_count) - 1)
			db.commit()
			return { 'code': 200, 'message': '取消点赞', 'data': { 'post_id': post_id, 'like_count': post.like_count, 'is_liked': False } }
		else:
			try:
				like = database.PostLike(post_id=post_id, user_id=current_user.user_id)
				db.add(like)
				post.like_count = int(post.like_count) + 1
				db.commit()
			except Exception:
				db.rollback()
				raise
			return { 'code': 200, 'message': '点赞成功', 'data': { 'post_id': post_id, 'like_count': post.like_count, 'is_liked': True } }
	finally:
		db.close()

### 通知接口 ###

@app.get('/api/v1/notifications')
def list_notifications(page: int = Query(1, ge=1), pageSize: int = Query(20, ge=1), is_read: bool | None = None, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		q = db.query(database.Notification).filter(database.Notification.user_id == current_user.user_id)
		if is_read is not None:
			q = q.filter(database.Notification.is_read == is_read)
		total = q.count()
		items = q.order_by(database.Notification.created_at.desc()).offset((page-1)*pageSize).limit(pageSize).all()
		result = []
		for n in items:
			result.append({ 'notification_id': n.notification_id, 'user_id': n.user_id, 'title': n.title, 'content': n.content, 'type': n.type, 'is_read': n.is_read, 'related_url': n.related_url, 'created_at': n.created_at })
		return { 'code':200, 'message':'成功', 'data': { 'items': result, 'pagination': { 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total / pageSize) } } }
	finally:
		db.close()


@app.put('/api/v1/notifications/{notification_id}/read')
def mark_notification_read(notification_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		n = db.query(database.Notification).filter(database.Notification.notification_id == notification_id, database.Notification.user_id == current_user.user_id).first()
		if not n:
			raise HTTPException(status_code=404, detail='通知不存在')
		n.is_read = True
		db.commit()
		return { 'code':200, 'message':'已标记为已读', 'data': { 'notification_id': n.notification_id, 'is_read': True } }
	finally:
		db.close()


@app.put('/api/v1/notifications/read-all')
def mark_all_notifications_read(current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		db.query(database.Notification).filter(database.Notification.user_id == current_user.user_id, database.Notification.is_read == False).update({ 'is_read': True })
		db.commit()
		return { 'code':200, 'message':'全部已读', 'data': None }
	finally:
		db.close()

### 文件接口 ###

@app.post('/api/v1/files/upload')
def upload_file(file: UploadFile = File(...), purpose: str | None = Form(None), related_id: int | None = Form(None), current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		os.makedirs(FILES_UPLOAD_DIR, exist_ok=True)
		filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
		path = f"{FILES_UPLOAD_DIR}/{filename}"
		with open(path, 'wb') as f:
			shutil.copyfileobj(file.file, f)
		file_url = f"/uploads/files/{filename}"
		rec = database.File(user_id=current_user.user_id, file_name=file.filename, file_url=file_url, file_size=0, mime_type=file.content_type)
		db.add(rec)
		db.commit()
		db.refresh(rec)
		return { 'code':200, 'message':'上传成功', 'data': { 'file_id': rec.file_id, 'file_name': rec.file_name, 'file_url': rec.file_url, 'file_size': rec.file_size, 'mime_type': rec.mime_type, 'user_id': rec.user_id, 'created_at': rec.created_at } }
	finally:
		db.close()


@app.get('/api/v1/files/{file_id}')
def get_file_info(file_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		f = db.query(database.File).filter(database.File.file_id == file_id).first()
		if not f:
			raise HTTPException(status_code=404, detail='文件不存在')
		return { 'code':200, 'message':'成功', 'data': { 'file_id': f.file_id, 'file_name': f.file_name, 'file_url': f.file_url, 'file_size': f.file_size, 'mime_type': f.mime_type, 'user_id': f.user_id, 'created_at': f.created_at } }
	finally:
		db.close()


@app.get('/api/v1/files/{file_id}/download')
def download_file(file_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		f = db.query(database.File).filter(database.File.file_id == file_id).first()
		if not f:
			raise HTTPException(status_code=404, detail='文件不存在')
		# 本实现简单返回文件路径（生产环境请使用安全的文件服务或临时签名 URL）
		return { 'code':200, 'message':'成功', 'data': { 'file_url': f.file_url } }
	finally:
		db.close()


@app.delete('/api/v1/files/{file_id}')
def delete_file(file_id: int, current_user: database.User = Depends(get_current_user)):
	db = database.SessionLocal()
	try:
		f = db.query(database.File).filter(database.File.file_id == file_id).first()
		if not f:
			raise HTTPException(status_code=404, detail='文件不存在')
		if f.user_id != current_user.user_id:
			raise HTTPException(status_code=403, detail='没有权限')
		db.delete(f)
		db.commit()
		return { 'code':200, 'message':'删除成功', 'data': None }
	finally:
		db.close()


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
	
	
