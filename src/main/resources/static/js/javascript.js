//用户名输入弹窗管理
class UsernameModal {
    constructor() {
        this.modal = null;
        this.resolve = null;
    }

    show() {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.createModal();
        });
    }

    createModal() {
        //创建遮罩层
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';

        this.modal.innerHTML = `
                        <div class="modal">
                            <div class="modal-title">欢迎来到 DisDiscord</div>
                            <div class="modal-description">请输入您的用户名以开始聊天</div>
                            <input type="text" class="modal-input" placeholder="输入用户名..." id="usernameInput" maxlength="20">
                            <div class="modal-buttons">
                                <button class="modal-button modal-button-secondary" onclick="usernameModal.cancel()">取消</button>
                                <button class="modal-button modal-button-primary" onclick="usernameModal.confirm()" id="confirmButton" disabled>确认</button>
                            </div>
                        </div>
                    `;

        document.body.appendChild(this.modal);

        //获取输入框和确认按钮
        const input = document.getElementById('usernameInput');
        const confirmButton = document.getElementById('confirmButton');

        //监听输入变化
        input.addEventListener('input', () => {
            const value = input.value.trim();
            confirmButton.disabled = value.length === 0;

            if (value.length > 0) {
                confirmButton.classList.remove('modal-button-primary:disabled');
            }
        });

        //回车确认
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.confirm();
            }
        });

        //自动聚焦输入框
        setTimeout(() => input.focus(), 100);

        //阻止点击遮罩层关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                e.preventDefault();
            }
        });
    }

    confirm() {
        const input = document.getElementById('usernameInput');
        const username = input.value.trim();

        if (username) {
            this.close();
            this.resolve(username);
        }
    }

    cancel() {
        this.close();
        this.resolve(null);
    }

    close() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }
}

//全局用户名弹窗实例
const usernameModal = new UsernameModal();

//WebSocket连接管理
class ChatWebSocket {
    constructor() {
        this.ws = null;
        this.userId = null;
        this.currentChannel = '频道1';
        this.reconnectInterval = 3000;
        this.maxReconnectAttempts = 5;
        this.reconnectAttempts = 0;

        //输入状态管理
        this.typingTimeout = null;
        this.typingUsers = new Set();
        this.isTyping = false;
        this.typingDelay = 2000; //2秒后停止输入状态

        this.init();
    }

    async getUserId() {
        //从缓存获取用户名
        let userId = localStorage.getItem('discord_username');
        //如果用户名为空，弹出输入框
        if (!userId) {
            userId = await usernameModal.show();
            //如果用户取消输入，使用默认用户名
            if (!userId) {
                userId = 'Guest_' + Math.random().toString(36).substr(2, 6);
            }
            //保存到缓存
            localStorage.setItem('discord_username', userId);
        }
        return userId;
    }

    async init() {
        //等待获取用户ID
        this.userId = await this.getUserId();
        this.connect();
    }

    connect() {
        try {
            //连接到WebSocket服务器
            this.ws = new WebSocket(`ws://localhost/websocket/${this.userId}`);
            this.ws.onopen = (event) => {
                console.log('WebSocket连接已建立');
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('解析消息失败:', error);
                }
            };
            this.ws.onclose = (event) => {
                console.log('WebSocket连接已关闭');
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            };
            this.ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.attemptReconnect();
        }
    }
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('WebSocket重连失败，已达到最大重试次数');
            this.showConnectionError();
        }
    }
    sendMessage(type, content, channel = null) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: type,
                content: content,
                channel: channel || this.currentChannel,
                timestamp: new Date().toLocaleString()
            };
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket未连接');
            this.showConnectionError();
        }
    }
    //发送正在输入通知
    sendTypingStart() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendMessage('typing_start', '', this.currentChannel);
        }
        //清除之前的定时器
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        //设置新的定时器，2秒后自动停止输入状态
        this.typingTimeout = setTimeout(() => {
            this.sendTypingStop();
        }, this.typingDelay);
    }
    //发送停止输入通知
    sendTypingStop() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendMessage('typing_stop', '', this.currentChannel);
        }
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }
    handleMessage(data) {
        switch (data.type) {
            case 'chat':
            case 'system':
                this.displayMessage(data);
                break;
            case 'user_list':
                this.updateUserList(data.users);
                break;
            case 'typing_start':
                this.handleTypingStart(data);
                break;
            case 'typing_stop':
                this.handleTypingStop(data);
                break;
            default:
                console.log('未知消息类型:', data);
        }
    }
    //处理用户开始输入
    handleTypingStart(data) {
        //不显示自己的输入状态
        if (data.userId === this.userId) return;
        //只处理当前频道的输入状态
        if (data.channel !== this.currentChannel) return;
        this.typingUsers.add(data.userId);
        this.updateTypingIndicator();
    }
    //处理用户停止输入
    handleTypingStop(data) {
        //不处理自己的输入状态
        if (data.userId === this.userId) return;
        this.typingUsers.delete(data.userId);
        this.updateTypingIndicator();
    }
    //更新正在输入指示器
    updateTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        const typingText = document.getElementById('typingText');

        if (this.typingUsers.size === 0) {
            indicator.style.display = 'none';
            return;
        }
        const users = Array.from(this.typingUsers);
        let text = '';
        if (users.length === 1) {
            text = `${users[0]} 正在输入...`;
        } else {
            text = `${users.join('、')} 正在输入...`;
        }
        typingText.textContent = text;
        indicator.style.display = 'block';
        //滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    displayMessage(data) {
        const now = new Date(data.timestamp);
        const timeString = `今天 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        if (data.type === 'system') {
            messageElement.innerHTML = `
                        <div class="message-avatar" style="background: #faa61a;">S</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-author" style="color: #faa61a;">系统</span>
                                <span class="message-timestamp">${timeString}</span>
                            </div>
                            <div class="message-text" style="color: #faa61a; font-style: italic;">${data.content}</div>
                        </div>
                    `;
        } else {
            const isCurrentUser = data.userId === this.userId;
            messageElement.innerHTML = `
                        <div class="message-avatar">${data.avatar}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-author" ${isCurrentUser ? 'style="color: #00d4aa;"' : ''}>${data.author}</span>
                                <span class="message-timestamp">${timeString}</span>
                            </div>
                            <div class="message-text">${data.content}</div>
                        </div>
                    `;
        }
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    updateUserList(users) {
        const userSidebar = document.querySelector('.user-sidebar');
        //分类用户
        const onlineUsers = users.filter(user => user.status === 'online');
        const idleUsers = users.filter(user => user.status === 'idle');
        const dndUsers = users.filter(user => user.status === 'dnd');
        const offlineUsers = users.filter(user => user.status === 'offline');
        userSidebar.innerHTML = `
                    <div class="user-category">在线 — ${onlineUsers.length}</div>
                    ${onlineUsers.map(user => this.createUserElement(user)).join('')}
                    ${idleUsers.length > 0 ? `<div class="user-category">空闲 — ${idleUsers.length}</div>` : ''}
                    ${idleUsers.map(user => this.createUserElement(user)).join('')}
                    ${dndUsers.length > 0 ? `<div class="user-category">勿扰 — ${dndUsers.length}</div>` : ''}
                    ${dndUsers.map(user => this.createUserElement(user)).join('')}
                    ${offlineUsers.length > 0 ? `<div class="user-category">离线 — ${offlineUsers.length}</div>` : ''}
                    ${offlineUsers.map(user => this.createUserElement(user)).join('')}
                `;
    }
    createUserElement(user) {
        const isCurrentUser = user.userId === this.userId;
        return `
                    <div class="user-item" ${isCurrentUser ? 'style="background-color: rgba(88, 101, 242, 0.1);"' : ''}>
                        <div class="user-avatar">
                            ${user.avatar}
                            <div class="user-status status-${user.status}"></div>
                        </div>
                        <div class="user-name" ${isCurrentUser ? 'style="color: #00d4aa;"' : ''}>${user.username}${isCurrentUser ? ' (你)' : ''}</div>
                    </div>
                `;
    }
    joinChannel(channel) {
        this.currentChannel = channel;
        this.sendMessage('join_channel', '', channel);
        //清空当前消息和输入状态
        messagesContainer.innerHTML = '';
        this.typingUsers.clear();
        this.updateTypingIndicator();
        //如果当前正在输入，停止输入状态
        if (this.isTyping) {
            this.sendTypingStop();
        }
    }
    updateConnectionStatus(connected) {
        const header = document.querySelector('.chat-header h3');
        if (connected) {
            header.style.color = '#ffffff';
            if (header.textContent.includes('(连接断开)')) {
                header.textContent = header.textContent.replace(' (连接断开)', '');
            }
        } else {
            header.style.color = '#ed4245';
            if (!header.textContent.includes('(连接断开)')) {
                header.textContent = header.textContent + ' (连接断开)';
            }
        }

        //更新连接指示器
        updateConnectionIndicator(connected);
    }
    showConnectionError() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
                    <div class="message-avatar" style="background: #ed4245;">!</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author" style="color: #ed4245;">系统</span>
                            <span class="message-timestamp">现在</span>
                        </div>
                        <div class="message-text" style="color: #ed4245;">连接服务器失败，请检查网络或刷新页面重试</div>
                    </div>
                `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

//全局变量
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
let chatWS;

//初始化WebSocket连接
window.addEventListener('load', function () {
    chatWS = new ChatWebSocket();
});

//发送消息函数
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;

    if (chatWS && chatWS.ws && chatWS.ws.readyState === WebSocket.OPEN) {
        //发送消息前停止输入状态
        chatWS.sendTypingStop();
        chatWS.sendMessage('chat', message);
        messageInput.value = '';
    } else {
        console.error('WebSocket未连接，无法发送消息');
        chatWS.showConnectionError();
    }
}

//输入框事件处理
messageInput.addEventListener('input', function () {
    if (chatWS && this.value.trim().length > 0) {
        chatWS.sendTypingStart();
    } else if (chatWS) {
        chatWS.sendTypingStop();
    }
});

//输入框失去焦点时停止输入状态
messageInput.addEventListener('blur', function () {
    if (chatWS) {
        chatWS.sendTypingStop();
    }
});

//回车发送消息
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

//频道切换功能
document.querySelectorAll('.channel-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.channel-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const channelName = this.textContent.trim();
        document.querySelector('.chat-header h3').textContent = channelName;
        document.querySelector('.message-input').placeholder = `在 # ${channelName} 中发送消息`;

        //通知WebSocket切换频道
        if (chatWS) {
            chatWS.joinChannel(channelName);
        }
    });
});

//连接状态指示器
function addConnectionIndicator() {
    const header = document.querySelector('.chat-header');
    const indicator = document.createElement('div');
    indicator.id = 'connection-indicator';
    indicator.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #ed4245;
                margin-left: auto;
                margin-right: 16px;
                transition: background-color 0.3s ease;
            `;
    header.appendChild(indicator);
}

//更新连接状态指示器
function updateConnectionIndicator(connected) {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
        indicator.style.backgroundColor = connected ? '#3ba55c' : '#ed4245';
        indicator.title = connected ? '已连接' : '连接断开';
    }
}

//页面加载完成后添加连接指示器
document.addEventListener('DOMContentLoaded', function () {
    addConnectionIndicator();
});
