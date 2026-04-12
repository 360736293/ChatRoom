# DisDiscord - 实时聊天应用

<img width="1548" height="785" alt="DisDiscord Screenshot" src="https://github.com/user-attachments/assets/e23ac6d0-8517-4efd-ba47-14ca6150df10" />

## 📖 项目简介

娱乐项目，功能目前只是个DEMO，完全由AI实现（bug为人工修复）。

DisDiscord 是一个仿 Discord 的实时聊天应用，采用 SpringBoot + WebSocket 构建后端，原生 JavaScript 实现前端，Electron 实现客户端，提供流畅的即时通讯体验。

### ✨ 主要特性

- 🚀 **实时通讯** - 基于 WebSocket 的双向实时通信
- 👥 **在线用户列表** - 实时显示在线用户状态
- 📸 **图片分享** - 支持图片上传和预览
- 😀 **表情支持** - 丰富的 Emoji 表情选择器
- ⌨️ **输入状态** - 实时显示其他用户的输入状态
- 🔔 **消息通知** - 新消息提醒功能
- 🎨 **Discord 风格 UI** - 高度还原 Discord 的界面设计
- 💻 **桌面客户端** - 基于 Electron 的跨平台桌面应用

## 🛠️ 技术栈

### 后端
- **Spring Boot 2.7.0** - 主框架
- **Spring WebSocket** - WebSocket 支持
- **Jackson** - JSON 序列化
- **Lombok** - 简化代码
- **Java 8+** - 开发语言

### 前端
- **原生 JavaScript (ES6+)** - 模块化开发
- **原生 CSS3** - Discord 风格界面
- **WebSocket API** - 实时通信
- **FileReader API** - 图片处理

### 桌面客户端
- **Electron** - 跨平台桌面应用框架
- **Node.js** - JavaScript 运行环境

## 📁 项目结构

```
DisDiscord/
├── src/main/java/org/example/
│   ├── config/              # 配置类
│   │   ├── WebSocketConfig.java
│   │   ├── CorsConfig.java
│   │   └── JacksonConfig.java
│   ├── constant/            # 常量定义
│   ├── controller/          # REST控制器
│   ├── entity/              # 实体类
│   ├── event/               # 事件类
│   ├── exception/           # 异常处理
│   ├── service/             # 业务服务
│   ├── websocket/           # WebSocket端点
│   │   ├── ChatWebSocketEndpoint.java
│   │   ├── dispatcher/      # 消息分发器
│   │   └── handler/         # 消息处理器
│   └── ChatRoomApplication.java
├── src/main/resources/
│   ├── static/              # 前端资源
│   │   ├── css/             # 样式文件
│   │   ├── js/              # JavaScript模块
│   │   │   ├── components/  # UI组件
│   │   │   ├── core/        # 核心功能
│   │   │   ├── handlers/    # 事件处理
│   │   │   └── utils/       # 工具函数
│   │   └── index.html
│   └── application.yaml     # 应用配置
├── electron-client/         # Electron客户端
│   ├── electron/            # 主进程代码
│   ├── assets/              # 客户端资源
│   └── package.json
└── pom.xml                  # Maven配置
```

## 🚀 快速开始

### 后端启动

1. 克隆项目
```bash
git clone https://github.com/yourusername/DisDiscord.git
cd DisDiscord
```

2. 构建项目
```bash
mvn clean install
```

3. 运行应用
```bash
mvn spring-boot:run
```

应用将在 `http://localhost` 启动（默认80端口）

### 前端访问

直接在浏览器中访问 `http://localhost` 即可使用Web版本。

### 桌面客户端

1. 进入客户端目录
```bash
cd electron-client
```

2. 安装依赖
```bash
npm install
```

3. 运行开发版本
```bash
npm start
```

4. 构建安装包
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

## 💡 功能介绍

### 核心功能

1. **实时聊天**
    - WebSocket 双向通信
    - 消息实时推送
    - 断线自动重连

2. **用户管理**
    - 自定义用户名
    - 在线状态显示（在线/离线）
    - 用户列表实时更新

3. **消息功能**
    - 文本消息
    - 图片消息（支持粘贴上传）
    - 表情符号
    - @提及功能
    - URL自动识别

4. **界面交互**
    - Discord 风格 UI
    - 深色主题
    - 响应式设计
    - 输入状态提示
    - 新消息通知
