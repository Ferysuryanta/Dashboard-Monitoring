package com.mamregbkp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

/**
 * Global web configuration:
 *  - Enable stable Page<T> serialization via DTO
 *  - Provide global CORS config for frontend
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${app.cors.allowed-headers:Authorization,Content-Type,Accept,X-Requested-With,Origin}")
    private String allowedHeaders;

    @Value("${app.cors.exposed-headers:Authorization,Location,Content-Disposition}")
    private String exposedHeaders;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(parseCommaSeparatedValues(allowedOrigins).toArray(String[]::new))
                .allowedMethods(parseCommaSeparatedValues(allowedMethods).toArray(String[]::new))
                .allowedHeaders(parseCommaSeparatedValues(allowedHeaders).toArray(String[]::new))
                .exposedHeaders(parseCommaSeparatedValues(exposedHeaders).toArray(String[]::new))
                .allowCredentials(true)
                .maxAge(3600);
    }

    private List<String> parseCommaSeparatedValues(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(entry -> !entry.isEmpty())
                .distinct()
                .toList();
    }
}
