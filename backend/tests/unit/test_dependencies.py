import pytest
from src.dependencies import get_db
from sqlalchemy.orm import Session  # 修改：从SQLAlchemy导入Session类型

class TestDependencies:
    """测试依赖注入模块"""
    
    def test_get_db(self):
        """测试get_db函数返回有效的数据库会话"""
        db_generator = get_db()
        db_session = next(db_generator)
        
        # 修改：验证返回的是Session实例而非SessionLocal
        assert isinstance(db_session, Session)
        
        # 验证会话可用
        assert db_session is not None
        
        # 关闭生成器
        db_generator.close()
    
    def test_get_db_multiple_sessions(self):
        """测试get_db函数可以生成多个独立的会话"""
        # 获取第一个会话
        db_generator1 = get_db()
        db_session1 = next(db_generator1)
        
        # 获取第二个会话
        db_generator2 = get_db()
        db_session2 = next(db_generator2)
        
        # 验证两个会话是不同的实例
        assert db_session1 is not db_session2
        
        # 关闭生成器
        db_generator1.close()
        db_generator2.close()