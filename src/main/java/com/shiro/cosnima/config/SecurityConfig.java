package com.shiro.cosnima.config;

import com.shiro.cosnima.security.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Configuration
public class SecurityConfig {

    private final JwtUtils jwtUtils;

    public SecurityConfig(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tell Spring Security to use your CorsConfig bean
                .cors(Customizer.withDefaults())
                // 2. Disable CSRF for JWT-based auth
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 3. Permit all OPTIONS requests (Browser pre-flights)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtils), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    static class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtUtils jwtUtils;

        public JwtAuthenticationFilter(JwtUtils jwtUtils) {
            this.jwtUtils = jwtUtils;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain)
                throws ServletException, IOException {

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    String username = jwtUtils.extractUsername(token);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        boolean valid = jwtUtils.validateToken(token, username);

                        if (valid) {
                            User userDetails = new User(username, "", Collections.emptyList());
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else {
                            // If token is invalid, don't let it reach the controller
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            return;
                        }
                    }
                } catch (Exception e) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }

            filterChain.doFilter(request, response);
        }
    }
}