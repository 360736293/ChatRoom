// src/main/resources/static/js/components/MessageDisplay.js

import {createElement, getElementById, scrollToBottom} from '../utils/domUtils.js';
import {MESSAGE_TYPES} from '../utils/constants.js';
import {messageFormatter} from '../utils/messageFormatter.js';

export class MessageDisplay {
    constructor(containerId, currentUserId) {
        this.container = getElementById(containerId);
        this.currentUserId = currentUserId;
        this.imageHandler = null;
        this.onMentionMessageDisplayed = null;
        this.onQuoteReply = null;
        this.userList = [];
    }

    setUserList(users) {
        this.userList = users || [];
    }

    setImageHandler(imageHandler) {
        this.imageHandler = imageHandler;
    }

    displayMessage(data) {
        // 调试：查看消息数据结构
        console.log('Displaying message:', data);
        
        const messageElement = this.createMessageElement(data);
        this.container.appendChild(messageElement);
        scrollToBottom(this.container);
        
        if (data.mentions && data.mentions.includes(this.currentUserId) && this.onMentionMessageDisplayed) {
            this.onMentionMessageDisplayed(data.messageId);
        }
    }

    createMessageElement(data) {
        const timeString = messageFormatter.formatTimestamp(data.timestamp);
        const messageElement = createElement('div', 'message');
        
        // 确保消息元素有messageId
        if (data.messageId) {
            messageElement.setAttribute('data-message-id', data.messageId);
        }

        if (data.type === MESSAGE_TYPES.SYSTEM) {
            messageElement.innerHTML = this.createSystemMessage(data, timeString);
        } else {
            messageElement.innerHTML = this.createChatMessage(data, timeString);
            // 添加右键菜单事件
            this.addContextMenu(messageElement, data);
        }

        return messageElement;
    }

    // 添加右键菜单
    addContextMenu(messageElement, messageData) {
        messageElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, messageData);
        });
    }

    // 显示右键菜单
    showContextMenu(event, messageData) {
        // 移除已存在的菜单
        const existingMenu = document.querySelector('.message-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // 创建菜单
        const menu = document.createElement('div');
        menu.className = 'message-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        menu.style.backgroundColor = '#2f3136';
        menu.style.border = '1px solid #202225';
        menu.style.borderRadius = '4px';
        menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '150px';

        // 添加引用回复选项
        const replyOption = document.createElement('div');
        replyOption.className = 'context-menu-item';
        replyOption.style.padding = '8px 12px';
        replyOption.style.cursor = 'pointer';
        replyOption.style.color = '#dcddde';
        replyOption.innerHTML = '引用回复';
        
        replyOption.addEventListener('click', () => {
            this.handleQuoteReply(messageData);
            menu.remove();
        });

        menu.appendChild(replyOption);
        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 0);
    }

    // 处理引用回复
    handleQuoteReply(messageData) {
        if (this.onQuoteReply) {
            this.onQuoteReply(messageData);
        }
    }

    // 创建引用回复UI
    createQuoteReplyElement(quotedMessage) {
        let quotedContent = quotedMessage.content;
        try {
            const parsed = JSON.parse(quotedContent);
            if (parsed.type === 'image' && parsed.data) {
                quotedContent = '[图片]';
                if (parsed.text) {
                    quotedContent += ' ' + parsed.text;
                }
            }
        } catch (e) {
            // 不是JSON，继续使用原文
        }

        // 截断过长的内容
        if (quotedContent.length > 100) {
            quotedContent = quotedContent.substring(0, 97) + '...';
        }

        const messageId = quotedMessage.messageId || 'unknown';

        return `
            <div class="quote-reply" data-quoted-message-id="${messageId}" style="cursor: pointer;" onclick="window.scrollToMessage('${messageId}')">
                <div class="quote-reply-header">
                    <span class="quote-reply-author">${quotedMessage.author}</span>
                </div>
                <div class="quote-reply-content">${messageFormatter.formatMessage(quotedContent, {
                    currentUserId: this.currentUserId,
                    userList: this.userList,
                    enableEmojis: true,
                    enableLinks: true,
                    enableMentions: true,
                    enableLineBreaks: true
                })}</div>
            </div>
        `;
    }

    createSystemMessage(data, timeString) {
        return `
            <div class="message-avatar" style="background: #faa61a;">S</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author" style="color: #faa61a;">系统</span>
                    <span class="message-timestamp">${timeString}</span>
                </div>
                <div class="message-text" style="color: #faa61a; font-style: italic;">${data.content}</div>
            </div>
        `;
    }

    createChatMessage(data, timeString) {
        const isCurrentUser = data.userId === this.currentUserId;
        const authorStyle = isCurrentUser ? 'style="color: #00d4aa;"' : '';

        // 检查是否是图片消息
        let messageContent = data.content;
        let quoteReplyHtml = '';
        
        try {
            const parsed = JSON.parse(data.content);
            if (parsed.type === 'image' && parsed.data) {
                messageContent = this.createImageMessage(parsed);
                //图片消息因为提前做过格式化处理直接返回
                return `
                    <div class="message-avatar">${data.avatar}</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author" ${authorStyle}>${data.author}</span>
                            <span class="message-timestamp">${timeString}</span>
                        </div>
                        <div class="message-text">${messageContent}</div>
                    </div>
                `;
            } else if (parsed.type === 'quote_reply' && parsed.quoted) {
                // 处理引用回复消息
                quoteReplyHtml = this.createQuoteReplyElement({
                    author: parsed.quoted.author,
                    content: parsed.quoted.content,
                    messageId: parsed.quoted.messageId
                });
                messageContent = parsed.content;
            }
        } catch (e) {
            // 不是 JSON，继续作为普通消息处理
        }

        return `
            <div class="message-avatar">${data.avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author" ${authorStyle}>${data.author}</span>
                    <span class="message-timestamp">${timeString}</span>
                </div>
                <div class="message-text">
                    ${quoteReplyHtml}
                    ${typeof messageContent === 'string' ?
            messageFormatter.formatMessage(messageContent, {
                currentUserId: this.currentUserId,
                userList: this.userList,
                enableEmojis: true,
                enableLinks: true,
                enableMentions: true,
                enableCodeBlocks: true,
                enableLineBreaks: true
            }) : messageContent}
                </div>
            </div>
        `;
    }

    createImageMessage(imageData) {
        let html = '';

        // 如果有文字说明，先显示文字
        if (imageData.text) {
            html += `<div>${messageFormatter.formatMessage(imageData.text, {
                currentUserId: this.currentUserId,
                userList: this.userList,
                enableEmojis: true,
                enableLinks: true,
                enableMentions: true,
                enableLineBreaks: true
            })}</div>`;
        }

        // 生成唯一ID
        const imageId = 'img-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        // 显示图片
        html += `<img class="message-image" 
                     id="${imageId}"
                     src="${imageData.data}" 
                     alt="${imageData.fileName || '图片'}"
                     data-full-image="${imageData.data}"
                     style="cursor: pointer;">`;

        // 延迟绑定点击事件
        setTimeout(() => {
            const imgElement = document.getElementById(imageId);
            if (imgElement) {
                imgElement.addEventListener('click', () => {
                    this.imageHandler.showFullImage(imageData.data);
                });
                imgElement.addEventListener('error', () => {
                    imgElement.style.display = 'none';
                    imgElement.insertAdjacentHTML('afterend', '<div style="color: #ed4245;">图片加载失败</div>');
                });
            }
        }, 100);

        return html;
    }

    clear() {
        this.container.innerHTML = '';
    }

    showError(message) {
        const errorElement = this.createErrorMessage(message);
        this.container.appendChild(errorElement);
        scrollToBottom(this.container);
    }

    createErrorMessage(message) {
        const messageElement = createElement('div', 'message');
        messageElement.innerHTML = `
            <div class="message-avatar" style="background: #ed4245;">!</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author" style="color: #ed4245;">系统</span>
                    <span class="message-timestamp">现在</span>
                </div>
                <div class="message-text" style="color: #ed4245;">${message}</div>
            </div>
        `;
        return messageElement;
    }

    updateCurrentUserId(userId) {
        this.currentUserId = userId;
    }

    scrollToMessage(messageId, highlight = true) {
        console.log('Scrolling to message:', messageId);
        const messageElement = this.container.querySelector(`[data-message-id="${messageId}"]`);
        console.log('Found message element:', messageElement);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (highlight) {
                messageElement.classList.add('mention-highlight');
                setTimeout(() => {
                    messageElement.classList.remove('mention-highlight');
                }, 3000);
            }
            return true;
        }
        console.log('Message element not found for id:', messageId);
        return false;
    }
}