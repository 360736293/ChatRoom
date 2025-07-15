const { app, BrowserWindow, Menu, Tray, shell, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isQuiting = false;

// 服务器地址配置
const SERVER_URL = 'http://localhost';

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 940,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.png'),
        title: 'DisDiscord',
        show: false // 先不显示，等加载完成
    });

    // 加载应用
    mainWindow.loadURL(SERVER_URL);

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // 处理窗口关闭
    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
        return true;
    });

    // 处理新窗口打开（在默认浏览器中打开）
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // 创建菜单
    // createMenu();
    // 不显示菜单
    mainWindow.setMenu(null);

    // 创建系统托盘
    createTray();
}

// 创建系统托盘
function createTray() {
    tray = new Tray(path.join(__dirname, '../assets/tray.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示窗口',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: '隐藏窗口',
            click: () => {
                mainWindow.hide();
            }
        },
        { type: 'separator' },
        {
            label: '退出',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('DisDiscord');
    tray.setContextMenu(contextMenu);

    // 托盘图标双击事件
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

// 创建应用菜单
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '设置',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        // 可以在这里打开设置窗口
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '设置',
                            message: '设置功能开发中...',
                            buttons: ['确定']
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        isQuiting = true;
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: '关闭', accelerator: 'CmdOrCtrl+W', role: 'close' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于 DisDiscord',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于 DisDiscord',
                            message: 'DisDiscord 桌面客户端',
                            detail: '版本: 1.0.0\n基于 Electron 构建',
                            buttons: ['确定']
                        });
                    }
                },
                {
                    label: '访问官网',
                    click: () => {
                        shell.openExternal('http://localhost');
                    }
                }
            ]
        }
    ];

    // macOS 特殊处理
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { label: '关于 ' + app.getName(), role: 'about' },
                { type: 'separator' },
                { label: '服务', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: '隐藏 ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
                { label: '隐藏其他', accelerator: 'Command+Shift+H', role: 'hideothers' },
                { label: '显示全部', role: 'unhide' },
                { type: 'separator' },
                { label: '退出', accelerator: 'Command+Q', click: () => { app.quit(); } }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 应用事件处理
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuiting = true;
});

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-notification', (event, options) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
        new Notification(options).show();
    }
});
