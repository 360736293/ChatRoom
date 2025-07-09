// src/main/resources/static/js/main.js

import {NotificationManager} from './components/NotificationManager.js';
import {UsernameModal} from './components/UsernameModal.js';
import {MessageDisplay} from './components/MessageDisplay.js';
import {UserList} from './components/UserList.js';
import {TypingIndicator} from './components/TypingIndicator.js';
import {EmojiPicker} from './components/EmojiPicker.js';
import {ImageHandler} from './components/ImageHandler.js';
import {ChatWebSocket} from './core/ChatWebSocket.js';
import {ConnectionHandler} from './handlers/connectionHandler.js';
import {ChannelHandler} from './handlers/channelHandler.js';
import {MessageHandler} from './handlers/messageHandler.js';

class ChatApplication {
    constructor() {
        this.components = {};
        this.handlers = {};
        this.chatWebSocket = null;
        this.userId = null;
    }

    async init() {
        try {
            // 获取用户ID
            this.userId = await this.getUserId();

            // 初始化组件
            this.initComponents();

            // 初始化WebSocket
            this.initWebSocket();

            // 初始化处理器
            this.initHandlers();

            // 启动WebSocket连接
            await this.chatWebSocket.init(this.userId);

            console.log('聊天应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
        }
    }

    async getUserId() {
        // 从缓存获取用户名
        let userId = localStorage.getItem('discord_username');

        if (!userId) {
            const usernameModal = new UsernameModal();
            userId = await usernameModal.show();

            // 如果用户取消输入，使用默认用户名
            if (!userId) {
                userId = 'Guest_' + Math.random().toString(36).substr(2, 6);
            }

            // 保存到缓存
            localStorage.setItem('discord_username', userId);
        }

        return userId;
    }

    initComponents() {
        // 通知管理器
        this.components.notificationManager = new NotificationManager();

        // 消息显示组件
        this.components.messageDisplay = new MessageDisplay('messagesContainer', this.userId);

        // 用户列表组件
        this.components.userList = new UserList('.user-sidebar', this.userId);

        // 输入指示器组件
        this.components.typingIndicator = new TypingIndicator(
            'typingIndicator',
            'typingText',
            'messagesContainer'
        );

        // 表情选择器组件
        this.components.emojiPicker = new EmojiPicker(
            'emojiButton',
            'emojiPicker',
            'emojiGrid',
            'messageInput'
        );
    }

    initWebSocket() {
        this.chatWebSocket = new ChatWebSocket(
            this.components.messageDisplay,
            this.components.userList,
            this.components.typingIndicator,
            this.components.notificationManager
        );
    }

    initHandlers() {
        // 连接状态处理器
        this.handlers.connectionHandler = new ConnectionHandler();

        // 设置连接状态回调
        this.chatWebSocket.onConnectionStatusChange = (connected) => {
            this.handlers.connectionHandler.updateStatus(connected);
        };

        // 频道处理器
        this.handlers.channelHandler = new ChannelHandler(this.chatWebSocket);

        let imageHandler = new ImageHandler(this.chatWebSocket);
        this.components.messageDisplay.setImageHandler(imageHandler);

        // 消息处理器
        this.handlers.messageHandler = new MessageHandler(this.chatWebSocket, 'messageInput', imageHandler);
    }

    // 全局API方法
    sendMessage() {
        this.handlers.messageHandler.sendMessage();
    }

    changeChannel(channelName) {
        this.handlers.channelHandler.setActiveChannelByName(channelName);
    }

    logout() {
        localStorage.removeItem('discord_username');
        if (this.chatWebSocket) {
            this.chatWebSocket.disconnect();
        }
        location.reload();
    }
}

// 创建全局实例
const chatApp = new ChatApplication();

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    chatApp.init();
});

// 导出全局方法供HTML使用
window.sendMessage = () => chatApp.sendMessage();
window.changeChannel = (channel) => chatApp.changeChannel(channel);
window.logout = () => chatApp.logout();