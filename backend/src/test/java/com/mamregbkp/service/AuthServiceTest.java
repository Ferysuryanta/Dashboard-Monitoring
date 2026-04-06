package com.mamregbkp.service;
import com.mamregbkp.dto.LoginRequest;
import com.mamregbkp.dto.LoginResponse;
import com.mamregbkp.dto.LogoutRequest;
import com.mamregbkp.dto.RefreshTokenRequest;
import com.mamregbkp.model.AppUser;
import com.mamregbkp.model.UserRole;
import com.mamregbkp.model.UserSession;
import com.mamregbkp.repository.AppUserRepository;
import com.mamregbkp.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private AppUserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserSessionRepository userSessionRepository;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private HttpServletRequest httpServletRequest;
    @InjectMocks
    private AuthService authService;
    @Captor
    private ArgumentCaptor<UserSession> userSessionCaptor;
    @Test
    void loginCreatesSessionAndReturnsTokens() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("secret");
        AppUser user = AppUser.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .email("admin@mamre.test")
                .fullName("Administrator")
                .role(UserRole.ADMIN)
                .failedLoginAttempts(0)
                .isActive(true)
                .build();
        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(userRepository.findByUsernameOrEmail("admin")).thenReturn(Optional.of(user));
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(invocation -> {
            UserSession session = invocation.getArgument(0);
            if (session.getId() == null) {
                session.setId(UUID.randomUUID());
            }
            return session;
        });
        when(jwtService.getRefreshExpirationTime()).thenReturn(120_000L);
        when(jwtService.getExpirationTime()).thenReturn(3_600_000L);
        when(jwtService.generateAccessToken(eq(user), any(UUID.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(eq(user), any(UUID.class))).thenReturn("refresh-token");
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader(anyString())).thenReturn(null);
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("JUnit");
        when(httpServletRequest.getHeader("Sec-CH-UA-Platform")).thenReturn("Windows");
        LoginResponse response = authService.login(request, authenticationManager, httpServletRequest);
        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getExpiresIn()).isEqualTo(3600L);
        verify(userSessionRepository, times(2)).save(userSessionCaptor.capture());
        UserSession finalSession = userSessionCaptor.getAllValues().get(1);
        assertThat(finalSession.getId()).isNotNull();
        assertThat(finalSession.getUser()).isEqualTo(user);
        assertThat(finalSession.getTokenHash()).isEqualTo(sha256("refresh-token"));
        assertThat(finalSession.getIpAddress()).isEqualTo("127.0.0.1");
    }
    @Test
    void refreshTokenRotatesStoredSessionToken() {
        UUID sessionId = UUID.randomUUID();
        AppUser user = AppUser.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .email("admin@mamre.test")
                .fullName("Administrator")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();
        UserSession session = UserSession.builder()
                .id(sessionId)
                .user(user)
                .isActive(true)
                .tokenHash(sha256("old-refresh"))
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("old-refresh");
        when(jwtService.isRefreshToken("old-refresh")).thenReturn(true);
        when(jwtService.extractUsername("old-refresh")).thenReturn("admin");
        when(jwtService.extractSessionId("old-refresh")).thenReturn(sessionId);
        when(jwtService.isTokenValid("old-refresh", user)).thenReturn(true);
        when(jwtService.getRefreshExpirationTime()).thenReturn(600_000L);
        when(jwtService.getExpirationTime()).thenReturn(3_600_000L);
        when(jwtService.generateAccessToken(user, sessionId)).thenReturn("new-access");
        when(jwtService.generateRefreshToken(user, sessionId)).thenReturn("new-refresh");
        when(userRepository.findByUsernameOrEmail("admin")).thenReturn(Optional.of(user));
        when(userSessionRepository.findByIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(session));
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader(anyString())).thenReturn(null);
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("JUnit");
        LoginResponse response = authService.refreshToken(request, httpServletRequest);
        assertThat(response.getToken()).isEqualTo("new-access");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
        verify(userSessionRepository).save(userSessionCaptor.capture());
        assertThat(userSessionCaptor.getValue().getTokenHash()).isEqualTo(sha256("new-refresh"));
        assertThat(userSessionCaptor.getValue().getIsActive()).isTrue();
    }
    @Test
    void logoutRevokesActiveSessionFromAccessToken() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        AppUser user = AppUser.builder().id(userId).username("admin").build();
        UserSession session = UserSession.builder()
                .id(sessionId)
                .user(user)
                .isActive(true)
                .tokenHash(sha256("refresh"))
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();
        when(jwtService.extractSessionId("access-token")).thenReturn(sessionId);
        when(userSessionRepository.findByIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(session));
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        authService.logout(userId, "Bearer access-token", new LogoutRequest());
        verify(userSessionRepository).save(userSessionCaptor.capture());
        assertThat(userSessionCaptor.getValue().getIsActive()).isFalse();
    }
    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
