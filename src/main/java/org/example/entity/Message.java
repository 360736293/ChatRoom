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

@Setter
@Getter
public class Message {
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

    public Message() {
        timestamp = LocalDateTime.now();
        //默认为文本类型
        contentType = MessageContentType.TEXT.getValue();
    }

    public Message(String type, String content, String author, String avatar, String channel, String userId) {
        this.type = type;
        this.content = content;
        this.author = author;
        this.avatar = avatar;
        this.channel = channel;
        this.userId = userId;
        timestamp = LocalDateTime.now();
        //默认为文本类型
        contentType = MessageContentType.TEXT.getValue();
    }
}

