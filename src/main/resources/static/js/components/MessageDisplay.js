// src/main/resources/static/js/components/MessageDisplay.js

import { createElement, getElementById, scrollToBottom } from '../utils/domUtils.js';
import { MESSAGE_TYPES } from '../utils/constants.js';
import { messageFormatter } from '../utils/messageFormatter.js';

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

        return `
            <div class="message-avatar">${data.avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author" ${authorStyle}>${data.author}</span>
                    <span class="message-timestamp">${timeString}</span>
                </div>
                <div class="message-text">${messageFormatter.formatMessage(data.content, {
            currentUserId: this.currentUserId,
            enableEmojis: true,
            enableLinks: true,
            enableMentions: true,
            enableCodeBlocks: true,
            enableLineBreaks: true
        })}</div>
            </div>
        `;
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