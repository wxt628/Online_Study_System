-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS campus_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_platform;

-- 1. 用户表（修改版）
CREATE TABLE users (
    user_id               INT             PRIMARY KEY AUTO_INCREMENT                                COMMENT '用户ID',
    student_id            VARCHAR(20)     UNIQUE NOT NULL                                           COMMENT '学号',
    password_hash         VARCHAR(255)    NOT NULL                                                  COMMENT '密码哈希（加密存储）',
    salt                  VARCHAR(32)     NOT NULL                                                  COMMENT '密码盐值',
    failed_attempts       INT             DEFAULT 0                                                 COMMENT '连续登录失败次数',
    locked_until          DATETIME        DEFAULT NULL                                              COMMENT '账户锁定截止时间',
    name                  VARCHAR(50)     NOT NULL                                                  COMMENT '姓名',
    email                 VARCHAR(100)    UNIQUE                                                    COMMENT '邮箱',
    phone                 VARCHAR(20)                                                               COMMENT '手机号',
    avatar_url            VARCHAR(255)    DEFAULT NULL                                              COMMENT '头像链接',
    created_at            DATETIME        DEFAULT CURRENT_TIMESTAMP                                 COMMENT '创建时间',
    updated_at            DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP     COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4                                                             COMMENT='用户表';

-- 索引
CREATE INDEX idx_student_id ON users(student_id);
CREATE INDEX idx_email ON users(email);

-- 测试
INSERT INTO users (student_id, salt, password_hash, name, email, phone, created_at, updated_at)
VALUES (
    '2023114514', 
    'asdfghjkl', 
    '9673a6a354baccfd04a0ac740c9c8471e61fce6252a330e6cc921347cb08400f', 
    '张三', 
    '2023114514@szu.edu.cn',
		"19198101145",
    NOW(), 
    NOW()
);

-- 2. 小程序表
CREATE TABLE mini_programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '小程序ID',
    name VARCHAR(100) NOT NULL COMMENT '小程序名称',
    icon_url VARCHAR(255) COMMENT '图标链接',
    description TEXT COMMENT '描述',
    url VARCHAR(255) NOT NULL COMMENT '跳转链接或路由',
    category VARCHAR(50) DEFAULT '其他' COMMENT '分类',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    display_order INT DEFAULT 0 COMMENT '显示顺序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小程序表';

-- 索引
CREATE INDEX idx_category ON mini_programs(category);
CREATE INDEX idx_is_active ON mini_programs(is_active);

-- 3. 课程表
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID',
    course_code VARCHAR(50) UNIQUE NOT NULL COMMENT '课程代码',
    name VARCHAR(100) NOT NULL COMMENT '课程名称',
    teacher VARCHAR(50) NOT NULL COMMENT '教师',
    semester VARCHAR(20) NOT NULL COMMENT '学期'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- 索引
CREATE INDEX idx_course_code ON courses(course_code);
CREATE INDEX idx_semester ON courses(semester);

-- 4. 作业表
CREATE TABLE assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '作业ID',
    course_id INT NOT NULL COMMENT '课程ID',
    title VARCHAR(200) NOT NULL COMMENT '作业标题',
    description TEXT COMMENT '作业描述',
    attachment_url VARCHAR(255) COMMENT '附件链接',
    deadline DATETIME COMMENT '截止时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';

-- 索引
CREATE INDEX idx_course_id ON assignments(course_id);
CREATE INDEX idx_deadline ON assignments(deadline);

-- 5. 作业提交表
CREATE TABLE submissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '提交ID',
    assignment_id INT NOT NULL COMMENT '作业ID',
    user_id INT NOT NULL COMMENT '用户ID',
    file_url VARCHAR(255) NOT NULL COMMENT '提交文件链接',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    score FLOAT COMMENT '成绩',
    feedback TEXT COMMENT '教师反馈',
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业提交表';

-- 索引
CREATE INDEX idx_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_user_id ON submissions(user_id);

-- 6. 帖子表
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    content TEXT NOT NULL COMMENT '帖子内容',
    category VARCHAR(50) DEFAULT '校园' COMMENT '分类',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    view_count INT DEFAULT 0 COMMENT '浏览数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发帖时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子表';

-- 索引
CREATE INDEX idx_user_id_posts ON posts(user_id);
CREATE INDEX idx_category ON posts(category);
CREATE INDEX idx_created_at ON posts(created_at);

-- 7. 评论表
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    post_id INT NOT NULL COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id INT DEFAULT NULL COMMENT '父评论ID（用于楼中楼）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 索引
CREATE INDEX idx_post_id ON comments(post_id);
CREATE INDEX idx_parent_id ON comments(parent_id);

-- 8. 通知表（可选）
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id INT NOT NULL COMMENT '目标用户ID',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    type VARCHAR(50) COMMENT '通知类型（作业、回复等）',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    related_url VARCHAR(255) COMMENT '相关链接',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- 索引
CREATE INDEX idx_user_id_notifications ON notifications(user_id);
CREATE INDEX idx_is_read ON notifications(is_read);

-- 9. 文件表（可选）
CREATE TABLE files (
    file_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    user_id INT NOT NULL COMMENT '上传用户ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(255) NOT NULL COMMENT '文件链接',
    file_size INT COMMENT '文件大小（字节）',
    mime_type VARCHAR(100) COMMENT '文件类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件存储表';

-- 索引
CREATE INDEX idx_user_id_files ON files(user_id);

-- 10. 帖子点赞记录（用户级别点赞，避免并发计数问题）
CREATE TABLE post_likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录ID',
    post_id INT NOT NULL COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY unique_post_user (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子点赞记录表';

CREATE INDEX idx_post_id_likes ON post_likes(post_id);
CREATE INDEX idx_user_id_likes ON post_likes(user_id);
