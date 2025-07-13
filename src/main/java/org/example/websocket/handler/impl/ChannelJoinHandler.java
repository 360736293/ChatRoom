package org.example.websocket.handler.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.service.BroadcastService;
import org.example.service.ChannelService;
import org.example.service.UserService;
import org.example.websocket.handler.MessageHandler;
import org.springframework.stereotype.Component;

import javax.websocket.Session;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChannelJoinHandler implements MessageHandler {

    private final UserService userService;
    private final ChannelService channelService;
    private final BroadcastService broadcastService;

    @Override
    public boolean canHandle(Message message) {
        return MessageType.JOIN_CHANNEL.getValue().equals(message.getType());
    }

    @Override
    public void handle(Message message, User user, Session session) {
        String newChannel = message.getChannel();

        // 更新用户当前频道
        userService.updateUserChannel(user.getUserId(), newChannel);

        // 发送频道历史消息
        channelService.sendChannelHistory(session, newChannel);

        // 广播用户列表更新
        broadcastService.broadcastUserList();

        log.info("用户加入频道: user={}, channel={}", user.getUsername(), newChannel);
    }
}