# 校园综合平台 API 文档（与当前实现对齐）

## 文档说明
- 基础路径：`/api/v1`
- 认证方式：JWT（`Authorization: Bearer <token>`）
- 成功响应：`{ "code": 200, "message": "成功", "data": { ... } }`
- 错误返回：以 HTTP 状态码为准；`detail` 可能是字符串或结构化 JSON（如 `{"error":{"code":"...","message":"..."}}`）
- 时间字段：UTC（ISO 8601）或数据库 DATETIME，前端需容错

---

## 认证

- 登录
  - `POST /auth/login`
  - 请求：`{ "student_id": "20210001", "password": "plaintext" }`
  - 成功：`{ "token": "<jwt>", "user_id": 1, "student_id": "20210001" }`
  - 可能错误：401 未授权；423 账户锁定（失败次数过多）
  - 参考实现：`src/routers/auth.py`

- 注册
  - `POST /auth/register`
  - 请求：`{ "student_id": "...", "password": "...", "name": "...", "email": "...?", "phone": "..." }`
  - 校验：学号唯一、邮箱唯一（可选）、手机号必填非空
  - 成功：同登录返回
  - 可能错误：409（USER_EXISTS/EMAIL_EXISTS）、422（PHONE_REQUIRED）

---

## 用户

- 获取当前用户信息
  - `GET /me`（需认证）
  - 成功返回字段：`user_id, student_id, name, email, phone, avatar_url, created_at, updated_at`
  - 参考实现：`src/routers/user.py`

- 更新当前用户
  - `POST /user/update`（需认证，`multipart/form-data`）
  - 字段：`name?`, `email?`, `phone?`, `avatar(文件)?`, `avatar_url?`
  - 规则：
    - 传文件 `avatar` 时保存并更新 `avatar_url`
    - 传 `avatar_url` 时直接更新
    - `phone` 若提供则必须非空白（空白返回 422）
  - 成功：`{ "code": 200, "message": "更新成功", "data": { ...用户信息... } }`

---

## 小程序

- 获取列表
  - `GET /mini-programs`（需认证）
  - 参数：`category?`
  - 返回项字段：`program_id, name, icon_url, description, url, category, is_active, display_order, created_at`
  - 参考实现：`src/routers/mini_program.py`

---

## 课程与作业

- 获取课程列表
  - `GET /courses`（需认证）
  - 参数：`semester?`
  - 返回项：`course_id, course_code, name, teacher, semester`

- 获取课程详情
  - `GET /courses/{course_id}`（需认证）
  - 不存在时返回 404

- 获取课程作业
  - `GET /courses/{course_id}/assignments`（需认证）
  - 返回项：`assignment_id, course_id, title, description, attachment_url, deadline, created_at`

- 获取作业详情
  - `GET /assignments/{assignment_id}`（需认证）
  - 不存在时返回 404

- 提交作业
  - `POST /assignments/{assignment_id}/submit`（需认证，`multipart/form-data`）
  - 字段：`file`（必填），`comment?`
  - 成功返回：`submission_id, assignment_id, user_id, file_url, submitted_at, score, feedback`
  - 参考实现：`src/routers/course.py`

---

## 帖子与评论

- 获取帖子列表
  - `GET /posts`（需认证）
  - 参数：`category?`, `sort_by?`（`created_at|like_count|view_count`）, `order?`（`asc|desc`）, `page?`（默认1）, `pageSize?`（默认20）
  - 返回项：
    - 基本字段：`post_id, title, content_preview, category, like_count, view_count, comment_count, created_at`
    - 嵌套 `author`：`{ user_id, student_id, name, avatar_url }`
  - 参考实现：`src/routers/post.py`

- 获取帖子详情
  - `GET /posts/{post_id}`（需认证）
  - 返回：
    - `post`: `{ post_id, title, content, author{ user_id, student_id, name, avatar_url }, category, like_count, view_count, created_at, updated_at }`
    - `comments`: `{ items: [...], pagination: { total, page, pageSize, totalPages } }`
  - 评论项包含：`comment_id, post_id, user_id, student_id, name, avatar_url, content, parent_id, created_at, replies[...]`
  - 回复项包含：`comment_id, post_id, user_id, student_id, name, content, parent_id, created_at`
  - 性能：使用预加载避免 N+1 查询

- 发布帖子
  - `POST /posts`（需认证，`multipart/form-data`）
  - 字段：`title`, `content`, `category?`
  - 成功返回包含 `author` 嵌套对象

- 编辑帖子
  - `PUT /posts/{post_id}`（需认证，作者权限）
  - 字段：`title?`, `content?`, `category?`
  - 成功：`{ code: 200, message: "更新成功", data: { post_id, author{...} } }`

- 删除帖子
  - `DELETE /posts/{post_id}`（需认证，作者权限）

- 发表评论
  - `POST /posts/{post_id}/comments`（需认证，`multipart/form-data`）
  - 字段：`content`, `parent_id?`
  - 成功返回包含 `student_id, name, avatar_url`

- 删除评论
  - `DELETE /comments/{comment_id}`（需认证，评论作者权限）

- 点赞/取消点赞
  - `POST /posts/{post_id}/like`（需认证）
  - 行为：切换点赞，返回 `{ post_id, like_count, is_liked }`
  - 并发：使用行级锁保证 `like_count` 一致性

---

## 通知

- 获取通知列表
  - `GET /notifications`（需认证）
  - 参数：`page?`, `pageSize?`, `is_read?`
  - 返回：`items` + `pagination`

- 标记单条为已读
  - `PUT /notifications/{notification_id}/read`（需认证）

- 标记全部为已读
  - `PUT /notifications/read-all`（需认证）

---

## 认证令牌与密钥
- 令牌签发：`create_access_token`（`src/security.py`）
- 密钥来源：环境变量 `SECRET_KEY`（未设置则使用默认值）
- 多实例部署：所有实例必须使用相同的 `SECRET_KEY`
- 更换密钥会导致旧令牌失效

---

## 统一约定与错误
- 受保护接口需携带 `Authorization: Bearer <token>`
- 列表接口建议统一使用 `items` 与 `pagination`
- 错误返回：
  - 使用 HTTP 状态码（如 401/403/404/500）
  - `detail` 可能为字符串或结构化 JSON（例如登录锁定返回 `{ "error": { "code": "...", "message": "..." } }`）

---

文档版本：v1.0（已与当前代码实现对齐）
