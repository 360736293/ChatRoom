package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.entity.Message;
import org.springframework.stereotype.Service;

import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 频道管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChannelService {

    private final Map<String, List<Message>> channelMessages = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public void addMessage(String channel, Message message) {
        channelMessages.computeIfAbsent(channel, k -> new ArrayList<>()).add(message);
    }

    public List<Message> getChannelMessages(String channel) {
        return channelMessages.getOrDefault(channel, new ArrayList<>());
    }

    public int getChannelMessageCount(String channel) {
        return getChannelMessages(channel).size();
    }

    public void sendChannelHistory(Session session, String channel) {
        try {
            List<Message> history = getChannelMessages(channel);

            for (Message msg : history) {
                String json = objectMapper.writeValueAsString(msg);
                session.getBasicRemote().sendText(json);
            }

        } catch (IOException e) {
            log.error("发送频道历史消息失败", e);
        }
    }
}