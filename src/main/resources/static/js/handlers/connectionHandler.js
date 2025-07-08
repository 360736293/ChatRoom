// src/main/resources/static/js/handlers/connectionHandler.js

import { querySelector, createElement, getElementById } from '../utils/domUtils.js';

export class ConnectionHandler {
    constructor() {
        this.indicator = null;
        this.header = null;
        this.init();
    }

    init() {
        this.header = querySelector('.chat-header');
        this.addConnectionIndicator();
    }

    addConnectionIndicator() {
        this.indicator = createElement('div');
        this.indicator.id = 'connection-indicator';
        this.indicator.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #ed4245;
            margin-left: auto;
            margin-right: 16px;
            transition: background-color 0.3s ease;
        `;

        if (this.header) {
            this.header.appendChild(this.indicator);
        }
    }

    updateStatus(connected) {
        this.updateIndicator(connected);
        this.updateHeaderText(connected);
    }

    updateIndicator(connected) {
        if (this.indicator) {
            this.indicator.style.backgroundColor = connected ? '#3ba55c' : '#ed4245';
            this.indicator.title = connected ? '已连接' : '连接断开';
        }
    }

    updateHeaderText(connected) {
        const h3 = this.header ? this.header.querySelector('h3') : null;
        if (!h3) return;

        if (connected) {
            h3.style.color = '#ffffff';
            if (h3.textContent.includes('(连接断开)')) {
                h3.textContent = h3.textContent.replace(' (连接断开)', '');
            }
        } else {
            h3.style.color = '#ed4245';
            if (!h3.textContent.includes('(连接断开)')) {
                h3.textContent += ' (连接断开)';
            }
        }
    }

    setConnecting() {
        if (this.indicator) {
            this.indicator.style.backgroundColor = '#faa61a';
            this.indicator.title = '连接中...';
        }
    }
}