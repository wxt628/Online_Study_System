import pytest
import sys
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

# 设置测试环境变量
os.environ["TESTING"] = "1"

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

# 首先创建测试数据库引擎和会话工厂
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 测试数据库配置（使用SQLite进行测试）
TEST_DATABASE_URL = "sqlite:///:memory:"  # 内存数据库
test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# 替换src.database中的engine和SessionLocal
import src.database
# 将src.database.engine替换为测试引擎
src.database.engine = test_engine
# 重新创建SessionLocal以使用测试引擎
src.database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# 现在再导入app，确保app使用的是测试数据库引擎
from fastapi.testclient import TestClient
from app import app
from src.database import Base

# 在模块级别创建表，确保所有测试都能使用
Base.metadata.create_all(bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """创建测试数据库会话"""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    try:
        # 先回滚事务，再关闭会话和连接
        if transaction.is_active:
            transaction.rollback()
    except Exception:
        pass
    finally:
        session.close()
        connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    # 同时patch依赖注入的get_db函数和直接使用的SessionLocal
    with patch('src.dependencies.get_db') as mock_get_db, patch('src.database.SessionLocal') as mock_session:
        # 让get_db()返回测试数据库会话
        mock_get_db.return_value = db_session
        # 让SessionLocal()也返回测试数据库会话
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