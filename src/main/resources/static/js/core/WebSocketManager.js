// src/main/resources/static/js/core/WebSocketManager.js

export class WebSocketManager {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageQueue = [];
        this.isReconnecting = false;

        // 事件回调
        this.onOpen = null;
        this.onClose = null;
        this.onError = null;
        this.onMessage = null;
        this.onReconnecting = null;
        this.onReconnectFailed = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = (event) => {
                    console.log('WebSocket连接已建立');
                    this.reconnectAttempts = 0;
                    this.isReconnecting = false;
                    this.flushMessageQueue();

                    if (this.onOpen) {
                        this.onOpen(event);
                    }
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    if (this.onMessage) {
                        this.onMessage(event);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('WebSocket连接已关闭');
                    if (this.onClose) {
                        this.onClose(event);
                    }

                    // 如果不是主动关闭，则尝试重连
                    if (event.code !== 1000) {
                        this.handleReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket错误:', error);
                    if (this.onError) {
                        this.onError(error);
                    }
                    reject(error);
                };
            } catch (error) {
                console.error('创建WebSocket连接失败:', error);
                reject(error);
            }
        });
    }

    send(data) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);

        if (this.isConnected()) {
            this.ws.send(message);
            return true;
        } else {
            // 如果未连接，将消息加入队列
            console.warn('WebSocket未连接，消息已加入队列');
            this.messageQueue.push(message);
            return false;
        }
    }

    close(code = 1000, reason = 'Normal closure') {
        if (this.ws) {
            this.ws.close(code, reason);
            this.ws = null;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    isConnecting() {
        return this.ws && this.ws.readyState === WebSocket.CONNECTING;
    }

    handleReconnect() {
        if (this.isReconnecting) return;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.isReconnecting = true;
            this.reconnectAttempts++;

            console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            if (this.onReconnecting) {
                this.onReconnecting(this.reconnectAttempts);
            }

            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('重连失败:', error);
                });
            }, this.reconnectInterval);
        } else {
            console.error('WebSocket重连失败，已达到最大重试次数');
            this.isReconnecting = false;

            if (this.onReconnectFailed) {
                this.onReconnectFailed();
            }
        }
    }

    flushMessageQueue() {
        // 发送队列中的消息
        while (this.messageQueue.length > 0 && this.isConnected()) {
            const message = this.messageQueue.shift();
            this.ws.send(message);
        }
    }

    getState() {
        if (!this.ws) return 'CLOSED';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.OPEN:
                return 'OPEN';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }

    setReconnectConfig(maxAttempts, interval) {
        this.maxReconnectAttempts = maxAttempts;
        this.reconnectInterval = interval;
    }

    clearMessageQueue() {
        this.messageQueue = [];
    }

    getQueuedMessageCount() {
        return this.messageQueue.length;
    }
}