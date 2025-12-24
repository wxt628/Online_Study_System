// 校园作业平台 - 主脚本文件
// 注意：此脚本不依赖后端API，所有数据均在本地模拟

// 模拟数据存储
const assignmentsData = {
    // 当前用户信息
    currentUser: null,
    
    // 系统用户列表（模拟）
    users: [
        {
            user_id: 1001,
            name: "张三",
            student_id: "2024123456",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
            email: "zhangsan@campus.edu.cn",
            department: "计算机科学与技术学院"
        },
        {
            user_id: 1002,
            name: "李四",
            student_id: "2024123457",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
            email: "lisi@campus.edu.cn",
            department: "软件工程学院"
        }
    ],
    
    // 课程数据
    courses: [
        {
            course_id: 101,
            name: "数据结构",
            code: "CS201",
            teacher: "王教授",
            semester: "2024-2025-1",
            color: "#667eea",
            credit: 4,
            description: "学习基本数据结构和算法设计"
        },
        {
            course_id: 102,
            name: "数据库系统",
            code: "CS202",
            teacher: "李教授",
            semester: "2024-2025-1",
            color: "#764ba2",
            credit: 3,
            description: "关系数据库设计与管理"
        },
        {
            course_id: 103,
            name: "计算机网络",
            code: "CS203",
            teacher: "张教授",
            semester: "2024-2025-1",
            color: "#f5576c",
            credit: 4,
            description: "计算机网络的原理与应用"
        },
        {
            course_id: 104,
            name: "软件工程",
            code: "CS204",
            teacher: "赵教授",
            semester: "2023-2024-2",
            color: "#4facfe",
            credit: 3,
            description: "软件设计与开发方法论"
        }
    ],
    
    // 作业数据
    assignments: [
        {
            assignment_id: 1001,
            course_id: 101,
            title: "线性表操作实现",
            description: "请使用C语言实现线性表的基本操作，包括：\n1. 初始化线性表\n2. 插入元素\n3. 删除元素\n4. 查找元素\n5. 遍历线性表\n\n要求：\n- 代码要有详细注释\n- 实现链表和顺序表两种存储结构\n- 比较两种实现的性能差异\n- 提交截止时间前需完成所有功能",
            deadline: "2024-03-20T23:59:59",
            created_at: "2024-03-01T09:00:00",
            max_score: 100,
            attachment_url: "/files/assignments/assignment_1001.pdf",
            attachment_name: "线性表作业要求.pdf",
            type: "编程作业"
        },
        {
            assignment_id: 1002,
            course_id: 101,
            title: "栈与队列应用",
            description: "实现一个简单的表达式求值程序，使用栈来处理运算符优先级。\n要求支持加减乘除和括号运算，并能够处理错误输入。",
            deadline: "2024-03-25T23:59:59",
            created_at: "2024-03-05T10:30:00",
            max_score: 100,
            attachment_url: "/files/assignments/assignment_1002.pdf",
            attachment_name: "栈与队列作业要求.pdf",
            type: "编程作业"
        },
        {
            assignment_id: 1003,
            course_id: 102,
            title: "ER图设计",
            description: "为图书馆管理系统设计ER图，要求：\n1. 识别所有实体、属性和关系\n2. 定义适当的主键和外键\n3. 将ER图转换为关系模式\n4. 进行规范化处理（至少达到3NF）",
            deadline: "2024-03-18T23:59:59",
            created_at: "2024-02-28T14:00:00",
            max_score: 100,
            attachment_url: "/files/assignments/assignment_1003.pdf",
            attachment_name: "ER图作业要求.pdf",
            type: "设计作业"
        },
        {
            assignment_id: 1004,
            course_id: 102,
            title: "SQL查询练习",
            description: "基于给定的数据库表结构，完成以下查询：\n1. 基本SELECT查询\n2. 多表连接查询\n3. 聚合函数与分组\n4. 子查询\n5. 数据更新操作",
            deadline: "2024-03-30T23:59:59",
            created_at: "2024-03-10T08:45:00",
            max_score: 100,
            type: "练习作业"
        },
        {
            assignment_id: 1005,
            course_id: 103,
            title: "TCP协议分析",
            description: "使用Wireshark捕获TCP协议通信数据包，分析：\n1. 三次握手过程\n2. 数据传输过程\n3. 四次挥手过程\n4. 流量控制机制",
            deadline: "2024-03-22T23:59:59",
            created_at: "2024-03-03T11:20:00",
            max_score: 100,
            attachment_url: "/files/assignments/assignment_1005.zip",
            attachment_name: "TCP分析实验材料.zip",
            type: "实验报告"
        },
        {
            assignment_id: 1006,
            course_id: 104,
            title: "需求分析文档",
            description: "选择一个软件项目，完成需求分析文档，包括：\n1. 项目背景与目标\n2. 用户角色分析\n3. 功能需求列表\n4. 非功能需求\n5. 用例图与用例描述",
            deadline: "2024-03-15T23:59:59",
            created_at: "2024-02-25T16:10:00",
            max_score: 100,
            attachment_url: "/files/assignments/assignment_1006.docx",
            attachment_name: "需求分析模板.docx",
            type: "文档作业"
        }
    ],
    
    // 提交记录
    submissions: [
        {
            submission_id: 2001,
            assignment_id: 1001,
            user_id: 1001,
            submitted_at: "2024-03-15T14:30:25",
            file_url: "/files/submissions/assignment_1001_zhangsan.zip",
            file_name: "线性表实现.zip",
            comment: "已按要求完成所有功能，性能比较结果在报告中",
            score: 92.5,
            feedback: "代码结构清晰，注释详细。性能比较部分分析不够深入，可以进一步优化算法复杂度分析。",
            status: "graded",
            graded_at: "2024-03-17T10:15:00",
            grader: "王教授"
        },
        {
            submission_id: 2002,
            assignment_id: 1003,
            user_id: 1001,
            submitted_at: "2024-03-16T09:45:12",
            file_url: "/files/submissions/assignment_1003_zhangsan.pdf",
            file_name: "图书馆ER图设计.pdf",
            comment: "包含ER图、关系模式和规范化分析",
            score: 88.0,
            feedback: "ER图设计合理，但部分关系可以进一步细化。规范化分析正确。",
            status: "graded",
            graded_at: "2024-03-18T14:20:00",
            grader: "李教授"
        },
        {
            submission_id: 2003,
            assignment_id: 1006,
            user_id: 1001,
            submitted_at: "2024-03-14T16:20:33",
            file_url: "/files/submissions/assignment_1006_zhangsan.docx",
            file_name: "在线考试系统需求分析.docx",
            comment: "基于在线考试系统项目完成需求分析",
            score: 95.0,
            feedback: "需求分析全面，用例设计合理。非功能需求部分可以更具体一些。",
            status: "graded",
            graded_at: "2024-03-16T11:05:00",
            grader: "赵教授"
        }
    ],
    
    // 统计数据
    stats: {
        pendingCount: 3,
        submittedCount: 3,
        averageScore: 91.8,
        upcomingCount: 2,
        totalAssignments: 6,
        lastUpdate: "2024-03-11"
    }
};

// DOM元素引用
const assignmentsUserInfo = document.getElementById('assignments-user-info');
const assignmentsUserName = document.getElementById('assignments-user-name');
const assignmentsUserAvatar = document.getElementById('assignments-user-avatar');
const pendingCountElement = document.getElementById('pending-count');
const submittedCountElement = document.getElementById('submitted-count');
const averageScoreElement = document.getElementById('average-score');
const upcomingCountElement = document.getElementById('upcoming-count');
const courseTabs = document.getElementById('course-tabs');
const semesterSelect = document.getElementById('semester-select');
const assignmentStatusFilter = document.getElementById('assignment-status-filter');
const refreshAssignmentsBtn = document.getElementById('refresh-assignments-btn');
const assignmentsContainer = document.getElementById('assignments-container');
const loadingAssignments = document.getElementById('loading-assignments');
const noAssignments = document.getElementById('no-assignments');
const recentSubmissionsBody = document.getElementById('recent-submissions-body');
const recentSubmissionsSection = document.getElementById('recent-submissions-section');
const emptySubmissions = document.getElementById('empty-submissions');
const viewAllSubmissions = document.getElementById('view-all-submissions');

// 模态框相关
const assignmentDetailModal = document.getElementById('assignment-detail-modal');
const assignmentDetailClose = document.getElementById('assignment-detail-close');
const assignmentDetailTitle = document.getElementById('assignment-detail-title');
const assignmentDetailBody = document.getElementById('assignment-detail-body');
const submitAssignmentModal = document.getElementById('submit-assignment-modal');
const submitAssignmentClose = document.getElementById('submit-assignment-close');
const submitAssignmentTitle = document.getElementById('submit-assignment-title');
const submitAssignmentInfo = document.getElementById('submit-assignment-info');
const submitAssignmentForm = document.getElementById('submit-assignment-form');
const assignmentFileInput = document.getElementById('assignment-file');
const fileUploadArea = document.getElementById('file-upload-area');
const fileInfo = document.getElementById('file-info');
const selectedFileName = document.getElementById('selected-file-name');
const selectedFileSize = document.getElementById('selected-file-size');
const removeFileBtn = document.getElementById('remove-file-btn');
const assignmentComment = document.getElementById('assignment-comment');
const confirmSubmissionCheckbox = document.getElementById('confirm-submission');
const submitAssignmentBtn = document.getElementById('submit-assignment-btn');
const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
const submissionMessage = document.getElementById('submission-message');
const submissionDetailModal = document.getElementById('submission-detail-modal');
const submissionDetailClose = document.getElementById('submission-detail-close');
const submissionDetailContent = document.getElementById('submission-detail-content');
const assignmentsLoginModal = document.getElementById('assignments-login-modal');
const assignmentsLoginClose = document.getElementById('assignments-login-close');
const assignmentsLoginBtn = document.getElementById('assignments-login-btn');
const assignmentsCancelBtn = document.getElementById('assignments-cancel-btn');
const assignmentsUpdateTime = document.getElementById('assignments-update-time');

// 状态变量
let currentSelectedCourseId = 'all';
let currentSelectedStatus = 'all';
let currentSelectedAssignment = null;
let selectedFile = null;

// 初始化页面
function initializePage() {
    // 检查本地存储中的用户信息
    checkStoredUser();
    
    // 更新最后更新时间
    if (assignmentsUpdateTime) {
        assignmentsUpdateTime.textContent = assignmentsData.stats.lastUpdate;
    }
    
    // 更新用户信息
    updateUserInfo();
    
    // 加载课程选项卡
    loadCourseTabs();
    
    // 加载作业列表
    loadAssignments();
    
    // 加载最近提交记录
    loadRecentSubmissions();
    
    // 更新统计卡片
    updateStatsCards();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 显示欢迎提示
    setTimeout(() => {
        if (assignmentsData.currentUser) {
            Toastify({
                text: `欢迎回来，${assignmentsData.currentUser.name}同学！`,
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "#4ECDC4"
            }).showToast();
        }
    }, 1000);
}

// 检查本地存储中的用户信息
function checkStoredUser() {
    const storedUser = localStorage.getItem('assignmentsCurrentUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            // 在用户列表中查找匹配的用户
            const user = assignmentsData.users.find(u => u.user_id === userData.user_id);
            if (user) {
                assignmentsData.currentUser = user;
            }
        } catch (e) {
            console.error("解析用户数据失败:", e);
        }
    }
}

// 保存用户信息到本地存储
function saveUserToStorage() {
    if (assignmentsData.currentUser) {
        localStorage.setItem('assignmentsCurrentUser', JSON.stringify(assignmentsData.currentUser));
    } else {
        localStorage.removeItem('assignmentsCurrentUser');
    }
}

// 更新用户信息
function updateUserInfo() {
    if (assignmentsData.currentUser) {
        assignmentsUserName.textContent = assignmentsData.currentUser.name;
        assignmentsUserAvatar.src = assignmentsData.currentUser.avatar_url;
        assignmentsUserInfo.classList.remove('logged-out');
        assignmentsUserInfo.title = `${assignmentsData.currentUser.name} (${assignmentsData.currentUser.student_id})`;
    } else {
        assignmentsUserName.textContent = '请登录';
        assignmentsUserAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
        assignmentsUserInfo.classList.add('logged-out');
        assignmentsUserInfo.title = '点击登录';
    }
}

// 更新统计卡片
function updateStatsCards() {
    if (assignmentsData.currentUser) {
        // 重新计算统计数据
        const userId = assignmentsData.currentUser.user_id;
        const pendingAssignments = getUserAssignments(null, 'pending');
        const submittedSubmissions = assignmentsData.submissions.filter(s => s.user_id === userId);
        const upcomingAssignments = getUpcomingAssignments();
        
        // 计算平均分
        let totalScore = 0;
        let gradedCount = 0;
        submittedSubmissions.forEach(submission => {
            if (submission.score !== null && submission.score !== undefined) {
                totalScore += submission.score;
                gradedCount++;
            }
        });
        const avgScore = gradedCount > 0 ? (totalScore / gradedCount).toFixed(1) : 0;
        
        // 更新UI
        pendingCountElement.textContent = pendingAssignments.length;
        submittedCountElement.textContent = submittedSubmissions.length;
        averageScoreElement.textContent = avgScore;
        upcomingCountElement.textContent = upcomingAssignments.length;
        
        // 更新数据对象中的统计信息
        assignmentsData.stats.pendingCount = pendingAssignments.length;
        assignmentsData.stats.submittedCount = submittedSubmissions.length;
        assignmentsData.stats.averageScore = avgScore;
        assignmentsData.stats.upcomingCount = upcomingAssignments.length;
    } else {
        pendingCountElement.textContent = '0';
        submittedCountElement.textContent = '0';
        averageScoreElement.textContent = '0';
        upcomingCountElement.textContent = '0';
    }
}

// 获取用户课程
function getUserCourses(semester = 'all') {
    if (!assignmentsData.currentUser) return [];
    
    // 模拟用户选课数据
    const userCourses = assignmentsData.courses.filter(course => {
        // 模拟用户选了所有课程
        return semester === 'all' || course.semester === semester;
    });
    
    return userCourses;
}

// 获取课程信息
function getCourseById(courseId) {
    return assignmentsData.courses.find(course => course.course_id === courseId);
}

// 获取作业信息
function getAssignmentById(assignmentId) {
    return assignmentsData.assignments.find(assignment => assignment.assignment_id === assignmentId);
}

// 获取用户作业
function getUserAssignments(courseId = null, status = 'all') {
    if (!assignmentsData.currentUser) return [];
    
    const userId = assignmentsData.currentUser.user_id;
    
    let filteredAssignments = assignmentsData.assignments;
    
    // 按课程筛选
    if (courseId && courseId !== 'all') {
        filteredAssignments = filteredAssignments.filter(a => a.course_id === courseId);
    }
    
    // 按状态筛选
    if (status !== 'all') {
        filteredAssignments = filteredAssignments.filter(assignment => {
            const assignmentStatus = getAssignmentStatus(assignment.assignment_id);
            return assignmentStatus === status;
        });
    }
    
    return filteredAssignments;
}

// 获取作业状态
function getAssignmentStatus(assignmentId) {
    const userId = assignmentsData.currentUser ? assignmentsData.currentUser.user_id : null;
    const assignment = getAssignmentById(assignmentId);
    
    if (!assignment) return 'unknown';
    
    // 检查是否已截止
    const deadline = new Date(assignment.deadline);
    const now = new Date();
    if (deadline < now) {
        return 'expired';
    }
    
    // 检查是否已提交
    const submission = assignmentsData.submissions.find(
        s => s.assignment_id === assignmentId && s.user_id === userId
    );
    
    if (submission) {
        return 'submitted';
    }
    
    return 'pending';
}

// 获取用户提交记录
function getUserSubmission(assignmentId) {
    if (!assignmentsData.currentUser) return null;
    
    const userId = assignmentsData.currentUser.user_id;
    return assignmentsData.submissions.find(
        s => s.assignment_id === assignmentId && s.user_id === userId
    );
}

// 获取用户所有提交记录
function getUserSubmissions(limit = null) {
    if (!assignmentsData.currentUser) return [];
    
    const userId = assignmentsData.currentUser.user_id;
    let userSubmissions = assignmentsData.submissions.filter(s => s.user_id === userId);
    
    // 按提交时间降序排序
    userSubmissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    // 限制数量
    if (limit && limit > 0) {
        userSubmissions = userSubmissions.slice(0, limit);
    }
    
    return userSubmissions;
}

// 获取即将截止的作业
function getUpcomingAssignments() {
    if (!assignmentsData.currentUser) return [];
    
    const now = new Date();
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    return assignmentsData.assignments.filter(assignment => {
        const deadline = new Date(assignment.deadline);
        const status = getAssignmentStatus(assignment.assignment_id);
        return deadline > now && deadline <= twoDaysLater && status === 'pending';
    });
}

// 加载课程选项卡
function loadCourseTabs() {
    const selectedSemester = semesterSelect.value;
    const courses = getUserCourses(selectedSemester);
    
    // 清空现有选项卡
    courseTabs.innerHTML = '';
    
    // 添加"全部课程"选项卡
    const allTab = document.createElement('div');
    allTab.className = `course-tab ${currentSelectedCourseId === 'all' ? 'active' : ''}`;
    allTab.dataset.courseId = 'all';
    allTab.innerHTML = `
        <div class="course-icon" style="background-color: #667eea;">
            <i class="fas fa-th"></i>
        </div>
        <div class="course-name">全部课程</div>
    `;
    courseTabs.appendChild(allTab);
    
    // 添加各课程选项卡
    courses.forEach(course => {
        const tab = document.createElement('div');
        tab.className = `course-tab ${currentSelectedCourseId === course.course_id ? 'active' : ''}`;
        tab.dataset.courseId = course.course_id;
        tab.innerHTML = `
            <div class="course-icon" style="background-color: ${course.color || getCourseColor(course.course_id)};">
                <i class="fas fa-book"></i>
            </div>
            <div class="course-name">${course.name}</div>
            <div class="course-teacher">${course.teacher}</div>
        `;
        courseTabs.appendChild(tab);
    });
    
    // 如果没有课程
    if (courses.length === 0) {
        const noCourseTab = document.createElement('div');
        noCourseTab.className = 'course-tab empty-tab';
        noCourseTab.innerHTML = `
            <div class="course-icon" style="background-color: #ccc;">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="course-name">暂无课程</div>
        `;
        courseTabs.appendChild(noCourseTab);
    }
    
    // 添加点击事件
    document.querySelectorAll('.course-tab:not(.empty-tab)').forEach(tab => {
        tab.addEventListener('click', () => {
            const courseId = tab.dataset.courseId;
            selectCourse(courseId);
        });
    });
}

// 为课程生成颜色（备用）
function getCourseColor(courseId) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    return colors[courseId % colors.length];
}

// 选择课程
function selectCourse(courseId) {
    currentSelectedCourseId = courseId;
    
    // 更新选项卡激活状态
    document.querySelectorAll('.course-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.courseId === courseId.toString()) {
            tab.classList.add('active');
        }
    });
    
    // 重新加载作业列表
    loadAssignments();
}

// 加载作业列表
function loadAssignments() {
    // 显示加载状态
    loadingAssignments.style.display = 'flex';
    assignmentsContainer.style.display = 'block';
    noAssignments.style.display = 'none';
    
    // 清空现有内容
    assignmentsContainer.innerHTML = '';
    
    // 检查是否已登录
    if (!assignmentsData.currentUser) {
        setTimeout(() => {
            loadingAssignments.style.display = 'none';
            assignmentsContainer.style.display = 'none';
            noAssignments.style.display = 'flex';
            noAssignments.innerHTML = `
                <i class="fas fa-user-lock"></i>
                <h3>请先登录</h3>
                <p>登录后查看和提交作业</p>
            `;
        }, 500);
        return;
    }
    
    // 获取作业数据
    const assignments = getUserAssignments(
        currentSelectedCourseId === 'all' ? null : parseInt(currentSelectedCourseId),
        currentSelectedStatus
    );
    
    // 模拟网络延迟
    setTimeout(() => {
        loadingAssignments.style.display = 'none';
        
        if (assignments.length === 0) {
            noAssignments.style.display = 'flex';
            // 根据筛选条件显示不同消息
            if (currentSelectedStatus !== 'all') {
                noAssignments.innerHTML = `
                    <i class="fas fa-clipboard-check"></i>
                    <h3>暂无作业</h3>
                    <p>当前筛选条件下没有找到作业</p>
                `;
            } else if (currentSelectedCourseId !== 'all') {
                noAssignments.innerHTML = `
                    <i class="fas fa-book"></i>
                    <h3>暂无作业</h3>
                    <p>该课程当前没有作业</p>
                `;
            } else {
                noAssignments.innerHTML = `
                    <i class="fas fa-clipboard-check"></i>
                    <h3>暂无作业</h3>
                    <p>当前没有需要提交的作业，可以放松一下！</p>
                `;
            }
            return;
        }
        
        // 按截止时间排序（即将截止的排在前面）
        assignments.sort((a, b) => {
            const deadlineA = new Date(a.deadline);
            const deadlineB = new Date(b.deadline);
            return deadlineA - deadlineB;
        });
        
        // 渲染作业列表
        assignments.forEach(assignment => {
            const assignmentElement = createAssignmentElement(assignment);
            assignmentsContainer.appendChild(assignmentElement);
        });
    }, 800);
}

// 创建作业元素
function createAssignmentElement(assignment) {
    const course = getCourseById(assignment.course_id);
    const status = getAssignmentStatus(assignment.assignment_id);
    const submission = getUserSubmission(assignment.assignment_id);
    const deadlineRemaining = getDeadlineRemaining(assignment.deadline);
    
    const assignmentElement = document.createElement('div');
    assignmentElement.className = 'assignment-card';
    assignmentElement.dataset.assignmentId = assignment.assignment_id;
    
    // 状态标签
    let statusBadge = '';
    if (status === 'expired') {
        statusBadge = '<span class="assignment-badge badge-expired">已截止</span>';
    } else if (status === 'submitted') {
        statusBadge = '<span class="assignment-badge badge-submitted">已提交</span>';
    } else {
        if (deadlineRemaining.days <= 1) {
            statusBadge = `<span class="assignment-badge badge-urgent">紧急</span>`;
        } else {
            statusBadge = '<span class="assignment-badge badge-pending">待提交</span>';
        }
    }
    
    // 操作按钮
    let actionButton = '';
    if (status === 'pending') {
        actionButton = `<button class="btn btn-primary btn-submit" data-assignment-id="${assignment.assignment_id}">
            <i class="fas fa-paper-plane"></i> 提交作业
        </button>`;
    } else if (status === 'submitted') {
        actionButton = `<button class="btn btn-secondary btn-view-submission" data-assignment-id="${assignment.assignment_id}">
            <i class="fas fa-eye"></i> 查看提交
        </button>`;
    } else {
        actionButton = `<button class="btn btn-disabled" disabled>
            <i class="fas fa-clock"></i> 已截止
        </button>`;
    }
    
    // 剩余时间显示
    let deadlineText = '';
    if (deadlineRemaining.expired) {
        deadlineText = `已截止 ${formatDateTime(assignment.deadline)}`;
    } else {
        if (deadlineRemaining.days > 0) {
            deadlineText = `剩余 ${deadlineRemaining.days} 天`;
        } else if (deadlineRemaining.hours > 0) {
            deadlineText = `剩余 ${deadlineRemaining.hours} 小时`;
        } else {
            deadlineText = `剩余 ${deadlineRemaining.minutes} 分钟`;
        }
    }
    
    // 作业类型标签
    const typeBadge = assignment.type ? `<span class="assignment-type">${assignment.type}</span>` : '';
    
    assignmentElement.innerHTML = `
        <div class="assignment-header">
            <div class="assignment-title">
                <h3>${assignment.title}</h3>
                ${typeBadge}
                ${statusBadge}
            </div>
            <div class="assignment-course">
                <i class="fas fa-book"></i> ${course ? course.name : '未知课程'}
            </div>
        </div>
        
        <div class="assignment-content">
            <div class="assignment-description">
                ${assignment.description.split('\n')[0].substring(0, 100)}${assignment.description.length > 100 ? '...' : ''}
            </div>
            
            <div class="assignment-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>截止时间: ${formatDateTime(assignment.deadline)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${deadlineText}</span>
                </div>
                ${submission && submission.submitted_at ? `
                <div class="meta-item">
                    <i class="fas fa-check-circle"></i>
                    <span>提交时间: ${formatDateTime(submission.submitted_at)}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="assignment-footer">
            <button class="btn btn-outline btn-detail" data-assignment-id="${assignment.assignment_id}">
                <i class="fas fa-info-circle"></i> 详情
            </button>
            ${assignment.attachment_url ? `
            <a href="#" class="btn btn-outline btn-download" data-assignment-id="${assignment.assignment_id}">
                <i class="fas fa-download"></i> 下载要求
            </a>
            ` : ''}
            ${actionButton}
        </div>
    `;
    
    return assignmentElement;
}

// 加载最近提交记录
function loadRecentSubmissions() {
    const submissions = getUserSubmissions(5);
    
    // 清空现有内容
    recentSubmissionsBody.innerHTML = '';
    
    if (submissions.length === 0) {
        recentSubmissionsSection.style.display = 'none';
        emptySubmissions.style.display = 'flex';
        return;
    }
    
    recentSubmissionsSection.style.display = 'block';
    emptySubmissions.style.display = 'none';
    
    submissions.forEach(submission => {
        const assignment = getAssignmentById(submission.assignment_id);
        const course = assignment ? getCourseById(assignment.course_id) : null;
        const gradeLevel = getGradeLevel(submission.score);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment ? assignment.title : '未知作业'}</td>
            <td>${course ? course.name : '未知课程'}</td>
            <td>${formatDateTime(submission.submitted_at)}</td>
            <td>
                <span class="grade-badge grade-${gradeLevel}">
                    ${submission.score !== null ? submission.score.toFixed(1) : '待批改'}
                </span>
            </td>
            <td>
                <span class="status-badge status-${submission.status}">
                    ${submission.status === 'graded' ? '已批改' : submission.status === 'submitted' ? '已提交' : '未知'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-view-submission-detail" data-submission-id="${submission.submission_id}">
                    <i class="fas fa-eye"></i> 查看
                </button>
            </td>
        `;
        recentSubmissionsBody.appendChild(row);
    });
    
    // 如果提交记录少于5条，隐藏"查看全部"链接
    if (submissions.length < 5) {
        viewAllSubmissions.style.display = 'none';
    } else {
        viewAllSubmissions.style.display = 'block';
    }
}

// 显示作业详情模态框
function showAssignmentDetail(assignmentId) {
    const assignment = getAssignmentById(parseInt(assignmentId));
    if (!assignment) return;
    
    const course = getCourseById(assignment.course_id);
    const status = getAssignmentStatus(assignment.assignment_id);
    const submission = getUserSubmission(assignment.assignment_id);
    const deadlineRemaining = getDeadlineRemaining(assignment.deadline);
    
    // 更新模态框标题
    assignmentDetailTitle.textContent = assignment.title;
    
    // 构建详情内容
    let detailHTML = `
        <div class="assignment-detail-info">
            <div class="info-item">
                <label><i class="fas fa-book"></i> 课程名称</label>
                <p>${course ? course.name : '未知课程'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-user-tie"></i> 授课教师</label>
                <p>${course ? course.teacher : '未知教师'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-calendar-alt"></i> 截止时间</label>
                <p>${formatDateTime(assignment.deadline)}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clock"></i> 剩余时间</label>
                <p class="${deadlineRemaining.expired ? 'text-danger' : 'text-warning'}">
                    ${deadlineRemaining.expired ? '已截止' : 
                      deadlineRemaining.days > 0 ? `剩余 ${deadlineRemaining.days} 天` :
                      deadlineRemaining.hours > 0 ? `剩余 ${deadlineRemaining.hours} 小时` :
                      `剩余 ${deadlineRemaining.minutes} 分钟`}
                </p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clipboard-check"></i> 提交状态</label>
                <p>
                    <span class="status-badge status-${status}">
                        ${status === 'expired' ? '已截止' : 
                         status === 'submitted' ? '已提交' : 
                         status === 'pending' ? '待提交' : '未知'}
                    </span>
                </p>
            </div>
        </div>
        
        <div class="assignment-detail-description">
            <h3><i class="fas fa-file-alt"></i> 作业要求</h3>
            <div class="description-content">
                ${assignment.description.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
    
    // 如果有附件
    if (assignment.attachment_url) {
        detailHTML += `
            <div class="assignment-detail-attachment">
                <h3><i class="fas fa-paperclip"></i> 作业附件</h3>
                <div class="attachment-item">
                    <i class="fas fa-file-pdf"></i>
                    <div class="attachment-info">
                        <div class="attachment-name">${assignment.attachment_name}</div>
                        <button class="btn btn-small btn-download-attachment" data-assignment-id="${assignment.assignment_id}">
                            <i class="fas fa-download"></i> 下载
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 如果有提交记录
    if (submission) {
        const gradeLevel = getGradeLevel(submission.score);
        detailHTML += `
            <div class="assignment-detail-submission">
                <h3><i class="fas fa-upload"></i> 我的提交</h3>
                <div class="submission-info">
                    <div class="info-item">
                        <label>提交时间</label>
                        <p>${formatDateTime(submission.submitted_at)}</p>
                    </div>
                    ${submission.comment ? `
                    <div class="info-item">
                        <label>提交备注</label>
                        <p>${submission.comment}</p>
                    </div>
                    ` : ''}
                    ${submission.score !== null ? `
                    <div class="info-item">
                        <label>成绩</label>
                        <p>
                            <span class="grade-badge grade-${gradeLevel}">
                                ${submission.score.toFixed(1)}
                            </span>
                        </p>
                    </div>
                    ` : ''}
                    ${submission.feedback ? `
                    <div class="info-item">
                        <label>教师反馈</label>
                        <div class="feedback-content">
                            ${submission.feedback}
                        </div>
                    </div>
                    ` : ''}
                    ${submission.file_url ? `
                    <div class="info-item">
                        <label>提交文件</label>
                        <div class="submission-file">
                            <i class="fas fa-file"></i>
                            <div class="file-info">
                                <div class="file-name">${submission.file_name}</div>
                                <button class="btn btn-small btn-view-submission-detail" data-submission-id="${submission.submission_id}">
                                    查看详情
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    assignmentDetailBody.innerHTML = detailHTML;
    assignmentDetailModal.style.display = 'flex';
    
    // 绑定下载附件按钮
    assignmentDetailBody.querySelectorAll('.btn-download-attachment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const assignmentId = btn.dataset.assignmentId;
            simulateDownload(assignmentId);
        });
    });
    
    // 绑定提交详情查看按钮
    assignmentDetailBody.querySelectorAll('.btn-view-submission-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const submissionId = btn.dataset.submissionId;
            showSubmissionDetail(parseInt(submissionId));
        });
    });
}

// 显示提交作业模态框
function showSubmitAssignment(assignmentId) {
    const assignment = getAssignmentById(parseInt(assignmentId));
    if (!assignment) return;
    
    const course = getCourseById(assignment.course_id);
    currentSelectedAssignment = assignment;
    
    // 更新模态框标题
    submitAssignmentTitle.textContent = `提交作业 - ${assignment.title}`;
    
    // 更新作业信息
    const deadlineRemaining = getDeadlineRemaining(assignment.deadline);
    submitAssignmentInfo.innerHTML = `
        <div class="assignment-submit-info">
            <div class="info-item">
                <i class="fas fa-book"></i>
                <span>${course ? course.name : '未知课程'}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-calendar-alt"></i>
                <span>截止时间: ${formatDateTime(assignment.deadline)}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <span class="${deadlineRemaining.expired ? 'text-danger' : ''}">
                    ${deadlineRemaining.expired ? '已截止' : 
                      deadlineRemaining.days > 0 ? `剩余 ${deadlineRemaining.days} 天` :
                      deadlineRemaining.hours > 0 ? `剩余 ${deadlineRemaining.hours} 小时` :
                      `剩余 ${deadlineRemaining.minutes} 分钟`}
                </span>
            </div>
        </div>
        <div class="assignment-description">
            ${assignment.description.split('\n')[0].substring(0, 150)}${assignment.description.length > 150 ? '...' : ''}
        </div>
    `;
    
    // 重置表单
    submitAssignmentForm.reset();
    fileInfo.style.display = 'none';
    selectedFile = null;
    confirmSubmissionCheckbox.checked = false;
    submitAssignmentBtn.disabled = true;
    submissionMessage.innerHTML = '';
    
    // 显示模态框
    submitAssignmentModal.style.display = 'flex';
}

// 显示提交详情模态框
function showSubmissionDetail(submissionId) {
    const submission = assignmentsData.submissions.find(s => s.submission_id === submissionId);
    if (!submission) return;
    
    const assignment = getAssignmentById(submission.assignment_id);
    const course = assignment ? getCourseById(assignment.course_id) : null;
    const gradeLevel = getGradeLevel(submission.score);
    
    let detailHTML = `
        <div class="submission-detail-info">
            <div class="info-item">
                <label><i class="fas fa-book"></i> 课程</label>
                <p>${course ? course.name : '未知课程'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clipboard"></i> 作业</label>
                <p>${assignment ? assignment.title : '未知作业'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-calendar-alt"></i> 提交时间</label>
                <p>${formatDateTime(submission.submitted_at)}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-comment"></i> 提交备注</label>
                <p>${submission.comment || '无'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-file"></i> 提交文件</label>
                <div class="file-item">
                    <i class="fas fa-file"></i>
                    <div class="file-info">
                        <div class="file-name">${submission.file_name}</div>
                        <button class="btn btn-small btn-download-submission" data-submission-id="${submission.submission_id}">
                            <i class="fas fa-download"></i> 下载
                        </button>
                    </div>
                </div>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clipboard-check"></i> 提交状态</label>
                <p>
                    <span class="status-badge status-${submission.status}">
                        ${submission.status === 'graded' ? '已批改' : 
                         submission.status === 'submitted' ? '已提交' : '未知'}
                    </span>
                </p>
            </div>
    `;
    
    if (submission.score !== null) {
        detailHTML += `
            <div class="info-item">
                <label><i class="fas fa-star"></i> 成绩</label>
                <p>
                    <span class="grade-badge grade-${gradeLevel}">
                        ${submission.score.toFixed(1)}
                    </span>
                </p>
            </div>
        `;
    }
    
    if (submission.feedback) {
        detailHTML += `
            <div class="info-item">
                <label><i class="fas fa-comments"></i> 教师反馈</label>
                <div class="feedback-content">
                    ${submission.feedback}
                </div>
            </div>
        `;
    }
    
    if (submission.graded_at && submission.grader) {
        detailHTML += `
            <div class="info-item">
                <label><i class="fas fa-user-check"></i> 批改信息</label>
                <p>批改时间: ${formatDateTime(submission.graded_at)}</p>
                <p>批改教师: ${submission.grader}</p>
            </div>
        `;
    }
    
    detailHTML += `</div>`;
    
    submissionDetailContent.innerHTML = detailHTML;
    submissionDetailModal.style.display = 'flex';
    
    // 绑定下载按钮
    submissionDetailContent.querySelectorAll('.btn-download-submission').forEach(btn => {
        btn.addEventListener('click', () => {
            const submissionId = btn.dataset.submissionId;
            simulateSubmissionDownload(submissionId);
        });
    });
}

// 显示登录提示模态框
function showLoginModal() {
    assignmentsLoginModal.style.display = 'flex';
}

// 模拟下载作业附件
function simulateDownload(assignmentId) {
    const assignment = getAssignmentById(parseInt(assignmentId));
    if (!assignment || !assignment.attachment_name) return;
    
    Toastify({
        text: `开始下载: ${assignment.attachment_name}`,
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#667eea"
    }).showToast();
    
    // 模拟下载延迟
    setTimeout(() => {
        Toastify({
            text: `下载完成: ${assignment.attachment_name}`,
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#4ECDC4"
        }).showToast();
    }, 1500);
}

// 模拟下载提交文件
function simulateSubmissionDownload(submissionId) {
    const submission = assignmentsData.submissions.find(s => s.submission_id === parseInt(submissionId));
    if (!submission) return;
    
    Toastify({
        text: `开始下载: ${submission.file_name}`,
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#667eea"
    }).showToast();
    
    // 模拟下载延迟
    setTimeout(() => {
        Toastify({
            text: `下载完成: ${submission.file_name}`,
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#4ECDC4"
        }).showToast();
    }, 1500);
}

// 处理文件选择
function handleFileSelect(file) {
    // 检查文件大小（限制为50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        Toastify({
            text: "文件大小超过限制（最大50MB）",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#FF6B6B"
        }).showToast();
        return;
    }
    
    // 检查文件类型
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.jpg', '.jpeg', '.png', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        Toastify({
            text: "不支持的文件格式",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#FF6B6B"
        }).showToast();
        return;
    }
    
    selectedFile = file;
    
    // 更新文件信息显示
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatFileSize(file.size);
    
    // 显示文件信息区域
    fileInfo.style.display = 'block';
    fileUploadArea.style.borderColor = '#4ECDC4';
    
    // 更新提交按钮状态
    updateSubmitButtonState();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新提交按钮状态
function updateSubmitButtonState() {
    const isFileSelected = selectedFile !== null;
    const isConfirmed = confirmSubmissionCheckbox.checked;
    const deadlineRemaining = currentSelectedAssignment ? 
        getDeadlineRemaining(currentSelectedAssignment.deadline) : { expired: true };
    
    submitAssignmentBtn.disabled = !(isFileSelected && isConfirmed && !deadlineRemaining.expired);
}

// 提交作业处理
function handleSubmitAssignment(e) {
    e.preventDefault();
    
    if (!currentSelectedAssignment || !selectedFile) return;
    
    // 检查是否已截止
    const deadlineRemaining = getDeadlineRemaining(currentSelectedAssignment.deadline);
    if (deadlineRemaining.expired) {
        showMessage('error', '作业提交已截止');
        return;
    }
    
    // 显示提交中状态
    submitAssignmentBtn.disabled = true;
    submitAssignmentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
    
    // 模拟提交过程
    setTimeout(() => {
        // 生成新的提交ID
        const newSubmissionId = Math.max(...assignmentsData.submissions.map(s => s.submission_id)) + 1;
        
        // 创建提交记录
        const newSubmission = {
            submission_id: newSubmissionId,
            assignment_id: currentSelectedAssignment.assignment_id,
            user_id: assignmentsData.currentUser.user_id,
            submitted_at: new Date().toISOString(),
            file_url: `/files/submissions/${Date.now()}_${selectedFile.name}`,
            file_name: selectedFile.name,
            comment: assignmentComment.value || '',
            score: null,
            feedback: null,
            status: 'submitted'
        };
        
        // 添加到提交记录
        assignmentsData.submissions.push(newSubmission);
        
        // 更新统计
        updateStatsCards();
        
        // 显示成功消息
        showMessage('success', '作业提交成功！');
        
        // 重置表单
        submitAssignmentBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交作业';
        
        // 关闭模态框
        setTimeout(() => {
            submitAssignmentModal.style.display = 'none';
            
            // 刷新页面数据
            loadAssignments();
            loadRecentSubmissions();
            
            // 显示成功提示
            Toastify({
                text: "作业提交成功！",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "#4ECDC4",
                stopOnFocus: true
            }).showToast();
        }, 1500);
    }, 1500);
}

// 显示消息
function showMessage(type, text) {
    submissionMessage.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${text}
        </div>
    `;
}

// 工具函数：获取成绩等级
function getGradeLevel(score) {
    if (score === null || score === undefined) return 'none';
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    if (score >= 60) return 'pass';
    return 'fail';
}

// 工具函数：格式化日期时间
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

// 工具函数：获取截止时间剩余
function getDeadlineRemaining(deadlineString) {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline - now;
    
    if (diffMs <= 0) {
        return {
            expired: true,
            days: 0,
            hours: 0,
            minutes: 0
        };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
        expired: false,
        days,
        hours,
        minutes
    };
}

// 绑定事件监听器
function bindEventListeners() {
    // 用户信息点击事件
    assignmentsUserInfo.addEventListener('click', () => {
        if (!assignmentsData.currentUser) {
            showLoginModal();
        }
    });
    
    // 学期选择事件
    semesterSelect.addEventListener('change', () => {
        loadCourseTabs();
        loadAssignments();
    });
    
    // 作业状态筛选事件
    assignmentStatusFilter.addEventListener('change', (e) => {
        currentSelectedStatus = e.target.value;
        loadAssignments();
    });
    
    // 刷新按钮事件
    refreshAssignmentsBtn.addEventListener('click', () => {
        loadAssignments();
        loadRecentSubmissions();
        updateStatsCards();
        
        Toastify({
            text: "数据已刷新",
            duration: 2000,
            gravity: "top",
            position: "right",
            backgroundColor: "#667eea"
        }).showToast();
    });
    
    // 查看全部提交记录
    viewAllSubmissions.addEventListener('click', (e) => {
        e.preventDefault();
        Toastify({
            text: "查看全部提交记录功能正在开发中",
            duration: 2000,
            gravity: "top",
            position: "center",
            backgroundColor: "#667eea"
        }).showToast();
    });
    
    // 作业卡片事件委托
    assignmentsContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // 详情按钮
        if (target.closest('.btn-detail')) {
            const assignmentId = target.closest('.btn-detail').dataset.assignmentId;
            showAssignmentDetail(assignmentId);
        }
        
        // 下载按钮
        if (target.closest('.btn-download')) {
            const assignmentId = target.closest('.btn-download').dataset.assignmentId;
            simulateDownload(assignmentId);
        }
        
        // 提交作业按钮
        if (target.closest('.btn-submit')) {
            if (!assignmentsData.currentUser) {
                showLoginModal();
                return;
            }
            const assignmentId = target.closest('.btn-submit').dataset.assignmentId;
            showSubmitAssignment(assignmentId);
        }
        
        // 查看提交按钮
        if (target.closest('.btn-view-submission')) {
            const assignmentId = target.closest('.btn-view-submission').dataset.assignmentId;
            const submission = getUserSubmission(parseInt(assignmentId));
            if (submission) {
                showSubmissionDetail(submission.submission_id);
            }
        }
    });
    
    // 最近提交记录事件委托
    recentSubmissionsBody.addEventListener('click', (e) => {
        if (e.target.closest('.btn-view-submission-detail')) {
            const submissionId = e.target.closest('.btn-view-submission-detail').dataset.submissionId;
            showSubmissionDetail(parseInt(submissionId));
        }
    });
    
    // 模态框关闭事件
    assignmentDetailClose.addEventListener('click', () => {
        assignmentDetailModal.style.display = 'none';
    });
    
    submitAssignmentClose.addEventListener('click', () => {
        submitAssignmentModal.style.display = 'none';
    });
    
    cancelSubmissionBtn.addEventListener('click', () => {
        submitAssignmentModal.style.display = 'none';
    });
    
    submissionDetailClose.addEventListener('click', () => {
        submissionDetailModal.style.display = 'none';
    });
    
    assignmentsLoginClose.addEventListener('click', () => {
        assignmentsLoginModal.style.display = 'none';
    });
    
    assignmentsCancelBtn.addEventListener('click', () => {
        assignmentsLoginModal.style.display = 'none';
    });
    
    // 模态框外部点击关闭
    window.addEventListener('click', (e) => {
        if (e.target === assignmentDetailModal) {
            assignmentDetailModal.style.display = 'none';
        }
        if (e.target === submitAssignmentModal) {
            submitAssignmentModal.style.display = 'none';
        }
        if (e.target === submissionDetailModal) {
            submissionDetailModal.style.display = 'none';
        }
        if (e.target === assignmentsLoginModal) {
            assignmentsLoginModal.style.display = 'none';
        }
    });
    
    // 文件上传相关事件
    fileUploadArea.addEventListener('click', () => {
        assignmentFileInput.click();
    });
    
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#667eea';
        fileUploadArea.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    });
    
    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#ddd';
        fileUploadArea.style.backgroundColor = '#f9f9f9';
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#ddd';
        fileUploadArea.style.backgroundColor = '#f9f9f9';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    
    assignmentFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    removeFileBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInfo.style.display = 'none';
        assignmentFileInput.value = '';
        fileUploadArea.style.borderColor = '#ddd';
        updateSubmitButtonState();
    });
    
    confirmSubmissionCheckbox.addEventListener('change', updateSubmitButtonState);
    
    // 提交表单事件
    submitAssignmentForm.addEventListener('submit', handleSubmitAssignment);
    
    // 登录按钮事件
    assignmentsLoginBtn.addEventListener('click', () => {
        // 模拟登录，使用第一个用户
        assignmentsData.currentUser = assignmentsData.users[0];
        saveUserToStorage();
        updateUserInfo();
        updateStatsCards();
        loadAssignments();
        loadRecentSubmissions();
        assignmentsLoginModal.style.display = 'none';
        
        Toastify({
            text: "登录成功！",
            duration: 2000,
            gravity: "top",
            position: "center",
            backgroundColor: "#4ECDC4"
        }).showToast();
    });
    
    // 返回首页按钮事件
    document.querySelector('.back-home').addEventListener('click', (e) => {
        if (!assignmentsData.currentUser) {
            e.preventDefault();
            showLoginModal();
        }
    });
}

// 用户注销功能
function logout() {
    assignmentsData.currentUser = null;
    saveUserToStorage();
    updateUserInfo();
    updateStatsCards();
    loadAssignments();
    loadRecentSubmissions();
    
    Toastify({
        text: "已成功注销",
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#667eea"
    }).showToast();
}

// 添加注销功能到用户信息区域
assignmentsUserInfo.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (assignmentsData.currentUser) {
        if (confirm(`确定要注销 ${assignmentsData.currentUser.name} 账户吗？`)) {
            logout();
        }
    }
});

// 初始化页面
document.addEventListener('DOMContentLoaded', initializePage);

// 导出函数供其他模块使用
window.assignmentsModule = {
    initializePage,
    updateUserInfo,
    loadAssignments,
    loadRecentSubmissions,
    showAssignmentDetail,
    showSubmitAssignment,
    showSubmissionDetail,
    getCourseById,
    getAssignmentById,
    getUserCourses,
    getUserAssignments,
    getUserSubmission,
    formatDateTime,
    getDeadlineRemaining,
    getAssignmentStatus,
    logout
};