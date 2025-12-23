// 作业平台模拟数据
const assignmentsData = {
    // 当前用户信息
    currentUser: null,
    
    // 模拟用户数据
    users: [
        {
            user_id: 1,
            student_id: "20210001",
            name: "张三",
            email: "zhangsan@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=张三",
            phone: "13800138000",
            created_at: "2023-09-01T10:00:00Z",
            updated_at: "2024-03-10T14:30:00Z"
        },
        {
            user_id: 2,
            student_id: "20210002",
            name: "李四",
            email: "lisi@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四",
            phone: "13800138001",
            created_at: "2023-09-05T14:30:00Z",
            updated_at: "2024-03-09T09:15:00Z"
        }
    ],
    
    // 课程数据
    courses: [
        {
            course_id: 1,
            course_code: "CS101",
            name: "计算机科学导论",
            teacher: "王教授",
            semester: "2024-2025-1",
            description: "计算机科学基础课程，涵盖编程基础、算法入门等内容"
        },
        {
            course_id: 2,
            course_code: "MA101",
            name: "高等数学",
            teacher: "李教授",
            semester: "2024-2025-1",
            description: "高等数学基础课程，包括微积分、线性代数等内容"
        },
        {
            course_id: 3,
            course_code: "CS201",
            name: "数据结构",
            teacher: "张教授",
            semester: "2024-2025-1",
            description: "数据结构与算法课程，涵盖链表、树、图等数据结构"
        },
        {
            course_id: 4,
            course_code: "EN101",
            name: "大学英语",
            teacher: "刘教授",
            semester: "2024-2025-1",
            description: "大学英语基础课程，包括听说读写综合训练"
        },
        {
            course_id: 5,
            course_code: "PH101",
            name: "大学物理",
            teacher: "陈教授",
            semester: "2023-2024-2",
            description: "大学物理基础课程，涵盖力学、电磁学等内容"
        }
    ],
    
    // 作业数据
    assignments: [
        {
            assignment_id: 1,
            course_id: 1,
            title: "第一次编程作业",
            description: "实现基本的排序算法，包括冒泡排序、快速排序和归并排序。要求：\n1. 使用任意编程语言实现三种排序算法\n2. 对随机生成的数组进行排序测试\n3. 比较三种算法的性能差异\n4. 提交源代码和实验报告",
            attachment_url: "/files/assignments/1/sorting-algorithms.pdf",
            attachment_name: "排序算法作业要求.pdf",
            deadline: "2024-03-15T23:59:59Z",
            created_at: "2024-02-01T10:00:00Z"
        },
        {
            assignment_id: 2,
            course_id: 1,
            title: "数据结构实现作业",
            description: "实现链表数据结构，包括单链表和双链表。要求：\n1. 实现链表的基本操作（插入、删除、查找）\n2. 实现链表的反转操作\n3. 测试链表的功能正确性\n4. 编写使用示例",
            attachment_url: "/files/assignments/2/linked-list.pdf",
            attachment_name: "链表实现要求.pdf",
            deadline: "2024-04-15T23:59:59Z",
            created_at: "2024-03-01T10:00:00Z"
        },
        {
            assignment_id: 3,
            course_id: 2,
            title: "高等数学第三章习题",
            description: "完成高等数学教材第三章课后习题，包括：\n1. 习题1-20全部完成\n2. 第21-30题选做5题\n3. 需要写出详细的解题步骤\n4. 提交手写版或电子版",
            attachment_url: "/files/assignments/3/calculus-exercises.pdf",
            attachment_name: "高等数学习题.pdf",
            deadline: "2024-03-20T23:59:59Z",
            created_at: "2024-02-15T14:30:00Z"
        },
        {
            assignment_id: 4,
            course_id: 3,
            title: "二叉树遍历算法",
            description: "实现二叉树的三种遍历算法：前序、中序、后序遍历。要求：\n1. 使用递归和非递归两种方式实现\n2. 构建测试二叉树并验证遍历结果\n3. 分析不同实现方式的性能\n4. 提交源代码和测试结果",
            attachment_url: "/files/assignments/4/binary-tree.pdf",
            attachment_name: "二叉树作业要求.pdf",
            deadline: "2024-03-25T23:59:59Z",
            created_at: "2024-02-20T09:15:00Z"
        },
        {
            assignment_id: 5,
            course_id: 4,
            title: "英语写作练习",
            description: "写一篇关于大学生活的英语短文，要求：\n1. 字数300-500词\n2. 主题明确，结构清晰\n3. 语法正确，用词恰当\n4. 提交电子版文档",
            attachment_url: "/files/assignments/5/english-writing.pdf",
            attachment_name: "英语写作要求.pdf",
            deadline: "2024-03-10T23:59:59Z",
            created_at: "2024-02-10T11:20:00Z"
        },
        {
            assignment_id: 6,
            course_id: 5,
            title: "力学实验报告",
            description: "完成力学实验并撰写实验报告，内容包括：\n1. 实验目的和原理\n2. 实验步骤和数据处理\n3. 结果分析和讨论\n4. 实验心得和思考题",
            attachment_url: "/files/assignments/6/physics-lab.pdf",
            attachment_name: "力学实验指导.pdf",
            deadline: "2024-02-28T23:59:59Z", // 已截止
            created_at: "2024-01-15T13:45:00Z"
        }
    ],
    
    // 作业提交记录
    submissions: [
        {
            submission_id: 101,
            assignment_id: 1,
            user_id: 1,
            file_url: "/files/submissions/101/sorting-algorithms.zip",
            file_name: "张三_排序算法作业.zip",
            submitted_at: "2024-03-14T15:30:00Z",
            comment: "已完成三种排序算法的实现和测试",
            score: 90.5,
            feedback: "代码结构清晰，算法实现正确，但有少量优化空间。建议在快速排序中优化基准元素的选择策略。",
            status: "graded"
        },
        {
            submission_id: 102,
            assignment_id: 5,
            user_id: 1,
            file_url: "/files/submissions/102/english-essay.docx",
            file_name: "张三_英语写作.docx",
            submitted_at: "2024-03-09T10:15:00Z",
            comment: "英语短文：我的大学生活",
            score: 88.0,
            feedback: "文章结构清晰，语言流畅，但有一些语法小错误需要注意。",
            status: "graded"
        },
        {
            submission_id: 103,
            assignment_id: 3,
            user_id: 1,
            file_url: "/files/submissions/103/calculus-homework.pdf",
            file_name: "张三_高数作业.pdf",
            submitted_at: "2024-03-18T20:45:00Z",
            comment: "第三章习题已完成",
            score: 95.0,
            feedback: "解题步骤详细，答案准确，完成质量很高！",
            status: "graded"
        },
        {
            submission_id: 104,
            assignment_id: 6,
            user_id: 1,
            file_url: "/files/submissions/104/physics-report.pdf",
            file_name: "张三_力学实验报告.pdf",
            submitted_at: "2024-02-25T14:20:00Z",
            comment: "力学实验报告",
            score: 92.0,
            feedback: "实验数据记录完整，分析深入，报告格式规范。",
            status: "graded"
        },
        {
            submission_id: 105,
            assignment_id: 2,
            user_id: 1,
            file_url: "/files/submissions/105/linked-list.cpp",
            file_name: "张三_链表实现.cpp",
            submitted_at: "2024-04-10T16:30:00Z",
            comment: "链表数据结构实现",
            score: null,
            feedback: null,
            status: "submitted"
        }
    ],
    
    // 平台统计数据
    stats: {
        pendingCount: 2,
        submittedCount: 5,
        averageScore: 91.375,
        upcomingCount: 3,
        lastUpdate: "2024-03-11"
    }
};

// 从本地存储加载用户信息
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('campusUser');
    if (savedUser) {
        assignmentsData.currentUser = JSON.parse(savedUser);
    }
}

// 保存用户信息到本地存储
function saveUserToStorage() {
    if (assignmentsData.currentUser) {
        localStorage.setItem('campusUser', JSON.stringify(assignmentsData.currentUser));
    } else {
        localStorage.removeItem('campusUser');
    }
}

// 获取课程信息
function getCourseById(courseId) {
    return assignmentsData.courses.find(course => course.course_id === courseId);
}

// 获取作业信息
function getAssignmentById(assignmentId) {
    return assignmentsData.assignments.find(assignment => assignment.assignment_id === assignmentId);
}

// 获取用户的课程列表
function getUserCourses(semester = null) {
    let courses = [...assignmentsData.courses];
    
    // 如果指定了学期，则按学期筛选
    if (semester && semester !== 'all') {
        courses = courses.filter(course => course.semester === semester);
    }
    
    return courses;
}

// 获取指定课程的作业
function getAssignmentsByCourseId(courseId, status = 'all') {
    let assignments = assignmentsData.assignments.filter(assignment => assignment.course_id === courseId);
    
    // 按状态筛选
    if (status !== 'all') {
        assignments = assignments.filter(assignment => {
            const now = new Date();
            const deadline = new Date(assignment.deadline);
            
            if (status === 'expired') {
                return deadline < now;
            } else if (status === 'pending') {
                return deadline >= now && !hasUserSubmittedAssignment(assignment.assignment_id);
            } else if (status === 'submitted') {
                return hasUserSubmittedAssignment(assignment.assignment_id);
            }
            return true;
        });
    }
    
    return assignments;
}

// 获取用户的所有作业（按课程分组）
function getUserAssignments(courseId = null, status = 'all') {
    let assignments = [...assignmentsData.assignments];
    
    // 如果指定了课程，则筛选该课程的作业
    if (courseId && courseId !== 'all') {
        assignments = assignments.filter(assignment => assignment.course_id === courseId);
    }
    
    // 按状态筛选
    if (status !== 'all') {
        assignments = assignments.filter(assignment => {
            const now = new Date();
            const deadline = new Date(assignment.deadline);
            
            if (status === 'expired') {
                return deadline < now;
            } else if (status === 'pending') {
                return deadline >= now && !hasUserSubmittedAssignment(assignment.assignment_id);
            } else if (status === 'submitted') {
                return hasUserSubmittedAssignment(assignment.assignment_id);
            }
            return true;
        });
    }
    
    return assignments;
}

// 判断用户是否已提交某作业
function hasUserSubmittedAssignment(assignmentId) {
    if (!assignmentsData.currentUser) return false;
    
    return assignmentsData.submissions.some(
        submission => submission.assignment_id === assignmentId && 
                     submission.user_id === assignmentsData.currentUser.user_id
    );
}

// 获取用户对某作业的提交记录
function getUserSubmission(assignmentId) {
    if (!assignmentsData.currentUser) return null;
    
    return assignmentsData.submissions.find(
        submission => submission.assignment_id === assignmentId && 
                     submission.user_id === assignmentsData.currentUser.user_id
    );
}

// 获取用户的所有提交记录
function getUserSubmissions(limit = null) {
    if (!assignmentsData.currentUser) return [];
    
    let submissions = assignmentsData.submissions.filter(
        submission => submission.user_id === assignmentsData.currentUser.user_id
    );
    
    // 按提交时间倒序排序
    submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    // 限制数量
    if (limit && submissions.length > limit) {
        submissions = submissions.slice(0, limit);
    }
    
    return submissions;
}

// 提交作业
function submitAssignment(assignmentId, fileInfo, comment = '') {
    if (!assignmentsData.currentUser) return null;
    
    // 检查作业是否已截止
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return null;
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (deadline < now) {
        return { success: false, message: '作业提交已截止' };
    }
    
    // 生成新的提交ID
    const submissionId = assignmentsData.submissions.length > 0 ? 
        Math.max(...assignmentsData.submissions.map(s => s.submission_id)) + 1 : 1001;
    
    // 创建提交记录
    const newSubmission = {
        submission_id: submissionId,
        assignment_id: assignmentId,
        user_id: assignmentsData.currentUser.user_id,
        file_url: fileInfo.url || '/files/submissions/default.pdf',
        file_name: fileInfo.name || '未命名文件',
        submitted_at: new Date().toISOString(),
        comment: comment,
        score: null,
        feedback: null,
        status: 'submitted'
    };
    
    // 添加到数据
    assignmentsData.submissions.push(newSubmission);
    
    // 更新统计数据
    updateStats();
    
    return { success: true, submission: newSubmission };
}

// 更新统计数据
function updateStats() {
    if (!assignmentsData.currentUser) return;
    
    const now = new Date();
    
    // 待提交作业数（未截止且未提交）
    const pending = assignmentsData.assignments.filter(assignment => {
        const deadline = new Date(assignment.deadline);
        return deadline >= now && !hasUserSubmittedAssignment(assignment.assignment_id);
    }).length;
    
    // 已提交作业数
    const submitted = assignmentsData.submissions.filter(
        submission => submission.user_id === assignmentsData.currentUser.user_id
    ).length;
    
    // 平均成绩
    const gradedSubmissions = assignmentsData.submissions.filter(
        submission => submission.user_id === assignmentsData.currentUser.user_id && 
                     submission.score !== null
    );
    
    const averageScore = gradedSubmissions.length > 0 ? 
        (gradedSubmissions.reduce((sum, sub) => sum + sub.score, 0) / gradedSubmissions.length).toFixed(1) : 0;
    
    // 即将截止的作业数（3天内）
    const upcoming = assignmentsData.assignments.filter(assignment => {
        const deadline = new Date(assignment.deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return deadline >= now && daysLeft <= 3 && !hasUserSubmittedAssignment(assignment.assignment_id);
    }).length;
    
    assignmentsData.stats = {
        pendingCount: pending,
        submittedCount: submitted,
        averageScore: parseFloat(averageScore),
        upcomingCount: upcoming,
        lastUpdate: new Date().toISOString().split('T')[0]
    };
}

// 格式化时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化相对时间
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 计算截止时间剩余
function getDeadlineRemaining(deadlineString) {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline - now;
    
    if (diffMs <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0 };
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
        expired: false,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes
    };
}

// 获取作业状态
function getAssignmentStatus(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return 'unknown';
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (deadline < now) {
        return 'expired';
    }
    
    if (hasUserSubmittedAssignment(assignmentId)) {
        return 'submitted';
    }
    
    return 'pending';
}

// 获取成绩等级
function getGradeLevel(score) {
    if (score === null || score === undefined) return 'ungraded';
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
}

// 初始化数据
loadUserFromStorage();
if (assignmentsData.currentUser) {
    updateStats();
}