package gh.decorai.gateway;

import gh.decorai.shared.ServiceIds;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * In-process service registry. Mirrors a microservices mesh:
 * each bounded context registers itself; the gateway exposes health.
 * Later each entry can point at a remote base URL instead of "local".
 */
@Component
public class ServiceRegistry {
  private final Map<String, Map<String, Object>> services = new LinkedHashMap<>();

  public ServiceRegistry() {
    register(ServiceIds.GATEWAY, "local", "/health", "up");
    register(ServiceIds.AUTH, "local", "/login|/register|/auth/*", "up");
    register(ServiceIds.CATALOG, "local", "/shops|/decorators", "up");
    register(ServiceIds.BILLING, "local", "/billing/*", "up");
    register(ServiceIds.BOOKINGS, "local", "/bookings|/threads|/messages", "up");
    register(ServiceIds.NOTIFICATIONS, "local", "/notifications", "up");
    register(ServiceIds.AI, "local", "/ai/*", "up");
    register(ServiceIds.MAIL, "local", "internal", "up");
  }

  public void register(String id, String mode, String routes, String status) {
    Map<String, Object> entry = new LinkedHashMap<>();
    entry.put("id", id);
    entry.put("mode", mode); // local | remote
    entry.put("routes", routes);
    entry.put("status", status);
    entry.put("baseUrl", "local".equals(mode) ? "http://127.0.0.1:4000" : mode);
    services.put(id, entry);
  }

  public List<Map<String, Object>> list() {
    return List.copyOf(services.values());
  }

  public Map<String, Object> get(String id) {
    return services.get(id);
  }
}
