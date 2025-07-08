// src/main/resources/static/js/components/EmojiPicker.js

import { getElementById, addEventListener, toggleClass, removeClass } from '../utils/domUtils.js';
import { EMOJI_DATA } from '../utils/constants.js';

export class EmojiPicker {
    constructor(buttonId, pickerId, gridId, messageInputId) {
        this.button = getElementById(buttonId);
        this.picker = getElementById(pickerId);
        this.grid = getElementById(gridId);
        this.messageInput = getElementById(messageInputId);
        this.currentCategory = 'smileys';

        this.init();
    }

    init() {
        this.renderEmojis(this.currentCategory);
        this.setupEventListeners();
    }

    renderEmojis(category) {
        this.grid.innerHTML = '';

        if (EMOJI_DATA[category]) {
            EMOJI_DATA[category].forEach(emoji => {
                const button = document.createElement('button');
                button.className = 'emoji-item';
                button.textContent = emoji;
                addEventListener(button, 'click', () => this.insertEmoji(emoji));
                this.grid.appendChild(button);
            });
        }
    }

    insertEmoji(emoji) {
        const cursorPos = this.messageInput.selectionStart;
        const textBefore = this.messageInput.value.substring(0, cursorPos);
        const textAfter = this.messageInput.value.substring(cursorPos);

        this.messageInput.value = textBefore + emoji + textAfter;
        this.messageInput.selectionStart = this.messageInput.selectionEnd = cursorPos + emoji.length;
        this.messageInput.focus();

        // 触发input事件，以便其他功能（如输入状态）能够响应
        this.messageInput.dispatchEvent(new Event('input'));

        this.hide();
    }

    setupEventListeners() {
        // 表情按钮点击
        addEventListener(this.button, 'click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // 分类按钮点击
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            addEventListener(btn, 'click', () => {
                categoryBtns.forEach(b => removeClass(b, 'active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderEmojis(this.currentCategory);
            });
        });

        // 点击外部关闭表情选择器
        addEventListener(document, 'click', (e) => {
            if (!this.picker.contains(e.target) && e.target !== this.button) {
                this.hide();
            }
        });
    }

    show() {
        this.picker.classList.add('show');
    }

    hide() {
        this.picker.classList.remove('show');
    }

    toggle() {
        toggleClass(this.picker, 'show');
    }

    isVisible() {
        return this.picker.classList.contains('show');
    }
}