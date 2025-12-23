// 论坛模拟数据
const forumData = {
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
            created_at: "2023-09-01T10:00:00Z"
        },
        {
            user_id: 2,
            student_id: "20210002",
            name: "李四",
            email: "lisi@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=李四",
            created_at: "2023-09-05T14:30:00Z"
        },
        {
            user_id: 3,
            student_id: "20210003",
            name: "王五",
            email: "wangwu@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=王五",
            created_at: "2023-09-10T09:15:00Z"
        },
        {
            user_id: 4,
            student_id: "20210004",
            name: "赵六",
            email: "zhaoliu@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=赵六",
            created_at: "2023-09-15T16:45:00Z"
        },
        {
            user_id: 5,
            student_id: "20210005",
            name: "陈七",
            email: "chenqi@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=陈七",
            created_at: "2023-09-20T11:20:00Z"
        }
    ],
    
    // 模拟帖子数据
    posts: [
        {
            post_id: 1,
            user_id: 2,
            title: "寻找一起学习数据结构的小伙伴",
            content: "有没有同学想一起准备数据结构的期末考试？我们可以组织学习小组，互相督促，共同进步。主要复习树、图、排序算法等内容。时间可以定在周末，地点可以在图书馆或自习室。感兴趣的同学可以留言或私信我！",
            category: "学习交流",
            tags: ["考试", "组队学习", "数据结构"],
            like_count: 15,
            view_count: 120,
            comment_count: 8,
            created_at: "2024-03-10T14:30:00Z",
            updated_at: "2024-03-10T14:30:00Z",
            liked_by: [1, 3, 5] // 用户ID数组，表示哪些用户点赞了
        },
        {
            post_id: 2,
            user_id: 3,
            title: "转让计算机组成原理教材，九成新",
            content: "计算机组成原理教材（第3版），作者：唐朔飞。这本书我只用了一个学期，保存完好，几乎没有笔记。原价68元，现在35元转让。有意者请联系我，可以在食堂或图书馆面交。",
            category: "闲置交易",
            tags: ["教材", "二手", "计算机"],
            like_count: 5,
            view_count: 80,
            comment_count: 3,
            created_at: "2024-03-09T10:15:00Z",
            updated_at: "2024-03-09T10:15:00Z",
            liked_by: [2, 4]
        },
        {
            post_id: 3,
            user_id: 4,
            title: "本周五下午校园篮球赛招募队员",
            content: "本周五下午4点，在学校东区篮球场将举行一场友谊赛，现招募队员。不论水平高低，只要热爱篮球，都可以参加。我们主要是为了锻炼身体，结交朋友。比赛后会一起聚餐。有意向的同学请留言报名！",
            category: "校园活动",
            tags: ["篮球", "运动", "社团"],
            like_count: 12,
            view_count: 95,
            comment_count: 5,
            created_at: "2024-03-11T09:30:00Z",
            updated_at: "2024-03-11T09:30:00Z",
            liked_by: [1, 2, 3]
        },
        {
            post_id: 4,
            user_id: 1,
            title: "关于校园网速度慢的问题",
            content: "最近感觉校园网速度特别慢，尤其是在晚上高峰期，连看视频都卡。不知道大家有没有同样的问题？有没有什么解决方法？或者学校网络中心有没有升级计划？希望学校能重视这个问题。",
            category: "意见建议",
            tags: ["校园网", "网络", "建议"],
            like_count: 8,
            view_count: 150,
            comment_count: 12,
            created_at: "2024-03-08T16:20:00Z",
            updated_at: "2024-03-08T16:20:00Z",
            liked_by: [2, 3, 4, 5]
        },
        {
            post_id: 5,
            user_id: 5,
            title: "高数学习经验分享",
            content: "刚刚结束了高等数学的期末考试，成绩还不错（95分）。想分享一下我的学习经验：1. 课前预习很重要；2. 认真完成课后作业；3. 多做题，特别是历年考题；4. 组建学习小组互相讨论。希望对学弟学妹们有帮助！",
            category: "学习交流",
            tags: ["高数", "学习经验", "考试"],
            like_count: 20,
            view_count: 200,
            comment_count: 15,
            created_at: "2024-03-07T13:45:00Z",
            updated_at: "2024-03-07T13:45:00Z",
            liked_by: [1, 2, 3, 4]
        },
        {
            post_id: 6,
            user_id: 2,
            title: "宿舍楼洗衣机太少，建议增加",
            content: "我们宿舍楼只有两台洗衣机，但整栋楼有200多个学生，经常需要排队。尤其是周末，有时要等一两个小时。建议学校在每个楼层增加1-2台洗衣机，方便大家使用。支持的请点赞！",
            category: "意见建议",
            tags: ["宿舍", "洗衣机", "建议"],
            like_count: 25,
            view_count: 180,
            comment_count: 10,
            created_at: "2024-03-06T11:10:00Z",
            updated_at: "2024-03-06T11:10:00Z",
            liked_by: [1, 3, 4, 5]
        },
        {
            post_id: 7,
            user_id: 3,
            title: "食堂新窗口试吃报告",
            content: "今天去食堂发现新开了一个川菜窗口，试了一下水煮肉片和麻婆豆腐。味道不错，价格也实惠，就是有点辣。喜欢川菜的同学可以去试试。另外，大家有什么推荐的食堂美食吗？",
            category: "校园生活",
            tags: ["食堂", "美食", "川菜"],
            like_count: 7,
            view_count: 90,
            comment_count: 6,
            created_at: "2024-03-05T12:30:00Z",
            updated_at: "2024-03-05T12:30:00Z",
            liked_by: [1, 4]
        },
        {
            post_id: 8,
            user_id: 4,
            title: "求推荐好的英语学习APP",
            content: "准备考四级了，想找一个好用的英语学习APP。主要想练习听力和阅读，最好有真题和模拟题。大家有什么推荐的吗？目前看了几个：百词斩、扇贝、可可英语。哪个更好用？",
            category: "学习交流",
            tags: ["英语", "四级", "APP"],
            like_count: 9,
            view_count: 110,
            comment_count: 7,
            created_at: "2024-03-04T15:40:00Z",
            updated_at: "2024-03-04T15:40:00Z",
            liked_by: [2, 5]
        }
    ],
    
    // 模拟评论数据
    comments: [
        {
            comment_id: 1,
            post_id: 1,
            user_id: 3,
            content: "我也有这个想法，一起学习效率更高",
            parent_id: null,
            like_count: 3,
            created_at: "2024-03-10T15:00:00Z",
            liked_by: [1, 2]
        },
        {
            comment_id: 2,
            post_id: 1,
            user_id: 2,
            content: "我们可以定个时间地点",
            parent_id: 1,
            like_count: 1,
            created_at: "2024-03-10T15:10:00Z",
            liked_by: [3]
        },
        {
            comment_id: 3,
            post_id: 1,
            user_id: 4,
            content: "加我一个，我数据结构比较弱，需要帮助",
            parent_id: null,
            like_count: 2,
            created_at: "2024-03-10T16:20:00Z",
            liked_by: [1]
        },
        {
            comment_id: 4,
            post_id: 2,
            user_id: 1,
            content: "书还在吗？我想买",
            parent_id: null,
            like_count: 0,
            created_at: "2024-03-09T14:30:00Z",
            liked_by: []
        },
        {
            comment_id: 5,
            post_id: 3,
            user_id: 1,
            content: "我报名！虽然技术一般，但热爱篮球",
            parent_id: null,
            like_count: 2,
            created_at: "2024-03-11T10:45:00Z",
            liked_by: [4]
        },
        {
            comment_id: 6,
            post_id: 4,
            user_id: 2,
            content: "同感，晚上网速特别慢，看视频都卡",
            parent_id: null,
            like_count: 5,
            created_at: "2024-03-08T18:30:00Z",
            liked_by: [1, 3, 4, 5]
        },
        {
            comment_id: 7,
            post_id: 5,
            user_id: 2,
            content: "感谢分享！很有帮助",
            parent_id: null,
            like_count: 3,
            created_at: "2024-03-07T15:20:00Z",
            liked_by: [1, 3]
        },
        {
            comment_id: 8,
            post_id: 6,
            user_id: 3,
            content: "支持！我们楼也是这个问题",
            parent_id: null,
            like_count: 4,
            created_at: "2024-03-06T13:45:00Z",
            liked_by: [1, 4, 5]
        }
    ],
    
    // 可用标签
    availableTags: [
        "考试", "教材", "组队学习", "宿舍", "食堂", "运动", "二手", "社团",
        "数据结构", "高数", "英语", "计算机", "篮球", "校园网", "网络", "建议",
        "学习经验", "四级", "APP", "川菜", "美食", "洗衣机"
    ],
    
    // 在线人数（模拟）
    onlineCount: 156,
    
    // 今日发帖数（模拟）
    todayPostCount: 24
};

// 从本地存储加载用户信息
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('campusUser');
    if (savedUser) {
        forumData.currentUser = JSON.parse(savedUser);
    }
}

// 保存用户信息到本地存储
function saveUserToStorage() {
    if (forumData.currentUser) {
        localStorage.setItem('campusUser', JSON.stringify(forumData.currentUser));
    } else {
        localStorage.removeItem('campusUser');
    }
}

// 获取用户信息
function getUserById(userId) {
    return forumData.users.find(user => user.user_id === userId);
}

// 获取帖子作者信息
function getPostAuthor(post) {
    return getUserById(post.user_id);
}

// 获取评论作者信息
function getCommentAuthor(comment) {
    return getUserById(comment.user_id);
}

// 获取帖子的评论
function getPostComments(postId) {
    return forumData.comments.filter(comment => comment.post_id === postId);
}

// 用户是否点赞了某帖子
function isPostLikedByUser(post, userId) {
    return post.liked_by && post.liked_by.includes(userId);
}

// 用户是否点赞了某评论
function isCommentLikedByUser(comment, userId) {
    return comment.liked_by && comment.liked_by.includes(userId);
}

// 获取热帖排行
function getHotPosts(limit = 5) {
    return [...forumData.posts]
        .sort((a, b) => {
            // 综合热度：点赞数 + 评论数 * 2 + 浏览数 * 0.1
            const aHot = a.like_count + (a.comment_count * 2) + (a.view_count * 0.1);
            const bHot = b.like_count + (b.comment_count * 2) + (b.view_count * 0.1);
            return bHot - aHot;
        })
        .slice(0, limit);
}

// 格式化时间
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
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 初始化数据
loadUserFromStorage();