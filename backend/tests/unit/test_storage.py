import pytest
import os
import tempfile
from unittest.mock import Mock, MagicMock
from fastapi import UploadFile
from src.storage import (
    save_submission_file, 
    save_avatar, 
    delete_by_url, 
    _local_path_from_url,
    SUBMISSIONS_DIR, 
    AVATARS_DIR
)

class TestStorageModule:
    """测试存储模块"""
    
    @pytest.fixture
    def mock_upload_file(self):
        """创建模拟的上传文件"""
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test_file.txt"
        mock_file.file = MagicMock()
        return mock_file
    
    def test_local_path_from_url(self):
        """测试URL到本地路径的转换"""
        url = "/uploads/submissions/test_file.txt"
        local_path = _local_path_from_url(url)
        
        expected_path = os.path.join(os.getcwd(), "uploads", "submissions", "test_file.txt")
        assert local_path == expected_path
    
    def test_local_path_from_relative_url(self):
        """测试相对URL的处理"""
        url = "uploads/avatars/avatar.png"
        local_path = _local_path_from_url(url)
        
        expected_path = os.path.join(os.getcwd(), "uploads", "avatars", "avatar.png")
        assert local_path == expected_path
    
    def test_save_submission_file(self, mock_upload_file):
        """测试保存提交文件"""
        # 准备模拟文件内容 - 关键修复：使用side_effect模拟真实文件行为
        mock_upload_file.file.read.side_effect = [b"test content", b""]
        mock_upload_file.file.__enter__.return_value = mock_upload_file.file
        
        submission_id = 123
        
        # 调用函数
        file_url, size = save_submission_file(mock_upload_file, submission_id)
        
        # 验证结果
        assert file_url.startswith("/uploads/submissions/")
        assert file_url.endswith("123_test_file.txt")
        assert size > 0
        
        # 清理测试文件
        local_path = os.path.join(SUBMISSIONS_DIR, f"123_test_file.txt")
        if os.path.exists(local_path):
            os.remove(local_path)
    
    def test_save_avatar(self, mock_upload_file):
        """测试保存头像文件"""
        # 准备模拟文件内容 - 关键修复：使用side_effect模拟真实文件行为
        mock_upload_file.file.read.side_effect = [b"test avatar content", b""]
        mock_upload_file.file.__enter__.return_value = mock_upload_file.file
        
        # 调用函数
        file_url, size, filename = save_avatar(mock_upload_file)
        
        # 验证结果
        assert file_url.startswith("/uploads/avatars/")
        assert filename in file_url
        assert size > 0
        
        # 清理测试文件
        local_path = os.path.join(AVATARS_DIR, filename)
        if os.path.exists(local_path):
            os.remove(local_path)
    
    def test_delete_by_url_existing_file(self):
        """测试删除存在的文件"""
        # 创建临时测试文件
        test_file_path = os.path.join(SUBMISSIONS_DIR, "delete_test.txt")
        with open(test_file_path, "w") as f:
            f.write("test content")
        
        # 调用删除函数
        file_url = "/uploads/submissions/delete_test.txt"
        result = delete_by_url(file_url)
        
        # 验证文件被删除
        assert result is True
        assert not os.path.exists(test_file_path)
    
    def test_delete_by_url_nonexistent_file(self):
        """测试删除不存在的文件"""
        file_url = "/uploads/submissions/nonexistent_file.txt"
        result = delete_by_url(file_url)
        
        # 验证返回False
        assert result is False