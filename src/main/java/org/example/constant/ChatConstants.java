package org.example.constant;

/**
 * 聊天系统常量
 */
public class ChatConstants {
    public static final String DEFAULT_CHANNEL = "频道1";

    public static final String SYSTEM_USER_ID = "system";

    public static final String SYSTEM_USERNAME = "系统";

    public static final String SYSTEM_AVATAR = "S";

    // 消息相关常量
    public static final int MAX_MESSAGE_SIZE = 1024 * 1024 * 1024; // 1GB

    private ChatConstants() {
        // 防止实例化
    }
}
