package org.example.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 消息内容类型枚举
 */
@Getter
@RequiredArgsConstructor
public enum MessageContentType {
    TEXT("text"),
    IMAGE("image");

    private final String value;

    public static MessageContentType fromValue(String value) {
        for (MessageContentType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}
