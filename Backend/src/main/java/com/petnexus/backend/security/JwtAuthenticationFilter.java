package com.petnexus.backend.security;

import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Filter that intercepts incoming HTTP requests, checks for the Authorization header
 * with Bearer token, validates the JWT, and populates the SecurityContext.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7).trim();
        if (jwt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String userEmail = jwtService.extractEmail(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                userRepository.findByEmail(userEmail.toLowerCase()).ifPresent(user -> {
                    if (user.getStatus() == UserStatus.Active && jwtService.isTokenValid(jwt, user)) {
                        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                        );
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                authorities
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Successfully authenticated principal for user: {}", user.getEmail());
                    }
                });
            }
        } catch (Exception e) {
            log.debug("JWT authentication filter: failed to authenticate token ({})", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
