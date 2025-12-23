// 小程序平台主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const miniUserInfo = document.getElementById('mini-user-info');
    const miniUserName = document.getElementById('mini-user-name');
    const miniUserAvatar = document.getElementById('mini-user-avatar');
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
        
        // 底部导航 - 我的小程序
        myMiniNav.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.my-mini-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
        
        // 底部导航 - 最近使用
        recentMiniNav.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.recent-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
        
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