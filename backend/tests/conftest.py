import pytest
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app import app
from src.database import SessionLocal, Base, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 测试数据库配置（使用内存SQLite进行测试）
TEST_DATABASE_URL = "sqlite:///./test.db"

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
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # 重写数据库依赖
    from app import database
    app.dependency_overrides[database.SessionLocal] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()