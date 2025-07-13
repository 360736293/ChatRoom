package org.example.websocket.handler.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.service.BroadcastService;
import org.example.websocket.handler.MessageHandler;
import org.springframework.stereotype.Component;

import javax.websocket.Session;

@Slf4j
@Component
@RequiredArgsConstructor
public class TypingHandler implements MessageHandler {

    private final BroadcastService broadcastService;

    @Override
    public boolean canHandle(Message message) {
        String type = message.getType();
        return MessageType.TYPING_START.getValue().equals(type) ||
                MessageType.TYPING_STOP.getValue().equals(type);
    }

    @Override
    public void handle(Message message, User user, Session session) {
        message.setUserId(user.getUserId());
        message.setAuthor(user.getUsername());

        // 广播输入状态
        broadcastService.broadcastToChannel(message, message.getChannel());

        log.debug("用户输入状态: user={}, type={}", user.getUsername(), message.getType());
    }
}