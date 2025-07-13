const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 获取应用版本
    getVersion: () => ipcRenderer.invoke('get-app-version'),

    // 显示系统通知
    showNotification: (options) => ipcRenderer.invoke('show-notification', options),

    // 平台信息
    platform: process.platform,

    // 监听主进程事件
    on: (channel, callback) => {
        const validChannels = ['update-available', 'update-downloaded'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    },

    // 移除事件监听
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});