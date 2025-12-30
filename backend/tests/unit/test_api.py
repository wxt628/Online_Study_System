import pytest
from fastapi.testclient import TestClient
from src.database import User
import hashlib
from unittest.mock import patch

class TestAPIModule:
    
    def test_login_success(self, client, db_session):
        """测试登录成功"""
        # 创建测试用户
        salt = "test_salt"
        password = "TestPassword123!"
        password_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=password_hash,
            salt=salt,
            failed_attempts=0,
            locked_until=None,
            email="test@example.com",
            phone="1234567890"
        )
        db_session.add(user)
        db_session.commit()
        
        # 测试登录
        response = client.post("/api/v1/auth/login", json={
            "student_id": "2023191134",
            "password": "TestPassword123!"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["student_id"] == "2023191134"
        assert data["user_id"] == user.user_id
    
    def test_login_user_not_found(self, client):
        """测试用户不存在"""
        response = client.post("/api/v1/auth/login", json={
            "student_id": "nonexistent_user",
            "password": "any_password"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
    
    def test_login_wrong_password(self, client, db_session):
        """测试密码错误"""
        salt = "test_salt"
        password_hash = hashlib.sha256((salt + "correct_password").encode('utf-8')).hexdigest()
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=password_hash,
            salt=salt,
            failed_attempts=0,
            locked_until=None,
            email="test@example.com",
            phone="1234567890"
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/v1/auth/login", json={
            "student_id": "2023191134",
            "password": "wrong_password"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
    
    def test_get_me_with_valid_token(self, client, db_session):
        """测试获取个人信息（有效令牌）"""
        # 创建用户
        user = User(
            student_id="2023191134",
            name="魏小天",
            password_hash="hash",
            salt="salt",
            failed_attempts=0,
            locked_until=None,
            email="test@example.com",
            phone="1234567890"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建令牌
        from src.security import create_access_token
        token = create_access_token(data={"sub": "2023191134"})
        
        # 测试获取个人信息
        response = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["student_id"] == "2023191134"
        assert data["name"] == "魏小天"
    
    def test_get_me_without_token(self, client):
        """测试无令牌获取个人信息"""
        response = client.get("/api/v1/me")
        
        assert response.status_code == 401
    
    def test_root_endpoint(self, client):
        """测试根端点"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == 114514