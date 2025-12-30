import pytest
import sys
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app import app
from src.database import SessionLocal, Base, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 测试数据库配置（使用SQLite进行测试）
TEST_DATABASE_URL = "sqlite:///:memory:"  # 改为内存数据库

test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """创建测试数据库会话"""
    # 创建测试表
    Base.metadata.create_all(bind=test_engine)
    
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    # 清理测试表
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    # 使用patch替换数据库会话创建函数
    with patch('src.database.SessionLocal') as mock_session:
        # 让SessionLocal()返回测试数据库会话
        mock_session.return_value = db_session
        
        with TestClient(app) as test_client:
            yield test_client

@pytest.fixture(scope="function")
def mock_database_session():
    """模拟数据库会话"""
    with patch('src.database.SessionLocal') as mock_session:
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        yield mock_db