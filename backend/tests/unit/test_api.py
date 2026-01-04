import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from src.database import User
from src.security import create_access_token

class TestAPIRoutesComprehensive:
    """全面测试API路由"""
    
    @pytest.fixture
    def test_user(self):
        """创建测试用户"""
        return User(
            student_id="2023191134",
            name="测试用户",
            email="test@example.com",
            phone="13800138000",
            password_hash="hashed_password",
            salt="test_salt",
            failed_attempts=0,
            locked_until=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    # 登录路由测试
    def test_login_wrong_password(self, client, db_session, test_user):
        """测试密码错误场景"""
        # 在测试数据库中添加测试用户
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)
        
        # 测试登录
        with patch("src.routers.auth.hash_password", return_value="wrong_hash"):
            response = client.post(
                "/api/v1/auth/login",
                json={"student_id": "2023191134", "password": "wrong_password"}
            )
        
        # 验证结果
        assert response.status_code == 401
        data = response.json()
        assert "用户名或密码错误" in data["detail"]["error"]["message"]
    
    def test_login_account_locked(self, client, db_session, test_user):
        """测试账户锁定场景"""
        # 设置锁定用户
        test_user.failed_attempts = 5
        test_user.locked_until = datetime.utcnow() + timedelta(minutes=5)
        
        # 在测试数据库中添加锁定用户
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)
        
        # 测试登录
        response = client.post(
            "/api/v1/auth/login",
            json={"student_id": "2023191134", "password": "password123"}
        )
        
        # 验证结果
        assert response.status_code == 423
        data = response.json()
        assert "账户已锁定" in data["detail"]["error"]["message"]
    
    # 用户路由测试
    def test_update_user(self, client, db_session, test_user):
        """测试更新用户信息"""
        # 在测试数据库中添加测试用户
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)
        
        # 创建访问令牌
        access_token = create_access_token(data={"sub": test_user.student_id})
        
        # 测试更新用户
        with patch("src.routers.user.get_current_user", return_value=test_user):
            response = client.post(
                "/api/v1/user/update",
                headers={"Authorization": f"Bearer {access_token}"},
                data={
                    "name": "新测试用户",
                    "email": "new_test@example.com"
                }
            )
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 200
        assert data["message"] == "更新成功"
        assert data["data"]["name"] == "新测试用户"
        assert data["data"]["email"] == "new_test@example.com"
    
    def test_update_user_with_avatar(self, client, db_session, test_user):
        """测试更新用户头像"""
        # 在测试数据库中添加测试用户
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)
        
        # 创建访问令牌
        access_token = create_access_token(data={"sub": test_user.student_id})
        
        # 测试更新用户
        with patch("src.routers.user.get_current_user", return_value=test_user):
            with patch("src.routers.user.storage.save_avatar", return_value=("/uploads/avatars/test.jpg", 1024, "test.jpg")):
                with patch("src.routers.user.storage.delete_by_url", return_value=True):
                    response = client.post(
                        "/api/v1/user/update",
                        headers={"Authorization": f"Bearer {access_token}"},
                        files={
                            "avatar": ("test.jpg", b"image content", "image/jpeg")
                        },
                        data={
                            "name": "新测试用户"
                        }
                    )
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 200
        assert data["data"]["avatar_url"] == "/uploads/avatars/test.jpg"