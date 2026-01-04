import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from src.database import User, MiniProgram, Post, Comment, Assignment, Submission

class TestDatabaseModels:
    
    def test_user_creation(self, db_session: Session):
        """测试用户创建"""
        user = User(
            student_id="2023191134",
            name="魏小天",
            email="weixiaotian@example.com",
            phone="13800138000",
            password_hash="hashed_password_here",
            salt="random_salt"
        )
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.user_id is not None
        assert user.student_id == "2023191134"
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)
        
        # 测试查询
        retrieved_user = db_session.query(User).filter_by(student_id="2023191134").first()
        assert retrieved_user.name == "魏小天"
        assert retrieved_user.email == "weixiaotian@example.com"
    
    def test_mini_program_creation(self, db_session: Session):
        """测试小程序创建"""
        program = MiniProgram(
            name="成绩查询",
            icon_url="/icons/grade.png",
            description="查询学生成绩",
            url="/miniapps/grade",
            category="学习工具"
        )
        
        db_session.add(program)
        db_session.commit()
        
        assert program.program_id is not None
        assert program.name == "成绩查询"
        assert program.is_active is True
    
    def test_post_creation_with_relationships(self, db_session: Session):
        """测试帖子创建与关系"""
        # 先创建用户
        user = User(
            student_id="2023191134",
            name="魏小天",
            password_hash="hash",
            salt="salt",
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建帖子
        post = Post(
            user_id=user.user_id,
            title="测试帖子",
            content="这是测试内容",
            category="学术交流"
        )
        
        db_session.add(post)
        db_session.commit()
        
        # 测试关系
        assert post.user.student_id == "2023191134"
        assert len(user.posts) == 1
        assert user.posts[0].title == "测试帖子"
    
    def test_assignment_submission_flow(self, db_session: Session):
        """测试作业提交流程"""
        # 创建用户
        user = User(
            student_id="2023191134",
            name="魏小天",
            password_hash="hash",
            salt="salt",
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建作业
        assignment = Assignment(
            course_id=1,
            title="期末报告",
            description="完成5000字报告",
            deadline=datetime.utcnow()
        )
        db_session.add(assignment)
        db_session.commit()
        
        # 创建提交
        submission = Submission(
            assignment_id=assignment.assignment_id,
            user_id=user.user_id,
            file_url="/uploads/submissions/report.pdf"
        )
        db_session.add(submission)
        db_session.commit()
        
        # 测试关系
        assert assignment.submissions[0].user == user
        assert user.submissions[0].assignment == assignment
        assert submission.score is None  # 初始分数应为None