package com.mamregbkp.config;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import static org.assertj.core.api.Assertions.assertThat;
class RestAuthenticationEntryPointTest {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    @Test
    void commenceWritesStandardUnauthorizedPayload() throws Exception {
        RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/members");
        MockHttpServletResponse response = new MockHttpServletResponse();
        entryPoint.commence(request, response, new BadCredentialsException("bad credentials"));
        JsonNode json = objectMapper.readTree(response.getContentAsByteArray());
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(json.get("code").asText()).isEqualTo("UNAUTHORIZED");
        assertThat(json.get("message").asText()).contains("Autentikasi diperlukan");
        assertThat(json.get("path").asText()).isEqualTo("/api/members");
    }
}
