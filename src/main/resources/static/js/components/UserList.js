// src/main/resources/static/js/components/UserList.js

import { querySelector } from '../utils/domUtils.js';
import { USER_STATUS } from '../utils/constants.js';

export class UserList {
    constructor(sidebarSelector, currentUserId) {
        this.sidebar = querySelector(sidebarSelector);
        this.currentUserId = currentUserId;
    }

    updateList(users) {
        // 分类用户
        const categorizedUsers = this.categorizeUsers(users);

        // 构建HTML
        this.sidebar.innerHTML = this.buildUserListHTML(categorizedUsers);
    }

    categorizeUsers(users) {
        return {
            online: users.filter(user => user.status === USER_STATUS.ONLINE),
            idle: users.filter(user => user.status === USER_STATUS.IDLE),
            dnd: users.filter(user => user.status === USER_STATUS.DND),
            offline: users.filter(user => user.status === USER_STATUS.OFFLINE)
        };
    }

    buildUserListHTML(categorized) {
        let html = '';

        // 在线用户
        if (categorized.online.length > 0) {
            html += `<div class="user-category">在线 — ${categorized.online.length}</div>`;
            html += categorized.online.map(user => this.createUserElement(user)).join('');
        }

        // 空闲用户
        if (categorized.idle.length > 0) {
            html += `<div class="user-category">空闲 — ${categorized.idle.length}</div>`;
            html += categorized.idle.map(user => this.createUserElement(user)).join('');
        }

        // 勿扰用户
        if (categorized.dnd.length > 0) {
            html += `<div class="user-category">勿扰 — ${categorized.dnd.length}</div>`;
            html += categorized.dnd.map(user => this.createUserElement(user)).join('');
        }

        // 离线用户
        if (categorized.offline.length > 0) {
            html += `<div class="user-category">离线 — ${categorized.offline.length}</div>`;
            html += categorized.offline.map(user => this.createUserElement(user)).join('');
        }

        return html;
    }

    createUserElement(user) {
        const isCurrentUser = user.userId === this.currentUserId;
        const itemStyle = isCurrentUser ? 'style="background-color: rgba(88, 101, 242, 0.1);"' : '';
        const nameStyle = isCurrentUser ? 'style="color: #00d4aa;"' : '';
        const nameSuffix = isCurrentUser ? ' (你)' : '';

        return `
            <div class="user-item" ${itemStyle} data-user-id="${user.userId}">
                <div class="user-avatar">
                    ${user.avatar}
                    <div class="user-status status-${user.status}"></div>
                </div>
                <div class="user-name" ${nameStyle}>${user.username}${nameSuffix}</div>
            </div>
        `;
    }

    updateCurrentUserId(userId) {
        this.currentUserId = userId;
    }

    getUserElement(userId) {
        return this.sidebar.querySelector(`[data-user-id="${userId}"]`);
    }

    getOnlineCount() {
        return this.sidebar.querySelectorAll('.status-online').length;
    }
}