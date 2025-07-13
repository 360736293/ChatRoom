package org.example.exception;

/**
 * 聊天系统基础异常
 */
public class ChatException extends RuntimeException {
    public ChatException(String message) {
        super(message);
    }

    public ChatException(String message, Throwable cause) {
        super(message, cause);
    }
}