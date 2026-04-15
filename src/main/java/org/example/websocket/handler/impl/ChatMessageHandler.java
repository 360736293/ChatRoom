package org.example.websocket.handler.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.MessageContentType;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.service.BroadcastService;
import org.example.service.ChannelService;
import org.example.service.ImageStorageService;
import org.example.websocket.handler.MessageHandler;
import org.springframework.stereotype.Component;

import javax.websocket.Session;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatMessageHandler implements MessageHandler {

    private final ChannelService channelService;
    private final BroadcastService broadcastService;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper;

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

        log.info("处理聊天消息: user={}, channel={}, mentions={}", user.getUsername(), message.getChannel(), message.getMentions());
    }

    private void processImageMessage(Message message) {
        try {
            if (message.getContent() != null && message.getContent().startsWith("{")) {
                // 解析消息内容
                JsonNode contentNode = objectMapper.readTree(message.getContent());
                if (contentNode.has("type") && MessageContentType.IMAGE.getValue().equals(contentNode.get("type").asText())) {
                    message.setContentType(MessageContentType.IMAGE.getValue());

                    // 处理图片存储
                    if (contentNode.has("data") && contentNode.has("fileName")) {
                        String base64Image = contentNode.get("data").asText();
                        String fileName = contentNode.get("fileName").asText();

                        // 存储图片到文件系统
                        String imageUrl = imageStorageService.storeImage(base64Image, fileName);

                        // 构建新的消息内容，只包含图片URL和文本
                        StringBuilder newContent = new StringBuilder();
                        newContent.append("{");
                        newContent.append("\"type\":\"image\",");
                        newContent.append("\"url\":\"").append(imageUrl).append("\",");
                        if (contentNode.has("text")) {
                            newContent.append("\"text\":\"").append(contentNode.get("text").asText()).append("\",");
                        }
                        newContent.append("\"fileName\":\"").append(fileName).append("\"");
                        newContent.append("}");

                        message.setContent(newContent.toString());
                    }
                }
            }
        } catch (Exception e) {
            log.error("处理图片消息失败", e);
            message.setContentType(MessageContentType.TEXT.getValue());
        }
    }
}
