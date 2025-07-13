package org.example.websocket;

import lombok.extern.slf4j.Slf4j;
import org.example.entity.User;
import org.example.service.SessionManager;
import org.example.service.UserService;
import org.example.websocket.dispatcher.MessageDispatcher;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

/**
 * WebSocket端点，负责处理WebSocket连接的生命周期
 */
@Slf4j
@ServerEndpoint("/websocket/{userId}")
@Component
public class ChatWebSocketEndpoint {

    private static SessionManager sessionManager;
    private static UserService userService;
    private static MessageDispatcher messageDispatcher;

    // 使用静态方法注入依赖（因为WebSocket端点是由容器管理的）
    public static void setDependencies(SessionManager sessionManager,
                                       UserService userService,
                                       MessageDispatcher messageDispatcher) {
        ChatWebSocketEndpoint.sessionManager = sessionManager;
        ChatWebSocketEndpoint.userService = userService;
        ChatWebSocketEndpoint.messageDispatcher = messageDispatcher;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        try {
            log.info("用户连接: {}", userId);

            // 注册会话
            sessionManager.addSession(userId, session);

            // 处理用户连接
            User user = userService.handleUserConnect(userId);

            // 发送初始化数据
            messageDispatcher.sendInitialData(session, user);

        } catch (Exception e) {
            log.error("处理用户连接失败: userId={}", userId, e);
        }
    }

    @OnMessage(maxMessageSize = 1024 * 1024 * 1024)
    public void onMessage(String messageStr, Session session, @PathParam("userId") String userId) {
        try {
            log.debug("收到消息: userId={}, message={}", userId, messageStr);

            // 获取用户信息
            User user = userService.getUser(userId);
            if (user == null) {
                log.warn("用户不存在: {}", userId);
                return;
            }

            // 分发消息处理
            messageDispatcher.dispatch(messageStr, user, session);

        } catch (Exception e) {
            log.error("处理消息失败: userId={}, message={}", userId, messageStr, e);
        }
    }

    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        try {
            log.info("用户断开连接: {}", userId);

            // 移除会话
            sessionManager.removeSession(userId);

            // 处理用户断开
            userService.handleUserDisconnect(userId);

        } catch (Exception e) {
            log.error("处理用户断开连接失败: userId={}", userId, e);
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket错误", error);
    }
}