package com.smarthome.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DatabaseUrlNormalizer implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DATABASE_URL");
        if (dbUrl == null) return;

        String normalized = toJdbcUrl(dbUrl);

        if (!normalized.equals(dbUrl)) {
            Map<String, Object> props = new HashMap<>();
            props.put("DATABASE_URL", normalized);
            environment.getPropertySources().addFirst(new MapPropertySource("normalizedDatabaseUrl", props));
        }
    }

    private String toJdbcUrl(String url) {
        String rest;
        if (url.startsWith("postgres://")) {
            rest = url.substring("postgres://".length());
        } else if (url.startsWith("postgresql://")) {
            rest = url.substring("postgresql://".length());
        } else {
            return url;
        }

        // rest = "user:password@host:port/db" or "host:port/db"
        int atIndex = rest.lastIndexOf('@');
        if (atIndex < 0) {
            return "jdbc:postgresql://" + rest;
        }

        String userInfo = rest.substring(0, atIndex);
        String hostInfo = rest.substring(atIndex + 1);

        String user = null;
        String password = null;
        int colonIndex = userInfo.indexOf(':');
        if (colonIndex >= 0) {
            user = userInfo.substring(0, colonIndex);
            password = userInfo.substring(colonIndex + 1);
        } else {
            user = userInfo;
        }

        // Produce: jdbc:postgresql://host:port/db?user=...&password=...
        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(hostInfo);
        boolean hasQuery = hostInfo.contains("?");
        if (user != null && !user.isEmpty()) {
            jdbc.append(hasQuery ? '&' : '?').append("user=").append(user);
            hasQuery = true;
        }
        if (password != null && !password.isEmpty()) {
            jdbc.append(hasQuery ? '&' : '?').append("password=").append(password);
        }
        return jdbc.toString();
    }
}
