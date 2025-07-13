package org.example.websocket.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.service.BroadcastService;
import org.example.service.ChannelService;
import org.springframework.stereotype.Component;

import javax.websocket.Session;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatMessageHandler implements MessageHandler {

    private final ChannelService channelService;
    private final BroadcastService broadcastService;

    @Override
    public boolean canHandle(Message message) {
        return MessageType.CHAT.getValue().equals(message.getType());
    }

    @Override
    public void handle(Message message, User user, Session session) {
        // 设置消息属性
        message.setAuthor(user.getUsername());
        message.setAvatar(user.getAvatar());
        message.setUserId(user.getUserId());
        message.setTimestamp(LocalDateTime.now());

        // 处理图片消息
        processImageMessage(message);

        // 保存消息到历史记录
        channelService.addMessage(message.getChannel(), message);

        // 广播消息
        broadcastService.broadcastToChannel(message, message.getChannel());

        log.info("处理聊天消息: user={}, channel={}", user.getUsername(), message.getChannel());
    }

    private void processImageMessage(Message message) {
        try {
            if (message.getContent() != null && message.getContent().startsWith("{")) {
                // 简单检查是否为图片消息
                if (message.getContent().contains("\"type\":\"image\"")) {
                    message.setContentType("image");
                }
            }
        } catch (Exception e) {
            message.setContentType("text");
        }
    }
}