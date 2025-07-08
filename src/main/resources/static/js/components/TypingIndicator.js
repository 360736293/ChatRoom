// src/main/resources/static/js/components/TypingIndicator.js

import { getElementById, showElement, hideElement, scrollToBottom } from '../utils/domUtils.js';

export class TypingIndicator {
    constructor(indicatorId, textId, messagesContainerId) {
        this.indicator = getElementById(indicatorId);
        this.typingText = getElementById(textId);
        this.messagesContainer = getElementById(messagesContainerId);
        this.typingUsers = new Set();
    }

    addUser(userId) {
        this.typingUsers.add(userId);
        this.update();
    }

    removeUser(userId) {
        this.typingUsers.delete(userId);
        this.update();
    }

    clear() {
        this.typingUsers.clear();
        this.update();
    }

    update() {
        if (this.typingUsers.size === 0) {
            hideElement(this.indicator);
            return;
        }

        const users = Array.from(this.typingUsers);
        let text = '';

        if (users.length === 1) {
            text = `${users[0]} 正在输入...`;
        } else if (users.length === 2) {
            text = `${users[0]} 和 ${users[1]} 正在输入...`;
        } else if (users.length === 3) {
            text = `${users[0]}、${users[1]} 和 ${users[2]} 正在输入...`;
        } else {
            text = `${users.length} 人正在输入...`;
        }

        this.typingText.textContent = text;
        showElement(this.indicator);

        // 滚动到底部
        scrollToBottom(this.messagesContainer);
    }

    isUserTyping(userId) {
        return this.typingUsers.has(userId);
    }

    getTypingUsers() {
        return Array.from(this.typingUsers);
    }
}