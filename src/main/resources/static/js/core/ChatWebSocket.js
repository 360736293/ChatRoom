// src/main/resources/static/js/core/ChatWebSocket.js

import { WebSocketManager } from './WebSocketManager.js';
import { WEBSOCKET_CONFIG, MESSAGE_TYPES, DEFAULT_CHANNEL } from '../utils/constants.js';

export class ChatWebSocket extends WebSocketManager {
    constructor(messageDisplay, userList, typingIndicator, notificationManager) {
        super(null); // URL will be set later
        this.userId = null;
        this.currentChannel = DEFAULT_CHANNEL;

        // 组件引用
        this.messageDisplay = messageDisplay;
        this.userList = userList;
        this.typingIndicator = typingIndicator;
        this.notificationManager = notificationManager;

        // 输入状态管理
        this.typingTimeout = null;
        this.isTyping = false;

        // 设置WebSocket配置
        this.setReconnectConfig(
            WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
            WEBSOCKET_CONFIG.RECONNECT_INTERVAL
        );

        // 设置事件处理器
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // 设置WebSocketManager的事件处理器
        this.onOpen = (event) => {
            console.log('聊天WebSocket连接已建立');
            this.updateConnectionStatus(true);
        };

        this.onMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.processMessage(data);
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        };

        this.onClose = (event) => {
            console.log('聊天WebSocket连接已关闭');
            this.updateConnectionStatus(false);
        };

        this.onError = (error) => {
            console.error('聊天WebSocket错误:', error);
        };

        this.onReconnectFailed = () => {
            this.messageDisplay.showError('连接服务器失败，请检查网络或刷新页面重试');
        };
    }

    async init(userId) {
        this.userId = userId;
        this.url = `ws://localhost/websocket/${this.userId}`;
        await this.connect();
    }

    processMessage(data) {
        switch (data.type) {
            case MESSAGE_TYPES.CHAT:
            case MESSAGE_TYPES.SYSTEM:
                this.notificationManager.showNotification();
                this.messageDisplay.displayMessage(data);
                break;

            case MESSAGE_TYPES.USER_LIST:
                this.userList.updateList(data.users);
                break;

            case MESSAGE_TYPES.TYPING_START:
                if (data.userId !== this.userId && data.channel === this.currentChannel) {
                    this.typingIndicator.addUser(data.author || data.userId);
                }
                break;

            case MESSAGE_TYPES.TYPING_STOP:
                if (data.userId !== this.userId) {
                    this.typingIndicator.removeUser(data.author || data.userId);
                }
                break;

            default:
                console.log('未知消息类型:', data);
        }
    }

    sendMessage(type, content, channel = null) {
        const message = {
            type: type,
            content: content,
            channel: channel || this.currentChannel,
            timestamp: this.formatDateForBackend(new Date())
        };

        if (!this.send(message)) {
            console.error('WebSocket未连接');
            this.messageDisplay.showError('连接已断开，无法发送消息');
        }
    }

    formatDateForBackend(date = new Date()) {
        // 获取东八区时间（UTC+8）
        const utcTime = date.getTime();
        const chinaOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
        const chinaTime = new Date(utcTime + chinaOffset);

        // 格式化为 yyyy-MM-dd HH:mm:ss
        const year = chinaTime.getUTCFullYear();
        const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(chinaTime.getUTCDate()).padStart(2, '0');
        const hours = String(chinaTime.getUTCHours()).padStart(2, '0');
        const minutes = String(chinaTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(chinaTime.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    sendChatMessage(content) {
        this.sendTypingStop();
        this.sendMessage(MESSAGE_TYPES.CHAT, content);
    }

    sendTypingStart() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendMessage(MESSAGE_TYPES.TYPING_START, '', this.currentChannel);
        }

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.sendTypingStop();
        }, WEBSOCKET_CONFIG.TYPING_DELAY);
    }

    sendTypingStop() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendMessage(MESSAGE_TYPES.TYPING_STOP, '', this.currentChannel);
        }

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }

    joinChannel(channel) {
        this.currentChannel = channel;
        this.sendMessage(MESSAGE_TYPES.JOIN_CHANNEL, '', channel);

        // 清空消息和输入状态
        this.messageDisplay.clear();
        this.typingIndicator.clear();

        // 如果当前正在输入，停止输入状态
        if (this.isTyping) {
            this.sendTypingStop();
        }
    }

    updateConnectionStatus(connected) {
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange(connected);
        }
    }

    // 添加额外的事件回调
    onConnectionStatusChange = null;
}