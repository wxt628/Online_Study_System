import pytest
from src.routers.auth import hash_password

class TestPasswordHashing:
    """测试密码哈希功能"""
    
    def test_hash_password(self):
        """测试哈希函数的基本功能"""
        salt = "test_salt"
        password = "password123"
        
        hash_result = hash_password(salt, password)
        
        # 验证哈希结果不为空
        assert hash_result is not None
        assert len(hash_result) > 0
        
        # 验证相同输入产生相同输出
        same_hash = hash_password(salt, password)
        assert same_hash == hash_result
        
        # 验证不同输入产生不同输出
        different_salt_hash = hash_password("different_salt", password)
        different_password_hash = hash_password(salt, "different_password")
        
        assert different_salt_hash != hash_result
        assert different_password_hash != hash_result
    
    def test_hash_empty_password(self):
        """测试空密码的哈希处理"""
        salt = "test_salt"
        password = ""
        
        hash_result = hash_password(salt, password)
        assert hash_result is not None
        assert len(hash_result) > 0
    
    def test_hash_special_characters(self):
        """测试特殊字符密码的哈希处理"""
        salt = "test_salt"
        password = "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/~`"
        
        hash_result = hash_password(salt, password)
        assert hash_result is not None
        assert len(hash_result) > 0