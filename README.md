# ChatRoom - 实时聊天应用

<img width="1548" height="785" alt="ChatRoom Screenshot" src="https://github.com/user-attachments/assets/e23ac6d0-8517-4efd-ba47-14ca6150df10" />

## 📖 项目简介

娱乐项目，功能目前只是个DEMO，完全由AI实现。

ChatRoom 是一个仿 Discord 的实时聊天应用，采用 SpringBoot + WebSocket 构建后端，原生 JavaScript 实现前端，Electron 实现客户端，提供流畅的即时通讯体验。

### ✨ 主要特性

- 🚀 **实时通讯** - 基于 WebSocket 的双向实时通信
- 👥 **在线用户列表** - 实时显示在线用户状态（在线/离开/离线）
- 📸 **图片分享** - 支持图片上传和预览
- 😀 **表情支持** - 丰富的 Emoji 表情选择器
- ⌨️ **输入状态** - 实时显示其他用户的输入状态
- 🔔 **消息通知** - 新消息提醒功能
- 🎯 **@提及功能** - 支持@用户，返回页面时自动跳转到@消息
- 🔗 **引用回复** - 右键消息支持引用回复，点击引用内容可跳转到原消息
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
ChatRoom/
├── src/main/java/org/example/
│   ├── config/              # 配置类
│   │   ├── WebSocketConfig.java
│   │   ├── CorsConfig.java
│   │   └── JacksonConfig.java
│   ├── constant/            # 常量定义
│   │   ├── ChatConstants.java
│   │   ├── MessageContentType.java
│   │   ├── MessageType.java
│   │   └── UserStatus.java
│   ├── controller/          # REST控制器
│   │   ├── ChatController.java
│   │   ├── ImageController.java
│   │   └── StaticResourceController.java
│   ├── entity/              # 实体类
│   │   ├── Message.java
│   │   └── User.java
│   ├── event/               # 事件类
│   │   ├── UserListUpdateEvent.java
│   │   └── UserStatusChangeEvent.java
│   ├── exception/           # 异常处理
│   │   ├── ChatException.java
│   │   └── InvalidMessageException.java
│   ├── service/             # 业务服务
│   │   ├── BroadcastService.java
│   │   ├── ChannelService.java
│   │   ├── ImageStorageService.java
│   │   ├── SessionManager.java
│   │   └── UserService.java
│   ├── websocket/           # WebSocket端点
│   │   ├── ChatWebSocketEndpoint.java
│   │   ├── dispatcher/      # 消息分发器
│   │   │   └── MessageDispatcher.java
│   │   └── handler/         # 消息处理器
│   │       ├── MessageHandler.java
│   │       └── impl/
│   │           ├── ChannelJoinHandler.java
│   │           ├── ChatMessageHandler.java
│   │           ├── StatusChangeHandler.java
│   │           └── TypingHandler.java
│   └── ChatRoomApplication.java
├── src/main/resources/
│   ├── static/              # 前端资源
│   │   ├── css/             # 样式文件
│   │   │   └── style.css
│   │   ├── js/              # JavaScript模块
│   │   │   ├── components/  # UI组件
│   │   │   │   ├── EmojiPicker.js
│   │   │   │   ├── ImageHandler.js
│   │   │   │   ├── MentionAutocomplete.js
│   │   │   │   ├── MessageDisplay.js
│   │   │   │   ├── NotificationManager.js
│   │   │   │   ├── TypingIndicator.js
│   │   │   │   ├── UserList.js
│   │   │   │   └── UsernameModal.js
│   │   │   ├── core/        # 核心功能
│   │   │   │   ├── ChatWebSocket.js
│   │   │   │   └── WebSocketManager.js
│   │   │   ├── handlers/    # 事件处理
│   │   │   │   ├── channelHandler.js
│   │   │   │   ├── connectionHandler.js
│   │   │   │   └── messageHandler.js
│   │   │   └── utils/       # 工具函数
│   │   │       ├── constants.js
│   │   │       ├── dateUtils.js
│   │   │       ├── domUtils.js
│   │   │       ├── imageUtils.js
│   │   │       └── messageFormatter.js
│   │   └── index.html
│   └── application.yaml     # 应用配置
├── electron-client/         # Electron客户端
│   ├── assets/              # 客户端资源
│   │   ├── icon.png
│   │   └── tray.png
│   ├── electron/            # 主进程代码
│   │   ├── main.js
│   │   └── preload.js
│   └── package.json
├── .gitignore
├── README.md
└── pom.xml                  # Maven配置
```

## 🚀 快速开始

### 后端启动

1. 克隆项目
```bash
git clone https://github.com/yourusername/ChatRoom.git
cd ChatRoom
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
    - 在线状态显示（在线/离开/离线）
    - 窗口焦点检测自动更新状态
    - 用户列表实时更新

3. **消息功能**
    - 文本消息
    - 图片消息（支持粘贴上传）
    - 表情符号
    - @提及功能（智能匹配用户）
    - 引用回复（右键消息支持引用）
    - URL自动识别

4. **界面交互**
    - Discord 风格 UI
    - 深色主题
    - 响应式设计
    - 输入状态提示
    - 新消息通知

### @提及功能详解

1. **@用户**
    - 输入 `@` 后自动显示用户列表
    - 支持按用户名搜索
    - 选择用户后自动补全
    - 智能匹配：只对存在的用户显示高亮

2. **@消息通知**
    - 当用户被@时，标题栏显示提醒
    - 页面不在焦点时存储未读@消息

3. **返回页面时的跳转**
    - 用户回到页面时，自动滚动到最新的@消息
    - 被@的消息会高亮显示
    - 顶部显示"有人@了你"的提示

4. **存储机制**
    - 使用 localStorage 存储未读@消息
    - 支持多个@消息的顺序处理
    - 自动清理过期数据

### 引用回复功能详解

1. **触发方式**
    - 右键点击任意消息
    - 选择"引用回复"选项

2. **引用提示**
    - 触发引用时显示浮动提示
    - 提示用户已引用的消息作者

3. **引用显示**
    - 发送后显示引用消息的预览
    - 包含作者信息和消息内容
    - 支持文本和图片消息的引用

4. **跳转功能**
    - 点击引用内容可跳转到原消息位置
    - 原消息会高亮显示
    - 平滑滚动动画

## 🎯 使用指南

1. **设置用户名**
    - 首次访问时会提示输入用户名
    - 用户名会保存在本地存储中

2. **发送消息**
    - 在输入框中输入文本，按 Enter 发送
    - 点击📎按钮上传图片
    - 点击😀按钮选择表情

3. **@提及用户**
    - 输入 `@` 开始提及用户
    - 从下拉列表中选择用户
    - 被提及的用户会收到通知
    - 智能匹配：只对存在的用户显示高亮

4. **查看@消息**
    - 回到页面时自动跳转到@消息
    - 消息会高亮显示
    - 查看后标记为已读

5. **引用回复消息**
    - 右键点击任意消息
    - 选择"引用回复"选项
    - 输入回复内容
    - 发送后显示引用消息
    - 点击引用内容跳转到原消息

## 🔧 开发说明

### 后端开发
- 消息处理流程：WebSocket → MessageDispatcher → 对应Handler → 广播
- 消息类型：chat, system, user_list, typing_start, typing_stop
- 数据结构：Message 实体类包含消息内容、作者、时间戳等信息

### 前端开发
- 模块化架构：组件化设计，职责分离
- WebSocket管理：自动重连、消息处理
- 界面更新：实时渲染、动画效果

### 客户端开发
- Electron 主进程：应用生命周期管理
- 渲染进程：加载Web页面
- 打包配置：多平台构建

## 📝 版本历史

### v1.0.0
- 基础聊天功能
- 实时消息推送
- 图片上传功能
- 表情支持
- 输入状态提示

### v1.1.0
- 新增@提及功能
- 优化消息通知
- 改进用户体验
- 修复已知bug

### v1.2.0
- 新增用户离开状态检测
- 新增引用回复功能
- 优化@提及功能（智能匹配用户）
- 改进用户界面交互

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🌟 鸣谢

- Discord - 界面设计参考
- Spring Boot - 后端框架
- Electron - 桌面客户端框架
- WebSocket API - 实时通信
