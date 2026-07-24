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

        String normalized = dbUrl;
        if (dbUrl.startsWith("postgres://")) {
            normalized = "jdbc:postgresql://" + dbUrl.substring("postgres://".length());
        } else if (dbUrl.startsWith("postgresql://")) {
            normalized = "jdbc:postgresql://" + dbUrl.substring("postgresql://".length());
        }

        if (!normalized.equals(dbUrl)) {
            Map<String, Object> props = new HashMap<>();
            props.put("DATABASE_URL", normalized);
            environment.getPropertySources().addFirst(new MapPropertySource("normalizedDatabaseUrl", props));
        }
    }
}
