package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.ChatConstants;
import org.example.constant.MessageType;
import org.example.entity.Message;
import org.example.entity.User;
import org.example.event.UserListUpdateEvent;
import org.example.event.UserStatusChangeEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import javax.websocket.Session;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 广播服务，负责消息广播
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BroadcastService {

    private final SessionManager sessionManager;
    private final UserService userService;
    private final ChannelService channelService;
    private final ObjectMapper objectMapper;

    /**
     * 监听用户列表更新事件
     */
    @EventListener
    public void handleUserListUpdate(UserListUpdateEvent event) {
        broadcastUserList();
    }

    /**
     * 监听用户状态变更事件
     */
    @EventListener
    public void handleUserStatusChange(UserStatusChangeEvent event) {
        broadcastUserList();
    }

    /**
     * 广播消息到指定频道
     */
    public void broadcastToChannel(Message message, String channel) {
        try {
            String json = objectMapper.writeValueAsString(message);

            Map<String, Session> sessions = sessionManager.getAllSessions();
            for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                User user = userService.getUser(entry.getKey());
                if (user != null && channel.equals(user.getCurrentChannel()) && entry.getValue().isOpen()) {
                    try {
                        entry.getValue().getBasicRemote().sendText(json);
                    } catch (IOException e) {
                        log.error("发送消息失败: userId={}", entry.getKey(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("广播消息失败", e);
        }
    }

    /**
     * 广播系统消息
     */
    public void broadcastSystemMessage(String content, String channel) {
        Message systemMsg = new Message(
                MessageType.SYSTEM.getValue(),
                content,
                "系统",
                "S",
                channel,
                ChatConstants.SYSTEM_USER_ID
        );

        // 保存到历史记录
        channelService.addMessage(channel, systemMsg);

        // 广播消息
        broadcastToChannel(systemMsg, channel);
    }

    /**
     * 广播用户列表
     */
    public void broadcastUserList() {
        try {
            List<User> userList = userService.getAllUsers();

            Map<String, Object> userListMsg = new HashMap<>();
            userListMsg.put("type", "user_list");
            userListMsg.put("users", userList);

            String json = objectMapper.writeValueAsString(userListMsg);

            Map<String, Session> sessions = sessionManager.getAllSessions();
            for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                if (entry.getValue().isOpen()) {
                    try {
                        entry.getValue().getBasicRemote().sendText(json);
                    } catch (IOException e) {
                        log.error("发送用户列表失败: userId={}", entry.getKey(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("广播用户列表失败", e);
        }
    }
}