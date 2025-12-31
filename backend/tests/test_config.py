"""
API黑盒测试配置文件
"""

# 测试环境配置
TEST_CONFIG = {
    "base_url": "http://localhost:8000",
    "timeout": 30,
    "max_retries": 3,
    
    # 测试用户配置 - 已修改为2023114514
    "test_users": [
        {
            "student_id": "2023114514",
            "password": "2023114514",
            "name": "测试用户"
        }
    ],
    
    # API端点配置
    "endpoints": {
        "auth": {
            "login": "/api/v1/auth/login"
        },
        "user": {
            "me": "/api/v1/me",
            "update": "/api/v1/user/update"
        },
        "mini_programs": {
            "list": "/api/v1/mini-programs"
        },
        "courses": {
            "list": "/api/v1/courses",
            "detail": "/api/v1/courses/{course_id}",
            "assignments": "/api/v1/courses/{course_id}/assignments"
        },
        "assignments": {
            "detail": "/api/v1/assignments/{assignment_id}"
        },
        "posts": {
            "list": "/api/v1/posts",
            "detail": "/api/v1/posts/{post_id}",
            "create": "/api/v1/posts",
            "edit": "/api/v1/posts/{post_id}",
            "delete": "/api/v1/posts/{post_id}",
            "comments": "/api/v1/posts/{post_id}/comments"
        }
    },
    
    # 测试数据
    "test_data": {
        "posts": {
            "title_prefix": "测试帖子_",
            "content": "这是一个测试帖子的内容，用于API黑盒测试验证。",
            "categories": ["校园", "学习", "生活", "其他"]
        },
        "comments": {
            "content_prefix": "测试评论_"
        },
        "user_update": {
            "name_prefix": "测试用户_",
            "email_domain": "@test.example.com",
            "phone_prefix": "138"
        }
    }
}

# 测试结果报告配置
REPORT_CONFIG = {
    "output_dir": "test_reports",
    "html_report": True,
    "json_report": True,
    "verbose": True
}