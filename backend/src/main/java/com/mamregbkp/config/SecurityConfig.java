package com.mamregbkp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] READ_ROLES = {
            "VIEWER",
            "USER",
            "PENGURUS",
            "ADMIN",
            "SUPER_ADMIN"
    };

    private static final String[] OPERATIONAL_ROLES = {
            "PENGURUS",
            "ADMIN",
            "SUPER_ADMIN"
    };

    private static final String[] ADMIN_ROLES = {
            "ADMIN",
            "SUPER_ADMIN"
    };

    private static final String[] PUBLIC_AUTH_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/register"
    };

    private static final String[] PUBLIC_ACTUATOR_ENDPOINTS = {
            "/actuator/health",
            "/actuator/health/**",
            "/actuator/info"
    };

    private static final String[] SWAGGER_ENDPOINTS = {
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html"
    };

    private static final String[] AUTHENTICATED_AUTH_ENDPOINTS = {
            "/api/auth/me",
            "/api/auth/change-password",
            "/api/auth/profile",
            "/api/auth/logout"
    };

    private static final String[] PUBLIC_DASHBOARD_ENDPOINTS = {
            "/api/dashboard/summary-stats"
    };

    private static final String[] READ_ONLY_ENDPOINTS = {
            "/api/dashboard/**",
            "/api/members/**",
            "/api/attendance/**",
            "/api/bible-reading/**",
            "/api/programs/**",
            "/api/sectors/**",
            "/api/positions/**"
    };

    private static final String[] EXPORT_ENDPOINTS = {
            "/api/export/**",
            "/api/members/export"
    };

    private static final String[] ADMIN_MANAGED_ENDPOINTS = {
            "/api/finance/**",
            "/api/sectors/**",
            "/api/positions/**"
    };

    private static final String[] OPERATIONAL_WRITE_ENDPOINTS = {
            "/api/members/**",
            "/api/attendance/**",
            "/api/bible-reading/**",
            "/api/programs/**",
            "/api/programs/*/documents"
    };

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @Value("${monitoring.prometheus.public:false}")
    private boolean prometheusPublic;

    @Value("${app.cors.allowed-origins:http://localhost:4200,http://localhost:4201,http://127.0.0.1:4200,http://localhost:3000}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${app.cors.allowed-headers:Authorization,Content-Type,Accept,X-Requested-With,Origin}")
    private String allowedHeaders;

    @Value("${app.cors.exposed-headers:Authorization,Location,Content-Disposition}")
    private String exposedHeaders;

    @Value("${app.security.csp:default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:4200 http://localhost:4201 http://127.0.0.1:4200 http://localhost:3000 http://localhost:8080;}")
    private String contentSecurityPolicy;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        configureSecurityHeaders(http);
        configureAuthorization(http);

        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(parseCommaSeparatedValues(allowedOrigins));
        configuration.setAllowedMethods(parseCommaSeparatedValues(allowedMethods));
        configuration.setAllowedHeaders(parseCommaSeparatedValues(allowedHeaders));
        configuration.setExposedHeaders(parseCommaSeparatedValues(exposedHeaders));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void configureSecurityHeaders(HttpSecurity http) throws Exception {
        http.headers(headers -> headers
                .frameOptions(org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig::deny)
                .contentTypeOptions(contentTypeOptions -> {})
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .contentSecurityPolicy(csp -> csp.policyDirectives(contentSecurityPolicy))
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000)
                        .preload(true))
        );
    }

    private void configureAuthorization(HttpSecurity http) throws Exception {
        if (isDevMode() || !securityEnabled) {
            configureDevelopmentAuthorization(http);
            return;
        }

        configureProductionAuthorization(http);
    }

    private void configureDevelopmentAuthorization(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
                .requestMatchers(PUBLIC_ACTUATOR_ENDPOINTS).permitAll()
                .requestMatchers("/actuator/prometheus").permitAll()
                .requestMatchers(SWAGGER_ENDPOINTS).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll()
        );
    }

    private void configureProductionAuthorization(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
                .requestMatchers(PUBLIC_DASHBOARD_ENDPOINTS).permitAll()
                .requestMatchers(PUBLIC_ACTUATOR_ENDPOINTS).permitAll()
                .requestMatchers("/actuator/prometheus").access((authentication, context) ->
                        new AuthorizationDecision(
                                prometheusPublic || (authentication.get() != null && authentication.get().isAuthenticated())
                        ))
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(SWAGGER_ENDPOINTS).hasAnyRole(ADMIN_ROLES)
                .requestMatchers(AUTHENTICATED_AUTH_ENDPOINTS).authenticated()

                .requestMatchers(HttpMethod.GET, EXPORT_ENDPOINTS).hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.GET, "/api/finance/**").hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/finance/**").hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.PUT, ADMIN_MANAGED_ENDPOINTS).hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.PATCH, ADMIN_MANAGED_ENDPOINTS).hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/sectors/**", "/api/positions/**").hasAnyRole(ADMIN_ROLES)
                .requestMatchers(HttpMethod.DELETE, ADMIN_MANAGED_ENDPOINTS).hasAnyRole(ADMIN_ROLES)

                .requestMatchers(HttpMethod.POST, OPERATIONAL_WRITE_ENDPOINTS).hasAnyRole(OPERATIONAL_ROLES)
                .requestMatchers(HttpMethod.PUT, OPERATIONAL_WRITE_ENDPOINTS).hasAnyRole(OPERATIONAL_ROLES)
                .requestMatchers(HttpMethod.PATCH, OPERATIONAL_WRITE_ENDPOINTS).hasAnyRole(OPERATIONAL_ROLES)
                .requestMatchers(HttpMethod.DELETE, "/api/members/**", "/api/attendance/**", "/api/bible-reading/**", "/api/programs/**").hasAnyRole(ADMIN_ROLES)

                .requestMatchers(HttpMethod.GET, READ_ONLY_ENDPOINTS).hasAnyRole(READ_ROLES)
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll()
        );
    }

    private boolean isDevMode() {
        return environment.matchesProfiles("dev");
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

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);
        return authBuilder.build();
    }
}
