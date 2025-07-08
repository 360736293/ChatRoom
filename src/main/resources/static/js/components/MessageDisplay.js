// src/main/resources/static/js/components/MessageDisplay.js

import {createElement, getElementById, scrollToBottom} from '../utils/domUtils.js';
import {MESSAGE_TYPES} from '../utils/constants.js';
import {messageFormatter} from '../utils/messageFormatter.js';

export class MessageDisplay {
    constructor(containerId, currentUserId) {
        this.container = getElementById(containerId);
        this.currentUserId = currentUserId;
    }

    displayMessage(data) {
        const messageElement = this.createMessageElement(data);
        this.container.appendChild(messageElement);
        scrollToBottom(this.container);
    }

    createMessageElement(data) {
        const timeString = messageFormatter.formatTimestamp(data.timestamp);
        const messageElement = createElement('div', 'message');

        if (data.type === MESSAGE_TYPES.SYSTEM) {
            messageElement.innerHTML = this.createSystemMessage(data, timeString);
        } else {
            messageElement.innerHTML = this.createChatMessage(data, timeString);
        }

        return messageElement;
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
                <div class="message-text">${typeof messageContent === 'string' ?
            messageFormatter.formatMessage(messageContent, {
                currentUserId: this.currentUserId,
                enableEmojis: true,
                enableLinks: true,
                enableMentions: true,
                enableCodeBlocks: true,
                enableLineBreaks: true
            }) : messageContent}</div>
            </div>
        `;
    }

    createImageMessage(imageData) {
        let html = '';

        // 如果有文字说明，先显示文字
        if (imageData.text) {
            html += `<div>${messageFormatter.formatMessage(imageData.text, {
                currentUserId: this.currentUserId,
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
                    window.showFullImage(imageData.data);
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
}