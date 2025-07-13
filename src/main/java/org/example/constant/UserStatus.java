package org.example.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 用户状态枚举
 */
@Getter
@RequiredArgsConstructor
public enum UserStatus {
    ONLINE("online"),
    IDLE("idle"),
    DND("dnd"),
    OFFLINE("offline");

    private final String value;

    public static UserStatus fromValue(String value) {
        for (UserStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        return null;
    }
}