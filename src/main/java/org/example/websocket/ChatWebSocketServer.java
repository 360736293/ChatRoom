package org.example.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.entity.Message;
import org.example.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/websocket/{userId}")
@Component
public class ChatWebSocketServer {

    //存储所有连接的用户会话
    private static Map<String, Session> sessions = new ConcurrentHashMap<>();

    //存储用户信息
    private static Map<String, User> users = new ConcurrentHashMap<>();

    //频道消息历史记录
    private static Map<String, List<Message>> channelMessages = new ConcurrentHashMap<>();

    //JSON处理器
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        try {
            sessions.put(userId, session);
            //创建新用户或更新用户状态
            User user = users.getOrDefault(userId, new User());
            if (user.getUsername() == null) {
                user.setUserId(userId);
                user.setUsername(userId);
                if (ObjectUtils.isEmpty(userId)) {
                    user.setAvatar("");
                } else {
                    user.setAvatar(String.valueOf(userId.charAt(0)));
                }
            }
            user.setStatus("online");
            user.setCurrentChannel("频道1");
            users.put(userId, user);
            //发送历史消息
            sendChannelHistory(session, user.getCurrentChannel());
            //广播用户列表更新
            broadcastUserList();
            System.out.println("用户连接: " + userId + " (" + user.getUsername() + ")");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnMessage
    public void onMessage(String messageStr, Session session, @PathParam("userId") String userId) {
        try {
            Message message = objectMapper.readValue(messageStr, Message.class);
            User user = users.get(userId);
            if (user == null) return;
            switch (message.getType()) {
                case "chat":
                    handleChatMessage(message, user);
                    break;
                case "join_channel":
                    handleChannelJoin(message, user, session);
                    break;
                case "status_change":
                    handleStatusChange(message, user);
                    break;
                case "typing_start":
                case "typing_stop":
                    handleTyping(message, user);
                    break;
                default:
                    System.out.println("未知消息类型: " + message.getType());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        try {
            sessions.remove(userId);
            User user = users.get(userId);
            if (user != null) {
                user.setStatus("offline");
                //广播用户列表更新
                broadcastUserList();
            }
            System.out.println("用户断开连接: " + userId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.err.println("WebSocket错误: " + error.getMessage());
        error.printStackTrace();
    }

    //处理聊天消息
    private void handleChatMessage(Message message, User user) {
        message.setAuthor(user.getUsername());
        message.setAvatar(user.getAvatar());
        message.setUserId(user.getUserId());
        message.setTimestamp(LocalDateTime.now());
        //保存消息到历史记录
        channelMessages.computeIfAbsent(message.getChannel(), k -> new ArrayList<>()).add(message);
        //广播消息到指定频道
        broadcastToChannel(message, message.getChannel());
    }

    //处理频道加入
    private void handleChannelJoin(Message message, User user, Session session) {
        String newChannel = message.getChannel();
        user.setCurrentChannel(newChannel);
        //发送频道历史消息
        sendChannelHistory(session, newChannel);
        //广播用户列表更新
        broadcastUserList();
    }

    //处理状态变更
    private void handleStatusChange(Message message, User user) {
        user.setStatus(message.getContent());
        //广播用户列表更新
        broadcastUserList();
    }

    //处理用户输入
    private void handleTyping(Message message, User user) {
        message.setUserId(user.getUserId());
        message.setAuthor(user.getUsername());
        broadcastToChannel(message, message.getChannel());
    }

    //发送频道历史消息
    private void sendChannelHistory(Session session, String channel) {
        try {
            List<Message> history = channelMessages.getOrDefault(channel, new ArrayList<>());

            //发送最近50条消息
            int start = Math.max(0, history.size() - 50);
            for (int i = start; i < history.size(); i++) {
                Message msg = history.get(i);
                String json = objectMapper.writeValueAsString(msg);
                session.getBasicRemote().sendText(json);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //广播消息到指定频道
    private void broadcastToChannel(Message message, String channel) {
        try {
            String json = objectMapper.writeValueAsString(message);
            for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                User user = users.get(entry.getKey());
                if (user != null && channel.equals(user.getCurrentChannel()) && entry.getValue().isOpen()) {
                    try {
                        entry.getValue().getBasicRemote().sendText(json);
                    } catch (IOException e) {
                        System.err.println("发送消息失败: " + entry.getKey());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //广播系统消息
    private void broadcastSystemMessage(String content, String channel) {
        Message systemMsg = new Message("system", content, "系统", "S", channel, "system");
        //保存到历史记录
        channelMessages.computeIfAbsent(channel, s -> new ArrayList<>()).add(systemMsg);
        //广播消息
        broadcastToChannel(systemMsg, channel);
    }

    //广播用户列表
    private void broadcastUserList() {
        try {
            List<User> userList = new ArrayList<>(users.values());
            Map<String, Object> userListMsg = new HashMap<>();
            userListMsg.put("type", "user_list");
            userListMsg.put("users", userList);
            String json = objectMapper.writeValueAsString(userListMsg);
            for (Map.Entry<String, Session> entry : sessions.entrySet()) {
                if (entry.getValue().isOpen()) {
                    try {
                        entry.getValue().getBasicRemote().sendText(json);
                    } catch (IOException e) {
                        System.err.println("发送用户列表失败: " + entry.getKey());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //获取在线用户数量
    public static int getOnlineUserCount() {
        return (int) users.values().stream()
                .filter(user -> "online".equals(user.getStatus()))
                .count();
    }

    //获取频道消息数量
    public static int getChannelMessageCount(String channel) {
        return channelMessages.getOrDefault(channel, new ArrayList<>()).size();
    }
}
