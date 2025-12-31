INSERT INTO users (student_id, password_hash, salt, name, phone) VALUES
('2023114511','f889bcf5a11bdfd50f15db8affb4cc326305b65a46a19b95061c08f9ad46bd85','c278ffbaa6f7c1af11010a6b6740e8b7','张三','13800000001'),
('2023114512','d27fd662e7194e5dbdff831116c229e15b197618084b38f471c647f00040a1c5','1c6b8c96f36569c64ed78b3ad23ca7b4','李四','13800000002'),
('2023114513','df5568cb9df066e4cd0bb19c3068cf6625301a302823f28eb4cc55af52dd9d0b','cefc9e4f351e874e787c9c9cfa9aad0c','王五','13800000003'),
('2023114514','3260bf2fb3c3fccda63aa1c7fd59e2fa719d0447f8236d84a97b204a888d9e49','9a545234ee1674c246d1170755053144','赵六','13800000004'),
('2023114515','8b214b1ae11201cdba3848c8e4e0b3db176d49bd5e23bebaf0a255b7f3587537','a781e6fabdfa14271d7b138d687e1dab','周七','13800000005'),
('2023114516','537b0f37bdf114d19ac6464285983a03511de7de2368ed532a9333198d23224e','9c942310e908f8a35b7e27c35325c319','吴八','13800000006'),
('2023114517','3455663178053b926491219e1330c76649109ef107d019a01e76529ab8eb9fe5','353b2c5f86eb02a26858d3dddba79fe5','郑九','13800000007'),
('2023114518','47097b05480d19fdaad44e8d88e903df205184cbf27522f5361a9c47321e93fa','be793e4cd180c5bd2510d5e134c054e9','冯十','13800000008')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  salt = VALUES(salt),
  name = VALUES(name),
  phone = VALUES(phone);

INSERT INTO courses (course_code, name, teacher, semester) VALUES
('CS101','计算机基础','张老师','2025春'),
('MATH201','高等数学','李老师','2025春'),
('ENG105','大学英语','王老师','2025春')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  teacher = VALUES(teacher),
  semester = VALUES(semester);

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '第一次编程作业', '完成基本语法练习', '/attachments/cs101_hw1.pdf', '2025-03-01 23:59:59'
FROM courses WHERE course_code='CS101';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '第二次编程作业', '实现简单控制流与函数', '/attachments/cs101_hw2.pdf', '2025-03-15 23:59:59'
FROM courses WHERE course_code='CS101';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '极限与导数作业一', '计算基础极限与求导题', '/attachments/math201_hw1.pdf', '2025-03-05 23:59:59'
FROM courses WHERE course_code='MATH201';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '积分与应用作业二', '定积分计算及几何应用', '/attachments/math201_hw2.pdf', '2026-01-20 23:59:59'
FROM courses WHERE course_code='MATH201';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '英语阅读作业一', '完成阅读理解并写摘要', '/attachments/eng105_hw1.pdf', '2026-01-08 23:59:59'
FROM courses WHERE course_code='ENG105';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '计算机网络实验', '实现简单的Socket通信', NULL, '2026-01-10 23:59:59'
FROM courses WHERE course_code='CS101';

INSERT INTO assignments (course_id, title, description, attachment_url, deadline)
SELECT course_id, '操作系统作业', '进程调度算法分析', NULL, '2026-01-20 23:59:59'
FROM courses WHERE course_code='CS101';


