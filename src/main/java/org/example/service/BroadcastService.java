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

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import javax.websocket.Session;

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
    
    // 上次广播的用户列表，用于减少重复广播
    private List<User> lastBroadcastedUserList = new CopyOnWriteArrayList<>();

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
            // 序列化消息一次，避免重复序列化
            String json = objectMapper.writeValueAsString(message);

            // 获取所有会话
            Map<String, Session> sessions = sessionManager.getAllSessions();
            
            // 批量发送消息
            List<Session> channelSessions = new ArrayList<>();
            for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                User user = userService.getUser(entry.getKey());
                if (user != null && channel.equals(user.getCurrentChannel()) && entry.getValue().isOpen()) {
                    channelSessions.add(entry.getValue());
                }
            }
            
            // 发送消息
            for (Session session : channelSessions) {
                try {
                    // 使用异步写入避免并发写入问题
                    session.getAsyncRemote().sendText(json);
                } catch (Exception e) {
                    log.error("发送消息失败", e);
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
            ChatConstants.SYSTEM_USERNAME,
            ChatConstants.SYSTEM_AVATAR,
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
            List<User> currentUserList = userService.getAllUsers();
            
            // 检查用户列表是否有变化，避免重复广播
            if (isUserListChanged(currentUserList)) {
                Map<String, Object> userListMsg = new HashMap<>();
                userListMsg.put("type", MessageType.USER_LIST.getValue());
                userListMsg.put("users", currentUserList);

                String json = objectMapper.writeValueAsString(userListMsg);

                Map<String, Session> sessions = sessionManager.getAllSessions();
                for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                    if (entry.getValue().isOpen()) {
                        try {
                            // 使用异步写入避免并发写入问题
                            entry.getValue().getAsyncRemote().sendText(json);
                        } catch (Exception e) {
                            log.error("发送用户列表失败: userId={}", entry.getKey(), e);
                        }
                    }
                }
                
                // 更新上次广播的用户列表，创建用户对象的深拷贝
                List<User> copiedUserList = new CopyOnWriteArrayList<>();
                for (User user : currentUserList) {
                    User copiedUser = new User();
                    copiedUser.setUserId(user.getUserId());
                    copiedUser.setUsername(user.getUsername());
                    copiedUser.setAvatar(user.getAvatar());
                    copiedUser.setStatus(user.getStatus());
                    copiedUser.setCurrentChannel(user.getCurrentChannel());
                    copiedUserList.add(copiedUser);
                }
                lastBroadcastedUserList = copiedUserList;
            }
        } catch (Exception e) {
            log.error("广播用户列表失败", e);
        }
    }
    
    /**
     * 检查用户列表是否有变化
     */
    private boolean isUserListChanged(List<User> currentUserList) {
        if (currentUserList.size() != lastBroadcastedUserList.size()) {
            return true;
        }
        
        for (int i = 0; i < currentUserList.size(); i++) {
            User currentUser = currentUserList.get(i);
            User lastUser = lastBroadcastedUserList.get(i);
            
            if (!currentUser.getUserId().equals(lastUser.getUserId()) ||
                !currentUser.getStatus().equals(lastUser.getStatus())) {
                return true;
            }
        }
        
        return false;
    }
}
