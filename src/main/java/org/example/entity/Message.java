package org.example.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import lombok.Getter;
import lombok.Setter;

import org.example.constant.MessageContentType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class Message {
    private String messageId;

    private String type;

    private String content;

    private String author;

    private String avatar;

    private String channel;

    private String userId;

    //消息内容类型
    private String contentType;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime timestamp;

    // @提及的用户列表
    private List<String> mentions = new ArrayList<>();

    public Message() {
        this.messageId = UUID.randomUUID().toString();
        timestamp = LocalDateTime.now();
        contentType = MessageContentType.TEXT.getValue();
    }

    public Message(String type, String content, String author, String avatar, String channel, String userId) {
        this.messageId = UUID.randomUUID().toString();
        this.type = type;
        this.content = content;
        this.author = author;
        this.avatar = avatar;
        this.channel = channel;
        this.userId = userId;
        timestamp = LocalDateTime.now();
        contentType = MessageContentType.TEXT.getValue();
    }

    public Message(String type, String content, String author, String avatar, String channel, String userId, List<String> mentions) {
        this.messageId = UUID.randomUUID().toString();
        this.type = type;
        this.content = content;
        this.author = author;
        this.avatar = avatar;
        this.channel = channel;
        this.userId = userId;
        this.mentions = mentions;
        timestamp = LocalDateTime.now();
        contentType = MessageContentType.TEXT.getValue();
    }
}

