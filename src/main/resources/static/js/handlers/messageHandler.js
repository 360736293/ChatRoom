// src/main/resources/static/js/handlers/messageHandler.js

import {addEventListener, getElementById} from '../utils/domUtils.js';
import {MentionAutocomplete} from '../components/MentionAutocomplete.js';

export class MessageHandler {
    constructor(chatWebSocket, messageInputId, imageHandler) {
        this.chatWebSocket = chatWebSocket;
        this.messageInput = getElementById(messageInputId);
        this.imageHandler = imageHandler;
        this.mentionAutocomplete = new MentionAutocomplete(messageInputId);
        this.quotedMessage = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 输入事件
        addEventListener(this.messageInput, 'input', () => {
            this.handleInput();
        });

        // 回车发送
        addEventListener(this.messageInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // 失去焦点
        addEventListener(this.messageInput, 'blur', () => {
            if (this.chatWebSocket) {
                this.chatWebSocket.sendTypingStop();
            }
        });

        // 发送按钮
        const sendButton = getElementById('sendButton');
        addEventListener(sendButton, 'click', () => {
            this.sendMessage();
        });
    }

    handleInput() {
        const hasContent = this.messageInput.value.trim().length > 0;

        if (this.chatWebSocket && hasContent) {
            this.chatWebSocket.sendTypingStart();
        } else if (this.chatWebSocket) {
            this.chatWebSocket.sendTypingStop();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        const hasImage = this.imageHandler && this.imageHandler.hasImage();

        if (message === '' && !hasImage) {
            return;
        }

        if (this.chatWebSocket && this.chatWebSocket.isConnected()) {
            if (hasImage) {
                // 发送图片消息
                await this.imageHandler.sendImage(message);
                this.clearInput();
            } else if (message !== '') {
                // 发送文本消息（支持引用回复）
                this.chatWebSocket.sendChatMessage(message, this.quotedMessage);
                this.clearInput();
            }
        } else {
            console.error('WebSocket未连接，无法发送消息');
        }
    }

    // 设置引用消息
    setQuotedMessage(message) {
        this.quotedMessage = message;
        // 清空输入框，让用户输入回复内容
        this.messageInput.value = '';
        this.messageInput.focus();
        
        // 显示引用提示
        this.showQuoteNotification(message);
    }

    // 显示引用提示
    showQuoteNotification(message) {
        // 移除已存在的提示
        const existingNotification = document.querySelector('.quote-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'quote-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(88, 101, 242, 0.9)';
        notification.style.color = 'white';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        notification.innerHTML = `已引用 <strong>${message.author}</strong> 的消息`;

        document.body.appendChild(notification);

        // 3秒后自动移除提示
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    clearInput() {
        this.messageInput.value = '';
        this.quotedMessage = null;
        this.messageInput.focus();
    }

    setPlaceholder(channelName) {
        this.messageInput.placeholder = `给 #${channelName} 发消息`;
    }

    isInputFocused() {
        return document.activeElement === this.messageInput;
    }

    focusInput() {
        this.messageInput.focus();
    }

    setImageHandler(imageHandler) {
        this.imageHandler = imageHandler;
    }

    // 更新用户列表
    updateUserList(users) {
        this.mentionAutocomplete.setUserList(users);
    }

    // 设置当前用户ID
    setCurrentUserId(userId) {
        this.mentionAutocomplete.setCurrentUserId(userId);
    }
}