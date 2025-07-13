package org.example.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 消息类型枚举
 */
@Getter
@RequiredArgsConstructor
public enum MessageType {
    CHAT("chat"),
    SYSTEM("system"),
    USER_LIST("user_list"),
    JOIN_CHANNEL("join_channel"),
    STATUS_CHANGE("status_change"),
    TYPING_START("typing_start"),
    TYPING_STOP("typing_stop");

    private final String value;

    public static MessageType fromValue(String value) {
        for (MessageType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}