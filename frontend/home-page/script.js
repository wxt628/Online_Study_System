// 模拟数据
const mockData = {
    user: {
        user_id: 1,
        student_id: "20210001",
        name: "张三",
        email: "zhangsan@example.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=张三"
    },
    miniPrograms: [
        { program_id: 1, name: "校园一卡通", icon_url: "/icons/card.png", description: "校园卡充值、消费记录查询", url: "#", category: "生活", display_order: 1 },
        { program_id: 2, name: "图书馆查询", icon_url: "/icons/library.png", description: "图书借阅、馆藏查询", url: "#", category: "教务", display_order: 2 },
        { program_id: 3, name: "课表查询", icon_url: "/icons/schedule.png", description: "个人课程表查看", url: "#", category: "教务", display_order: 3 },
        { program_id: 4, name: "电费缴纳", icon_url: "/icons/electricity.png", description: "宿舍电费查询与缴纳", url: "#", category: "生活", display_order: 4 },
        { program_id: 5, name: "成绩查询", icon_url: "/icons/grades.png", description: "学期成绩查询", url: "#", category: "教务", display_order: 5 },
        { program_id: 6, name: "失物招领", icon_url: "/icons/lost-found.png", description: "校园失物招领平台", url: "#", category: "生活", display_order: 6 }
    ],
    assignments: [
        { assignment_id: 1, title: "第一次编程作业", description: "实现基本的排序算法", deadline: "2024-03-15T23:59:59Z", has_submitted: false, submission_status: "未提交" },
        { assignment_id: 2, title: "数据结构实验报告", description: "实现链表数据结构", deadline: "2024-03-18T23:59:59Z", has_submitted: true, submission_status: "已提交" },
        { assignment_id: 3, title: "高等数学第三章习题", description: "完成课后习题1-20", deadline: "2024-03-20T23:59:59Z", has_submitted: false, submission_status: "未提交" }
    ],
    posts: [
        { post_id: 1, title: "寻找一起学习的小伙伴", content_preview: "有没有同学想一起准备期末考试...", author: { name: "李四", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四" }, category: "学习交流", like_count: 15, view_count: 120, comment_count: 8, created_at: "2024-03-10T14:30:00Z" },
        { post_id: 2, title: "转让二手教材", content_preview: "计算机组成原理教材，九成新...", author: { name: "王五", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=王五" }, category: "闲置交易", like_count: 5, view_count: 80, comment_count: 3, created_at: "2024-03-09T10:15:00Z" },
        { post_id: 3, title: "校园篮球赛招募队员", content_preview: "本周五下午校园篮球赛...", author: { name: "赵六", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=赵六" }, category: "校园活动", like_count: 12, view_count: 95, comment_count: 5, created_at: "2024-03-11T09:30:00Z" }
    ]
};

// DOM元素
const userInfo = document.getElementById('user-info');
const userDropdown = document.getElementById('user-dropdown');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const profileBtn = document.getElementById('profile-btn');
const loginModal = document.getElementById('login-modal');
const loginModalClose = document.getElementById('login-modal-close');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const welcomeText = document.getElementById('welcome-text');

// 统计元素
const miniProgramCount = document.getElementById('mini-program-count');
const assignmentCount = document.getElementById('assignment-count');
const postCount = document.getElementById('post-count');

// 内容容器
const miniProgramsGrid = document.getElementById('mini-programs-grid');
const assignmentsList = document.getElementById('assignments-list');
const postsList = document.getElementById('posts-list');

// 应用状态
let isLoggedIn = false;
let currentUser = null;

// 初始化函数
function init() {
    // 检查本地存储是否有登录状态
    const savedUser = localStorage.getItem('campusUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateUIForLogin();
    }
    
    // 加载模拟数据
    loadMiniPrograms();
    loadAssignments();
    loadPosts();
    updateStats();
    
    // 设置事件监听器
    setupEventListeners();
}

// 加载小程序数据
function loadMiniPrograms() {
    miniProgramsGrid.innerHTML = '';
    
    mockData.miniPrograms.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'mini-program-card';
        programCard.innerHTML = `
            <div class="program-icon" style="background-color: ${getCategoryColor(program.category)}">
                <i class="${getProgramIcon(program.name)}"></i>
            </div>
            <div class="program-name">${program.name}</div>
            <div class="program-category">${program.category}</div>
        `;
        
        programCard.addEventListener('click', () => {
            alert(`打开小程序: ${program.name}`);
        });
        
        miniProgramsGrid.appendChild(programCard);
    });
}

// 加载作业数据
function loadAssignments() {
    assignmentsList.innerHTML = '';
    
    mockData.assignments.forEach(assignment => {
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'assignment-item';
        
        // 格式化截止日期
        const deadline = new Date(assignment.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        let deadlineText = '';
        
        if (daysLeft < 0) {
            deadlineText = '已截止';
        } else if (daysLeft === 0) {
            deadlineText = '今天截止';
        } else if (daysLeft === 1) {
            deadlineText = '明天截止';
        } else {
            deadlineText = `${daysLeft}天后截止`;
        }
        
        assignmentItem.innerHTML = `
            <div class="assignment-header">
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-status ${assignment.has_submitted ? 'submitted' : 'pending'}">
                    ${assignment.submission_status}
                </div>
            </div>
            <div class="assignment-description">${assignment.description}</div>
            <div class="assignment-info">
                <div class="assignment-deadline">
                    <i class="far fa-clock"></i>
                    <span>${deadlineText}</span>
                </div>
                <div class="assignment-action">
                    ${!assignment.has_submitted ? '<button class="btn-submit">立即提交</button>' : '<button class="btn-view">查看提交</button>'}
                </div>
            </div>
        `;
        
        assignmentsList.appendChild(assignmentItem);
        
        // 添加按钮事件
        const submitBtn = assignmentItem.querySelector('.btn-submit');
        const viewBtn = assignmentItem.querySelector('.btn-view');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isLoggedIn) {
                    showLoginModal();
                    return;
                }
                alert(`提交作业: ${assignment.title}`);
            });
        }
        
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert(`查看作业提交记录: ${assignment.title}`);
            });
        }
    });
}

// 加载帖子数据
function loadPosts() {
    postsList.innerHTML = '';
    
    mockData.posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        
        // 格式化时间
        const postTime = new Date(post.created_at);
        const timeText = formatTimeAgo(postTime);
        
        postItem.innerHTML = `
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-category">${post.category}</div>
            </div>
            <div class="post-preview">${post.content_preview}</div>
            <div class="post-info">
                <div class="post-author">
                    <img src="${post.author.avatar_url}" alt="${post.author.name}" class="author-avatar">
                    <span class="author-name">${post.author.name}</span>
                </div>
                <div class="post-stats">
                    <span><i class="far fa-heart"></i> ${post.like_count}</span>
                    <span><i class="far fa-comment"></i> ${post.comment_count}</span>
                    <span class="post-time"><i class="far fa-clock"></i> ${timeText}</span>
                </div>
            </div>
        `;
        
        postsList.appendChild(postItem);
        
        // 点击查看帖子详情
        postItem.addEventListener('click', () => {
            if (!isLoggedIn) {
                showLoginModal();
                return;
            }
            alert(`查看帖子: ${post.title}`);
        });
    });
}

// 更新统计信息
function updateStats() {
    miniProgramCount.textContent = mockData.miniPrograms.length;
    
    const pendingAssignments = mockData.assignments.filter(a => !a.has_submitted).length;
    assignmentCount.textContent = pendingAssignments;
    
    postCount.textContent = mockData.posts.length;
}

// 设置事件监听器
function setupEventListeners() {
    // 用户信息点击显示下拉菜单
    userInfo.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // 登录按钮点击
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
        userDropdown.classList.remove('show');
    });
    
    // 退出登录按钮点击
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        userDropdown.classList.remove('show');
    });
    
    // 个人信息按钮点击
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('打开个人信息页面');
        userDropdown.classList.remove('show');
    });
    
    // 登录模态框关闭
    loginModalClose.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });
    
    // 点击模态框外部关闭
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });
    
    // 登录表单提交
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = document.getElementById('student-id').value;
        const password = document.getElementById('password').value;
        
        // 模拟登录验证
        if (studentId && password) {
            // 模拟API调用延迟
            setTimeout(() => {
                // 使用模拟用户数据
                currentUser = {
                    ...mockData.user,
                    student_id: studentId,
                    name: studentId === "20210001" ? "张三" : `用户${studentId}`
                };
                
                // 保存到本地存储
                localStorage.setItem('campusUser', JSON.stringify(currentUser));
                
                isLoggedIn = true;
                updateUIForLogin();
                loginModal.classList.remove('show');
                
                // 显示登录成功消息
                showMessage('登录成功！欢迎回来，' + currentUser.name, 'success');
            }, 800);
        } else {
            showMessage('请输入学号和密码', 'error');
        }
    });
    
    // 移动端菜单按钮
    mobileMenuBtn.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('show');
    });
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        document.querySelector('.nav-links').classList.remove('show');
    });
    
    // 阻止下拉菜单内的点击事件冒泡
    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // 快捷操作按钮
    document.getElementById('quick-submit').addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLoginModal();
            return;
        }
        alert('打开作业提交页面');
    });
    
    document.getElementById('quick-post').addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLoginModal();
            return;
        }
        alert('打开发帖页面');
    });
    
    document.getElementById('quick-card').addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLoginModal();
            return;
        }
        alert('打开校园卡充值页面');
    });
    
    document.getElementById('quick-library').addEventListener('click', (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLoginModal();
            return;
        }
        alert('打开图书馆查询页面');
    });
}

// 显示登录模态框
function showLoginModal() {
    loginModal.classList.add('show');
    loginMessage.style.display = 'none';
    document.getElementById('student-id').value = '';
    document.getElementById('password').value = '';
    document.getElementById('student-id').focus();
}

// 更新登录状态UI
function updateUIForLogin() {
    if (isLoggedIn && currentUser) {
        userName.textContent = currentUser.name;
        userAvatar.src = currentUser.avatar_url;
        welcomeText.textContent = `欢迎回来，${currentUser.name}同学`;
        
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'block';
        logoutBtn.style.display = 'block';
    } else {
        userName.textContent = '请登录';
        userAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
        welcomeText.textContent = '欢迎使用校园综合平台';
        
        loginBtn.style.display = 'block';
        profileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// 退出登录
function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('campusUser');
    updateUIForLogin();
    showMessage('已退出登录', 'success');
}

// 显示消息
function showMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = `login-message ${type}`;
    loginMessage.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        loginMessage.style.display = 'none';
    }, 3000);
}

// 工具函数：获取分类颜色
function getCategoryColor(category) {
    const colors = {
        '教务': '#3498db',
        '生活': '#2ecc71',
        '工具': '#9b59b6',
        '其他': '#95a5a6'
    };
    
    return colors[category] || colors['其他'];
}

// 工具函数：获取小程序图标
function getProgramIcon(name) {
    const icons = {
        '校园一卡通': 'fas fa-credit-card',
        '图书馆查询': 'fas fa-book',
        '课表查询': 'fas fa-calendar-alt',
        '电费缴纳': 'fas fa-bolt',
        '成绩查询': 'fas fa-chart-line',
        '失物招领': 'fas fa-search'
    };
    
    return icons[name] || 'fas fa-th-large';
}

// 工具函数：格式化相对时间
function formatTimeAgo(date) {
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
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);