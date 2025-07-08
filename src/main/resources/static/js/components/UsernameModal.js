// src/main/resources/static/js/components/UsernameModal.js

import { createElement, addEventListener } from '../utils/domUtils.js';

export class UsernameModal {
    constructor() {
        this.modal = null;
        this.resolve = null;

        // 绑定全局方法以供HTML调用
        window.usernameModal = this;
    }

    show() {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.createModal();
        });
    }

    createModal() {
        this.modal = createElement('div', 'modal-overlay');

        this.modal.innerHTML = `
            <div class="modal">
                <div class="modal-title">欢迎来到 DisDiscord</div>
                <div class="modal-description">请输入您的用户名以开始聊天</div>
                <input type="text" class="modal-input" placeholder="输入用户名..." id="usernameInput" maxlength="20">
                <div class="modal-buttons">
                    <button class="modal-button modal-button-secondary" id="cancelButton">取消</button>
                    <button class="modal-button modal-button-primary" id="confirmButton" disabled>确认</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const input = document.getElementById('usernameInput');
        const confirmButton = document.getElementById('confirmButton');
        const cancelButton = document.getElementById('cancelButton');

        // 监听输入变化
        addEventListener(input, 'input', () => {
            const value = input.value.trim();
            confirmButton.disabled = value.length === 0;
        });

        // 回车确认
        addEventListener(input, 'keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.confirm();
            }
        });

        // 确认按钮
        addEventListener(confirmButton, 'click', () => this.confirm());

        // 取消按钮
        addEventListener(cancelButton, 'click', () => this.cancel());

        // 自动聚焦输入框
        setTimeout(() => input.focus(), 100);

        // 阻止点击遮罩层关闭
        addEventListener(this.modal, 'click', (e) => {
            if (e.target === this.modal) {
                e.preventDefault();
            }
        });
    }

    confirm() {
        const input = document.getElementById('usernameInput');
        const username = input.value.trim();

        if (username) {
            this.close();
            this.resolve(username);
        }
    }

    cancel() {
        this.close();
        this.resolve(null);
    }

    close() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }
}