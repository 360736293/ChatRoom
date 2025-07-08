// src/main/resources/static/js/handlers/channelHandler.js

import { querySelector, querySelectorAll, addEventListener } from '../utils/domUtils.js';

export class ChannelHandler {
    constructor(chatWebSocket) {
        this.chatWebSocket = chatWebSocket;
        this.currentChannel = null;
        this.init();
    }

    init() {
        this.setupChannelClickHandlers();
    }

    setupChannelClickHandlers() {
        const channelItems = querySelectorAll('.channel-item');

        channelItems.forEach(item => {
            addEventListener(item, 'click', () => {
                this.handleChannelClick(item);
            });
        });
    }

    handleChannelClick(clickedItem) {
        // 更新UI
        this.updateActiveChannel(clickedItem);

        // 获取频道名称
        const channelName = clickedItem.textContent.trim();
        this.currentChannel = channelName;

        // 更新头部和输入框
        this.updateChannelUI(channelName);

        // 通知WebSocket切换频道
        if (this.chatWebSocket && this.chatWebSocket.isConnected()) {
            this.chatWebSocket.joinChannel(channelName);
        }
    }

    updateActiveChannel(activeItem) {
        // 移除所有active类
        const allItems = querySelectorAll('.channel-item');
        allItems.forEach(item => item.classList.remove('active'));

        // 添加active类到当前项
        activeItem.classList.add('active');
    }

    updateChannelUI(channelName) {
        // 更新聊天头部
        const header = querySelector('.chat-header h3');
        if (header) {
            header.textContent = channelName;
        }

        // 更新输入框占位符
        const messageInput = querySelector('.message-input');
        if (messageInput) {
            messageInput.placeholder = `给 #${channelName} 发消息`;
        }
    }

    getCurrentChannel() {
        return this.currentChannel;
    }

    setActiveChannelByName(channelName) {
        const channelItems = querySelectorAll('.channel-item');

        channelItems.forEach(item => {
            if (item.textContent.trim() === channelName) {
                this.handleChannelClick(item);
            }
        });
    }
}