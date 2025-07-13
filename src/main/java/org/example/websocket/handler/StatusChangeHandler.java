package org.example.websocket.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.service.BroadcastService;
import org.example.service.UserService;
import org.springframework.stereotype.Component;

import javax.websocket.Session;

@Slf4j
@Component
@RequiredArgsConstructor
public class StatusChangeHandler implements MessageHandler {

    private final UserService userService;
    private final BroadcastService broadcastService;

    @Override
    public boolean canHandle(Message message) {
        return MessageType.STATUS_CHANGE.getValue().equals(message.getType());
    }

    @Override
    public void handle(Message message, User user, Session session) {
        // 更新用户状态
        userService.updateUserStatus(user.getUserId(), message.getContent());

        // 广播用户列表更新
        broadcastService.broadcastUserList();

        log.info("用户状态变更: user={}, status={}", user.getUsername(), message.getContent());
    }
}