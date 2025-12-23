from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Body, Path, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import os

DATABASE_URL = "mysql+pymysql://用户名:密码@localhost:3306/campus_platform?charset=utf8mb4"

app = FastAPI(
    title="校园综合平台 API",
    description="校园综合平台后端接口文档",
    version="1.0.0"
)

# 允许CORS，前端本地开发
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# =====================
# 数据模型定义
# =====================

class LoginRequest(BaseModel):
    student_id: str
    password: str

class UserInfo(BaseModel):
    user_id: int
    student_id: str
    name: str
    email: str
    phone: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

class UpdateUserRequest(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    old_password: Optional[str]
    new_password: Optional[str]

class MiniProgram(BaseModel):
    program_id: int
    name: str
    icon_url: Optional[str]
    description: Optional[str]
    url: str
    category: str
    display_order: int

class Course(BaseModel):
    course_id: int
    course_code: str
    name: str
    teacher: str
    semester: str

class Assignment(BaseModel):
    assignment_id: int
    title: str
    description: Optional[str]
    deadline: Optional[datetime]
    created_at: datetime
    has_submitted: bool
    submission_status: str

class AssignmentDetail(BaseModel):
    assignment_id: int
    course_id: int
    title: str
    description: Optional[str]
    deadline: Optional[datetime]
    attachment_url: Optional[str]
    attachment_name: Optional[str]
    created_at: datetime
    course_info: Dict[str, Any]

class Submission(BaseModel):
    submission_id: int
    file_url: str
    file_name: str
    submitted_at: datetime
    score: Optional[float]
    feedback: Optional[str]

class Post(BaseModel):
    post_id: int
    title: str
    content_preview: str
    author: Dict[str, Any]
    category: str
    like_count: int
    view_count: int
    comment_count: int
    created_at: datetime

class Comment(BaseModel):
    comment_id: int
    content: str
    author: Dict[str, Any]
    parent_id: Optional[int]
    like_count: int
    created_at: datetime
    replies: List[Any] = []

class FileUploadResponse(BaseModel):
    file_id: int
    file_name: str
    file_url: str
    file_size: int
    mime_type: str
    created_at: datetime

# =====================
# 用户认证与个人信息
# =====================

@app.post("/api/v1/auth/login", tags=["用户认证"])
async def login(request: LoginRequest):
    """
    用户登录
    TODO: 实现学号和密码验证，返回JWT token和用户信息
    """
    # TODO: 验证学号和密码
    # TODO: 生成JWT token
    # TODO: 返回用户信息和token
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "登录成功",
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "user_id": 1,
                    "student_id": "20210001",
                    "name": "张三",
                    "email": "zhangsan@example.com",
                    "avatar_url": "/avatars/default.png"
                }
            }
        }
    )

@app.get("/api/v1/users/me", tags=["用户信息"])
async def get_current_user_info():
    """
    获取当前用户信息
    TODO: 从JWT token中解析用户ID，查询用户信息
    """
    # TODO: 从JWT token中获取用户ID
    # TODO: 查询数据库获取用户详细信息
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "user_id": 1,
                "student_id": "20210001",
                "name": "张三",
                "email": "zhangsan@example.com",
                "phone": "13800138000",
                "avatar_url": "/avatars/default.png",
                "created_at": "2024-01-01T10:00:00Z"
            }
        }
    )

@app.put("/api/v1/users/me", tags=["用户信息"])
async def update_user_info(request: UpdateUserRequest):
    """
    更新用户信息
    TODO: 更新用户基本信息，支持密码修改
    """
    # TODO: 验证用户身份
    # TODO: 如果修改密码，验证旧密码
    # TODO: 更新用户信息到数据库
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "更新成功",
            "data": {
                "user_id": 1,
                "name": "张三（新）",
                "email": "new_email@example.com",
                "updated_at": "2024-01-02T14:30:00Z"
            }
        }
    )

# =====================
# 校园小程序平台
# =====================

@app.get("/api/v1/mini-programs", tags=["小程序平台"])
async def get_mini_programs(
    category: Optional[str] = Query(None, description="小程序分类"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100)
):
    """
    获取小程序列表
    TODO: 查询小程序列表，支持按分类筛选和分页
    """
    # TODO: 从数据库查询小程序列表
    # TODO: 按分类筛选
    # TODO: 分页处理
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "items": [
                    {
                        "program_id": 1,
                        "name": "校园一卡通",
                        "icon_url": "/icons/card.png",
                        "description": "校园卡充值、消费记录查询",
                        "url": "https://card.example.com",
                        "category": "生活",
                        "display_order": 1
                    }
                ],
                "pagination": {
                    "total": 15,
                    "page": 1,
                    "pageSize": 20,
                    "totalPages": 1
                }
            }
        }
    )

# =====================
# 校园作业平台
# =====================

@app.get("/api/v1/courses", tags=["作业平台"])
async def get_courses(
    semester: Optional[str] = Query(None, description="学期"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100)
):
    """
    获取当前课程列表
    TODO: 查询学生已确定的课程列表，支持按学期筛选
    """
    # TODO: 从数据库查询学生课程列表
    # TODO: 按学期筛选
    # TODO: 分页处理
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "items": [
                    {
                        "course_id": 1,
                        "course_code": "CS101",
                        "name": "计算机科学导论",
                        "teacher": "王教授",
                        "semester": "2024-2025-1"
                    }
                ],
                "pagination": {
                    "total": 8,
                    "page": 1,
                    "pageSize": 20,
                    "totalPages": 1
                }
            }
        }
    )

@app.get("/api/v1/courses/{course_id}", tags=["作业平台"])
async def get_course_detail(course_id: int = Path(..., description="课程ID")):
    """
    获取课程详细信息
    TODO: 根据课程ID查询课程详细信息
    """
    # TODO: 从数据库查询课程详细信息
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "course_id": 1,
                "course_code": "CS101",
                "name": "计算机科学导论",
                "teacher": "王教授",
                "semester": "2024-2025-1",
                "description": "计算机科学基础课程，涵盖编程基础、算法入门等内容"
            }
        }
    )

@app.get("/api/v1/courses/{course_id}/assignments", tags=["作业平台"])
async def get_course_assignments(
    course_id: int = Path(..., description="课程ID"),
    status: Optional[str] = Query(None, description="作业状态"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100)
):
    """
    获取课程作业列表
    TODO: 查询指定课程的所有作业
    """
    # TODO: 从数据库查询课程作业列表
    # TODO: 按状态筛选（未截止、已截止）
    # TODO: 分页处理
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "items": [
                    {
                        "assignment_id": 1,
                        "title": "第一次编程作业",
                        "description": "实现基本的排序算法",
                        "deadline": "2024-03-15T23:59:59Z",
                        "created_at": "2024-02-01T10:00:00Z",
                        "has_submitted": True,
                        "submission_status": "已提交"
                    }
                ],
                "pagination": {
                    "total": 5,
                    "page": 1,
                    "pageSize": 20,
                    "totalPages": 1
                }
            }
        }
    )

@app.get("/api/v1/assignments/{assignment_id}", tags=["作业平台"])
async def get_assignment_detail(assignment_id: int = Path(..., description="作业ID")):
    """
    获取作业详情
    TODO: 根据作业ID查询作业详细信息，包含附件URL
    """
    # TODO: 从数据库查询作业详细信息
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "assignment_id": 1,
                "course_id": 1,
                "title": "第一次编程作业",
                "description": "实现基本的排序算法，包括冒泡排序、快速排序和归并排序",
                "deadline": "2024-03-15T23:59:59Z",
                "attachment_url": "/files/assignments/1/sorting-algorithms.pdf",
                "attachment_name": "排序算法作业要求.pdf",
                "created_at": "2024-02-01T10:00:00Z",
                "course_info": {
                    "course_code": "CS101",
                    "name": "计算机科学导论",
                    "teacher": "王教授"
                }
            }
        }
    )

@app.post("/api/v1/assignments/{assignment_id}/submit", tags=["作业平台"])
async def submit_assignment(
    assignment_id: int = Path(..., description="作业ID"),
    file: UploadFile = File(..., description="作业文件"),
    comment: Optional[str] = Form(None, description="提交备注")
):
    """
    提交作业
    TODO: 上传作业文件，创建提交记录
    """
    # TODO: 验证作业是否在截止时间内
    # TODO: 保存上传的文件
    # TODO: 创建提交记录到数据库
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "作业提交成功",
            "data": {
                "submission_id": 101,
                "assignment_id": 1,
                "file_url": "/files/submissions/101/program.zip",
                "file_name": "program.zip",
                "submitted_at": "2024-03-14T15:30:00Z",
                "score": None,
                "feedback": None
            }
        }
    )

@app.get("/api/v1/assignments/{assignment_id}/submissions/me", tags=["作业平台"])
async def get_my_submissions(assignment_id: int = Path(..., description="作业ID")):
    """
    查看已提交作业记录
    TODO: 查询自己对某个作业的提交记录
    """
    # TODO: 从数据库查询用户的作业提交记录
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "assignment_id": 1,
                "title": "第一次编程作业",
                "submissions": [
                    {
                        "submission_id": 101,
                        "file_url": "/files/submissions/101/program.zip",
                        "file_name": "program.zip",
                        "submitted_at": "2024-03-14T15:30:00Z",
                        "score": 90.5,
                        "feedback": "代码结构清晰，算法实现正确，但有少量优化空间"
                    }
                ],
                "latest_submission": {
                    "submission_id": 101,
                    "submitted_at": "2024-03-14T15:30:00Z",
                    "score": 90.5
                }
            }
        }
    )

# =====================
# 校园论坛平台
# =====================

@app.get("/api/v1/posts", tags=["论坛平台"])
async def get_posts(
    category: Optional[str] = Query(None, description="帖子分类"),
    sort_by: str = Query("created_at", description="排序字段"),
    order: str = Query("desc", description="排序顺序"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100)
):
    """
    获取帖子列表
    TODO: 查询帖子列表，支持分类筛选、排序和分页
    """
    # TODO: 从数据库查询帖子列表
    # TODO: 按分类筛选
    # TODO: 按指定字段排序
    # TODO: 分页处理
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "items": [
                    {
                        "post_id": 1,
                        "title": "寻找一起学习的小伙伴",
                        "content_preview": "有没有同学想一起准备期末考试...",
                        "author": {
                            "user_id": 2,
                            "name": "李四",
                            "avatar_url": "/avatars/user2.png"
                        },
                        "category": "学习交流",
                        "like_count": 15,
                        "view_count": 120,
                        "comment_count": 8,
                        "created_at": "2024-03-10T14:30:00Z"
                    }
                ],
                "pagination": {
                    "total": 156,
                    "page": 1,
                    "pageSize": 20,
                    "totalPages": 8
                }
            }
        }
    )

@app.get("/api/v1/posts/{post_id}", tags=["论坛平台"])
async def get_post_detail(
    post_id: int = Path(..., description="帖子ID"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100)
):
    """
    获取帖子详情
    TODO: 查询帖子详细信息，包含评论列表
    """
    # TODO: 增加帖子浏览数
    # TODO: 从数据库查询帖子详细信息
    # TODO: 查询帖子的评论（支持楼中楼）
    # TODO: 评论分页处理
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "成功",
            "data": {
                "post": {
                    "post_id": 1,
                    "title": "寻找一起学习的小伙伴",
                    "content": "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。主要复习数据结构和高数两门课程。",
                    "author": {
                        "user_id": 2,
                        "name": "李四",
                        "avatar_url": "/avatars/user2.png"
                    },
                    "category": "学习交流",
                    "like_count": 15,
                    "view_count": 121,
                    "comment_count": 8,
                    "created_at": "2024-03-10T14:30:00Z",
                    "updated_at": "2024-03-10T14:30:00Z",
                    "is_liked": False
                },
                "comments": {
                    "items": [
                        {
                            "comment_id": 1,
                            "content": "我也有这个想法，一起学习效率更高",
                            "author": {
                                "user_id": 3,
                                "name": "王五",
                                "avatar_url": "/avatars/user3.png"
                            },
                            "parent_id": None,
                            "like_count": 3,
                            "created_at": "2024-03-10T15:00:00Z",
                            "replies": []
                        }
                    ],
                    "pagination": {
                        "total": 8,
                        "page": 1,
                        "pageSize": 20,
                        "totalPages": 1
                    }
                }
            }
        }
    )

@app.post("/api/v1/posts", tags=["论坛平台"], status_code=status.HTTP_201_CREATED)
async def create_post(
    title: str = Body(..., description="帖子标题"),
    content: str = Body(..., description="帖子内容"),
    category: str = Body("校园", description="帖子分类")
):
    """
    发布新帖子
    TODO: 创建新帖子
    """
    # TODO: 验证用户身份
    # TODO: 创建帖子记录到数据库
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "code": 200,
            "message": "帖子发布成功",
            "data": {
                "post_id": 3,
                "title": "寻找一起学习的小伙伴",
                "content": "有没有同学想一起准备期末考试？我们可以组织学习小组...",
                "category": "学习交流",
                "like_count": 0,
                "view_count": 0,
                "created_at": "2024-03-11T09:00:00Z"
            }
        }
    )

@app.put("/api/v1/posts/{post_id}", tags=["论坛平台"])
async def update_post(
    post_id: int = Path(..., description="帖子ID"),
    title: Optional[str] = Body(None, description="帖子标题"),
    content: Optional[str] = Body(None, description="帖子内容"),
    category: Optional[str] = Body(None, description="帖子分类")
):
    """
    编辑帖子
    TODO: 更新帖子信息（只能编辑自己的帖子）
    """
    # TODO: 验证用户身份和权限（只能编辑自己的帖子）
    # TODO: 更新帖子信息到数据库
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "帖子更新成功",
            "data": {
                "post_id": 1,
                "title": "寻找一起学习的小伙伴（更新）",
                "content": "更新后的内容...",
                "category": "学习交流",
                "updated_at": "2024-03-11T10:00:00Z"
            }
        }
    )

@app.delete("/api/v1/posts/{post_id}", tags=["论坛平台"])
async def delete_post(post_id: int = Path(..., description="帖子ID")):
    """
    删除帖子
    TODO: 删除帖子（只能删除自己的帖子）
    """
    # TODO: 验证用户身份和权限（只能删除自己的帖子）
    # TODO: 删除帖子（软删除或硬删除）
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "帖子删除成功",
            "data": None
        }
    )

@app.post("/api/v1/posts/{post_id}/comments", tags=["论坛平台"], status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int = Path(..., description="帖子ID"),
    content: str = Body(..., description="评论内容"),
    parent_id: Optional[int] = Body(None, description="父评论ID")
):
    """
    发表评论
    TODO: 对帖子发表评论，支持楼中楼回复
    """
    # TODO: 验证用户身份
    # TODO: 验证帖子是否存在
    # TODO: 创建评论记录到数据库
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "code": 200,
            "message": "评论发表成功",
            "data": {
                "comment_id": 9,
                "post_id": 1,
                "content": "我也有这个想法，一起学习效率更高",
                "parent_id": None,
                "author": {
                    "user_id": 3,
                    "name": "王五",
                    "avatar_url": "/avatars/user3.png"
                },
                "like_count": 0,
                "created_at": "2024-03-11T11:00:00Z"
            }
        }
    )

@app.delete("/api/v1/comments/{comment_id}", tags=["论坛平台"])
async def delete_comment(comment_id: int = Path(..., description="评论ID")):
    """
    删除评论
    TODO: 删除评论（只能删除自己的评论）
    """
    # TODO: 验证用户身份和权限（只能删除自己的评论）
    # TODO: 删除评论
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "评论删除成功",
            "data": None
        }
    )

@app.post("/api/v1/posts/{post_id}/like", tags=["论坛平台"])
async def like_post(post_id: int = Path(..., description="帖子ID")):
    """
    点赞/取消点赞帖子
    TODO: 切换帖子的点赞状态
    """
    # TODO: 验证用户身份
    # TODO: 切换点赞状态（如果已点赞则取消，未点赞则添加）
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "点赞成功",
            "data": {
                "post_id": 1,
                "like_count": 16,
                "is_liked": True
            }
        }
    )

# =====================
# 文件上传与下载
# =====================

@app.post("/api/v1/files/upload", tags=["文件管理"])
async def upload_file(
    file: UploadFile = File(..., description="上传的文件"),
    type: Optional[str] = Form(None, description="文件类型")
):
    """
    文件上传
    TODO: 通用文件上传接口
    """
    # TODO: 保存上传的文件
    # TODO: 记录文件信息到数据库
    # TODO: 返回文件URL和信息
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 200,
            "message": "文件上传成功",
            "data": {
                "file_id": 1001,
                "file_name": "assignment.pdf",
                "file_url": "/files/upload/assignment_20240311_123456.pdf",
                "file_size": 204800,
                "mime_type": "application/pdf",
                "created_at": "2024-03-11T12:00:00Z"
            }
        }
    )

# =====================
# 健康检查接口
# =====================

@app.get("/", tags=["健康检查"])
async def root():
    return {"message": "校园综合平台后端服务运行正常", "status": "OK"}

@app.get("/health", tags=["健康检查"])
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# =====================
# 错误处理
# =====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail,
            "data": None
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": 500,
            "message": "服务器内部错误",
            "data": None
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)