from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import math
from src import database
from src.security import get_current_user
from src.dependencies import get_db

router = APIRouter()

@router.get('/notifications')
def list_notifications(page: int = Query(1, ge=1), pageSize: int = Query(20, ge=1), is_read: bool | None = None, current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
	q = db.query(database.Notification).filter(database.Notification.user_id == current_user.user_id)
	if is_read is not None:
		q = q.filter(database.Notification.is_read == is_read)
	total = q.count()
	items = q.order_by(database.Notification.created_at.desc()).offset((page-1)*pageSize).limit(pageSize).all()
	result = []
	for n in items:
		result.append({ 'notification_id': n.notification_id, 'user_id': n.user_id, 'title': n.title, 'content': n.content, 'type': n.type, 'is_read': n.is_read, 'related_url': n.related_url, 'created_at': n.created_at })
	return { 'code':200, 'message':'成功', 'data': { 'items': result, 'pagination': { 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total / pageSize) } } }


@router.put('/notifications/{notification_id}/read')
def mark_notification_read(notification_id: int, current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
	n = db.query(database.Notification).filter(database.Notification.notification_id == notification_id, database.Notification.user_id == current_user.user_id).first()
	if not n:
		raise HTTPException(status_code=404, detail='通知不存在')
	n.is_read = True
	db.commit()
	return { 'code':200, 'message':'已标记为已读', 'data': { 'notification_id': n.notification_id, 'is_read': True } }


@router.put('/notifications/read-all')
def mark_all_notifications_read(current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
	db.query(database.Notification).filter(database.Notification.user_id == current_user.user_id, database.Notification.is_read == False).update({ 'is_read': True })
	db.commit()
	return { 'code':200, 'message':'全部已读', 'data': None }
