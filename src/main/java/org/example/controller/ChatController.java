package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.constant.ChatConstants;
import org.example.service.ChannelService;
import org.example.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final UserService userService;
    private final ChannelService channelService;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("onlineUsers", userService.getOnlineUserCount());
        stats.put("totalMessages", channelService.getChannelMessageCount(ChatConstants.DEFAULT_CHANNEL));
        stats.put("serverStatus", "running");
        return stats;
    }
}
