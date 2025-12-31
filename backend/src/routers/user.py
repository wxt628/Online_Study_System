from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import hashlib
import secrets
from src import database
from src import storage
from src.schemas.user import UserInfomation
from src.security import get_current_user
from src.dependencies import get_db

router = APIRouter()

@router.post("/user/update")
async def update_user(
	name: str = Form(None),
	email: str = Form(None),
	phone: str = Form(None),
	avatar: UploadFile | None = File(None),
	avatar_url: str | None = Form(None),
	old_password: str = Form(None),
	new_password: str = Form(None),
	current_user: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	user = db.query(database.User).filter(database.User.user_id == current_user.user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="用户不存在")

	if name:
		user.name = name
	if email:
		user.email = email
	if phone is not None:
		p = phone.strip()
		if not p:
			raise HTTPException(status_code=422, detail="手机号不能为空")
		user.phone = p

	# Handle password update
	if old_password and new_password:
		# Verify old password
		current_hash = hashlib.sha256((user.salt + old_password).encode('utf-8')).hexdigest()
		if current_hash != user.password_hash:
			raise HTTPException(status_code=400, detail="旧密码错误")
		
		# Set new password
		new_salt = secrets.token_hex(16)
		new_hash = hashlib.sha256((new_salt + new_password).encode('utf-8')).hexdigest()
		user.salt = new_salt
		user.password_hash = new_hash

	if avatar is not None:
		# delete previous avatar file first if present
		if user.avatar_url:
			try:
				storage.delete_by_url(user.avatar_url)
			except Exception:
				pass
		try:
			file_url, size, filename = storage.save_avatar(avatar)
		except Exception:
			raise HTTPException(status_code=500, detail="保存头像文件失败")
		# store a URL path that the frontend can access directly (e.g. via static server)
		user.avatar_url = file_url
	elif avatar_url:
		# frontend may pass an already-uploaded file URL instead of file
		user.avatar_url = avatar_url

	user.updated_at = datetime.utcnow()
	db.commit()

	return {
		"code": 200,
		"message": "更新成功",
		"data": {
			"user_id": user.user_id,
			"student_id": user.student_id,
			"name": user.name,
			"email": user.email,
			"phone": user.phone,
			"avatar_url": user.avatar_url,
			"created_at": user.created_at.isoformat() if getattr(user, 'created_at', None) else None,
			"updated_at": user.updated_at.isoformat() if getattr(user, 'updated_at', None) else None,
		}
	}

@router.get("/me", response_model=UserInfomation)
def me(current_user: database.User = Depends(get_current_user)):
	return UserInfomation(
		user_id=str(current_user.user_id),
		student_id=current_user.student_id,
		name=current_user.name,
		email=current_user.email,
		phone=current_user.phone,
		avatar_url=current_user.avatar_url,
		created_at=current_user.created_at.isoformat(),
		updated_at=current_user.updated_at.isoformat(),
	)
