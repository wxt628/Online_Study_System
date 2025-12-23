# 校园综合平台 API 设计文档

## 文档说明
- **API根路径**: `/api/v1`
- **认证方式**: JWT Token，在请求头中携带 `Authorization: Bearer {token}`
- **响应格式**: 统一JSON格式，包含 `code`, `message`, `data` 字段
- **日期格式**: ISO 8601 格式，如 `2024-01-15T10:30:00Z`

---

## 一、公共响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
}
```

### 状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证/登录过期
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 二、用户认证与个人信息

### 1. 用户登录
- **接口**: `POST /auth/login`
- **功能**: 学生使用学号和密码登录
- **无需认证**: 是

**请求参数**:
```json
{
  "student_id": "20210001",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "student_id": "20210001",
      "name": "张三",
      "email": "zhangsan@example.com",
      "avatar_url": "/avatars/default.png"
    }
  }
}
```

### 2. 获取当前用户信息
- **接口**: `GET /users/me`
- **功能**: 获取当前登录用户的详细信息
- **需要认证**: 是

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "user_id": 1,
    "student_id": "20210001",
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "avatar_url": "/avatars/default.png",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### 3. 更新个人信息
- **接口**: `PUT /users/me`
- **功能**: 更新个人信息，包含密码重置
- **需要认证**: 是

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "张三（新）",
  "email": "new_email@example.com",
  "phone": "13800138888",
  "avatar_url": "/avatars/new.png",
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

**说明**:
- `old_password` 和 `new_password` 为可选字段，修改密码时需要同时提供
- 其他字段单独更新时，密码字段可以省略

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "user_id": 1,
    "name": "张三（新）",
    "email": "new_email@example.com",
    "updated_at": "2024-01-02T14:30:00Z"
  }
}
```

---

## 三、校园小程序平台

### 1. 获取小程序列表
- **接口**: `GET /mini-programs`
- **功能**: 获取所有可用的小程序入口，包含跳转URL
- **需要认证**: 是
- **支持筛选**: 按分类筛选

**查询参数**:
- `category` (可选): 小程序分类，如 "教务"、"生活"、"工具"
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页数量，默认为20

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "program_id": 1,
        "name": "校园一卡通",
        "icon_url": "/icons/card.png",
        "description": "校园卡充值、消费记录查询",
        "url": "https://card.example.com",
        "category": "生活",
        "display_order": 1
      },
      {
        "program_id": 2,
        "name": "图书馆查询",
        "icon_url": "/icons/library.png",
        "description": "图书借阅、馆藏查询",
        "url": "https://library.example.com",
        "category": "教务",
        "display_order": 2
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
}
```

---

## 四、校园作业平台

### 1. 获取当前课程列表
- **接口**: `GET /courses`
- **功能**: 获取学生已确定的课程列表
- **需要认证**: 是
- **支持筛选**: 按学期筛选

**查询参数**:
- `semester` (可选): 学期，如 "2024-2025-1"
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页数量，默认为20

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "course_id": 1,
        "course_code": "CS101",
        "name": "计算机科学导论",
        "teacher": "王教授",
        "semester": "2024-2025-1"
      },
      {
        "course_id": 2,
        "course_code": "MA101",
        "name": "高等数学",
        "teacher": "李教授",
        "semester": "2024-2025-1"
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
}
```

### 2. 获取课程详细信息
- **接口**: `GET /courses/{course_id}`
- **功能**: 获取指定课程的详细信息
- **需要认证**: 是
- **URL参数**: `course_id` (必需): 课程ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "course_id": 1,
    "course_code": "CS101",
    "name": "计算机科学导论",
    "teacher": "王教授",
    "semester": "2024-2025-1",
    "description": "计算机科学基础课程，涵盖编程基础、算法入门等内容"
  }
}
```

### 3. 获取课程作业列表
- **接口**: `GET /courses/{course_id}/assignments`
- **功能**: 获取指定课程的所有作业
- **需要认证**: 是
- **URL参数**: `course_id` (必需): 课程ID
- **查询参数**:
  - `status` (可选): 作业状态，如 "pending"（未截止）, "expired"（已截止）
  - `page` (可选): 页码，默认为1
  - `pageSize` (可选): 每页数量，默认为20

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "assignment_id": 1,
        "title": "第一次编程作业",
        "description": "实现基本的排序算法",
        "deadline": "2024-03-15T23:59:59Z",
        "created_at": "2024-02-01T10:00:00Z",
        "has_submitted": true,
        "submission_status": "已提交"
      },
      {
        "assignment_id": 2,
        "title": "第二次编程作业",
        "description": "数据结构实现",
        "deadline": "2024-04-15T23:59:59Z",
        "created_at": "2024-03-01T10:00:00Z",
        "has_submitted": false,
        "submission_status": "未提交"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
}
```

### 4. 获取作业详情
- **接口**: `GET /assignments/{assignment_id}`
- **功能**: 获取作业的详细信息，包含附件URL
- **需要认证**: 是
- **URL参数**: `assignment_id` (必需): 作业ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "assignment_id": 1,
    "course_id": 1,
    "title": "第一次编程作业",
    "description": "实现基本的排序算法，包括冒泡排序、快速排序和归并排序",
    "deadline": "2024-03-15T23:59:59Z",
    "attachment_url": "/files/assignments/1/sorting-algorithms.pdf",
    "attachment_name": "排序算法作业要求.pdf",
    "created_at": "2024-02-01T10:00:00Z",
    "course_info": {
      "course_code": "CS101",
      "name": "计算机科学导论",
      "teacher": "王教授"
    }
  }
}
```

### 5. 提交作业
- **接口**: `POST /assignments/{assignment_id}/submit`
- **功能**: 提交作业文件
- **需要认证**: 是
- **URL参数**: `assignment_id` (必需): 作业ID
- **请求格式**: `multipart/form-data`

**表单字段**:
- `file` (必需): 作业文件
- `comment` (可选): 提交备注

**响应示例**:
```json
{
  "code": 200,
  "message": "作业提交成功",
  "data": {
    "submission_id": 101,
    "assignment_id": 1,
    "file_url": "/files/submissions/101/program.zip",
    "file_name": "program.zip",
    "submitted_at": "2024-03-14T15:30:00Z",
    "score": null,
    "feedback": null
  }
}
```

### 6. 查看已提交作业记录
- **接口**: `GET /assignments/{assignment_id}/submissions/me`
- **功能**: 查看自己对该作业的提交记录
- **需要认证**: 是
- **URL参数**: `assignment_id` (必需): 作业ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "assignment_id": 1,
    "title": "第一次编程作业",
    "submissions": [
      {
        "submission_id": 101,
        "file_url": "/files/submissions/101/program.zip",
        "file_name": "program.zip",
        "submitted_at": "2024-03-14T15:30:00Z",
        "score": 90.5,
        "feedback": "代码结构清晰，算法实现正确，但有少量优化空间"
      }
    ],
    "latest_submission": {
      "submission_id": 101,
      "submitted_at": "2024-03-14T15:30:00Z",
      "score": 90.5
    }
  }
}
```

---

## 五、校园论坛平台

### 1. 获取帖子列表
- **接口**: `GET /posts`
- **功能**: 获取帖子列表，支持分页、分类筛选、排序
- **需要认证**: 是

**查询参数**:
- `category` (可选): 帖子分类，如 "校园"、"学习交流"、"闲置交易"
- `sort_by` (可选): 排序字段，可选值: `created_at`（发布时间）, `like_count`（点赞数）, `view_count`（浏览数）, 默认 `created_at`
- `order` (可选): 排序顺序，可选值: `desc`（降序）, `asc`（升序），默认 `desc`
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页数量，默认为20

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "post_id": 1,
        "title": "寻找一起学习的小伙伴",
        "content_preview": "有没有同学想一起准备期末考试...",
        "author": {
          "user_id": 2,
          "name": "李四",
          "avatar_url": "/avatars/user2.png"
        },
        "category": "学习交流",
        "like_count": 15,
        "view_count": 120,
        "comment_count": 8,
        "created_at": "2024-03-10T14:30:00Z"
      },
      {
        "post_id": 2,
        "title": "转让二手教材",
        "content_preview": "计算机组成原理教材，九成新...",
        "author": {
          "user_id": 3,
          "name": "王五",
          "avatar_url": "/avatars/user3.png"
        },
        "category": "闲置交易",
        "like_count": 5,
        "view_count": 80,
        "comment_count": 3,
        "created_at": "2024-03-09T10:15:00Z"
      }
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "pageSize": 20,
      "totalPages": 8
    }
  }
}
```

### 2. 获取帖子详情
- **接口**: `GET /posts/{post_id}`
- **功能**: 获取帖子详细信息，包含评论
- **需要认证**: 是
- **URL参数**: `post_id` (必需): 帖子ID
- **查询参数**:
  - `page` (可选): 评论分页页码，默认为1
  - `pageSize` (可选): 每页评论数量，默认为20

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "post": {
      "post_id": 1,
      "title": "寻找一起学习的小伙伴",
      "content": "有没有同学想一起准备期末考试？我们可以组织学习小组，互相督促，共同进步。主要复习数据结构和高数两门课程。",
      "author": {
        "user_id": 2,
        "name": "李四",
        "avatar_url": "/avatars/user2.png"
      },
      "category": "学习交流",
      "like_count": 15,
      "view_count": 121,
      "comment_count": 8,
      "created_at": "2024-03-10T14:30:00Z",
      "updated_at": "2024-03-10T14:30:00Z",
      "is_liked": false
    },
    "comments": {
      "items": [
        {
          "comment_id": 1,
          "content": "我也有这个想法，一起学习效率更高",
          "author": {
            "user_id": 3,
            "name": "王五",
            "avatar_url": "/avatars/user3.png"
          },
          "parent_id": null,
          "like_count": 3,
          "created_at": "2024-03-10T15:00:00Z",
          "replies": [
            {
              "comment_id": 2,
              "content": "我们可以定个时间地点",
              "author": {
                "user_id": 2,
                "name": "李四",
                "avatar_url": "/avatars/user2.png"
              },
              "parent_id": 1,
              "like_count": 1,
              "created_at": "2024-03-10T15:10:00Z"
            }
          ]
        }
      ],
      "pagination": {
        "total": 8,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1
      }
    }
  }
}
```

### 3. 发布新帖子
- **接口**: `POST /posts`
- **功能**: 发布新帖子
- **需要认证**: 是

**请求参数**:
```json
{
  "title": "寻找一起学习的小伙伴",
  "content": "有没有同学想一起准备期末考试？我们可以组织学习小组...",
  "category": "学习交流"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "帖子发布成功",
  "data": {
    "post_id": 3,
    "title": "寻找一起学习的小伙伴",
    "content": "有没有同学想一起准备期末考试？我们可以组织学习小组...",
    "category": "学习交流",
    "like_count": 0,
    "view_count": 0,
    "created_at": "2024-03-11T09:00:00Z"
  }
}
```

### 4. 编辑帖子
- **接口**: `PUT /posts/{post_id}`
- **功能**: 编辑自己发布的帖子
- **需要认证**: 是
- **URL参数**: `post_id` (必需): 帖子ID

**请求参数**:
```json
{
  "title": "寻找一起学习的小伙伴（更新）",
  "content": "更新后的内容...",
  "category": "学习交流"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "帖子更新成功",
  "data": {
    "post_id": 1,
    "title": "寻找一起学习的小伙伴（更新）",
    "content": "更新后的内容...",
    "category": "学习交流",
    "updated_at": "2024-03-11T10:00:00Z"
  }
}
```

### 5. 删除帖子
- **接口**: `DELETE /posts/{post_id}`
- **功能**: 删除自己发布的帖子
- **需要认证**: 是
- **URL参数**: `post_id` (必需): 帖子ID

**响应示例**:
```json
{
  "code": 200,
  "message": "帖子删除成功",
  "data": null
}
```

### 6. 发表评论
- **接口**: `POST /posts/{post_id}/comments`
- **功能**: 对帖子发表评论
- **需要认证**: 是
- **URL参数**: `post_id` (必需): 帖子ID

**请求参数**:
```json
{
  "content": "我也有这个想法，一起学习效率更高",
  "parent_id": null
}
```

**说明**:
- `parent_id`: 父评论ID，如果为null或不存在，则是一级评论；如果有值，则是回复某条评论

**响应示例**:
```json
{
  "code": 200,
  "message": "评论发表成功",
  "data": {
    "comment_id": 9,
    "post_id": 1,
    "content": "我也有这个想法，一起学习效率更高",
    "parent_id": null,
    "author": {
      "user_id": 3,
      "name": "王五",
      "avatar_url": "/avatars/user3.png"
    },
    "like_count": 0,
    "created_at": "2024-03-11T11:00:00Z"
  }
}
```

### 7. 删除评论
- **接口**: `DELETE /comments/{comment_id}`
- **功能**: 删除自己发表的评论
- **需要认证**: 是
- **URL参数**: `comment_id` (必需): 评论ID

**响应示例**:
```json
{
  "code": 200,
  "message": "评论删除成功",
  "data": null
}
```

### 8. 点赞/取消点赞帖子
- **接口**: `POST /posts/{post_id}/like`
- **功能**: 点赞或取消点赞帖子
- **需要认证**: 是
- **URL参数**: `post_id` (必需): 帖子ID

**响应示例** (点赞成功):
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "post_id": 1,
    "like_count": 16,
    "is_liked": true
  }
}
```

**响应示例** (取消点赞):
```json
{
  "code": 200,
  "message": "取消点赞成功",
  "data": {
    "post_id": 1,
    "like_count": 15,
    "is_liked": false
  }
}
```

---

## 六、文件上传与下载

### 1. 文件上传
- **接口**: `POST /files/upload`
- **功能**: 通用文件上传接口
- **需要认证**: 是
- **请求格式**: `multipart/form-data`

**表单字段**:
- `file` (必需): 上传的文件
- `type` (可选): 文件类型，用于分类，如 "avatar"、"assignment"、"post_image"

**响应示例**:
```json
{
  "code": 200,
  "message": "文件上传成功",
  "data": {
    "file_id": 1001,
    "file_name": "assignment.pdf",
    "file_url": "/files/upload/assignment_20240311_123456.pdf",
    "file_size": 204800,
    "mime_type": "application/pdf",
    "created_at": "2024-03-11T12:00:00Z"
  }
}
```

### 2. 文件下载
- **方式**: 直接通过文件URL访问（需要相应的权限验证中间件）
- **说明**: 文件下载不通过API接口，而是通过文件服务器直接提供，但需要在后端进行权限验证

---

## 七、错误处理示例

### 1. 未认证访问
```json
{
  "code": 401,
  "message": "未认证，请先登录",
  "data": null
}
```

### 2. 权限不足
```json
{
  "code": 403,
  "message": "权限不足，无法访问此资源",
  "data": null
}
```

### 3. 资源不存在
```json
{
  "code": 404,
  "message": "帖子不存在或已被删除",
  "data": null
}
```

### 4. 参数验证错误
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": {
    "errors": {
      "title": ["标题不能为空"],
      "content": ["内容不能少于10个字符"]
    }
  }
}
```

### 5. 作业提交已截止
```json
{
  "code": 400,
  "message": "作业提交已截止，无法提交",
  "data": null
}
```

---

## 八、数据库扩展说明

根据API设计，需要在现有数据库基础上扩展以下功能：

### 1. 帖子点赞功能
需要新增 `post_likes` 表：
```sql
CREATE TABLE post_likes (
  like_id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_user (post_id, user_id)
);
```

### 2. 评论点赞功能（可选）
如果需要评论点赞功能，可以类似地创建 `comment_likes` 表。

### 3. 作业提交状态跟踪
在现有的 `submissions` 表中，可以添加 `status` 字段来跟踪作业状态（如 "submitted"、"graded" 等）。

---

## 九、API使用说明

### 1. 认证流程
1. 调用 `/auth/login` 接口获取token
2. 在后续请求的Header中携带：`Authorization: Bearer {token}`
3. Token过期后需要重新登录

### 2. 文件处理流程
1. 上传文件：调用 `/files/upload` 接口，获取文件URL
2. 使用文件：在需要的地方使用返回的file_url
3. 下载文件：直接访问file_url（需要认证）

### 3. 分页处理
所有列表接口都支持分页，可以通过 `page` 和 `pageSize` 参数控制

### 4. 错误处理
所有接口都返回标准格式的响应，包括状态码和消息，客户端应根据code值进行相应处理

---

**文档版本**: v1.0  
**最后更新**: 2024-03-11  
**适用平台**: 校园综合平台