package org.example.entity;

public class User {
    private String userId;
    private String username;
    private String avatar;
    private String status; // online, idle, dnd, offline
    private String currentChannel;

    public User() {}

    public User(String userId, String username, String avatar, String status) {
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.status = status;
        this.currentChannel = "频道1";
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentChannel() { return currentChannel; }
    public void setCurrentChannel(String currentChannel) { this.currentChannel = currentChannel; }
}