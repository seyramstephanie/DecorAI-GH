package gh.decorai.ai;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ai-decorate-service HTTP surface.
 * POST /ai/decorate — photo + brief → finished designed space + shop items.
 */
@RestController
@RequestMapping("/ai")
public class AiController {
  private final AiDecorateService decorate;

  public AiController(AiDecorateService decorate) {
    this.decorate = decorate;
  }

  @GetMapping("/status")
  Map<String, Object> status() {
    return decorate.status();
  }

  @PostMapping("/decorate")
  Map<String, Object> decorate(@RequestBody Map<String, Object> body) {
    String photo = str(body, "photoBase64");
    if (photo.isBlank()) photo = str(body, "photoB64");
    return decorate.decorate(
        photo,
        str(body, "eventType"),
        str(body, "style"),
        str(body, "vision"),
        str(body, "mime")
    );
  }

  private static String str(Map<String, Object> body, String key) {
    Object v = body.get(key);
    return v == null ? "" : String.valueOf(v);
  }
}
