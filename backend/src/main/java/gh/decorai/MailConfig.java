package gh.decorai;

import java.util.Properties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
class MailConfig {

  /**
   * Builds a Gmail-ready sender from DotEnv / system properties.
   * Credentials are re-applied at send time in DecorAiController as well.
   */
  @Bean
  JavaMailSender javaMailSender() {
    return createSender();
  }

  static JavaMailSenderImpl createSender() {
    String host = firstNonBlank(DotEnv.get("MAIL_HOST"), "smtp.gmail.com");
    String portStr = firstNonBlank(DotEnv.get("MAIL_PORT"), "587");
    String username = DotEnv.get("MAIL_USERNAME");
    String password = DotEnv.get("MAIL_PASSWORD");

    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost(host);
    sender.setPort(Integer.parseInt(portStr));
    sender.setUsername(username);
    sender.setPassword(password);
    sender.setDefaultEncoding("UTF-8");

    Properties props = sender.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    props.put("mail.smtp.starttls.required", "true");
    props.put("mail.smtp.ssl.trust", host);
    props.put("mail.smtp.ssl.protocols", "TLSv1.2");
    props.put("mail.smtp.connectiontimeout", "15000");
    props.put("mail.smtp.timeout", "15000");
    props.put("mail.smtp.writetimeout", "15000");
    props.put("mail.debug", "false");

    if (username.isBlank() || password.isBlank()) {
      System.err.println(
        "[mail] MAIL_USERNAME / MAIL_PASSWORD missing — password-reset emails will fall back to on-screen code."
      );
    } else {
      System.out.println("[mail] SMTP ready: " + username + " @ " + host + ":" + portStr
        + " (password length " + password.length() + ")");
    }
    return sender;
  }

  private static String firstNonBlank(String a, String b) {
    return a != null && !a.isBlank() ? a.trim() : (b == null ? "" : b);
  }
}
