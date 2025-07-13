package org.example.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 用户状态变更事件
 */
@Getter
public class UserStatusChangeEvent extends ApplicationEvent {
    private final String userId;
    private final String status;

    public UserStatusChangeEvent(Object source, String userId, String status) {
        super(source);
        this.userId = userId;
        this.status = status;
    }
}