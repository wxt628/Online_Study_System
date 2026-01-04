import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.routers.auth import login, hash_password
from src.schemas.auth import LoginRequest
from src.database import User


class TestLoginLogic:
    def test_login_success(self, db_session: Session):
        """测试登录成功场景"""
        # 创建测试用户
        salt = "test_salt"
        password = "password123"
        password_hash = hash_password(salt, password)
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=password_hash,
            salt=salt,
            failed_attempts=0,
            locked_until=None,
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建登录请求
        login_request = LoginRequest(student_id="2023191134", password="password123")
        
        # 直接将db_session传递给login函数
        response = login(login_request, db=db_session)
        
        assert response is not None
        assert response.student_id == "2023191134"
        assert hasattr(response, "token")
    
    def test_login_user_not_found(self, db_session: Session):
        """测试用户不存在场景"""
        # 创建登录请求，但数据库中没有该用户
        login_request = LoginRequest(student_id="non_existent_user", password="password123")
        
        # 直接将db_session传递给login函数
        with pytest.raises(HTTPException) as excinfo:
            login(login_request, db=db_session)
        
        assert excinfo.value.status_code == 401
        assert "用户不存在" in str(excinfo.value.detail)
    
    def test_login_wrong_password(self, db_session: Session):
        """测试密码错误场景"""
        # 创建测试用户
        salt = "test_salt"
        password = "password123"
        password_hash = hash_password(salt, password)
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=password_hash,
            salt=salt,
            failed_attempts=0,
            locked_until=None,
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        user_id = user.user_id
        
        # 创建错误密码的请求
        login_request = LoginRequest(student_id="2023191134", password="wrong_password")
        
        # 直接将db_session传递给login函数
        with pytest.raises(HTTPException) as excinfo:
            login(login_request, db=db_session)
        
        assert excinfo.value.status_code == 401
        assert "用户名或密码错误" in str(excinfo.value.detail)
        
        # 验证失败尝试次数增加（使用新查询获取用户而不是刷新）
        updated_user = db_session.query(User).filter(User.user_id == user_id).first()
        assert updated_user.failed_attempts == 1
    
    def test_account_locked(self, db_session: Session):
        """测试账户锁定场景"""
        # 创建已锁定的用户
        salt = "test_salt"
        password = "password123"
        password_hash = hash_password(salt, password)
        
        # 设置锁定时间为未来5分钟
        from datetime import datetime, timedelta
        locked_until = datetime.utcnow() + timedelta(minutes=5)
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=password_hash,
            salt=salt,
            failed_attempts=5,  # 超过最大尝试次数
            locked_until=locked_until,
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建登录请求
        login_request = LoginRequest(student_id="2023191134", password="password123")
        
        # 直接将db_session传递给login函数
        with pytest.raises(HTTPException) as excinfo:
            login(login_request, db=db_session)
        
        assert excinfo.value.status_code == 423
        assert "账户已锁定" in str(excinfo.value.detail)
    
    def test_password_hash_mismatch(self, db_session: Session):
        """测试密码哈希不匹配场景"""
        # 创建测试用户，密码哈希与实际密码不匹配
        salt = "test_salt"
        password = "password123"
        # 使用不同的密码生成哈希
        wrong_password_hash = hash_password(salt, "different_password")
        
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash=wrong_password_hash,
            salt=salt,
            failed_attempts=0,
            locked_until=None,
            phone="13800138000"
        )
        db_session.add(user)
        db_session.commit()
        user_id = user.user_id
        
        # 创建登录请求
        login_request = LoginRequest(student_id="2023191134", password=password)
        
        # 直接将db_session传递给login函数
        with pytest.raises(HTTPException) as excinfo:
            login(login_request, db=db_session)
        
        assert excinfo.value.status_code == 401
        assert "用户名或密码错误" in str(excinfo.value.detail)
        
        # 验证失败尝试次数增加（使用新查询获取用户而不是刷新）
        updated_user = db_session.query(User).filter(User.user_id == user_id).first()
        assert updated_user.failed_attempts == 1