package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StaticResourceController {

    @GetMapping("/")
    public String index() {
        return "index.html";
    }
}
