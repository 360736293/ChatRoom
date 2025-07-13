package org.example.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 会话管理器，负责管理WebSocket会话
 */
@Slf4j
@Service
public class SessionManager {

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public void addSession(String userId, Session session) {
        sessions.put(userId, session);
        log.debug("添加会话: userId={}", userId);
    }

    public void removeSession(String userId) {
        sessions.remove(userId);
        log.debug("移除会话: userId={}", userId);
    }

    public Session getSession(String userId) {
        return sessions.get(userId);
    }

    public Map<String, Session> getAllSessions() {
        return new ConcurrentHashMap<>(sessions);
    }

    public boolean isSessionOpen(String userId) {
        Session session = sessions.get(userId);
        return session != null && session.isOpen();
    }

    public void sendMessage(String userId, String message) {
        Session session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                log.error("发送消息失败: userId={}", userId, e);
            }
        }
    }
}