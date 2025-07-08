package org.example.controller;

import org.example.websocket.ChatWebSocketServer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("onlineUsers", ChatWebSocketServer.getOnlineUserCount());
        stats.put("totalMessages", ChatWebSocketServer.getChannelMessageCount("频道1"));
        stats.put("serverStatus", "running");
        return stats;
    }
}
