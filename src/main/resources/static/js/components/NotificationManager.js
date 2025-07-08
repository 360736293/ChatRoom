// src/main/resources/static/js/components/NotificationManager.js

export class NotificationManager {
    constructor() {
        this.originalTitle = document.title;
        this.isPageVisible = true;
        this.initVisibilityDetection();
    }

    initVisibilityDetection() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (this.isPageVisible) {
                this.clearNotification();
            }
        });

        // 监听窗口焦点变化
        window.addEventListener('focus', () => {
            this.isPageVisible = true;
            this.clearNotification();
        });

        window.addEventListener('blur', () => {
            this.isPageVisible = false;
        });
    }

    showNotification() {
        // 只有页面不可见时才显示通知
        if (this.isPageVisible) return;

        // 更新标题
        document.title = '【新消息】' + this.originalTitle;
    }

    clearNotification() {
        document.title = this.originalTitle;
    }
}