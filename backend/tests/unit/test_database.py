import pytest
import sys
from datetime import datetime
from pathlib import Path
from sqlalchemy.exc import IntegrityError

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import User, Post, Comment, Assignment, Submission


class TestDatabaseOperations:
    """测试数据库操作"""
    
    def test_session_creation(self, db_session):
        """测试数据库会话创建"""
        assert db_session is not None
        # 测试简单查询
        result = db_session.query(User).count()
        assert isinstance(result, int)
    
    def test_unique_constraints(self, db_session):
        """测试唯一约束"""
        # 创建第一个用户
        user1 = User(
            student_id="2023191134",
            name="测试用户1",
            password_hash="hash1",
            salt="salt1",
            phone="13800138000"
        )
        db_session.add(user1)
        db_session.commit()
        
        # 创建相同学号的用户，应该抛出完整性错误
        user2 = User(
            student_id="2023191134",  # 相同的学号
            name="测试用户2",
            password_hash="hash2",
            salt="salt2",
            phone="13800138000"
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
        
    
    def test_relationship_operations(self, db_session):
        """测试关系操作"""
        # 创建用户
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash="hash",
            salt="salt",
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建帖子
        post = Post(
            title="测试帖子",
            content="测试内容",
            user_id=user.user_id
        )
        db_session.add(post)
        db_session.commit()
        
        # 验证关系
        assert post.user == user
        assert len(user.posts) == 1
        
        # 创建评论
        comment = Comment(
            content="测试评论",
            user_id=user.user_id,
            post_id=post.post_id
        )
        db_session.add(comment)
        db_session.commit()
        
        # 验证关系
        assert comment.user == user
        assert comment.post == post
        assert len(post.comments) == 1
        
        # 创建作业
        assignment = Assignment(
            title="测试作业",
            description="测试描述",
            course_id=1,
            deadline=datetime.fromisoformat("2023-12-31T23:59:59")
        )
        db_session.add(assignment)
        db_session.commit()
        
        # 创建提交
        submission = Submission(
            assignment_id=assignment.assignment_id,
            user_id=user.user_id,
            file_url="http://example.com/file.pdf",
            score=90,
            feedback="测试反馈"
        )
        db_session.add(submission)
        db_session.commit()
        
        # 验证关系
        assert submission.user == user
        assert submission.assignment == assignment
        assert len(assignment.submissions) == 1