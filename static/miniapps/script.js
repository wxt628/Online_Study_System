// 小程序平台数据管理
const miniProgramData = {
    // 当前用户信息
    currentUser: null,
    
    // 平台统计信息
    stats: {
        todayUseCount: 2453,
        activeUserCount: 5867,
        dataUpdateTime: "2024-12-20 15:30"
    },
    
    // 小程序列表数据
    miniPrograms: [
        {
            program_id: 1,
            name: "校园一卡通",
            description: "校园卡充值、消费记录查询",
            long_description: "校园一卡通小程序提供校园卡的在线充值、消费记录查询、余额查询、挂失解挂等服务。支持微信支付、支付宝等多种支付方式，方便快捷。",
            category: "生活服务",
            icon_fa: "fa-id-card",
            display_order: 1,
            use_count: 12543,
            rating: 4.8,
            last_updated: "2024-12-01T10:00:00",
            is_active: true,
            is_official: true,
            url: "https://campus-card.example.com",
            tags: ["充值", "查询", "校园卡"]
        },
        {
            program_id: 2,
            name: "图书馆预约",
            description: "图书馆座位、书籍预约系统",
            long_description: "图书馆预约小程序提供图书馆座位预约、书籍借阅预约、研讨室预约等功能。支持实时查看座位使用情况，提前预约心仪座位。",
            category: "学习工具",
            icon_fa: "fa-book",
            display_order: 2,
            use_count: 8945,
            rating: 4.7,
            last_updated: "2024-11-25T14:30:00",
            is_active: true,
            is_official: true,
            url: "https://library-booking.example.com",
            tags: ["座位", "预约", "图书"]
        },
        {
            program_id: 3,
            name: "校园课表",
            description: "个人课程表查询与管理",
            long_description: "校园课表小程序帮助您管理个人课程表，查看上课时间、地点、教师信息。支持课程提醒、成绩查询等功能，是学习生活的好帮手。",
            category: "学习工具",
            icon_fa: "fa-calendar-alt",
            display_order: 3,
            use_count: 15678,
            rating: 4.9,
            last_updated: "2024-12-10T09:15:00",
            is_active: true,
            is_official: true,
            url: "https://class-schedule.example.com",
            tags: ["课表", "课程", "提醒"]
        },
        {
            program_id: 4,
            name: "校园公告",
            description: "学校新闻、通知公告",
            long_description: "校园公告小程序实时推送学校重要通知、新闻动态、活动信息。支持按学院、类型筛选，不错过任何重要信息。",
            category: "校园资讯",
            icon_fa: "fa-bullhorn",
            display_order: 4,
            use_count: 11234,
            rating: 4.5,
            last_updated: "2024-12-05T16:20:00",
            is_active: true,
            is_official: true,
            url: "https://campus-news.example.com",
            tags: ["新闻", "通知", "公告"]
        },
        {
            program_id: 5,
            name: "成绩查询",
            description: "课程成绩查询与分析",
            long_description: "成绩查询小程序提供详细的成绩查询功能，包括历年成绩、绩点计算、成绩趋势分析等，帮助您更好地了解学习情况。",
            category: "学习工具",
            icon_fa: "fa-chart-line",
            display_order: 5,
            use_count: 9876,
            rating: 4.6,
            last_updated: "2024-11-30T13:45:00",
            is_active: true,
            is_official: true,
            url: "https://grade-query.example.com",
            tags: ["成绩", "绩点", "分析"]
        },
        {
            program_id: 6,
            name: "校园导航",
            description: "校园地图与室内导航",
            long_description: "校园导航小程序提供详细的校园地图，支持室内外导航、地点搜索、路径规划等功能。帮助新生快速熟悉校园环境。",
            category: "生活服务",
            icon_fa: "fa-map-marker-alt",
            display_order: 6,
            use_count: 7654,
            rating: 4.8,
            last_updated: "2024-12-15T11:30:00",
            is_active: true,
            is_official: true,
            url: "https://campus-map.example.com",
            tags: ["地图", "导航", "位置"]
        },
        {
            program_id: 7,
            name: "失物招领",
            description: "失物发布与认领平台",
            long_description: "失物招领小程序提供便捷的失物发布和认领服务，帮助同学们快速找回丢失的物品，共建诚信友爱的校园环境。",
            category: "生活服务",
            icon_fa: "fa-search",
            display_order: 7,
            use_count: 5432,
            rating: 4.4,
            last_updated: "2024-12-03T15:10:00",
            is_active: true,
            is_official: false,
            url: "https://lost-found.example.com",
            tags: ["失物", "招领", "寻物"]
        },
        {
            program_id: 8,
            name: "社团活动",
            description: "社团信息与活动报名",
            long_description: "社团活动小程序汇集全校各类社团信息，提供活动发布、在线报名、活动签到等功能，丰富您的校园文化生活。",
            category: "校园资讯",
            icon_fa: "fa-users",
            display_order: 8,
            use_count: 6543,
            rating: 4.7,
            last_updated: "2024-12-08T14:00:00",
            is_active: true,
            is_official: false,
            url: "https://club-activity.example.com",
            tags: ["社团", "活动", "报名"]
        },
        {
            program_id: 9,
            name: "校车时刻",
            description: "校车班次查询与实时位置",
            long_description: "校车时刻小程序提供校车班次查询、实时位置跟踪、到站提醒等功能，让您合理安排出行时间，不再错过校车。",
            category: "生活服务",
            icon_fa: "fa-bus",
            display_order: 9,
            use_count: 4321,
            rating: 4.9,
            last_updated: "2024-12-12T08:45:00",
            is_active: true,
            is_official: true,
            url: "https://campus-bus.example.com",
            tags: ["校车", "班次", "出行"]
        },
        {
            program_id: 10,
            name: "在线报修",
            description: "宿舍、教室设施报修服务",
            long_description: "在线报修小程序提供便捷的设施报修服务，支持拍照上传、进度跟踪、服务评价等功能，快速解决设施问题。",
            category: "生活服务",
            icon_fa: "fa-tools",
            display_order: 10,
            use_count: 7890,
            rating: 4.5,
            last_updated: "2024-11-28T16:30:00",
            is_active: true,
            is_official: true,
            url: "https://repair-service.example.com",
            tags: ["报修", "维修", "服务"]
        },
        {
            program_id: 11,
            name: "心理健康",
            description: "心理咨询与心理测试",
            long_description: "心理健康小程序提供在线心理咨询、心理测试、心理健康知识普及等服务，关注学生心理健康成长。",
            category: "校园服务",
            icon_fa: "fa-heart",
            display_order: 11,
            use_count: 3456,
            rating: 4.8,
            last_updated: "2024-12-02T10:15:00",
            is_active: true,
            is_official: true,
            url: "https://mental-health.example.com",
            tags: ["心理", "咨询", "健康"]
        },
        {
            program_id: 12,
            name: "二手市场",
            description: "校园二手物品交易平台",
            long_description: "二手市场小程序提供安全可靠的校园二手物品交易平台，支持物品发布、搜索、在线沟通等功能，方便学生之间物品流转。",
            category: "生活服务",
            icon_fa: "fa-shopping-cart",
            display_order: 12,
            use_count: 8765,
            rating: 4.6,
            last_updated: "2024-12-06T13:20:00",
            is_active: true,
            is_official: false,
            url: "https://second-hand.example.com",
            tags: ["二手", "交易", "买卖"]
        }
    ],
    
    // 用户数据
    users: [
        {
            id: 1,
            name: "张三",
            student_id: "202310101",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=张三",
            department: "计算机科学与技术学院",
            grade: "2023级"
        },
        {
            id: 2,
            name: "李四",
            student_id: "202320202",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四",
            department: "电子工程学院",
            grade: "2023级"
        },
        {
            id: 3,
            name: "王五",
            student_id: "202330303",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=王五",
            department: "经济管理学院",
            grade: "2022级"
        }
    ],
    
    // 用户收藏的小程序ID数组（按显示顺序）
    userFavorites: [1, 3, 5, 7],
    
    // 用户最近使用记录
    userRecentUse: [
        { program_id: 3, used_at: "2024-12-20T14:30:00" },
        { program_id: 1, used_at: "2024-12-20T10:15:00" },
        { program_id: 6, used_at: "2024-12-19T16:45:00" },
        { program_id: 2, used_at: "2024-12-19T09:30:00" },
        { program_id: 8, used_at: "2024-12-18T15:20:00" },
        { program_id: 4, used_at: "2024-12-18T11:10:00" },
        { program_id: 5, used_at: "2024-12-17T14:00:00" }
    ],
    
    // 推荐的小程序ID数组
    recommendedPrograms: [2, 6, 9, 11, 12],
    
    // 初始化
    init: function() {
        this.loadFromStorage();
        
        // 如果没有用户数据，设置默认用户
        if (!this.currentUser && this.users.length > 0) {
            this.currentUser = this.users[0];
        }
        
        return this;
    },
    
    // 从本地存储加载数据
    loadFromStorage: function() {
        try {
            const userData = localStorage.getItem('miniProgram_user');
            const favoritesData = localStorage.getItem('miniProgram_favorites');
            const recentData = localStorage.getItem('miniProgram_recent');
            
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
            
            if (favoritesData) {
                this.userFavorites = JSON.parse(favoritesData);
            }
            
            if (recentData) {
                this.userRecentUse = JSON.parse(recentData);
            }
        } catch (e) {
            console.error('加载本地存储数据失败:', e);
        }
    },
    
    // 保存用户数据到本地存储
    saveUserToStorage: function() {
        try {
            localStorage.setItem('miniProgram_user', JSON.stringify(this.currentUser));
        } catch (e) {
            console.error('保存用户数据失败:', e);
        }
    },
    
    // 保存收藏数据到本地存储
    saveFavoritesToStorage: function() {
        try {
            localStorage.setItem('miniProgram_favorites', JSON.stringify(this.userFavorites));
        } catch (e) {
            console.error('保存收藏数据失败:', e);
        }
    },
    
    // 保存最近使用数据到本地存储
    saveRecentUseToStorage: function() {
        try {
            localStorage.setItem('miniProgram_recent', JSON.stringify(this.userRecentUse));
        } catch (e) {
            console.error('保存最近使用数据失败:', e);
        }
    },
    
    // 根据分类获取小程序
    getProgramsByCategory: function(category) {
        if (category === 'all') {
            return this.miniPrograms.filter(p => p.is_active);
        }
        return this.miniPrograms.filter(p => p.is_active && p.category === category);
    },
    
    // 搜索小程序
    searchPrograms: function(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.miniPrograms.filter(p => 
            p.is_active && (
                p.name.toLowerCase().includes(lowercaseQuery) ||
                p.description.toLowerCase().includes(lowercaseQuery) ||
                p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
                p.category.toLowerCase().includes(lowercaseQuery)
            )
        );
    },
    
    // 根据ID获取小程序
    getProgramById: function(programId) {
        return this.miniPrograms.find(p => p.program_id === programId);
    },
    
    // 获取推荐的小程序
    getRecommendedPrograms: function() {
        return this.recommendedPrograms
            .map(id => this.getProgramById(id))
            .filter(p => p && p.is_active);
    },
    
    // 获取用户最近使用的小程序
    getUserRecentPrograms: function(limit = 6) {
        return this.userRecentUse
            .slice(0, limit)
            .map(item => {
                const program = this.getProgramById(item.program_id);
                return program ? { ...program, used_at: item.used_at } : null;
            })
            .filter(p => p !== null);
    },
    
    // 获取用户收藏的小程序
    getUserFavorites: function() {
        return this.userFavorites
            .map(id => this.getProgramById(id))
            .filter(p => p && p.is_active);
    },
    
    // 检查小程序是否已收藏
    isProgramFavorited: function(programId) {
        return this.userFavorites.includes(programId);
    },
    
    // 切换收藏状态
    toggleFavorite: function(programId) {
        const index = this.userFavorites.indexOf(programId);
        
        if (index > -1) {
            // 如果已收藏，移除
            this.userFavorites.splice(index, 1);
            this.saveFavoritesToStorage();
            return false;
        } else {
            // 如果未收藏，添加
            this.userFavorites.push(programId);
            this.saveFavoritesToStorage();
            return true;
        }
    },
    
    // 添加最近使用记录
    addRecentUse: function(programId) {
        // 移除已存在的记录
        this.userRecentUse = this.userRecentUse.filter(item => item.program_id !== programId);
        
        // 添加新记录到开头
        this.userRecentUse.unshift({
            program_id: programId,
            used_at: new Date().toISOString()
        });
        
        // 只保留最近的20条记录
        if (this.userRecentUse.length > 20) {
            this.userRecentUse = this.userRecentUse.slice(0, 20);
        }
        
        this.saveRecentUseToStorage();
    },
    
    // 清空最近使用记录
    clearRecentUse: function() {
        this.userRecentUse = [];
        this.saveRecentUseToStorage();
    },
    
    // 格式化时间显示（几分钟前、几小时前等）
    formatTimeAgo: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return '刚刚';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}分钟前`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}小时前`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            if (days < 7) {
                return `${days}天前`;
            } else {
                // 显示具体日期
                return date.toLocaleDateString('zh-CN', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        }
    },
    
    // 获取小程序图标颜色（根据ID生成确定性的颜色）
    getIconColor: function(programId) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
            '#118AB2', '#073B4C', '#EF476F', '#7209B7',
            '#3A86FF', '#FB5607', '#8338EC', '#FF006E'
        ];
        return colors[programId % colors.length];
    },
    
    // 获取所有分类
    getCategories: function() {
        const categories = new Set();
        this.miniPrograms.forEach(p => {
            if (p.is_active) {
                categories.add(p.category);
            }
        });
        return Array.from(categories);
    }
};

// 初始化miniProgramData
miniProgramData.init();

// 小程序平台主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const miniUserInfo = document.getElementById('user-info');
    const miniUserName = document.getElementById('user-name');
    const miniUserAvatar = document.getElementById('user-avatar');
    const miniSearchInput = document.getElementById('mini-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchTags = document.querySelectorAll('.search-tag');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortSelect = document.getElementById('sort-select');
    const myMiniGrid = document.getElementById('my-mini-grid');
    const emptyMyMini = document.getElementById('empty-my-mini');
    const miniGrid = document.getElementById('mini-grid');
    const loadingMini = document.getElementById('loading-mini');
    const noResults = document.getElementById('no-results');
    const miniTotalCount = document.getElementById('mini-total-count');
    const recommendSlider = document.getElementById('recommend-slider');
    const recentGrid = document.getElementById('recent-grid');
    const emptyRecent = document.getElementById('empty-recent');
    const editMyMiniBtn = document.getElementById('edit-my-mini-btn');
    const clearRecentBtn = document.getElementById('clear-recent-btn');
    const myMiniNav = document.getElementById('my-mini-nav');
    const recentMiniNav = document.getElementById('recent-mini-nav');
    const todayUseCount = document.getElementById('today-use-count');
    const activeUserCount = document.getElementById('active-user-count');
    const dataUpdateTime = document.getElementById('data-update-time');
    const recommendRefresh = document.querySelector('.recommend-refresh');
    
    // 模态框相关
    const miniDetailModal = document.getElementById('mini-detail-modal');
    const miniDetailClose = document.getElementById('mini-detail-close');
    const miniDetailBody = document.getElementById('mini-detail-body');
    const editMiniModal = document.getElementById('edit-mini-modal');
    const editMiniClose = document.getElementById('edit-mini-close');
    const editMiniList = document.getElementById('edit-mini-list');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // 应用状态
    let currentCategory = 'all';
    let currentSearchQuery = '';
    let currentSortBy = 'display_order';
    let isEditingMyMini = false;
    let sortableInstance = null;
    
    // 初始化
    init();
    
    function init() {
        // 更新用户信息显示
        updateUserInfo();
        
        // 更新平台统计信息
        updateStats();
        
        // 加载我的小程序
        loadMyMiniPrograms();
        
        // 加载全部小程序
        loadAllMiniPrograms();
        
        // 加载推荐小程序
        loadRecommendedPrograms();
        
        // 加载最近使用小程序
        loadRecentPrograms();
        
        // 设置事件监听器
        setupEventListeners();
    }
    
    // 更新用户信息显示
    function updateUserInfo() {
        if (miniProgramData.currentUser) {
            miniUserName.textContent = miniProgramData.currentUser.name;
            miniUserAvatar.src = miniProgramData.currentUser.avatar_url;
        } else {
            miniUserName.textContent = '请登录';
            miniUserAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
        }
    }
    
    // 更新平台统计信息
    function updateStats() {
        todayUseCount.textContent = miniProgramData.stats.todayUseCount;
        activeUserCount.textContent = miniProgramData.stats.activeUserCount;
        dataUpdateTime.textContent = miniProgramData.stats.dataUpdateTime;
        miniTotalCount.textContent = miniProgramData.miniPrograms.filter(p => p.is_active).length;
    }
    
    // 加载我的小程序
    function loadMyMiniPrograms() {
        const favorites = miniProgramData.getUserFavorites();
        
        myMiniGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            emptyMyMini.style.display = 'block';
            myMiniGrid.appendChild(emptyMyMini);
            return;
        }
        
        emptyMyMini.style.display = 'none';
        
        favorites.forEach(program => {
            const miniItem = document.createElement('div');
            miniItem.className = 'mini-card';
            miniItem.dataset.programId = program.program_id;
            
            miniItem.innerHTML = `
                <div class="mini-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                    <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                </div>
                <div class="mini-name">${program.name}</div>
                <div class="mini-category">${program.category}</div>
                <button class="mini-favorite-btn favorite" data-program-id="${program.program_id}">
                    <i class="fas fa-star"></i>
                </button>
            `;
            
            myMiniGrid.appendChild(miniItem);
            
            // 添加点击事件
            miniItem.addEventListener('click', function(e) {
                if (!e.target.closest('.mini-favorite-btn')) {
                    openMiniProgram(program.program_id);
                }
            });
            
            // 添加收藏按钮事件
            const favoriteBtn = miniItem.querySelector('.mini-favorite-btn');
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavorite(program.program_id);
                loadMyMiniPrograms();
                loadAllMiniPrograms();
            });
        });
    }
    
    // 加载全部小程序
    function loadAllMiniPrograms() {
        // 显示加载状态
        loadingMini.style.display = 'block';
        noResults.style.display = 'none';
        
        // 模拟API延迟
        setTimeout(() => {
            let programs = [];
            
            // 根据搜索词和分类筛选
            if (currentSearchQuery) {
                programs = miniProgramData.searchPrograms(currentSearchQuery);
            } else {
                programs = miniProgramData.getProgramsByCategory(currentCategory);
            }
            
            // 根据排序方式排序
            programs.sort((a, b) => {
                switch (currentSortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'recent':
                        // 按最近使用时间排序（需要计算）
                        const aRecent = miniProgramData.userRecentUse.find(item => item.program_id === a.program_id);
                        const bRecent = miniProgramData.userRecentUse.find(item => item.program_id === b.program_id);
                        
                        if (!aRecent && !bRecent) return 0;
                        if (!aRecent) return 1;
                        if (!bRecent) return -1;
                        
                        return new Date(bRecent.used_at) - new Date(aRecent.used_at);
                    case 'popular':
                        return b.use_count - a.use_count;
                    case 'display_order':
                    default:
                        return a.display_order - b.display_order;
                }
            });
            
            // 更新总数显示
            miniTotalCount.textContent = programs.length;
            
            // 渲染小程序列表
            renderMiniPrograms(programs);
            
            // 隐藏加载状态
            loadingMini.style.display = 'none';
            
            // 如果没有结果，显示无结果提示
            if (programs.length === 0) {
                noResults.style.display = 'block';
            }
        }, 500);
    }
    
    // 渲染小程序列表
    function renderMiniPrograms(programs) {
        miniGrid.innerHTML = '';
        
        programs.forEach(program => {
            const isFavorited = miniProgramData.isProgramFavorited(program.program_id);
            
            const miniCard = document.createElement('div');
            miniCard.className = `mini-card ${isFavorited ? 'favorite' : ''}`;
            miniCard.dataset.programId = program.program_id;
            
            miniCard.innerHTML = `
                <div class="mini-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                    <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                </div>
                <div class="mini-name">${program.name}</div>
                <div class="mini-category">${program.category}</div>
                <div class="mini-description">${program.description}</div>
                <button class="mini-favorite-btn ${isFavorited ? 'favorite' : ''}" data-program-id="${program.program_id}">
                    <i class="fas fa-star"></i>
                </button>
            `;
            
            miniGrid.appendChild(miniCard);
            
            // 添加点击事件
            miniCard.addEventListener('click', function(e) {
                if (!e.target.closest('.mini-favorite-btn')) {
                    openMiniProgram(program.program_id);
                }
            });
            
            // 添加收藏按钮事件
            const favoriteBtn = miniCard.querySelector('.mini-favorite-btn');
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wasFavorited = miniProgramData.toggleFavorite(program.program_id);
                
                // 更新按钮状态
                this.classList.toggle('favorite', wasFavorited);
                
                // 更新卡片样式
                miniCard.classList.toggle('favorite', wasFavorited);
                
                // 更新我的小程序列表
                loadMyMiniPrograms();
                
                // 显示提示
                showToast(wasFavorited ? '已添加到我的小程序' : '已从我的小程序移除', wasFavorited ? 'success' : 'info');
            });
        });
    }
    
    // 加载推荐小程序
    function loadRecommendedPrograms() {
        const recommended = miniProgramData.getRecommendedPrograms();
        
        recommendSlider.innerHTML = '';
        
        recommended.forEach(program => {
            const isFavorited = miniProgramData.isProgramFavorited(program.program_id);
            
            const recommendCard = document.createElement('div');
            recommendCard.className = 'recommend-card';
            recommendCard.dataset.programId = program.program_id;
            
            recommendCard.innerHTML = `
                <div class="recommend-badge">推荐</div>
                <div class="recommend-content">
                    <div class="recommend-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                        <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                    </div>
                    <div class="recommend-info">
                        <div class="recommend-name">${program.name}</div>
                        <div class="recommend-desc">${program.description}</div>
                    </div>
                </div>
            `;
            
            recommendSlider.appendChild(recommendCard);
            
            // 添加点击事件
            recommendCard.addEventListener('click', function() {
                openMiniProgram(program.program_id);
            });
        });
    }
    
    // 加载最近使用小程序
    function loadRecentPrograms() {
        const recentPrograms = miniProgramData.getUserRecentPrograms(6);
        
        recentGrid.innerHTML = '';
        
        if (recentPrograms.length === 0) {
            emptyRecent.style.display = 'block';
            recentGrid.appendChild(emptyRecent);
            return;
        }
        
        emptyRecent.style.display = 'none';
        
        recentPrograms.forEach(program => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            recentItem.dataset.programId = program.program_id;
            
            recentItem.innerHTML = `
                <div class="recent-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                    <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                </div>
                <div class="recent-name">${program.name}</div>
                <div class="recent-time">${miniProgramData.formatTimeAgo(program.used_at)}</div>
            `;
            
            recentGrid.appendChild(recentItem);
            
            // 添加点击事件
            recentItem.addEventListener('click', function() {
                openMiniProgram(program.program_id);
            });
        });
    }
    
    // 打开小程序
    function openMiniProgram(programId) {
        const program = miniProgramData.getProgramById(programId);
        if (!program) return;
        
        // 增加使用计数
        program.use_count++;
        
        // 添加到最近使用记录
        miniProgramData.addRecentUse(programId);
        
        // 更新最近使用列表
        loadRecentPrograms();
        
        // 显示小程序详情
        showMiniDetail(programId);
        
        // 显示提示
        showToast(`正在打开 ${program.name}`, 'info');
    }
    
    // 显示小程序详情
    function showMiniDetail(programId) {
        const program = miniProgramData.getProgramById(programId);
        if (!program) return;
        
        const isFavorited = miniProgramData.isProgramFavorited(programId);
        
        // 构建小程序详情HTML
        miniDetailBody.innerHTML = `
            <div class="mini-detail-header">
                <div class="mini-detail-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                    <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                </div>
                <div class="mini-detail-title-section">
                    <h3 class="mini-detail-title">${program.name}</h3>
                    <div class="mini-detail-category">${program.category} ${program.is_official ? '· 官方' : '· 第三方'}</div>
                </div>
                <div class="mini-detail-favorite">
                    <button class="mini-detail-favorite-btn ${isFavorited ? 'favorite' : ''}" id="mini-detail-favorite-btn" data-program-id="${programId}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
            
            <div class="mini-detail-content">
                <div class="mini-detail-description">
                    ${program.long_description}
                </div>
                
                <div class="mini-detail-info">
                    <div class="mini-detail-info-item">
                        <i class="fas fa-chart-line"></i>
                        <span>使用次数: ${program.use_count}</span>
                    </div>
                    <div class="mini-detail-info-item">
                        <i class="fas fa-star"></i>
                        <span>评分: ${program.rating}/5.0</span>
                    </div>
                    <div class="mini-detail-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>更新: ${program.last_updated.split('T')[0]}</span>
                    </div>
                </div>
                
                ${program.tags && program.tags.length > 0 ? `
                    <div class="mini-detail-tags">
                        ${program.tags.map(tag => `<span class="mini-detail-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="mini-detail-actions">
                <button class="btn btn-primary" id="open-mini-btn" data-program-id="${programId}">
                    <i class="fas fa-external-link-alt"></i> 打开小程序
                </button>
                <button class="btn btn-secondary" id="share-mini-btn">
                    <i class="fas fa-share-alt"></i> 分享
                </button>
            </div>
        `;
        
        // 显示模态框
        miniDetailModal.classList.add('show');
        
        // 设置收藏按钮事件
        const favoriteBtn = document.getElementById('mini-detail-favorite-btn');
        favoriteBtn.addEventListener('click', function() {
            const wasFavorited = miniProgramData.toggleFavorite(programId);
            
            // 更新按钮状态
            this.classList.toggle('favorite', wasFavorited);
            
            // 更新其他地方的显示
            loadMyMiniPrograms();
            loadAllMiniPrograms();
            
            // 显示提示
            showToast(wasFavorited ? '已添加到我的小程序' : '已从我的小程序移除', wasFavorited ? 'success' : 'info');
        });
        
        // 设置打开按钮事件
        const openBtn = document.getElementById('open-mini-btn');
        openBtn.addEventListener('click', function() {
            // 在实际应用中，这里会跳转到小程序页面
            // 现在只是模拟打开
            alert(`正在打开 ${program.name} 小程序...\n\nURL: ${program.url || '#'}`);
            miniDetailModal.classList.remove('show');
        });
        
        // 设置分享按钮事件
        const shareBtn = document.getElementById('share-mini-btn');
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: program.name,
                    text: program.description,
                    url: window.location.href
                });
            } else {
                // 复制链接到剪贴板
                const tempInput = document.createElement('input');
                tempInput.value = `校园小程序: ${program.name} - ${program.description}`;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                showToast('小程序信息已复制到剪贴板', 'success');
            }
        });
    }
    
    // 切换收藏状态
    function toggleFavorite(programId) {
        const wasFavorited = miniProgramData.toggleFavorite(programId);
        return wasFavorited;
    }
    
    // 显示编辑我的小程序模态框
    function showEditMyMiniModal() {
        const favorites = miniProgramData.getUserFavorites();
        
        editMiniList.innerHTML = '';
        
        if (favorites.length === 0) {
            editMiniList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">暂无收藏的小程序</p>';
        } else {
            favorites.forEach(program => {
                const editItem = document.createElement('div');
                editItem.className = 'edit-mini-item';
                editItem.dataset.programId = program.program_id;
                
                editItem.innerHTML = `
                    <div class="edit-mini-icon" style="background-color: ${miniProgramData.getIconColor(program.program_id)}">
                        <i class="fas ${program.icon_fa || 'fa-th-large'}"></i>
                    </div>
                    <div class="edit-mini-info">
                        <div class="edit-mini-name">${program.name}</div>
                        <div class="edit-mini-category">${program.category}</div>
                    </div>
                    <button class="edit-mini-remove" data-program-id="${program.program_id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                editMiniList.appendChild(editItem);
                
                // 添加移除按钮事件
                const removeBtn = editItem.querySelector('.edit-mini-remove');
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const programId = parseInt(this.dataset.programId);
                    miniProgramData.toggleFavorite(programId);
                    
                    // 从列表中移除
                    editItem.remove();
                    
                    // 如果列表为空，显示提示
                    if (editMiniList.children.length === 0) {
                        editMiniList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">暂无收藏的小程序</p>';
                    }
                });
            });
            
            // 初始化拖拽排序
            if (sortableInstance) {
                sortableInstance.destroy();
            }
            
            sortableInstance = new Sortable(editMiniList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: function(evt) {
                    // 拖拽结束后更新收藏顺序
                    const newOrder = [];
                    const items = editMiniList.querySelectorAll('.edit-mini-item');
                    items.forEach(item => {
                        newOrder.push(parseInt(item.dataset.programId));
                    });
                    
                    miniProgramData.userFavorites = newOrder;
                }
            });
        }
        
        // 显示模态框
        editMiniModal.classList.add('show');
    }
    
    // 保存编辑
    function saveEditMyMini() {
        // 数据已经在拖拽时更新了，这里只需要保存
        miniProgramData.saveFavoritesToStorage();
        
        // 更新我的小程序列表
        loadMyMiniPrograms();
        
        // 关闭模态框
        editMiniModal.classList.remove('show');
        
        showToast('我的小程序已更新', 'success');
    }
    
    // 清空最近使用记录
    function clearRecentUse() {
        if (confirm('确定要清空最近使用记录吗？')) {
            miniProgramData.clearRecentUse();
            loadRecentPrograms();
            showToast('最近使用记录已清空', 'info');
        }
    }
    
    // 显示Toast通知
    function showToast(message, type = 'info') {
        const backgroundColor = type === 'success' ? '#4CAF50' : 
                               type === 'error' ? '#FF6B6B' : 
                               type === 'info' ? '#3498db' : '#FFB347';
        
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: backgroundColor,
            stopOnFocus: true,
        }).showToast();
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 用户信息点击（模拟登录/登出）
        miniUserInfo.addEventListener('click', function() {
            if (miniProgramData.currentUser) {
                // 登出
                if (confirm('确定要退出登录吗？')) {
                    miniProgramData.currentUser = null;
                    miniProgramData.saveUserToStorage();
                    updateUserInfo();
                    showToast('已退出登录', 'info');
                }
            } else {
                // 登录（模拟）
                const randomUser = miniProgramData.users[0];
                miniProgramData.currentUser = randomUser;
                miniProgramData.saveUserToStorage();
                
                updateUserInfo();
                showToast(`欢迎回来，${randomUser.name}`, 'success');
            }
        });
        
        // 搜索输入
        miniSearchInput.addEventListener('input', function() {
            currentSearchQuery = this.value.trim();
            
            // 显示/隐藏清空按钮
            if (currentSearchQuery) {
                clearSearchBtn.classList.add('show');
            } else {
                clearSearchBtn.classList.remove('show');
            }
            
            // 延迟搜索（防抖）
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                loadAllMiniPrograms();
            }, 300);
        });
        
        // 清空搜索
        clearSearchBtn.addEventListener('click', function() {
            miniSearchInput.value = '';
            currentSearchQuery = '';
            this.classList.remove('show');
            loadAllMiniPrograms();
        });
        
        // 热门搜索标签
        searchTags.forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                const searchText = this.dataset.search;
                miniSearchInput.value = searchText;
                currentSearchQuery = searchText;
                clearSearchBtn.classList.add('show');
                loadAllMiniPrograms();
            });
        });
        
        // 分类筛选按钮
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 更新活动状态
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 更新分类筛选
                currentCategory = this.dataset.category;
                currentPage = 1;
                loadAllMiniPrograms();
                
                // 滚动到小程序列表区域
                document.querySelector('.mini-list-section').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
        
        // 排序方式变化
        sortSelect.addEventListener('change', function() {
            currentSortBy = this.value;
            loadAllMiniPrograms();
        });
        
        // 编辑我的小程序
        editMyMiniBtn.addEventListener('click', showEditMyMiniModal);
        
        // 清空最近使用记录
        clearRecentBtn.addEventListener('click', clearRecentUse);
        
        // 推荐刷新
        recommendRefresh.addEventListener('click', function() {
            // 随机打乱推荐顺序
            miniProgramData.recommendedPrograms.sort(() => Math.random() - 0.5);
            loadRecommendedPrograms();
            showToast('推荐已刷新', 'info');
        });
        
        // 模态框关闭
        miniDetailClose.addEventListener('click', function() {
            miniDetailModal.classList.remove('show');
        });
        
        editMiniClose.addEventListener('click', function() {
            editMiniModal.classList.remove('show');
        });
        
        // 模态框外部点击关闭
        [miniDetailModal, editMiniModal].forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('show');
                }
            });
        });
        
        // 编辑模态框按钮
        saveEditBtn.addEventListener('click', saveEditMyMini);
        
        cancelEditBtn.addEventListener('click', function() {
            editMiniModal.classList.remove('show');
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            // ESC键关闭模态框
            if (e.key === 'Escape') {
                if (miniDetailModal.classList.contains('show')) {
                    miniDetailModal.classList.remove('show');
                }
                if (editMiniModal.classList.contains('show')) {
                    editMiniModal.classList.remove('show');
                }
            }
            
            // Ctrl/Cmd + F 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                miniSearchInput.focus();
            }
        });
    }
});