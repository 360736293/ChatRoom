package org.example.exception;

/**
 * 无效消息异常
 */
public class InvalidMessageException extends ChatException {
    public InvalidMessageException(String message) {
        super(message);
    }

    public InvalidMessageException(String message, Throwable cause) {
        super(message, cause);
    }
}