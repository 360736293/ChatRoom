// src/main/resources/static/js/components/MentionAutocomplete.js

import {createElement, getElementById} from '../utils/domUtils.js';

export class MentionAutocomplete {
    constructor(messageInputId) {
        this.messageInput = getElementById(messageInputId);
        this.container = null;
        this.userList = [];
        this.currentUserId = null;
        this.currentQuery = '';
        this.isVisible = false;
        this.selectedIndex = -1;
        
        this.init();
    }

    // 设置当前用户ID
    setCurrentUserId(userId) {
        this.currentUserId = userId;
    }

    init() {
        this.createContainer();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = createElement('div', 'mention-autocomplete');
        this.container.style.position = 'absolute';
        this.container.style.backgroundColor = '#2f3136';
        this.container.style.border = '1px solid #202225';
        this.container.style.borderRadius = '4px';
        this.container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        this.container.style.zIndex = '1000';
        this.container.style.display = 'none';
        this.container.style.maxHeight = '200px';
        this.container.style.overflowY = 'auto';
        this.container.style.minWidth = '200px';
        
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        // 输入事件
        this.messageInput.addEventListener('input', (e) => {
            this.handleInput(e);
        });

        // 按键事件
        this.messageInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // 点击事件
        document.addEventListener('click', (e) => {
            if (!this.messageInput.contains(e.target) && !this.container.contains(e.target)) {
                this.hide();
            }
        });

        // 滚动事件
        this.messageInput.addEventListener('scroll', () => {
            this.updatePosition();
        });
    }

    setUserList(users) {
        this.userList = users;
    }

    handleInput(e) {
        const value = this.messageInput.value;
        const cursorPosition = this.messageInput.selectionStart;
        
        // 查找@符号的位置
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex === -1) {
            this.hide();
            return;
        }
        
        // 检查@符号是否是单词的开始
        const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
        if (!/\s|^/.test(charBeforeAt)) {
            this.hide();
            return;
        }
        
        // 提取@后面的文本
        this.currentQuery = textBeforeCursor.substring(lastAtIndex + 1);
        
        if (this.currentQuery.length === 0) {
            this.showAllUsers();
        } else {
            this.showMatchingUsers();
        }
        
        this.updatePosition();
    }

    handleKeydown(e) {
        if (!this.isVisible) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateUp();
                break;
            case 'Enter':
                e.preventDefault();
                this.selectCurrent();
                break;
            case 'Escape':
                this.hide();
                break;
        }
    }

    showAllUsers() {
        // 排除当前用户
        const filteredUsers = this.userList.filter(user => {
            const userId = user.id || user.userId || user.name;
            return userId !== this.currentUserId;
        });
        this.renderUsers(filteredUsers);
    }

    showMatchingUsers() {
        const query = this.currentQuery.toLowerCase();
        const matchingUsers = this.userList.filter(user => {
            // 排除当前用户
            const userId = user.id || user.userId || user.name;
            if (userId === this.currentUserId) {
                return false;
            }
            const userName = user.name || user.author || user.userId || '';
            return userName.toLowerCase().includes(query);
        });
        this.renderUsers(matchingUsers);
    }

    renderUsers(users) {
        if (users.length === 0) {
            this.hide();
            return;
        }
        
        this.container.innerHTML = '';
        
        users.forEach((user, index) => {
            const userItem = createElement('div', 'mention-user-item');
            userItem.style.padding = '8px 12px';
            userItem.style.cursor = 'pointer';
            userItem.style.display = 'flex';
            userItem.style.alignItems = 'center';
            userItem.style.gap = '8px';
            
            userItem.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
            
            userItem.addEventListener('click', () => {
                this.selectUser(user);
            });
            
            // 用户头像
            const avatar = createElement('div', 'mention-user-avatar');
            avatar.style.width = '24px';
            avatar.style.height = '24px';
            avatar.style.borderRadius = '50%';
            avatar.style.background = 'linear-gradient(135deg, #5865f2, #7289da)';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.color = 'white';
            avatar.style.fontSize = '12px';
            avatar.style.fontWeight = '600';
            // 确保user.name存在
            const userName = user.name || user.author || user.userId || '?';
            avatar.textContent = userName.charAt(0).toUpperCase();
            
            // 用户名
            const username = createElement('span', 'mention-username');
            username.style.color = '#dcddde';
            const displayName = user.name || user.author || user.userId || 'Unknown';
            username.textContent = displayName;
            
            userItem.appendChild(avatar);
            userItem.appendChild(username);
            this.container.appendChild(userItem);
        });
        
        this.selectedIndex = 0;
        this.updateSelection();
        this.show();
    }

    updateSelection() {
        const items = this.container.querySelectorAll('.mention-user-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.backgroundColor = '#404249';
            } else {
                item.style.backgroundColor = 'transparent';
            }
        });
    }

    navigateDown() {
        const items = this.container.querySelectorAll('.mention-user-item');
        if (items.length === 0) return;
        
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.updateSelection();
        this.scrollToSelected();
    }

    navigateUp() {
        const items = this.container.querySelectorAll('.mention-user-item');
        if (items.length === 0) return;
        
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.updateSelection();
        this.scrollToSelected();
    }

    scrollToSelected() {
        const items = this.container.querySelectorAll('.mention-user-item');
        if (items[this.selectedIndex]) {
            items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    selectCurrent() {
        const items = this.container.querySelectorAll('.mention-user-item');
        if (items[this.selectedIndex]) {
            const username = items[this.selectedIndex].querySelector('.mention-username').textContent;
            this.selectUser({ name: username });
        }
    }

    selectUser(user) {
        const value = this.messageInput.value;
        const cursorPosition = this.messageInput.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const userName = user.name || user.author || user.userId || 'Unknown';
            const newText = value.substring(0, lastAtIndex) + '@' + userName + ' ' + value.substring(cursorPosition);
            this.messageInput.value = newText;
            
            // 设置光标位置
            const newCursorPosition = lastAtIndex + userName.length + 2; // +2 for @ and space
            this.messageInput.setSelectionRange(newCursorPosition, newCursorPosition);
            
            this.hide();
        }
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        // 显示后立即更新位置，确保正确计算
        setTimeout(() => {
            this.updatePosition();
        }, 0);
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        this.currentQuery = '';
        this.selectedIndex = -1;
    }

    updatePosition() {
        if (!this.isVisible) return;
        
        const rect = this.messageInput.getBoundingClientRect();
        const containerHeight = this.container.offsetHeight || 200; // 预估高度
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        
        // 计算上下位置
        let top = rect.bottom + window.scrollY + 5;
        // 如果下方空间不足，显示在上方
        if (rect.bottom + containerHeight > windowHeight) {
            top = rect.top + window.scrollY - containerHeight - 5;
        }
        
        // 计算左右位置
        let left = rect.left + window.scrollX;
        const containerWidth = this.container.offsetWidth || 200; // 预估宽度
        // 如果右侧空间不足，调整左侧位置
        if (rect.left + containerWidth > windowWidth) {
            left = windowWidth - containerWidth - 10;
        }
        
        this.container.style.top = `${top}px`;
        this.container.style.left = `${left}px`;
    }

    // 清理
    destroy() {
        if (this.container) {
            document.body.removeChild(this.container);
        }
    }
}