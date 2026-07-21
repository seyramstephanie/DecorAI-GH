package gh.decorai.ai;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Ensures /ai/* failures return a clear JSON body the mobile app can show & share
 * (not just Spring's bare "502 Bad Gateway").
 */
@RestControllerAdvice(basePackages = "gh.decorai.ai")
public class AiExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<Map<String, Object>> handleStatus(ResponseStatusException ex) {
    HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
    if (status == null) status = HttpStatus.BAD_GATEWAY;

    String reason = ex.getReason() == null ? status.getReasonPhrase() : ex.getReason();
    String stage = "unknown";
    String message = reason;
    if (reason.startsWith("[stage=") && reason.contains("]")) {
      int end = reason.indexOf(']');
      stage = reason.substring("[stage=".length(), end);
      message = reason.substring(end + 1).trim();
    }

    System.err.println("[ai] ERROR status=" + status.value() + " stage=" + stage + " message=" + message);

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("ok", false);
    body.put("mock", false);
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("stage", stage);
    body.put("message", message);
    body.put("path", "/ai/decorate");
    body.put("timestamp", Instant.now().toString());
    body.put("hint", "Check GET /ai/status. Need OPENROUTER_API_KEY + credits. Restart API after .env changes.");
    return ResponseEntity.status(status).body(body);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String, Object>> handleOther(Exception ex) {
    String msg = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
    System.err.println("[ai] UNHANDLED " + ex.getClass().getName() + ": " + msg);
    ex.printStackTrace(System.err);

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("ok", false);
    body.put("mock", false);
    body.put("status", 502);
    body.put("error", "Bad Gateway");
    body.put("stage", "pipeline");
    body.put("message", "AI decorate failed: " + msg);
    body.put("path", "/ai");
    body.put("timestamp", Instant.now().toString());
    body.put("hint", "Check API window logs for [ai] lines. Verify OPENROUTER_API_KEY and credits.");
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(body);
  }
}
