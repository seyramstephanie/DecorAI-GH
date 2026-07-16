package gh.decorai.gateway;

import gh.decorai.ai.AiDecorateService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API Gateway facade — discovery + health for the microservices layout.
 * All domain traffic still routes through this Spring Boot process until
 * services are split into separate deployables.
 */
@RestController
public class GatewayController {
  private final ServiceRegistry registry;
  private final AiDecorateService ai;

  public GatewayController(ServiceRegistry registry, AiDecorateService ai) {
    this.registry = registry;
    this.ai = ai;
  }

  @GetMapping("/health")
  Map<String, Object> health() {
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("status", "up");
    out.put("architecture", "modular-microservices");
    out.put("services", registry.list());
    out.put("ai", ai.status());
    return out;
  }

  @GetMapping("/services")
  Map<String, Object> services() {
    return Map.of(
      "architecture", "Each domain is a logical microservice (local today, remote-ready).",
      "services", registry.list()
    );
  }
}
