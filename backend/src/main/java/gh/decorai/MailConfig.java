package gh.decorai;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
class MailConfig {
  @Bean
  JavaMailSender javaMailSender(Environment env) {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost(env.getProperty("spring.mail.host", firstNonBlank(readDotEnv("MAIL_HOST"), "smtp.gmail.com")));
    sender.setPort(Integer.parseInt(env.getProperty("spring.mail.port", firstNonBlank(readDotEnv("MAIL_PORT"), "587"))));
    sender.setUsername(env.getProperty("spring.mail.username", firstNonBlank(readDotEnv("MAIL_USERNAME"), "")));
    sender.setPassword(env.getProperty("spring.mail.password", firstNonBlank(readDotEnv("MAIL_PASSWORD"), "")));
    Properties props = sender.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    props.put("mail.debug", "false");
    return sender;
  }

  private static String firstNonBlank(String a, String b) {
    return a != null && !a.isBlank() ? a : b;
  }

  private static String readDotEnv(String key) {
    for (Path candidate : new Path[]{Path.of(".env"), Path.of("..", ".env")}) {
      try {
        for (String line : Files.readAllLines(candidate)) {
          if (line.startsWith(key + "=")) {
            return line.substring(key.length() + 1).trim().replaceAll("^['\"]|['\"]$", "");
          }
        }
      } catch (Exception ignored) { }
    }
    return "";
  }
}
