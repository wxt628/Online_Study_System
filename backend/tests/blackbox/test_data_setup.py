# backend/tests/blackbox/test_data_setup.py
import json
import requests
from typing import Dict, List

class TestDataGenerator:
    
    BASE_URL = "http://localhost:8000"
    HEADERS = {"Content-Type": "application/json"}
    
    def __init__(self):
        self.token = None
        self.user_id = None
    
    def login(self, student_id: str, password: str) -> bool:
        """登录获取令牌"""
        response = requests.post(
            f"{self.BASE_URL}/api/v1/auth/login",
            json={"student_id": student_id, "password": password},
            headers=self.HEADERS
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["data"]["token"]
            self.HEADERS["Authorization"] = f"Bearer {self.token}"
            self.user_id = data["data"]["user"]["user_id"]
            return True
        return False
    
    def create_test_course(self) -> Dict:
        """创建测试课程"""
        course_data = {
            "course_code": "CS101",
            "course_name": "计算机科学导论",
            "semester": "2023-2024-1",
            "teacher_name": "张教授",
            "description": "计算机科学基础课程"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/api/v1/courses",
            json=course_data,
            headers=self.HEADERS
        )
        
        return response.json()["data"] if response.status_code == 200 else None
    
    def create_test_assignment(self, course_id: int) -> Dict:
        """创建测试作业"""
        assignment_data = {
            "course_id": course_id,
            "title": "第一次作业",
            "description": "完成第一章练习题",
            "deadline": "2024-01-15T23:59:59"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/api/v1/assignments",
            json=assignment_data,
            headers=self.HEADERS
        )
        
        return response.json()["data"] if response.status_code == 200 else None
