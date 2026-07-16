package gh.decorai;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Loads root project .env reliably no matter whether the JVM cwd is
 * project root or backend/.
 */
public final class DotEnv {
  private DotEnv() {}

  /** Call once before SpringApplication.run. Does not overwrite real OS env vars. */
  public static void loadIntoSystemProperties() {
    Map<String, String> values = readAll();
    System.out.println("[env] Loaded " + values.size() + " keys from .env (cwd=" + Path.of("").toAbsolutePath() + ")");
    for (Map.Entry<String, String> e : values.entrySet()) {
      String key = e.getKey();
      String value = e.getValue();
      String fromEnv = System.getenv(key);
      if (fromEnv != null && !fromEnv.isBlank()) continue;
      if (System.getProperty(key) != null && !System.getProperty(key).isBlank()) continue;
      if ("MAIL_PASSWORD".equals(key)) value = value.replace(" ", "");
      System.setProperty(key, value);
    }
    String mailUser = get("MAIL_USERNAME");
    String mailPass = get("MAIL_PASSWORD");
    System.out.println(
      "[env] MAIL_USERNAME=" + (mailUser.isBlank() ? "(empty)" : mailUser)
        + " MAIL_PASSWORD=" + (mailPass.isBlank() ? "(empty)" : ("set, len=" + mailPass.length()))
    );
  }

  public static String get(String key) {
    String fromEnv = System.getenv(key);
    if (fromEnv != null && !fromEnv.isBlank()) {
      return normalize(key, fromEnv);
    }
    String fromProp = System.getProperty(key);
    if (fromProp != null && !fromProp.isBlank()) {
      return normalize(key, fromProp);
    }
    return normalize(key, readAll().getOrDefault(key, ""));
  }

  private static String normalize(String key, String value) {
    if (value == null) return "";
    String v = value.trim();
    if ("MAIL_PASSWORD".equals(key)) v = v.replace(" ", "");
    return v;
  }

  static Map<String, String> readAll() {
    Map<String, String> out = new LinkedHashMap<>();
    for (Path candidate : candidates()) {
      if (!Files.isRegularFile(candidate)) continue;
      try {
        for (String raw : Files.readAllLines(candidate, StandardCharsets.UTF_8)) {
          String line = stripBom(raw).trim();
          if (line.isEmpty() || line.startsWith("#")) continue;
          int eq = line.indexOf('=');
          if (eq <= 0) continue;
          String key = stripBom(line.substring(0, eq)).trim();
          String value = line.substring(eq + 1).trim();
          if ((value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2)
              || (value.startsWith("'") && value.endsWith("'") && value.length() >= 2)) {
            value = value.substring(1, value.length() - 1);
          }
          out.putIfAbsent(key, value);
        }
        if (!out.isEmpty()) {
          System.out.println("[env] Using .env at " + candidate.toAbsolutePath());
          break; // first existing file with keys wins
        }
      } catch (Exception e) {
        System.err.println("[env] Could not read " + candidate + ": " + e.getMessage());
      }
    }
    return out;
  }

  private static Path[] candidates() {
    Path cwd = Path.of("").toAbsolutePath().normalize();
    return new Path[]{
      cwd.resolve(".env"),
      cwd.resolve("..").resolve(".env").normalize(),
      cwd.resolve("backend").resolve(".env"),
      // Walk up a couple levels (Maven may start under tools/ or backend/)
      cwd.getParent() != null ? cwd.getParent().resolve(".env") : cwd.resolve(".env"),
      cwd.getParent() != null && cwd.getParent().getParent() != null
        ? cwd.getParent().getParent().resolve(".env")
        : cwd.resolve(".env"),
    };
  }

  private static String stripBom(String s) {
    if (s != null && !s.isEmpty() && s.charAt(0) == '\uFEFF') return s.substring(1);
    return s == null ? "" : s;
  }
}
