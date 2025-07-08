// src/main/resources/static/js/handlers/messageHandler.js

import { getElementById, addEventListener } from '../utils/domUtils.js';

export class MessageHandler {
    constructor(chatWebSocket, messageInputId) {
        this.chatWebSocket = chatWebSocket;
        this.messageInput = getElementById(messageInputId);
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
        const sendButton = document.querySelector('.send-button');
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

    sendMessage() {
        const message = this.messageInput.value.trim();

        if (message === '') {
            return;
        }

        if (this.chatWebSocket && this.chatWebSocket.isConnected()) {
            this.chatWebSocket.sendChatMessage(message);
            this.clearInput();
        } else {
            console.error('WebSocket未连接，无法发送消息');
        }
    }

    clearInput() {
        this.messageInput.value = '';
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
}