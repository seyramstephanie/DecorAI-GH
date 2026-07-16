package gh.decorai;

import java.util.Properties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
class MailConfig {

  @Bean
  JavaMailSender javaMailSender() {
    // Default bean — actual sends use createSender() with direct sockets
    return createSender(587, false);
  }

  /**
   * Gmail SMTP with Proxy.NO_PROXY sockets so Windows/proxy does not break Java mail.
   *
   * @param port 587 (STARTTLS) or 465 (SSL)
   * @param ssl  true for SMTPS on 465
   */
  static JavaMailSenderImpl createSender(int port, boolean ssl) {
    String host = firstNonBlank(DotEnv.get("MAIL_HOST"), "smtp.gmail.com");
    String username = DotEnv.get("MAIL_USERNAME");
    String password = DotEnv.get("MAIL_PASSWORD");

    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost(host);
    sender.setPort(port);
    sender.setUsername(username);
    sender.setPassword(password);
    sender.setDefaultEncoding("UTF-8");
    if (ssl) {
      sender.setProtocol("smtps");
    }

    Properties props = sender.getJavaMailProperties();
    props.put("mail.transport.protocol", ssl ? "smtps" : "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtps.auth", "true");
    props.put("mail.smtp.host", host);
    props.put("mail.smtp.port", String.valueOf(port));
    props.put("mail.smtps.host", host);
    props.put("mail.smtps.port", String.valueOf(port));

    // Force direct sockets (no SOCKS / system proxy) — class must be on classpath
    props.put("mail.smtp.socketFactory.class", DirectSocketFactory.class.getName());
    props.put("mail.smtp.socketFactory.fallback", "false");
    props.put("mail.smtp.socketFactory.port", String.valueOf(port));
    props.put("mail.smtps.socketFactory.class", DirectSslSocketFactory.class.getName());
    props.put("mail.smtps.socketFactory.fallback", "false");
    props.put("mail.smtps.socketFactory.port", String.valueOf(port));
    props.put("mail.smtp.ssl.socketFactory.class", DirectSslSocketFactory.class.getName());
    props.put("mail.smtp.ssl.socketFactory.port", String.valueOf(port));

    if (ssl) {
      props.put("mail.smtp.ssl.enable", "true");
      props.put("mail.smtps.ssl.enable", "true");
      props.put("mail.smtp.ssl.checkserveridentity", "true");
    } else {
      props.put("mail.smtp.starttls.enable", "true");
      props.put("mail.smtp.starttls.required", "true");
      props.put("mail.smtp.ssl.enable", "false");
    }

    props.put("mail.smtp.ssl.trust", host);
    props.put("mail.smtps.ssl.trust", host);
    props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
    props.put("mail.smtps.ssl.protocols", "TLSv1.2 TLSv1.3");

    props.put("mail.smtp.connectiontimeout", "12000");
    props.put("mail.smtp.timeout", "15000");
    props.put("mail.smtp.writetimeout", "15000");
    props.put("mail.smtps.connectiontimeout", "12000");
    props.put("mail.smtps.timeout", "15000");
    props.put("mail.smtps.writetimeout", "15000");

    // Empty proxy hosts so Jakarta Mail does not pick up system proxy
    props.put("mail.smtp.proxy.host", "");
    props.put("mail.smtp.socks.host", "");
    props.put("mail.smtps.proxy.host", "");
    props.put("mail.smtps.socks.host", "");

    props.put("mail.debug", "false");
    return sender;
  }

  private static String firstNonBlank(String a, String b) {
    return a != null && !a.isBlank() ? a.trim() : (b == null ? "" : b);
  }
}
