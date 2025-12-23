from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Float, Text, ForeignKey, create_engine
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/campus_platform?charset=utf8mb4"
Base = declarative_base()

# 用户表
class User(Base):
	__tablename__ = 'users'

	user_id               = Column(Integer, primary_key=True, autoincrement=True)
	student_id            = Column(String(20), unique=True, nullable=False)
	password_hash         = Column(String(255), nullable=False)          # 存储加盐哈希
	salt                  = Column(String(32), nullable=False)           # 密码盐
	failed_attempts       = Column(Integer, default=0)                   # 连续登录失败次数
	locked_until          = Column(DateTime, default=None)               # 账户锁定截止时间

	name                  = Column(String(50), nullable=False)
	email                 = Column(String(100), unique=True)
	phone                 = Column(String(20))
	avatar_url            = Column(String(255))
	created_at            = Column(DateTime, default=datetime.utcnow)
	updated_at            = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	posts                 = relationship("Post", back_populates="user")
	submissions           = relationship("Submission", back_populates="user")
	comments              = relationship("Comment", back_populates="user")
	notifications         = relationship("Notification", back_populates="user")
	files                 = relationship("File", back_populates="user")

# 小程序表
class MiniProgram(Base):
	__tablename__ = 'mini_programs'
	program_id = Column(Integer, primary_key=True, autoincrement=True)
	name = Column(String(100), nullable=False)
	icon_url = Column(String(255))
	description = Column(Text)
	url = Column(String(255), nullable=False)
	category = Column(String(50), default='其他')
	is_active = Column(Boolean, default=True)
	display_order = Column(Integer, default=0)
	created_at = Column(DateTime, default=datetime.utcnow)

# 课程表
class Course(Base):
	__tablename__ = 'courses'
	course_id = Column(Integer, primary_key=True, autoincrement=True)
	course_code = Column(String(50), unique=True, nullable=False)
	name = Column(String(100), nullable=False)
	teacher = Column(String(50), nullable=False)
	semester = Column(String(20), nullable=False)

	assignments = relationship("Assignment", back_populates="course")

# 作业表
class Assignment(Base):
	__tablename__ = 'assignments'
	assignment_id = Column(Integer, primary_key=True, autoincrement=True)
	course_id = Column(Integer, ForeignKey('courses.course_id'), nullable=False)
	title = Column(String(200), nullable=False)
	description = Column(Text)
	attachment_url = Column(String(255))
	deadline = Column(DateTime)
	created_at = Column(DateTime, default=datetime.utcnow)

	course = relationship("Course", back_populates="assignments")
	submissions = relationship("Submission", back_populates="assignment")

# 作业提交表
class Submission(Base):
	__tablename__ = 'submissions'
	submission_id = Column(Integer, primary_key=True, autoincrement=True)
	assignment_id = Column(Integer, ForeignKey('assignments.assignment_id'), nullable=False)
	user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
	file_url = Column(String(255), nullable=False)
	submitted_at = Column(DateTime, default=datetime.utcnow)
	score = Column(Float)
	feedback = Column(Text)

	assignment = relationship("Assignment", back_populates="submissions")
	user = relationship("User", back_populates="submissions")

# 帖子表
class Post(Base):
	__tablename__ = 'posts'
	post_id = Column(Integer, primary_key=True, autoincrement=True)
	user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
	title = Column(String(200), nullable=False)
	content = Column(Text, nullable=False)
	category = Column(String(50), default='校园')
	like_count = Column(Integer, default=0)
	view_count = Column(Integer, default=0)
	created_at = Column(DateTime, default=datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	user = relationship("User", back_populates="posts")
	comments = relationship("Comment", back_populates="post")

# 评论表
class Comment(Base):
	__tablename__ = 'comments'
	comment_id = Column(Integer, primary_key=True, autoincrement=True)
	post_id = Column(Integer, ForeignKey('posts.post_id'), nullable=False)
	user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
	content = Column(Text, nullable=False)
	parent_id = Column(Integer, ForeignKey('comments.comment_id'))
	created_at = Column(DateTime, default=datetime.utcnow)

	post = relationship("Post", back_populates="comments")
	user = relationship("User", back_populates="comments")
	parent = relationship("Comment", remote_side=[comment_id], backref="replies")

# 通知表
class Notification(Base):
	__tablename__ = 'notifications'
	notification_id = Column(Integer, primary_key=True, autoincrement=True)
	user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
	title = Column(String(200), nullable=False)
	content = Column(Text)
	type = Column(String(50))
	is_read = Column(Boolean, default=False)
	related_url = Column(String(255))
	created_at = Column(DateTime, default=datetime.utcnow)

	user = relationship("User", back_populates="notifications")

# 文件表
class File(Base):
	__tablename__ = 'files'
	file_id = Column(Integer, primary_key=True, autoincrement=True)
	user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
	file_name = Column(String(255), nullable=False)
	file_url = Column(String(255), nullable=False)
	file_size = Column(Integer)
	mime_type = Column(String(100))
	created_at = Column(DateTime, default=datetime.utcnow)

	user = relationship("User", back_populates="files")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
