package org.example.websocket.handler;

import org.example.entity.Message;
import org.example.entity.User;
import javax.websocket.Session;

/**
 * 消息处理器接口
 */
public interface MessageHandler {
    /**
     * 判断是否可以处理该消息
     */
    boolean canHandle(Message message);

    /**
     * 处理消息
     */
    void handle(Message message, User user, Session session);
}