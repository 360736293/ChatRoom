package org.example.entity;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class User {
    private String userId;
    private String username;
    private String avatar;
    private String status; // online, idle, dnd, offline
    private String currentChannel;

    public User() {
    }

    public User(String userId, String username, String avatar, String status) {
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.status = status;
        this.currentChannel = "频道1";
    }
}