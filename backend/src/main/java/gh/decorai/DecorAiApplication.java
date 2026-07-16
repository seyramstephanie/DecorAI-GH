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
    // Disable system / SOCKS proxies so Gmail SMTP and Neon JDBC use direct sockets
    System.setProperty("java.net.useSystemProxies", "false");
    System.clearProperty("socksProxyHost");
    System.clearProperty("socksProxyPort");
    System.clearProperty("http.proxyHost");
    System.clearProperty("https.proxyHost");
    // Root .env → system properties so MAIL_* / DATABASE_URL resolve
    DotEnv.loadIntoSystemProperties();
    SpringApplication.run(DecorAiApplication.class, args);
  }

  @Bean
  DataSource dataSource(Environment environment) {
    String databaseUrl = environment.getProperty("DATABASE_URL", "");
    if (databaseUrl.isBlank()) databaseUrl = DotEnv.get("DATABASE_URL");
    // Prefer pooled URL if provided separately
    String pooled = environment.getProperty("DATABASE_URL_POOLED", "");
    if (pooled.isBlank()) pooled = DotEnv.get("DATABASE_URL_POOLED");
    if (!pooled.isBlank()) databaseUrl = pooled;
    if (databaseUrl.isBlank()) {
      throw new IllegalStateException(
        "DATABASE_URL is required. Add the Neon Postgres URL to root .env (Console → Connect)."
      );
    }
    // Neon: use PgBouncer pooler hostname for Spring/Hikari apps
    // https://neon.com/docs/connect/connection-pooling
    databaseUrl = ensureNeonPooler(databaseUrl);
    System.out.println("[neon] JDBC host=" + hostOf(databaseUrl));

    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setMaximumPoolSize(5);
    dataSource.setMinimumIdle(1);
    dataSource.setPoolName("decorai-neon");
    // Neon closes idle TCP; recycle before that (see Neon Hikari guidance)
    dataSource.setMaxLifetime(180_000);   // 3 min
    dataSource.setIdleTimeout(60_000);
    dataSource.setKeepaliveTime(30_000);
    dataSource.setConnectionTimeout(20_000);
    dataSource.setValidationTimeout(5_000);
    dataSource.setConnectionTestQuery("SELECT 1");
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

  /** Insert -pooler into Neon endpoint host if missing. */
  static String ensureNeonPooler(String url) {
    if (url == null || url.isBlank()) return url;
    if (url.contains("-pooler.")) return url;
    // ep-xxx.region.aws.neon.tech → ep-xxx-pooler.region.aws.neon.tech
    if (url.contains(".neon.tech")) {
      return url.replaceFirst("@(ep-[a-z0-9-]+)\\.", "@$1-pooler.");
    }
    return url;
  }

  private static String hostOf(String url) {
    try {
      String u = url.startsWith("jdbc:") ? url.substring(5) : url;
      return URI.create(u).getHost();
    } catch (Exception e) {
      return "(unknown)";
    }
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
