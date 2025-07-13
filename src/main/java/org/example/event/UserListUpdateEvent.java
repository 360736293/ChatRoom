package org.example.event;

import org.springframework.context.ApplicationEvent;

/**
 * 用户列表更新事件
 */
public class UserListUpdateEvent extends ApplicationEvent {
    public UserListUpdateEvent(Object source) {
        super(source);
    }
}