import pytest
from datetime import datetime, timedelta
from jose import jwt
from src.security import (
    create_access_token,
    get_current_user,
    SECRET_KEY,
    ALGORITHM
)
from src.database import User

class TestSecurityModule:
    
    def test_create_access_token(self):
        """测试JWT令牌创建"""
        data = {"sub": "2023191134", "role": "student"}
        token = create_access_token(data=data)
        
        assert token is not None
        assert len(token) > 0
        
        # 验证令牌结构
        decoded = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        assert decoded["sub"] == "2023191134"
        assert "exp" in decoded
    
    def test_token_expiry(self):
        """测试令牌过期机制"""
        data = {"sub": "test_user"}
        # 创建1分钟有效期的令牌
        token = create_access_token(data=data, expires_delta=timedelta(minutes=1))
        
        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        assert "exp" in decoded
        # 验证过期时间在合理范围内
        exp_time = datetime.fromtimestamp(decoded["exp"])
        assert exp_time > datetime.utcnow()
    
    def test_get_current_user_valid_token(self, client, db_session):
        """测试有效令牌的用户获取"""
        # 创建测试用户
        user = User(
            student_id="2023191134",
            name="测试用户",
            password_hash="test_hash",
            salt="test_salt"
        )
        db_session.add(user)
        db_session.commit()
        
        # 创建令牌
        token = create_access_token(data={"sub": "2023191134"})
        
        # 测试获取当前用户
        current_user = get_current_user(token)
        assert current_user.student_id == "2023191134"
        assert current_user.name == "测试用户"
    
    def test_get_current_user_invalid_token(self):
        """测试无效令牌的用户获取"""
        with pytest.raises(Exception):
            get_current_user("invalid_token")
    
    def test_get_current_user_nonexistent_user(self, db_session):
        """测试不存在的用户令牌"""
        token = create_access_token(data={"sub": "nonexistent_user"})
        
        with pytest.raises(Exception):
            get_current_user(token)