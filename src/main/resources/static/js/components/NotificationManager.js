// src/main/resources/static/js/components/NotificationManager.js

const STORAGE_KEY_PREFIX = 'mentioned_messages_';
const MAX_STORED_IDS = 500;
const STORAGE_EXPIRY_DAYS = 7;

export class NotificationManager {
    constructor(userId = null) {
        this.originalTitle = document.title;
        this.isPageVisible = true;
        this.userId = userId;
        this.initVisibilityDetection();
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getStorageKey() {
        return STORAGE_KEY_PREFIX + (this.userId || 'default');
    }

    initVisibilityDetection() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (this.isPageVisible) {
                this.clearNotification();
            }
        });

        window.addEventListener('focus', () => {
            this.isPageVisible = true;
            this.clearNotification();
        });

        window.addEventListener('blur', () => {
            this.isPageVisible = false;
        });
    }

    showNotification() {
        if (this.isPageVisible) return;

        document.title = '【新消息】' + this.originalTitle;
    }

    showMentionNotification(messageId) {
        if (!messageId) {
            document.title = '【@提到你】' + this.originalTitle;
            return;
        }

        if (this.hasBeenNotified(messageId)) {
            return;
        }

        document.title = '【@提到你】' + this.originalTitle;
        this.markAsNotified(messageId);
    }

    hasBeenNotified(messageId) {
        try {
            const data = this.getStoredData();
            return data.hasOwnProperty(messageId);
        } catch (e) {
            console.error('Error checking notification status:', e);
            return false;
        }
    }

    markAsNotified(messageId) {
        try {
            const data = this.getStoredData();
            data[messageId] = Date.now();

            const keys = Object.keys(data);
            if (keys.length > MAX_STORED_IDS) {
                this.cleanupOldEntries(data);
            }

            localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
        } catch (e) {
            console.error('Error saving notification status:', e);
        }
    }

    getStoredData() {
        try {
            const stored = localStorage.getItem(this.getStorageKey());
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error reading stored notifications:', e);
            return {};
        }
    }

    cleanupOldEntries(data) {
        const entries = Object.entries(data);
        entries.sort((a, b) => a[1] - b[1]);

        const toRemove = entries.length - MAX_STORED_IDS;
        for (let i = 0; i < toRemove; i++) {
            delete data[entries[i][0]];
        }

        const expiryTime = Date.now() - (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        for (const [key, timestamp] of Object.entries(data)) {
            if (timestamp < expiryTime) {
                delete data[key];
            }
        }
    }

    clearNotification() {
        document.title = this.originalTitle;
    }

    clearAllStoredNotifications() {
        try {
            localStorage.removeItem(this.getStorageKey());
        } catch (e) {
            console.error('Error clearing stored notifications:', e);
        }
    }
}
