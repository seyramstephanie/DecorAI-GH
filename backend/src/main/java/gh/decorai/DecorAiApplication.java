package gh.decorai;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class DecorAiApplication {
  public static void main(String[] args) {
    // Root .env → system properties so spring.mail.* and ${MAIL_*} resolve
    DotEnv.loadIntoSystemProperties();
    SpringApplication.run(DecorAiApplication.class, args);
  }

  @Bean
  DataSource dataSource(Environment environment) {
    String databaseUrl = environment.getProperty("DATABASE_URL", "");
    if (databaseUrl.isBlank()) databaseUrl = DotEnv.get("DATABASE_URL");
    if (databaseUrl.isBlank()) {
      throw new IllegalStateException(
        "DATABASE_URL is required. Add the Neon Postgres URL to root .env or your environment."
      );
    }
    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setMaximumPoolSize(5);
    dataSource.setMinimumIdle(1);
    dataSource.setPoolName("decorai-neon");
    if (databaseUrl.startsWith("jdbc:")) {
      dataSource.setJdbcUrl(databaseUrl);
      dataSource.setUsername(environment.getProperty("DATABASE_USERNAME", ""));
      dataSource.setPassword(environment.getProperty("DATABASE_PASSWORD", ""));
      return dataSource;
    }
    URI uri = URI.create(databaseUrl);
    String userInfo = uri.getRawUserInfo() == null
      ? ""
      : URLDecoder.decode(uri.getRawUserInfo(), StandardCharsets.UTF_8);
    String[] credentials = userInfo.split(":", 2);
    String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
    dataSource.setJdbcUrl(
      "jdbc:postgresql://"
        + uri.getHost()
        + ":"
        + (uri.getPort() < 0 ? 5432 : uri.getPort())
        + uri.getRawPath()
        + query
    );
    dataSource.setUsername(credentials.length > 0 ? credentials[0] : "");
    dataSource.setPassword(credentials.length > 1 ? credentials[1] : "");
    return dataSource;
  }

  @Configuration
  static class CorsConfiguration {
    @Bean
    WebMvcConfigurer corsConfigurer() {
      return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
          registry
            .addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
            .allowedHeaders("*");
        }
      };
    }
  }
}
