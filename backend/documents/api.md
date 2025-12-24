# 校园综合平台 API 设计文档

## 文档说明
- **API 根路径**：`/api/v1`
- **认证方式**：JWT，Header: `Authorization: Bearer {token}`
- **响应格式**：统一 JSON：`{ "code": <int>, "message": "<str>", "data": <object|null> }`
- **日期格式**：ISO 8601（UTC），例如 `2024-01-15T10:30:00Z`

> 说明：本文件以数据库结构（backend/database/database.sql）为准，列出与数据库表对应的主要接口与字段。

---

## 一、通用约定
- 所有受保护接口需在 Header 中带上 `Authorization: Bearer {token}`。
- 列表接口建议支持 `page`（默认1）与 `pageSize`（默认20）进行分页。
- 列表返回数据统一使用 `items` 与 `pagination` 字段。

示例成功响应：
```json
{ "code": 200, "message": "成功", "data": {} }
```

示例错误响应：
```json
{ "code": 400, "message": "错误描述", "data": null }
```

状态码说明：常用 `200, 400, 401, 403, 404, 500`。

---

## 二、用户（users 表）
数据库字段（关键信息）：`user_id, student_id, password_hash, salt, failed_attempts, locked_until, name, email, phone, avatar_url, created_at, updated_at`

1) 登录
- 接口：`POST /api/v1/auth/login`
- 说明：使用 `student_id` 和 `password` 登录，返回 JWT token 与用户标识（按 backend/app.py 实现）。
- 请求体：
```json
{ "student_id": "20210001", "password": "plaintext" }
```
- 成功响应 data：
```json
{ "token": "<jwt>", "user_id": 1, "student_id": "20210001" }
```

2) 获取当前用户
- 接口：`GET /api/v1/me`
- 需要认证：是
- 成功响应 data：
```json
{
  "user_id": 1,
  "student_id": "20210001",
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "avatar_url": "/avatars/default.png",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-02T10:00:00Z"
}
```

3) 更新当前用户
- 接口：`PUT /api/v1/users/me`
- 需要认证：是
- 请求体（字段均可选）：
```json
{
  "name": "新姓名",
  "email": "new@example.com",
  "phone": "138...",
  "avatar_url": "/avatars/x.png",
  "old_password": "旧密码",
  "new_password": "新密码"
}
```
- 说明：若修改密码，需同时提供 `old_password` 与 `new_password`。

---

## 三、小程序（mini_programs 表）
字段：`program_id, name, icon_url, description, url, category, is_active, display_order, created_at`

1) 获取小程序列表
- 接口：`GET /api/v1/mini-programs`
- 参数：`category`（可选），`page`，`pageSize`
- 响应 items 中每项：
```json
{
  "program_id": 1,
  "name": "校园一卡通",
  "icon_url": "/icons/card.png",
  "description": "...",
  "url": "https://...",
  "category": "生活",
  "is_active": true,
  "display_order": 0,
  "created_at": "2024-03-11T12:00:00Z"
}
```

---

## 四、课程与作业（courses, assignments 表）

课程字段（courses）：`course_id, course_code, name, teacher, semester`

作业字段（assignments）：`assignment_id, course_id, title, description, attachment_url, deadline, created_at`

1) 获取课程列表
- 接口：`GET /api/v1/courses`
- 参数：`semester`（可选），`page`，`pageSize`
- items 每项：`course_id, course_code, name, teacher, semester`

2) 获取课程详情
- 接口：`GET /api/v1/courses/{course_id}`
- items/返回字段同上（如需扩展可在后端关联更多信息）

3) 获取课程作业列表
- 接口：`GET /api/v1/courses/{course_id}/assignments`
- 返回 items：
```json
{
  "assignment_id": 1,
  "course_id": 1,
  "title": "第一次作业",
  "description": "...",
  "attachment_url": "/files/assignments/1/spec.pdf",
  "deadline": "2024-03-15T23:59:59Z",
  "created_at": "2024-02-01T10:00:00Z"
}
```

4) 获取作业详情
- 接口：`GET /api/v1/assignments/{assignment_id}`
- 返回同 `assignments` 表字段

5) 提交作业
- 接口：`POST /api/v1/assignments/{assignment_id}/submit`
- 请求格式：`multipart/form-data`，字段：`file`（必需）、`comment`（可选）
- 上传后 `submissions` 表会保存 `submission_id, assignment_id, user_id, file_url, submitted_at, score, feedback`。
- 成功响应 data 示例：
```json
{
  "submission_id": 101,
  "assignment_id": 1,
  "user_id": 10,
  "file_url": "/files/submissions/101/program.zip",
  "submitted_at": "2024-03-14T15:30:00Z",
  "score": null,
  "feedback": null
}
```

6) 查询提交记录（示例）
- 接口（可实现）：`GET /api/v1/assignments/{assignment_id}/submissions/me` 返回当前用户对该作业的提交记录（从 `submissions` 表查询）。

---

## 五、论坛（posts, comments 表）

posts 字段：`post_id, user_id, title, content, category, like_count, view_count, created_at, updated_at`
comments 字段：`comment_id, post_id, user_id, content, parent_id, created_at`

1) 获取帖子列表
- 接口：`GET /api/v1/posts`
- 支持参数：`category`, `sort_by`（如 `created_at`/`like_count`/`view_count`）, `order` (`asc`/`desc`), `page`, `pageSize`

示例请求：
`GET /api/v1/posts?category=学习交流&sort_by=created_at&order=desc&page=1&pageSize=20`

成功响应示例：
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
        "author": { "user_id": 2, "name": "李四", "avatar_url": "/avatars/user2.png" },
        "category": "学习交流",
        "like_count": 15,
        "view_count": 120,
        "comment_count": 8,
        "created_at": "2024-03-10T14:30:00Z"
      }
    ],
    "pagination": { "total": 156, "page": 1, "pageSize": 20, "totalPages": 8 }
  }
}
```

2) 获取帖子详情
- 接口：`GET /api/v1/posts/{post_id}`
- 返回：帖子详情（posts 表字段）以及该帖的分页评论（来自 comments 表）
示例请求：`GET /api/v1/posts/1?page=1&pageSize=20`

成功响应示例：
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "post": {
      "post_id": 1,
      "title": "寻找一起学习的小伙伴",
      "content": "帖子完整内容...",
      "user_id": 2,
      "category": "学习交流",
      "like_count": 15,
      "view_count": 121,
      "created_at": "2024-03-10T14:30:00Z",
      "updated_at": "2024-03-10T14:30:00Z"
    },
    "comments": {
      "items": [
        {
          "comment_id": 1,
          "post_id": 1,
          "user_id": 3,
          "content": "我也有这个想法，一起学习效率更高",
          "parent_id": null,
          "created_at": "2024-03-10T15:00:00Z",
          "replies": []
        }
      ],
      "pagination": { "total": 8, "page": 1, "pageSize": 20, "totalPages": 1 }
    }
  }
}
```

3) 发布帖子
- 接口：`POST /api/v1/posts`
- 请求体：`title, content, category`，创建者信息取自 token 对应用户
请求示例：multipart/json body or JSON

成功响应示例（201）：
```json
{
  "code": 200,
  "message": "帖子发布成功",
  "data": {
    "post_id": 3,
    "user_id": 10,
    "title": "寻找一起学习的小伙伴",
    "content": "帖子的完整内容...",
    "category": "学习交流",
    "like_count": 0,
    "view_count": 0,
    "created_at": "2024-03-11T09:00:00Z"
  }
}
```

4) 编辑 / 删除 帖子
- 接口：`PUT /api/v1/posts/{post_id}`，`DELETE /api/v1/posts/{post_id}`（仅限作者）

5) 发表评论
- 接口：`POST /api/v1/posts/{post_id}/comments`
- 请求体：`content, parent_id`（parent_id 可空，用于楼中楼）
请求示例（JSON）:
```json
{ "content": "我也参加", "parent_id": null }
```

成功响应示例（201）：
```json
{
  "code": 200,
  "message": "评论发表成功",
  "data": {
    "comment_id": 9,
    "post_id": 1,
    "user_id": 3,
    "content": "我也有这个想法，一起学习效率更高",
    "parent_id": null,
    "created_at": "2024-03-11T11:00:00Z"
  }
}
```

6) 删除评论
- 接口：`DELETE /api/v1/comments/{comment_id}`（仅限评论作者）

注：数据库中未包含点赞表（post_likes/comment_likes），如需精确记录点赞动作建议新增关联表（见扩展）。

8) 帖子点赞
- 接口：`POST /api/v1/posts/{post_id}/like`
- 功能：切换点赞（如果不存在则新增 post_likes 记录并增量更新 `posts.like_count`，已存在则删除并减计）
- 推荐新增表结构：
```sql
CREATE TABLE post_likes (
  like_id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_post_user (post_id, user_id)
);
```

成功响应示例：
```json
{ "code": 200, "message": "点赞成功", "data": { "post_id": 1, "like_count": 16, "is_liked": true } }
```


---

## 六、通知与文件（notifications, files 表）

1) 通知（notifications 表）
- 表字段（关键信息）：`notification_id, user_id, title, content, type, is_read, related_url, created_at`

- 获取通知列表
  - 接口：`GET /api/v1/notifications`（需要认证）
  - 参数：`page`, `pageSize`, `is_read`（可选，true/false）
  - 成功响应示例：
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "notification_id": 11,
        "user_id": 10,
        "title": "作业成绩已发布",
        "content": "你在课程《算法导论》的作业得分为 90 分",
        "type": "assignment_grade",
        "is_read": false,
        "related_url": "/courses/5/assignments/12/submissions/101",
        "created_at": "2024-03-15T08:00:00Z"
      }
    ],
    "pagination": { "total": 23, "page": 1, "pageSize": 20, "totalPages": 2 }
  }
}
```

- 标记单条通知为已读
  - 接口：`PUT /api/v1/notifications/{notification_id}/read`（需要认证）
  - 成功响应示例：
```json
{ "code": 200, "message": "已标记为已读", "data": { "notification_id": 11, "is_read": true } }
```

- 标记全部为已读（可选）
  - 接口：`PUT /api/v1/notifications/read-all`（需要认证）
  - 成功响应示例：`{ "code":200, "message":"全部已读", "data": null }`

2) 文件（files 表）
- 表字段（关键信息）：`file_id, user_id, file_name, file_url, file_size, mime_type, created_at`

- 上传文件
  - 接口：`POST /api/v1/files/upload`（需要认证）
  - 请求：`multipart/form-data`，字段：`file`（必需），可选 `purpose` 或 `related_id` 用于关联（例如 assignment 提交）
  - 服务端行为建议：保存文件到持久存储（本地或对象存储），将访问 URL 写入 `file_url` 字段，并记录上传用户 `user_id`。
  - 成功响应示例（201）：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "file_id": 501,
    "file_name": "homework.zip",
    "file_url": "/uploads/files/501/homework.zip",
    "file_size": 123456,
    "mime_type": "application/zip",
    "user_id": 10,
    "created_at": "2024-03-14T15:30:00Z"
  }
}
```

- 获取文件元信息
  - 接口：`GET /api/v1/files/{file_id}`（需要认证视策略而定）
  - 成功响应示例：
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "file_id": 501,
    "file_name": "homework.zip",
    "file_url": "/uploads/files/501/homework.zip",
    "file_size": 123456,
    "mime_type": "application/zip",
    "user_id": 10,
    "created_at": "2024-03-14T15:30:00Z"
  }
}
```

- 下载文件（建议实现为重定向或直接返回文件流）
  - 接口：`GET /api/v1/files/{file_id}/download`
  - 行为：根据 `file_url` 返回 302 重定向到存储 URL，或返回 `application/octet-stream` 的文件流。

- 删除文件（仅上传者或管理员）
  - 接口：`DELETE /api/v1/files/{file_id}`（需要认证并校验权限）
  - 成功响应示例：`{ "code":200, "message":"删除成功", "data": null }`


---

## 七、数据库与接口对齐说明（要点）
- 以 `backend/database/database.sql` 中表结构为准：
  - `users`、`mini_programs`、`courses`、`assignments`、`submissions`、`posts`、`comments`、`notifications`、`files` 为核心数据表。
  - 若需要点赞记录或其它关联关系（例如 `post_likes`），应新增对应表以避免并发计数错误。

---

## 八、示例错误与校验
- 未认证：`401`，返回 `{ code: 401, message: "未认证，请先登录", data: null }`。
- 参数错误：`400`，返回 `{ code: 400, message: "请求参数错误", data: { errors: {...} } }`。

---

**文档版本**: v1.0

**说明**: 我已将 API 文档与 `backend/database/database.sql` 中的表字段对齐，必要时可根据 `backend/app.py` 的实现细化各接口的输入/输出示例（例如登录返回的字段）。
 
---

## 精确接口（基于 `backend/app.py` 与数据库结构）

注意：下列接口以实际实现为准；文中字段名直接使用数据库列名以保证一致性。

1) 用户认证
- POST `/api/v1/auth/login`（无需认证）
  - 请求 JSON：{ "student_id": "<学号>", "password": "<明文密码>" }
  - 成功响应 data（与 `LoginResponse` 对应）：
    { "token": "<jwt>", "user_id": 1, "student_id": "20210001" }
  - 错误示例：401 用户不存在或密码错误；423 账户被临时锁定（实现中会返回 detail 包含 code/message）

2) 当前用户信息
- GET `/api/v1/me`（需要认证，依赖 `get_current_user`）
  - 返回模型（与 `UserInfomation` 对齐）：
    {
      "user_id": 1,
      "student_id": "20210001",
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "avatar_url": "/avatars/default.png",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-02T10:00:00Z"
    }

3) 更新当前用户
- PUT `/api/v1/users/me`（需要认证）
  - 请求 JSON（字段可选）：`name,email,phone,avatar_url,old_password,new_password`（若改密码需同时提供旧/新密码）
  - 返回示例：{ "code":200, "message":"更新成功", "data": { user 信息... } }

4) 小程序（mini_programs 表）
- GET `/api/v1/mini-programs`（需要认证，可选 `category` 筛选）
  - 返回：数组，每项字段与表列一致：`program_id,name,icon_url,description,url,category,is_active,display_order,created_at`

5) 课程（courses 表）
- GET `/api/v1/courses`（需要认证，可选 `semester` 筛选）
  - 返回 items：`course_id,course_code,name,teacher,semester`
- GET `/api/v1/courses/{course_id}`（需要认证）
  - 若课程不存在返回 401 或 404（实现中对课程不存在抛出 401 或 404，客户端应容错处理）

6) 作业（assignments 表）
- GET `/api/v1/courses/{course_id}/assignments`（需要认证）
  - 列表项：`assignment_id,course_id,title,description,attachment_url,deadline,created_at`
- GET `/api/v1/assignments/{assignment_id}`（需要认证）
  - 返回作业详细（与 `AssignmentOut` 对齐）
- POST `/api/v1/assignments/{assignment_id}/submit`（需要认证）
  - 请求：`multipart/form-data`，字段 `file`（必需），`comment`（可选）
  - 服务端行为（实现细节）：保存提交记录到 `submissions` 表、存文件到 `uploads/submissions/`，并把 `file_url` 写回 `submission.file_url`。
  - 成功返回（与 `SubmissionOut` 对齐）：
    { "submission_id": <int>, "assignment_id": <int>, "user_id": <int>, "file_url": "<url>", "submitted_at": "<ISO>", "score": null, "feedback": null }

7) 其他表（数据库已建）
- `posts`, `comments`, `notifications`, `files` 在 `database.sql` 中定义；当前 `backend/app.py` 实现了作业/用户/小程序相关接口，论坛与文件接口在项目中存在（或可在 `server.py` / 其他模块实现）。建议按需实现并保持字段名与数据库一致。

---

## 注意事项与对齐规则
- 优先级：数据库结构（`database.sql`） > `backend/app.py` 实现 > 旧版设计草稿。
- 返回时间字段：实现中有时使用字符串（数据库 DATETIME）；客户端应解析 ISO 8601 或数据库时间格式。
- 错误返回：部分实现使用 `HTTPException` 的 `detail` 字段返回自定义 JSON（例如登录锁定会返回 detail 包含 code/message），API 使用者请读取 `response.status_code` 并解析 `detail` 或 `data`。

---

如需，我可以：
- 把 `posts/comments/files/notifications` 的 API 按 `database.sql` 补全到 `backend/documents/api.md`（包含请求/响应示例）；或
- 将 `backend/app.py` 中的缺失实现（例如课程-返回值的类型错误）修正为与数据库严格一致，并把修订后的示例写入文档。请选择下一步。
