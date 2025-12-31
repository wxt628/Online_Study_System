from fastapi import APIRouter, Depends, HTTPException, Query, Form, Body
from sqlalchemy.orm import Session, joinedload, subqueryload
from sqlalchemy import asc, desc, func
import math
from datetime import datetime
from src import database
from src.security import get_current_user
from src.dependencies import get_db

router = APIRouter()

@router.post("/posts/search")
def search_posts(
    payload: dict = Body(None),
    _: database.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = (payload or {}).get('category')
    sort_by = (payload or {}).get('sort_by') or "created_at"
    order = (payload or {}).get('order') or "desc"
    page = int((payload or {}).get('page') or 1)
    pageSize = int((payload or {}).get('pageSize') or 20)

    q = db.query(database.Post).options(joinedload(database.Post.user))
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
            'author': {
                'user_id': p.user.user_id,
                'student_id': p.user.student_id,
                'name': p.user.name,
                'avatar_url': p.user.avatar_url
            },
            'category': p.category,
            'like_count': p.like_count,
            'view_count': p.view_count,
            'comment_count': comment_count,
            'created_at': p.created_at,
        })

    return { 'code': 200, 'message': '成功', 'data': { 'items': result_items, 'pagination': { 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total / pageSize) } } }

@router.get("/posts")
def list_posts(
    category: str | None = None,
    sort_by: str | None = Query("created_at"),
    order: str | None = Query("desc"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=200),
    _: database.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(database.Post).options(joinedload(database.Post.user))
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
            'author': {
                'user_id': p.user.user_id,
                'student_id': p.user.student_id,
                'name': p.user.name,
                'avatar_url': p.user.avatar_url
            },
            'category': p.category,
            'like_count': p.like_count,
            'view_count': p.view_count,
            'comment_count': comment_count,
            'created_at': p.created_at,
        })

    return { 'code': 200, 'message': '成功', 'data': { 'items': result_items, 'pagination': { 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': math.ceil(total / pageSize) } } }

@router.get("/posts/{post_id}")
def get_post(post_id: int, page: int = Query(1, ge=1), pageSize: int = Query(20, ge=1), _: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 使用 joinedload 加载用户信息
    post = db.query(database.Post).options(joinedload(database.Post.user)).filter(database.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})

    # increment view count
    post.view_count = int(post.view_count) + 1
    db.commit()

    # comments pagination (top-level comments) - 同时加载评论用户信息和回复及其用户信息
    comments_q = db.query(database.Comment).options(
        joinedload(database.Comment.user),
        subqueryload(database.Comment.replies).joinedload(database.Comment.user)
    ).filter(database.Comment.post_id == post_id, database.Comment.parent_id == None).order_by(database.Comment.created_at.desc())
    total_comments = comments_q.count()
    comments = comments_q.offset((page-1)*pageSize).limit(pageSize).all()

    def to_comment_obj(c):
        replies = []
        for r in c.replies:
            # 回复的用户信息已经预加载
            replies.append({
                'comment_id': r.comment_id,
                'post_id': r.post_id,
                'user_id': r.user_id,
                'student_id': r.user.student_id if r.user else None,
                'name': r.user.name if r.user else None,
                'content': r.content,
                'parent_id': r.parent_id,
                'created_at': r.created_at
            })
        
        # 评论的用户信息已经预加载
        return {
            'comment_id': c.comment_id,
            'post_id': c.post_id,
            'user_id': c.user_id,
            'student_id': c.user.student_id if c.user else None,
            'name': c.user.name if c.user else None,
            'avatar_url': c.user.avatar_url if c.user else None,
            'content': c.content,
            'parent_id': c.parent_id,
            'created_at': c.created_at,
            'replies': replies
        }

    comment_items = [ to_comment_obj(c) for c in comments ]

    return {
        'code': 200,
        'message': '成功',
        'data': {
            'post': {
                'post_id': post.post_id,
                'title': post.title,
                'content': post.content,
                'author': {
                    'user_id': post.user.user_id,
                    'student_id': post.user.student_id,
                    'name': post.user.name,
                    'avatar_url': post.user.avatar_url
                },
                'category': post.category,
                'like_count': post.like_count,
                'view_count': post.view_count,
                'created_at': post.created_at,
                'updated_at': post.updated_at
            },
            'comments': {
                'items': comment_items,
                'pagination': {
                    'total': total_comments,
                    'page': page,
                    'pageSize': pageSize,
                    'totalPages': math.ceil(total_comments / pageSize)
                }
            }
        }
    }

@router.post("/posts/{post_id}/detail")
def get_post_detail(post_id: int, payload: dict = Body(None), _: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    page = int((payload or {}).get('page') or 1)
    pageSize = int((payload or {}).get('pageSize') or 20)

    post = db.query(database.Post).options(joinedload(database.Post.user)).filter(database.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})

    post.view_count = int(post.view_count) + 1
    db.commit()

    comments_q = db.query(database.Comment).options(
        joinedload(database.Comment.user),
        subqueryload(database.Comment.replies).joinedload(database.Comment.user)
    ).filter(database.Comment.post_id == post_id, database.Comment.parent_id == None).order_by(database.Comment.created_at.desc())
    total_comments = comments_q.count()
    comments = comments_q.offset((page-1)*pageSize).limit(pageSize).all()

    def to_comment_obj(c):
        replies = []
        for r in c.replies:
            replies.append({
                'comment_id': r.comment_id,
                'post_id': r.post_id,
                'user_id': r.user_id,
                'student_id': r.user.student_id if r.user else None,
                'name': r.user.name if r.user else None,
                'content': r.content,
                'parent_id': r.parent_id,
                'created_at': r.created_at
            })
        return {
            'comment_id': c.comment_id,
            'post_id': c.post_id,
            'user_id': c.user_id,
            'student_id': c.user.student_id if c.user else None,
            'name': c.user.name if c.user else None,
            'avatar_url': c.user.avatar_url if c.user else None,
            'content': c.content,
            'parent_id': c.parent_id,
            'created_at': c.created_at,
            'replies': replies
        }

    comment_items = [ to_comment_obj(c) for c in comments ]

    return {
        'code': 200,
        'message': '成功',
        'data': {
            'post': {
                'post_id': post.post_id,
                'title': post.title,
                'content': post.content,
                'author': {
                    'user_id': post.user.user_id,
                    'student_id': post.user.student_id,
                    'name': post.user.name,
                    'avatar_url': post.user.avatar_url
                },
                'category': post.category,
                'like_count': post.like_count,
                'view_count': post.view_count,
                'created_at': post.created_at,
                'updated_at': post.updated_at
            },
            'comments': {
                'items': comment_items,
                'pagination': {
                    'total': total_comments,
                    'page': page,
                    'pageSize': pageSize,
                    'totalPages': math.ceil(total_comments / pageSize)
                }
            }
        }
    }

@router.post("/posts")
def create_post(title: str = Form(...), content: str = Form(...), category: str | None = Form(None), current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = database.Post(user_id=current_user.user_id, title=title, content=content, category=(category or '校园'))
    db.add(p)
    db.commit()
    db.refresh(p)
    # 重新加载用户信息以获取完整数据
    p = db.query(database.Post).options(joinedload(database.Post.user)).filter(database.Post.post_id == p.post_id).first()
    return {
        'code': 200,
        'message': '帖子发布成功',
        'data': {
            'post_id': p.post_id,
            'author': {
                'user_id': p.user.user_id,
                'student_id': p.user.student_id,
                'name': p.user.name,
                'avatar_url': p.user.avatar_url
            },
            'title': p.title,
            'content': p.content,
            'category': p.category,
            'like_count': p.like_count,
            'view_count': p.view_count,
            'created_at': p.created_at
        }
    }

@router.put("/posts/{post_id}")
def edit_post(post_id: int, title: str | None = Form(None), content: str | None = Form(None), category: str | None = Form(None), current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 使用 joinedload 加载用户信息
    post = db.query(database.Post).options(joinedload(database.Post.user)).filter(database.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail={"error": {"message": "没有权限"}})
    if title:
        post.title = title
    if content:
        post.content = content
    if category:
        post.category = category
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return {
        'code': 200,
        'message': '更新成功',
        'data': {
            'post_id': post.post_id,
            'author': {
                'user_id': post.user.user_id,
                'student_id': post.user.student_id,
                'name': post.user.name,
                'avatar_url': post.user.avatar_url
            }
        }
    }

@router.delete("/posts/{post_id}")
def delete_post(post_id: int, current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail={"error": {"message": "没有权限"}})
    db.delete(post)
    db.commit()
    return { 'code': 200, 'message': '删除成功', 'data': None }

@router.post("/posts/{post_id}/comments")
def create_comment(post_id: int, content: str = Form(...), parent_id: int | None = Form(None), current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(database.Post).filter(database.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})
    c = database.Comment(post_id=post_id, user_id=current_user.user_id, content=content, parent_id=parent_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    
    # 获取用户信息
    user = db.query(database.User).filter(database.User.user_id == current_user.user_id).first()
    return {
        'code': 200,
        'message': '评论发表成功',
        'data': {
            'comment_id': c.comment_id,
            'post_id': c.post_id,
            'user_id': c.user_id,
            'student_id': user.student_id if user else None,
            'name': user.name if user else None,
            'avatar_url': user.avatar_url if user else None,
            'content': c.content,
            'parent_id': c.parent_id,
            'created_at': c.created_at
        }
    }

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(database.Comment).filter(database.Comment.comment_id == comment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail={"error": {"message": "评论不存在"}})
    if c.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail={"error": {"message": "没有权限"}})
    db.delete(c)
    db.commit()
    return { 'code': 200, 'message': '删除成功', 'data': None }

@router.post("/posts/{post_id}/like")
def toggle_like(post_id: int, current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 使用 with_for_update 锁定行，防止并发更新导致计数不准确
    post = db.query(database.Post).filter(database.Post.post_id == post_id).with_for_update().first()
    if not post:
        raise HTTPException(status_code=404, detail={"error": {"message": "帖子不存在"}})

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
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail={"error": {"message": "操作失败"}})
        return { 'code': 200, 'message': '点赞成功', 'data': { 'post_id': post_id, 'like_count': post.like_count, 'is_liked': True } }
