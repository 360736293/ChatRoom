package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.constant.ChatConstants;
import org.example.constant.UserStatus;
import org.example.entity.User;
import org.example.event.UserListUpdateEvent;
import org.example.event.UserStatusChangeEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 用户管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final ApplicationEventPublisher eventPublisher;

    public User handleUserConnect(String userId) {
        User user = users.getOrDefault(userId, new User());

        if (user.getUsername() == null) {
            user.setUserId(userId);
            user.setUsername(userId);
            user.setAvatar(generateAvatar(userId));
        }

        user.setStatus(UserStatus.ONLINE.getValue());
        user.setCurrentChannel(ChatConstants.DEFAULT_CHANNEL);

        users.put(userId, user);

        // 发布用户列表更新事件
        eventPublisher.publishEvent(new UserListUpdateEvent(this));

        log.info("用户连接: {} ({})", userId, user.getUsername());
        return user;
    }

    public void handleUserDisconnect(String userId) {
        User user = users.get(userId);
        if (user != null) {
            user.setStatus(UserStatus.OFFLINE.getValue());
            // 发布用户列表更新事件
            eventPublisher.publishEvent(new UserListUpdateEvent(this));
        }
    }

    public User getUser(String userId) {
        return users.get(userId);
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    public void updateUserStatus(String userId, String status) {
        User user = users.get(userId);
        if (user != null) {
            user.setStatus(status);
            // 发布状态变更事件
            eventPublisher.publishEvent(new UserStatusChangeEvent(this, userId, status));
        }
    }

    public void updateUserChannel(String userId, String channel) {
        User user = users.get(userId);
        if (user != null) {
            user.setCurrentChannel(channel);
        }
    }

    public long getOnlineUserCount() {
        return users.values().stream()
                .filter(user -> UserStatus.ONLINE.getValue().equals(user.getStatus()))
                .count();
    }

    private String generateAvatar(String userId) {
        if (!StringUtils.hasText(userId)) {
            return "";
        }
        return String.valueOf(userId.charAt(0));
    }
}