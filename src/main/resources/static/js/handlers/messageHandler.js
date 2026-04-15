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
        this.createQuoteUI();
    }

    // 创建引用UI
    createQuoteUI() {
        // 检查是否已存在引用UI容器
        let quoteContainer = document.getElementById('quote-container');
        if (!quoteContainer) {
            quoteContainer = document.createElement('div');
            quoteContainer.id = 'quote-container';
            quoteContainer.className = 'quote-container';
            quoteContainer.style.display = 'none';
            
            // 添加到输入框上方
            const inputContainer = this.messageInput.parentElement;
            inputContainer.insertBefore(quoteContainer, this.messageInput);
        }
        this.quoteContainer = quoteContainer;
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
        
        // 显示引用UI
        this.showQuoteUI(message);
    }

    // 显示引用UI
    showQuoteUI(message) {
        if (!this.quoteContainer) {
            this.createQuoteUI();
        }
        
        let quotedContent = message.content;
        try {
            const parsed = JSON.parse(quotedContent);
            if (parsed.type === 'image' && parsed.data) {
                quotedContent = '[图片]';
                if (parsed.text) {
                    quotedContent += ' ' + parsed.text;
                }
            } else if (parsed.type === 'quote_reply' && parsed.quoted) {
                // 处理引用回复，显示直接引用的内容
                let content = parsed.content;
                try {
                    const contentParsed = JSON.parse(content);
                    if (contentParsed.type === 'image' && contentParsed.data) {
                        content = '[图片]';
                        if (contentParsed.text) {
                            content += ' ' + contentParsed.text;
                        }
                    }
                } catch (e) {
                    // 不是JSON，继续使用原文
                }
                quotedContent = content;
            }
        } catch (e) {
            // 不是JSON，继续使用原文
        }
        
        // 截断过长的内容
        if (quotedContent.length > 100) {
            quotedContent = quotedContent.substring(0, 97) + '...';
        }
        
        // 更新引用UI
        this.quoteContainer.innerHTML = `
            <div class="quote-display">
                <div class="quote-info">
                    <span class="quote-author">${message.author}</span>
                    <button class="quote-clear" onclick="window.clearQuote()">×</button>
                </div>
                <div class="quote-content">${quotedContent}</div>
            </div>
        `;
        
        // 显示引用容器
        this.quoteContainer.style.display = 'block';
    }

    // 清除引用
    clearQuote() {
        this.quotedMessage = null;
        if (this.quoteContainer) {
            this.quoteContainer.style.display = 'none';
            this.quoteContainer.innerHTML = '';
        }
        this.messageInput.focus();
    }

    clearInput() {
        this.messageInput.value = '';
        this.quotedMessage = null;
        if (this.quoteContainer) {
            this.quoteContainer.style.display = 'none';
            this.quoteContainer.innerHTML = '';
        }
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