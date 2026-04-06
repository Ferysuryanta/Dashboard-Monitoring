package com.mamregbkp.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.assertj.AssertableApplicationContext;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
class StartupComponentsConditionTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfig.class);
    @Test
    void startupMutatorsAreDisabledByDefault() {
        contextRunner.run(this::assertMutatorsDisabled);
    }
    @Test
    void schemaUpdaterLoadsOnlyWhenExplicitlyEnabled() {
        contextRunner.withPropertyValues("app.startup.schema-updater.enabled=true")
                .run(context -> assertThat(context.getBeansOfType(DatabaseSchemaUpdater.class)).hasSize(1));
    }
    @Test
    void februarySeederRequiresDevProfileAndExplicitFlag() {
        contextRunner.withPropertyValues(
                        "spring.profiles.active=dev",
                        "app.seed.bible-feb2026.enabled=true")
                .run(context -> assertThat(context.getBeansOfType(DataSeederRunner.class)).hasSize(1));
    }
    private void assertMutatorsDisabled(AssertableApplicationContext context) {
        assertThat(context.getBeansOfType(DatabaseSchemaUpdater.class)).isEmpty();
        assertThat(context.getBeansOfType(DataSeederRunner.class)).isEmpty();
    }
    @Import({DatabaseSchemaUpdater.class, DataSeederRunner.class})
    static class TestConfig {
        @Bean
        JdbcTemplate jdbcTemplate() {
            return mock(JdbcTemplate.class);
        }
    }
}
