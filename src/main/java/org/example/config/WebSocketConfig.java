package org.example.config;

import org.example.service.SessionManager;
import org.example.service.UserService;
import org.example.websocket.ChatWebSocketEndpoint;
import org.example.websocket.dispatcher.MessageDispatcher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import javax.annotation.PostConstruct;

@Configuration
public class WebSocketConfig {

    private final SessionManager sessionManager;
    private final UserService userService;
    private final MessageDispatcher messageDispatcher;

    public WebSocketConfig(SessionManager sessionManager,
                           UserService userService,
                           MessageDispatcher messageDispatcher) {
        this.sessionManager = sessionManager;
        this.userService = userService;
        this.messageDispatcher = messageDispatcher;
    }

    @PostConstruct
    public void init() {
        // 注入依赖到WebSocket端点
        ChatWebSocketEndpoint.setDependencies(sessionManager, userService, messageDispatcher);
    }

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}