// 论坛模拟数据和功能实现

// 全局变量
let posts = [];
let hotPosts = [];
let currentUser = null;
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 10;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载模拟数据
    loadMockData();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 加载论坛统计信息
    updateForumStats();
    
    // 加载用户信息
    loadUserInfo();
});

// 初始化事件监听器
function initEventListeners() {
    // 分类筛选事件
    document.getElementById('category-list').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            
            // 更新分类状态
            const categoryLinks = this.querySelectorAll('a');
            categoryLinks.forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');
            
            // 获取选中的分类
            currentCategory = e.target.dataset.category;
            currentPage = 1;
            
            // 加载帖子
            loadPosts();
        }
    });
    
    // 搜索事件
    document.getElementById('search-btn').addEventListener('click', function() {
        currentPage = 1;
        loadPosts();
    });
    
    // 回车键搜索
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadPosts();
        }
    });
    
    // 排序事件
    document.getElementById('sort-by').addEventListener('change', function() {
        currentPage = 1;
        loadPosts();
    });
    
    document.getElementById('order').addEventListener('change', function() {
        currentPage = 1;
        loadPosts();
    });
    
    // 发布帖子事件
    document.getElementById('submit-post-btn').addEventListener('click', function() {
        createNewPost();
    });
    
    // 登录提示模态框事件
    document.getElementById('go-login-btn').addEventListener('click', function() {
        simulateLogin();
        closeModal('login-prompt-modal');
    });
    
    document.getElementById('cancel-login-btn').addEventListener('click', function() {
        closeModal('login-prompt-modal');
    });
    
    // 用户信息点击事件
    document.getElementById('forum-user-info').addEventListener('click', function() {
        if (!currentUser) {
            openModal('login-prompt-modal');
        }
    });
    
    // 关闭所有模态框的事件
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// 加载用户信息
function loadUserInfo() {
    // 尝试从本地存储获取用户信息
    const storedUser = localStorage.getItem('forumUser');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserUI();
    }
}

// 更新用户界面
function updateUserUI() {
    if (currentUser) {
        document.getElementById('forum-user-avatar').src = currentUser.avatar;
        document.getElementById('forum-user-name').textContent = currentUser.name;
        document.getElementById('create-post-avatar').src = currentUser.avatar;
    } else {
        document.getElementById('forum-user-avatar').src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
        document.getElementById('forum-user-name').textContent = '请登录';
        document.getElementById('create-post-avatar').src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
    }
}

// 加载帖子
function loadPosts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    const order = document.getElementById('order').value;
    
    // 过滤帖子
    let filteredPosts = [...posts];
    
    // 按分类过滤
    if (currentCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentCategory);
    }
    
    // 按搜索词过滤
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.content.toLowerCase().includes(searchTerm)
        );
    }
    
    // 排序帖子
    filteredPosts.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // 如果是字符串，转换为小写进行比较
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (order === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    // 计算分页
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // 渲染帖子
    renderPosts(paginatedPosts);
    
    // 渲染分页控件
    renderPagination(totalPages);
    
    // 滚动到顶部
    document.querySelector('.forum-main').scrollIntoView({ behavior: 'smooth' });
}
// 渲染帖子列表
function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">暂无帖子</div>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.author.avatar}" alt="${post.author.name}">
                    <div class="post-author-info">
                        <h4>${post.author.name}</h4>
                        <span>${formatTime(post.created_at)}</span>
                    </div>
                </div>
                <div class="post-category">${post.category}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title"><a href="#" class="post-title-link">${post.title}</a></h3>
                <p class="post-excerpt">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            </div>
            <div class="post-stats">
                <span><i class="fas fa-eye"></i> ${post.view_count}</span>
                <span><i class="fas fa-heart"></i> ${post.like_count}</span>
                <span><i class="fas fa-comment"></i> ${post.comment_count}</span>
            </div>
        </div>
    `).join('');
    
    // 为整个帖子卡片添加点击事件（替换之前的标题点击事件）
    postsContainer.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 防止点击内部链接时触发
            if (e.target.tagName === 'A' && e.target.classList.contains('post-title-link')) {
                e.preventDefault();
            }
            const postId = parseInt(this.dataset.postId);
            showPostDetail(postId);
        });
    });
}

// 渲染分页控件
function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
let paginationHTML = '';
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    // 页码按钮
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
}
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    // 为分页按钮添加事件监听器
    paginationContainer.querySelectorAll('.page-btn').forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.dataset.page);
            if (page !== currentPage) {
                currentPage = page;
                loadPosts();
                
                // 滚动到顶部
                document.querySelector('.forum-main').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// 创建新帖子
function createNewPost() {
    const title = document.getElementById('post-title-input').value.trim();
    const content = document.getElementById('post-content-input').value.trim();
    const category = document.getElementById('post-category-select').value;
    
    if (!title) {
        showToast('请输入帖子标题', 'error');
        return;
    }
    
    if (!content) {
        showToast('请输入帖子内容', 'error');
        return;
    }
    
    if (!category) {
        showToast('请选择帖子分类', 'error');
        return;
    }
    
    // 创建新帖子对象
    const newPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        title: title,
        content: content,
        category: category,
        author: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.name
        },
        created_at: new Date().toISOString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        liked: false,
        comments: []
    };
    
    // 添加到帖子数组
    posts.unshift(newPost);
    
    // 清空输入框
    document.getElementById('post-title-input').value = '';
    document.getElementById('post-content-input').value = '';
    document.getElementById('post-category-select').value = '';
    
    // 重新加载帖子
    currentPage = 1;
    loadPosts();
    
    // 更新热帖
    loadHotPosts();
    
    // 更新今日发帖数
    updateForumStats();
    
    // 显示成功消息
    showToast('帖子发布成功！', 'success');
}

// 点赞/取消点赞
function toggleLike(postId) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 切换点赞状态
    if (post.liked) {
        post.like_count--;
        post.liked = false;
    } else {
        post.like_count++;
        post.liked = true;
    }
    
    // 更新UI
    const likeButton = document.querySelector(`.btn-like[data-post-id="${postId}"]`);
    if (likeButton) {
        likeButton.classList.toggle('liked');
        likeButton.innerHTML = `<i class="fas fa-heart"></i> 点赞 (${post.like_count})`;
    }
    
    // 更新帖子列表中的点赞数
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"] .post-stats span:nth-child(2)`);
    if (postCard) {
        postCard.innerHTML = `<i class="fas fa-heart"></i> ${post.like_count}`;
    }
    
    // 更新热帖
    loadHotPosts();
    
    showToast(post.liked ? '已点赞' : '已取消点赞', 'info');
}

// 添加评论
function addComment(postId, content) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    if (!content.trim()) {
        showToast('请输入评论内容', 'error');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 创建新评论
    const newComment = {
        id: post.comments.length > 0 ? Math.max(...post.comments.map(c => c.id)) + 1 : 1,
        content: content,
        author: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.name
        },
        created_at: new Date().toISOString()
    };
    
    // 添加到帖子评论
    post.comments.unshift(newComment);
    post.comment_count++;
    
    // 更新UI
    const commentsSection = document.querySelector(`#post-detail-body .comments-section`);
    if (commentsSection) {
        const commentsList = commentsSection.querySelector('.comments-list');
        const commentCount = commentsSection.querySelector('h3');
        
        // 添加新评论到列表顶部
        const commentHTML = `
            <div class="comment-item">
                <div class="comment-author">
                    <img src="${newComment.author.avatar}" alt="${newComment.author.name}">
                    <div class="comment-author-info">
                        <h5>${newComment.author.name}</h5>
                        <span class="comment-time">${formatTime(newComment.created_at)}</span>
                    </div>
                </div>
                <div class="comment-content">${newComment.content}</div>
            </div>
        `;
        
        commentsList.insertAdjacentHTML('afterbegin', commentHTML);
        commentCount.textContent = `评论 (${post.comment_count})`;
    }
    
    // 更新帖子列表中的评论数
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"] .post-stats span:nth-child(3)`);
    if (postCard) {
        postCard.innerHTML = `<i class="fas fa-comment"></i> ${post.comment_count}`;
    }
    
    // 更新热帖
    loadHotPosts();
    
    showToast('评论发布成功！', 'success');
}

// 增加浏览量
function increaseViewCount(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    post.view_count++;
    
    // 更新帖子列表中的浏览量
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"] .post-stats span:nth-child(1)`);
    if (postCard) {
        postCard.innerHTML = `<i class="fas fa-eye"></i> ${post.view_count}`;
    }
    
    // 更新热帖
    loadHotPosts();
}

// 加载热帖
function loadHotPosts() {
    // 根据点赞数、评论数和浏览量计算热帖
    hotPosts = [...posts]
        .sort((a, b) => {
            // 简单热度算法：点赞*2 + 评论*1.5 + 浏览*0.1
            const aHot = (a.like_count * 2) + (a.comment_count * 1.5) + (a.view_count * 0.1);
            const bHot = (b.like_count * 2) + (b.comment_count * 1.5) + (b.view_count * 0.1);
            return bHot - aHot;
        })
        .slice(0, 5);
    
    // 渲染热帖
    renderHotPosts();
}

// 渲染热帖
function renderHotPosts() {
    const hotPostsList = document.getElementById('hot-posts-list');
    
    if (hotPosts.length === 0) {
        hotPostsList.innerHTML = '<li>暂无热帖</li>';
        return;
    }
    
    hotPostsList.innerHTML = hotPosts.map((post, index) => `
        <li>
            <span class="hot-rank">${index + 1}</span>
            <a href="#" class="hot-post-link" data-post-id="${post.id}">
                ${post.title}
            </a>
            <span class="hot-stats">
                <i class="fas fa-heart"></i> ${post.like_count}
                <i class="fas fa-comment"></i> ${post.comment_count}
            </span>
        </li>
    `).join('');
    
    // 为热帖链接添加事件监听器
    hotPostsList.querySelectorAll('.hot-post-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = parseInt(this.dataset.postId);
            showPostDetail(postId);
        });
    });
}

// 显示帖子详情
function showPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 增加浏览量
    increaseViewCount(postId);
    
    // 更新帖子详情内容
    document.getElementById('post-detail-title').textContent = post.title;
    
    const postDetailBody = document.getElementById('post-detail-body');
    postDetailBody.innerHTML = `
    <div class="post-detail-header">
        <div class="post-detail-author">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="post-detail-avatar"> <!-- 添加类名 -->
            <div class="post-detail-author-info">
                <h3>${post.author.name}</h3>
                <div class="post-detail-meta"> <!-- 添加容器 -->
                    <span class="post-detail-time">${formatTime(post.created_at)}</span>
                    <span class="post-detail-category">${post.category}</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="post-detail-content">
        ${post.content}
    </div>
    
        <div class="post-detail-actions">
            <button class="btn btn-secondary btn-like ${post.liked ? 'liked' : ''}" data-post-id="${post.id}" onclick="toggleLike(${post.id})">
                <i class="fas fa-heart"></i> 点赞 (${post.like_count})
            </button>
        </div>
        
        <div class="comments-section">
            <h3>评论 (${post.comment_count})</h3>
            
            <div class="add-comment">
                <textarea id="comment-input-${post.id}" class="comment-input" placeholder="写下你的评论..."></textarea>
                <button class="btn btn-primary" onclick="addComment(${post.id}, document.getElementById('comment-input-${post.id}').value)">
                    <i class="fas fa-paper-plane"></i> 发布评论
                </button>
            </div>
            
            <div class="comments-list">
                ${post.comments.length > 0 ? post.comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-author">
                            <img src="${comment.author.avatar}" alt="${comment.author.name}">
                            <div class="comment-author-info">
                                <h5>${comment.author.name}</h5>
                                <span class="comment-time">${formatTime(comment.created_at)}</span>
                            </div>
                        </div>
                        <div class="comment-content">${comment.content}</div>
                    </div>
                `).join('') : '<p>暂无评论</p>'}
            </div>
        </div>
    `;
    
    // 打开帖子详情模态框
    openModal('post-detail-modal');
}

// 显示登录提示模态框
function showLoginPrompt() {
    openModal('login-prompt-modal');
}

// 模拟登录
function simulateLogin() {
    // 创建模拟用户
    currentUser = {
        id: 1,
        name: '校园用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' + Date.now()
    };
    
    // 保存到本地存储
    localStorage.setItem('forumUser', JSON.stringify(currentUser));
    
    // 更新UI
    updateUserUI();
    
    // 显示成功消息
    showToast('登录成功！', 'success');
}

// 更新论坛统计信息
function updateForumStats() {
    // 模拟在线人数（随机数）
    const onlineCount = Math.floor(Math.random() * 100) + 100;
    document.getElementById('online-count').textContent = onlineCount;
    
    // 今日发帖数（从帖子数据中计算今天发布的帖子）
    const today = new Date().toISOString().split('T')[0];
    const todayPosts = posts.filter(post => post.created_at.startsWith(today)).length;
    document.getElementById('today-post-count').textContent = todayPosts;
}

// 打开模态框
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto'; // 恢复背景滚动
}

// 显示通知消息
function showToast(message, type = 'info') {
    const backgroundColor = type === 'success' ? '#4CAF50' : 
                           type === 'error' ? '#F44336' : 
                           type === 'warning' ? '#FF9800' : '#2196F3';
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true,
    }).showToast();
}

// 格式化时间
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
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

// 加载模拟数据
function loadMockData() {
    // 模拟帖子数据
    const mockPosts = [
        {
            id: 1,
            title: '高等数学期末复习经验分享',
            content: '这学期的高等数学考试快要到了，我整理了一些复习资料和经验，希望对大家有帮助。重点复习章节是第三章和第五章，历年考题中有60%的内容来自这两章。',
            category: '学习交流',
            author: {
                id: 101,
                name: '学霸小明',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=学霸小明'
            },
            created_at: '2024-05-10T14:30:00Z',
            view_count: 245,
            like_count: 45,
            comment_count: 12,
            liked: false,
            comments: [
                {
                    id: 1,
                    content: '感谢分享！请问有习题集的电子版吗？',
                    author: {
                        id: 102,
                        name: '求知者',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=求知者'
                    },
                    created_at: '2024-05-10T15:20:00Z'
                },
                {
                    id: 2,
                    content: '第三章的证明题确实很难，有没有更详细的解题思路？',
                    author: {
                        id: 103,
                        name: '数学爱好者',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=数学爱好者'
                    },
                    created_at: '2024-05-10T16:10:00Z'
                }
            ]
        },
        {
            id: 2,
            title: '北区食堂新窗口试吃报告',
            content: '今天北区食堂二楼新开了个川菜窗口，试了他们的水煮鱼和麻婆豆腐，味道不错，价格也合理。推荐给喜欢辣的同学！',
            category: '校园生活',
            author: {
                id: 104,
                name: '美食侦探',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=美食侦探'
            },
            created_at: '2024-05-09T12:15:00Z',
            view_count: 189,
            like_count: 32,
            comment_count: 8,
            liked: false,
            comments: [
                {
                    id: 1,
                    content: '中午去试了一下，确实不错！',
                    author: {
                        id: 105,
                        name: '吃货一枚',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=吃货一枚'
                    },
                    created_at: '2024-05-09T13:30:00Z'
                }
            ]
        },
        {
            id: 3,
            title: '转让几乎全新的Java编程思想',
            content: '因专业调整，转让一本《Java编程思想（第四版）》，仅翻阅过几次，几乎全新。原价108，现60出。有意者请联系。',
            category: '闲置交易',
            author: {
                id: 106,
                name: '转专业同学',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=转专业同学'
            },
            created_at: '2024-05-08T09:45:00Z',
            view_count: 76,
            like_count: 5,
            comment_count: 3,
            liked: false,
            comments: []
        },
        {
            id: 4,
            title: '周末篮球赛招募队员',
            content: '本周末下午3点体育馆有篮球友谊赛，现招募3名队员。要求有一定篮球基础，能打全场。有意者请回复报名！',
            category: '校园活动',
            author: {
                id: 107,
                name: '篮球社长',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=篮球社长'
            },
            created_at: '2024-05-07T16:20:00Z',
            view_count: 134,
            like_count: 18,
            comment_count: 7,
            liked: false,
            comments: []
        },
        {
            id: 5,
            title: '关于图书馆延长开放时间的建议',
            content: '期末临近，建议图书馆能将闭馆时间从晚上10点延长到11点，方便同学们复习备考。支持的请点赞！',
            category: '意见建议',
            author: {
                id: 108,
                name: '备考学子',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=备考学子'
            },
            created_at: '2024-05-06T20:10:00Z',
            view_count: 312,
            like_count: 89,
            comment_count: 24,
            liked: false,
            comments: []
        }
    ];
    
    // 添加更多模拟数据
    for (let i = 6; i <= 30; i++) {
        const categories = ['学习交流', '校园生活', '闲置交易', '校园活动', '意见建议'];
        
        mockPosts.push({
            id: i,
            title: `模拟帖子标题 ${i}`,
            content: `这是第 ${i} 个模拟帖子的内容。这是一个用于测试的帖子，包含一些示例文本。`,
            category: categories[i % categories.length],
            author: {
                id: 200 + i,
                name: `用户${i}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=用户${i}`
            },
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            view_count: Math.floor(Math.random() * 300),
            like_count: Math.floor(Math.random() * 50),
            comment_count: Math.floor(Math.random() * 15),
            liked: false,
            comments: []
        });
    }
    
    posts = mockPosts;
    
    // 加载帖子
    loadPosts();
    
    // 加载热帖
    loadHotPosts();
}