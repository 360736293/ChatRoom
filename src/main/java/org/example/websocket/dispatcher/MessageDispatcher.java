package org.example.websocket.dispatcher;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.exception.InvalidMessageException;
import org.example.service.BroadcastService;
import org.example.service.ChannelService;
import org.example.websocket.handler.MessageHandler;
import org.springframework.stereotype.Component;

import javax.websocket.Session;
import java.util.List;

/**
 * 消息分发器，负责将消息分发给对应的处理器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessageDispatcher {

    private final List<MessageHandler> handlers;
    private final ObjectMapper objectMapper;
    private final ChannelService channelService;
    private final BroadcastService broadcastService;

    /**
     * 分发消息到对应的处理器
     */
    public void dispatch(String messageStr, User user, Session session) {
        try {
            // 解析消息
            Message message = objectMapper.readValue(messageStr, Message.class);

            // 查找合适的处理器
            MessageHandler handler = findHandler(message);
            if (handler != null) {
                handler.handle(message, user, session);
            } else {
                log.warn("未找到消息处理器: type={}", message.getType());
            }

        } catch (Exception e) {
            log.error("消息分发失败", e);
            throw new InvalidMessageException("无效的消息格式: " + e.getMessage());
        }
    }

    /**
     * 发送初始化数据
     */
    public void sendInitialData(Session session, User user) {
        try {
            // 发送历史消息
            channelService.sendChannelHistory(session, user.getCurrentChannel());

            // 广播用户列表更新
            broadcastService.broadcastUserList();

        } catch (Exception e) {
            log.error("发送初始化数据失败", e);
        }
    }

    private MessageHandler findHandler(Message message) {
        return handlers.stream()
                .filter(handler -> handler.canHandle(message))
                .findFirst()
                .orElse(null);
    }
}