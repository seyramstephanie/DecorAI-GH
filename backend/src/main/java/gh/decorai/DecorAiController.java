package gh.decorai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
public class DecorAiController {
  private static final double CLIENT_LAT = 6.6885;
  private static final double CLIENT_LNG = -1.6244;
  private static final List<String> ROLES = List.of("client", "decorator", "shop", "admin");
  private final JdbcTemplate jdbc;
  private final ObjectMapper json;
  private final JavaMailSender mailSender;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final HttpClient http = HttpClient.newHttpClient();
  private final Random random = new Random();

  DecorAiController(JdbcTemplate jdbc, ObjectMapper json, JavaMailSender mailSender) {
    this.jdbc = jdbc; this.json = json; this.mailSender = mailSender;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  @PostMapping("/register")
  Map<String, Object> register(@RequestBody Map<String, Object> body) {
    String email = string(body, "email").toLowerCase(Locale.ROOT);
    if (email.isBlank()) throw badRequest("Email is required.");
    List<Map<String, Object>> existing = jdbc.query("select * from users where email = ?", userMapper(), email);
    if (!existing.isEmpty()) {
      // Social re-login returns the locked role from the database — never switch roles later.
      if (!"email".equals(defaulted(string(body, "provider"), "email"))) return publicUser(existing.get(0));
      throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with that email already exists — please log in.");
    }
    String provider = defaulted(string(body, "provider"), "email");
    String password = string(body, "password");
    if ("email".equals(provider) && password.isBlank()) throw badRequest("Please choose a password.");
    String role = defaulted(string(body, "role"), "client").toLowerCase(Locale.ROOT);
    if (!ROLES.contains(role) || "admin".equals(role)) role = "client"; // admin only via seed/ops
    String id = id();
    String name = defaulted(string(body, "name"), "Guest");
    String phone = string(body, "phone");
    String location = defaulted(string(body, "location"), "Kumasi");
    jdbc.update(
      "insert into users (id,name,email,password_hash,phone,location,role,provider,avatar,plan) values (?,?,?,?,?,?,?,?,?,?)",
      id, name, email, password.isBlank() ? null : passwordEncoder.encode(password),
      phone, location, role, provider, nullable(string(body, "avatar")), "free"
    );

    if ("decorator".equals(role)) {
      String decoratorId = createDecoratorProfile(id, name, phone, location, body);
      jdbc.update("update users set decorator_id = ? where id = ?", decoratorId, id);
      notify("admin", "brief", "New decorator signup", name + " applied as a decorator — review in Admin.");
    } else if ("shop".equals(role)) {
      String shopId = createShopProfile(id, name, phone, location, body);
      jdbc.update("update users set shop_id = ? where id = ?", shopId, id);
    }
    return publicUser(getUser(id));
  }

  @PostMapping("/login")
  Map<String, Object> login(@RequestBody Map<String, Object> body) {
    List<Map<String, Object>> users = jdbc.query(
      "select * from users where email = ?", userMapper(), string(body, "email").toLowerCase(Locale.ROOT));
    if (users.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No account with that email — sign up first.");
    Map<String, Object> user = users.get(0);
    String hash = (String) user.get("passwordHash");
    if (hash != null && !passwordEncoder.matches(string(body, "password"), hash)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong password.");
    }
    return publicUser(user);
  }

  @PostMapping("/auth/forgot-password")
  Map<String, Object> forgotPassword(@RequestBody Map<String, Object> body) {
    String email = string(body, "email").toLowerCase(Locale.ROOT);
    if (email.isBlank()) throw badRequest("Email is required.");
    List<String> users = jdbc.query("select id from users where email = ?", (rs, i) -> rs.getString(1), email);
    // Always return success to avoid email enumeration.
    if (users.isEmpty()) return map("ok", true, "message", "If that email exists, a reset code was sent.");

    String code = String.format("%06d", random.nextInt(1_000_000));
    String resetId = id();
    jdbc.update(
      "insert into password_resets (id,email,code,expires_at) values (?,?,?,?)",
      resetId, email, code, OffsetDateTime.now().plusMinutes(20)
    );
    sendResetEmail(email, code);
    Map<String, Object> out = map("ok", true, "message", "If that email exists, a reset code was sent.");
    // Dev convenience when mail is not configured — never enable in production with real users only.
    if (env("MAIL_USERNAME").isBlank()) out.put("devCode", code);
    return out;
  }

  @PostMapping("/auth/reset-password")
  Map<String, Object> resetPassword(@RequestBody Map<String, Object> body) {
    String email = string(body, "email").toLowerCase(Locale.ROOT);
    String code = string(body, "code").trim();
    String password = string(body, "password");
    if (email.isBlank() || code.isBlank() || password.length() < 4) {
      throw badRequest("Email, code, and a password (min 4 chars) are required.");
    }
    List<Map<String, Object>> rows = jdbc.query(
      "select id from password_resets where email = ? and code = ? and used = false and expires_at > now() order by created_at desc limit 1",
      (rs, i) -> map("id", rs.getString("id")), email, code
    );
    if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset code.");
    jdbc.update("update password_resets set used = true where id = ?", rows.get(0).get("id"));
    int updated = jdbc.update("update users set password_hash = ? where email = ?", passwordEncoder.encode(password), email);
    if (updated == 0) throw notFound("Account not found.");
    return map("ok", true, "message", "Password updated. You can sign in.");
  }

  @GetMapping("/users/{id}")
  Map<String, Object> user(@PathVariable String id) { return publicUser(getUser(id)); }

  @PatchMapping("/users/{id}")
  Map<String, Object> patchUser(@PathVariable String id, @RequestBody Map<String, Object> body) {
    getUser(id);
    // Role is locked at signup — never accept role changes from settings.
    String[] allowed = {"name", "email", "phone", "location", "avatar"};
    for (String field : allowed) {
      if (body.containsKey(field)) {
        jdbc.update("update users set " + field + " = ? where id = ?", nullable(string(body, field)), id);
      }
    }
    if (!string(body, "password").isBlank()) {
      jdbc.update("update users set password_hash = ? where id = ?", passwordEncoder.encode(string(body, "password")), id);
    }
    return publicUser(getUser(id));
  }

  // ── Decorator self-service profile ────────────────────────────────────────

  @GetMapping("/me/decorator")
  Map<String, Object> myDecorator(@RequestParam String userId) {
    Map<String, Object> user = getUser(userId);
    String decoratorId = string(user, "decoratorId");
    if (decoratorId.isBlank()) {
      List<Map<String, Object>> byUser = jdbc.query(
        "select *, specialisations::text as specialisations_json, portfolio::text as portfolio_json from decorators where user_id = ?",
        decoratorMapper(), userId);
      if (byUser.isEmpty()) throw notFound("No decorator profile linked.");
      return byUser.get(0);
    }
    return decorator(decoratorId);
  }

  @PatchMapping("/decorators/{id}/profile")
  Map<String, Object> patchDecoratorProfile(@PathVariable String id, @RequestBody Map<String, Object> body) {
    decorator(id); // exists check (includes unverified)
    if (body.containsKey("businessName")) jdbc.update("update decorators set business_name = ? where id = ?", string(body, "businessName"), id);
    if (body.containsKey("name")) jdbc.update("update decorators set name = ? where id = ?", string(body, "name"), id);
    if (body.containsKey("location")) jdbc.update("update decorators set location = ? where id = ?", string(body, "location"), id);
    if (body.containsKey("phone")) jdbc.update("update decorators set phone = ? where id = ?", string(body, "phone"), id);
    if (body.containsKey("bio")) jdbc.update("update decorators set bio = ? where id = ?", string(body, "bio"), id);
    if (body.containsKey("priceRange")) jdbc.update("update decorators set price_range = ? where id = ?", string(body, "priceRange"), id);
    if (body.containsKey("lat")) jdbc.update("update decorators set lat = ? where id = ?", doubleVal(body, "lat", 6.6885), id);
    if (body.containsKey("lng")) jdbc.update("update decorators set lng = ? where id = ?", doubleVal(body, "lng", -1.6244), id);
    if (body.containsKey("specialisations")) {
      jdbc.update("update decorators set specialisations = cast(? as jsonb) where id = ?", writeArray(strings(body.get("specialisations"))), id);
    }
    if (body.containsKey("portfolio")) {
      jdbc.update("update decorators set portfolio = cast(? as jsonb) where id = ?", writeArray(strings(body.get("portfolio"))), id);
    }
    return decoratorRaw(id);
  }

  // ── Admin: approve / reject decorators ────────────────────────────────────

  @GetMapping("/admin/decorators/pending")
  List<Map<String, Object>> pendingDecorators(@RequestParam String adminId) {
    requireAdmin(adminId);
    return jdbc.query(
      "select *, specialisations::text as specialisations_json, portfolio::text as portfolio_json from decorators where verified = false order by name",
      decoratorMapper()
    );
  }

  @PostMapping("/admin/decorators/{id}/approve")
  Map<String, Object> approveDecorator(@PathVariable String id, @RequestBody Map<String, Object> body) {
    requireAdmin(string(body, "adminId"));
    jdbc.update("update decorators set verified = true where id = ?", id);
    Map<String, Object> d = decoratorRaw(id);
    Object uid = d.get("userId");
    if (uid != null) notify(String.valueOf(uid), "brief", "You're approved!", "Your decorator profile is live. Clients can now find you.");
    return d;
  }

  @PostMapping("/admin/decorators/{id}/reject")
  Map<String, Object> rejectDecorator(@PathVariable String id, @RequestBody Map<String, Object> body) {
    requireAdmin(string(body, "adminId"));
    Map<String, Object> d = decoratorRaw(id);
    Object uid = d.get("userId");
    jdbc.update("update decorators set verified = false where id = ?", id);
    if (uid != null) {
      notify(String.valueOf(uid), "brief", "Application needs changes",
        defaulted(string(body, "reason"), "Please update your profile details and contact support."));
    }
    return map("ok", true, "id", id);
  }

  // ── Paystack Pro plan ─────────────────────────────────────────────────────

  @PostMapping("/billing/initialize")
  Map<String, Object> initializeBilling(@RequestBody Map<String, Object> body) {
    Map<String, Object> user = getUser(string(body, "userId"));
    String secret = env("PAYSTACK_SECRET_KEY");
    int amount = integerFromEnv("PRO_PLAN_AMOUNT_PESWAS", 5000); // GH₵50.00 default
    String email = String.valueOf(user.get("email"));
    String reference = "decorai_" + id();
    jdbc.update(
      "insert into payments (id,user_id,reference,amount,currency,plan,status) values (?,?,?,?,?,?,?)",
      id(), user.get("id"), reference, amount, "GHS", "pro", "pending"
    );

    if (secret.isBlank()) {
      // Dev without Paystack keys: return a local mock checkout that verify will accept.
      return map(
        "reference", reference,
        "authorizationUrl", "decorai://paystack-mock?reference=" + reference,
        "amount", amount,
        "currency", "GHS",
        "mock", true,
        "message", "PAYSTACK_SECRET_KEY not set — use verify with this reference for local Pro unlock."
      );
    }

    try {
      Map<String, Object> payload = map(
        "email", email,
        "amount", amount,
        "currency", "GHS",
        "reference", reference,
        "callback_url", defaulted(env("PAYSTACK_CALLBACK_URL"), "decorai://billing/callback"),
        "metadata", map("userId", user.get("id"), "plan", "pro")
      );
      HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create("https://api.paystack.co/transaction/initialize"))
        .header("Authorization", "Bearer " + secret)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload)))
        .build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      JsonNode root = json.readTree(res.body());
      if (!root.path("status").asBoolean(false)) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, root.path("message").asText("Paystack init failed"));
      }
      JsonNode data = root.path("data");
      return map(
        "reference", data.path("reference").asText(reference),
        "authorizationUrl", data.path("authorization_url").asText(),
        "accessCode", data.path("access_code").asText(null),
        "amount", amount,
        "currency", "GHS",
        "mock", false
      );
    } catch (ResponseStatusException e) { throw e; }
    catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Paystack unavailable: " + e.getMessage()); }
  }

  @PostMapping("/billing/verify")
  Map<String, Object> verifyBilling(@RequestBody Map<String, Object> body) {
    String reference = string(body, "reference");
    if (reference.isBlank()) throw badRequest("Payment reference is required.");
    List<Map<String, Object>> payments = jdbc.query(
      "select id, user_id, status from payments where reference = ?",
      (rs, i) -> map("id", rs.getString("id"), "userId", rs.getString("user_id"), "status", rs.getString("status")),
      reference
    );
    if (payments.isEmpty()) throw notFound("Payment not found.");
    Map<String, Object> payment = payments.get(0);
    if ("success".equals(payment.get("status"))) return publicUser(getUser(String.valueOf(payment.get("userId"))));

    String secret = env("PAYSTACK_SECRET_KEY");
    boolean paid = secret.isBlank(); // mock mode auto-succeeds
    if (!secret.isBlank()) {
      try {
        HttpRequest req = HttpRequest.newBuilder()
          .uri(URI.create("https://api.paystack.co/transaction/verify/" + reference))
          .header("Authorization", "Bearer " + secret)
          .GET().build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        JsonNode root = json.readTree(res.body());
        paid = root.path("status").asBoolean(false)
          && "success".equalsIgnoreCase(root.path("data").path("status").asText());
      } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Paystack verify failed: " + e.getMessage());
      }
    }
    if (!paid) {
      jdbc.update("update payments set status = 'failed' where reference = ?", reference);
      throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Payment not completed.");
    }
    jdbc.update("update payments set status = 'success' where reference = ?", reference);
    String userId = String.valueOf(payment.get("userId"));
    jdbc.update(
      "update users set plan = 'pro', plan_expires_at = ? where id = ?",
      OffsetDateTime.now().plusDays(30), userId
    );
    notify(userId, "digest", "Welcome to Pro", "Decorate with AI is unlocked for 30 days. Create beautiful rooms anytime.");
    return publicUser(getUser(userId));
  }

  @GetMapping("/billing/status")
  Map<String, Object> billingStatus(@RequestParam String userId) {
    Map<String, Object> user = publicUser(getUser(userId));
    return map(
      "plan", user.get("plan"),
      "planExpiresAt", user.get("planExpiresAt"),
      "isPro", isPro(user),
      "canUseAi", isPro(user) || "admin".equals(user.get("role"))
    );
  }

  // ── Directory & marketplace ───────────────────────────────────────────────

  @GetMapping("/shops")
  List<Map<String, Object>> shops(@RequestParam(required = false) String q, @RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
    double originLat = lat == null ? CLIENT_LAT : lat; double originLng = lng == null ? CLIENT_LNG : lng;
    List<Map<String, Object>> rows = jdbc.query("select *, stock::text as stock_json from shops where verified = true", shopMapper(originLat, originLng));
    if (q != null && !q.isBlank()) {
      String needle = q.toLowerCase(Locale.ROOT);
      rows.removeIf(shop -> !(lower(shop.get("name")).contains(needle) || lower(shop.get("category")).contains(needle) || strings(shop.get("stock")).stream().anyMatch(item -> item.toLowerCase(Locale.ROOT).contains(needle))));
    }
    rows.sort(Comparator.comparingDouble(shop -> ((Number) shop.get("distanceKm")).doubleValue()));
    return rows;
  }

  @GetMapping("/shops/{id}")
  Map<String, Object> shop(@PathVariable String id, @RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
    List<Map<String, Object>> rows = jdbc.query("select *, stock::text as stock_json from shops where id = ?", shopMapper(lat == null ? CLIENT_LAT : lat, lng == null ? CLIENT_LNG : lng), id);
    if (rows.isEmpty()) throw notFound("Shop not found.");
    return rows.get(0);
  }

  @PatchMapping("/shops/{id}/radius")
  Map<String, Object> radius(@PathVariable String id, @RequestBody Map<String, Object> body) {
    jdbc.update("update shops set radius_km = ? where id = ?", integer(body, "radiusKm", 10), id);
    return shop(id, null, null);
  }

  @PostMapping("/sourcing/items")
  Map<String, Object> sourceItems(@RequestBody Map<String, Object> body) {
    List<String> items = strings(body.get("items"));
    List<Map<String, Object>> matches = matchShops(items, CLIENT_LAT, CLIENT_LNG);
    List<Map<String, Object>> nearby = radiusMatches(items, CLIENT_LAT, CLIENT_LNG);
    for (Map<String, Object> nearbyShop : nearby) {
      notify("shop-" + nearbyShop.get("id"), "radius", "A client nearby is looking for items you stock",
        "A client in " + defaulted(string(body, "area"), "your area") + " searched for: " + String.join(", ", items.stream().limit(4).toList()) + ".");
    }
    List<Map<String, Object>> online = new ArrayList<>();
    for (String item : items) {
      online.add(map("item", item, "sources", List.of(
        map("vendor", "Jumia Ghana", "url", "https://www.jumia.com.gh/catalog/?q=" + item.replace(" ", "%20"), "delivery", "2–5 days"),
        map("vendor", "Amazon", "url", "https://www.amazon.com/s?k=" + item.replace(" ", "%20"), "delivery", "10–21 days (import)")
      ), "guidance", "If unavailable locally, ask a Kejetia or Makola market vendor to source \"" + item + "\", or consider a DIY version using local materials."));
    }
    return map("matches", matches, "online", online, "alertedShops", nearby.size());
  }

  @GetMapping("/decorators")
  List<Map<String, Object>> decorators(@RequestParam(required = false) String location, @RequestParam(required = false) String event) {
    List<Map<String, Object>> rows = jdbc.query(
      "select *, specialisations::text as specialisations_json, portfolio::text as portfolio_json from decorators where verified = true",
      decoratorMapper()
    );
    if (location != null) rows.removeIf(row -> !location.equalsIgnoreCase(String.valueOf(row.get("location"))));
    if (event != null) rows.removeIf(row -> strings(row.get("specialisations")).stream().noneMatch(value -> value.toLowerCase(Locale.ROOT).contains(event.toLowerCase(Locale.ROOT))));
    return rows;
  }

  @GetMapping("/decorators/{id}")
  Map<String, Object> decorator(@PathVariable String id) {
    List<Map<String, Object>> rows = jdbc.query(
      "select *, specialisations::text as specialisations_json, portfolio::text as portfolio_json from decorators where id = ? and verified = true",
      decoratorMapper(), id
    );
    if (rows.isEmpty()) throw notFound("Decorator not found.");
    return rows.get(0);
  }

  @PostMapping("/bookings")
  Map<String, Object> createBooking(@RequestBody Map<String, Object> body) {
    Map<String, Object> decorator = decorator(string(body, "decoratorId"));
    String bookingId = id();
    jdbc.update(
      "insert into bookings (id,decorator_id,decorator_name,client_id,client_name,event_type,event_date,venue,budget,design_image,brief,status) values (?,?,?,?,?,?,?,?,?,?,?,?)",
      bookingId, string(body, "decoratorId"), decorator.get("businessName"), defaulted(string(body, "clientId"), "guest"),
      defaulted(string(body, "clientName"), "Guest"), string(body, "eventType"), string(body, "eventDate"),
      string(body, "venue"), string(body, "budget"), nullable(string(body, "designImage")), string(body, "brief"), "Enquiry"
    );
    return booking(bookingId);
  }

  @GetMapping("/bookings")
  List<Map<String, Object>> bookings(@RequestParam(required = false) String clientId, @RequestParam(required = false) String decoratorId) {
    // Build explicit filters — avoids JDBC null-binding quirks that can 500 the list endpoint.
    boolean hasClient = clientId != null && !clientId.isBlank();
    boolean hasDecorator = decoratorId != null && !decoratorId.isBlank();
    if (hasClient && hasDecorator) {
      return jdbc.query(
        "select * from bookings where client_id = ? and decorator_id = ? order by created_at desc",
        bookingMapper(), clientId, decoratorId
      );
    }
    if (hasClient) {
      return jdbc.query(
        "select * from bookings where client_id = ? order by created_at desc",
        bookingMapper(), clientId
      );
    }
    if (hasDecorator) {
      return jdbc.query(
        "select * from bookings where decorator_id = ? order by created_at desc",
        bookingMapper(), decoratorId
      );
    }
    return jdbc.query("select * from bookings order by created_at desc", bookingMapper());
  }

  @PatchMapping("/bookings/{id}/status")
  Map<String, Object> patchBooking(@PathVariable String id, @RequestBody Map<String, Object> body) {
    String status = string(body, "status");
    if (!List.of("Enquiry", "Confirmed", "In Preparation", "Completed").contains(status)) throw badRequest("Invalid booking status.");
    jdbc.update("update bookings set status = ? where id = ?", status, id);
    return booking(id);
  }

  @GetMapping("/bookings/{id}/messages")
  List<Map<String, Object>> messages(@PathVariable String id) {
    return jdbc.query("select * from messages where booking_id = ? order by created_at", messageMapper(), id);
  }

  @PostMapping("/bookings/{id}/messages")
  Map<String, Object> postMessage(@PathVariable String id, @RequestBody Map<String, Object> body) {
    String messageId = id();
    jdbc.update("insert into messages (id,booking_id,sender_id,sender_name,text) values (?,?,?,?,?)",
      messageId, id, string(body, "from"), defaulted(string(body, "fromName"), "Guest"), string(body, "text"));
    return jdbc.queryForObject("select * from messages where id = ?", messageMapper(), messageId);
  }

  @GetMapping("/threads")
  List<Map<String, Object>> threads(@RequestParam String userId, @RequestParam(required = false) String phone) {
    String decoratorId = jdbc.query("select id from decorators where phone = ? or user_id = ?",
      (rs, index) -> rs.getString(1), phone == null ? "" : phone, userId).stream().findFirst().orElse(null);
    Map<String, Object> user = getUser(userId);
    if (decoratorId == null && user.get("decoratorId") != null) decoratorId = String.valueOf(user.get("decoratorId"));

    List<Map<String, Object>> messages = jdbc.query("select * from messages order by created_at", messageMapper());
    Map<String, Map<String, Object>> latest = new LinkedHashMap<>();
    for (Map<String, Object> message : messages) latest.put(String.valueOf(message.get("bookingId")), message);
    List<Map<String, Object>> rows = new ArrayList<>();
    for (Map.Entry<String, Map<String, Object>> entry : latest.entrySet()) {
      String threadId = entry.getKey();
      Map<String, Object> last = entry.getValue();
      String title = "Chat";
      String decorator = null;
      boolean participant = false;
      if (threadId.startsWith("dm_")) {
        String[] parts = threadId.split("_", 3);
        decorator = parts.length > 1 ? parts[1] : null;
        String client = parts.length > 2 ? parts[2] : "";
        participant = userId.equals(client) || (decorator != null && decorator.equals(decoratorId));
        if (userId.equals(client) && decorator != null) {
          try { title = String.valueOf(decoratorRaw(decorator).get("businessName")); }
          catch (Exception e) { title = String.valueOf(last.get("fromName")); }
        } else title = String.valueOf(last.get("fromName"));
      } else {
        List<Map<String, Object>> bookingRows = jdbc.query("select * from bookings where id = ?", bookingMapper(), threadId);
        if (!bookingRows.isEmpty()) {
          Map<String, Object> b = bookingRows.get(0);
          decorator = String.valueOf(b.get("decoratorId"));
          participant = userId.equals(b.get("clientId")) || decorator.equals(decoratorId);
          title = userId.equals(b.get("clientId")) ? String.valueOf(b.get("decoratorName")) : String.valueOf(b.get("clientName"));
        }
      }
      if (participant) rows.add(map("threadId", threadId, "title", title, "decoratorId", decorator, "lastText", last.get("text"), "at", last.get("at")));
    }
    rows.sort((a, b) -> String.valueOf(b.get("at")).compareTo(String.valueOf(a.get("at"))));
    return rows;
  }

  @GetMapping("/notifications")
  List<Map<String, Object>> notifications(@RequestParam String userId) {
    return jdbc.query(
      "select * from notifications where user_id = 'all' or user_id = ? order by created_at desc",
      notificationMapper(), userId
    );
  }

  @PatchMapping("/notifications/{id}/read")
  Map<String, Object> readNotification(@PathVariable String id) {
    jdbc.update("update notifications set read = true where id = ?", id);
    return jdbc.queryForObject("select * from notifications where id = ?", notificationMapper(), id);
  }

  @PostMapping("/notifications/brief-alert")
  Map<String, Object> briefAlert(@RequestBody Map<String, Object> body) {
    return notify("decorator-" + string(body, "decoratorId"), "brief", "New decoration brief received",
      string(body, "clientName") + " sent you a " + string(body, "eventType") + " brief with an AI design attached.");
  }

  @PostMapping("/notifications/booking-status")
  Map<String, Object> bookingAlert(@RequestBody Map<String, Object> body) {
    notify(string(body, "clientId"), "booking", "Booking update",
      "Your " + string(body, "eventType") + " booking is now " + string(body, "status") + ".");
    return notify("decorator-" + string(body, "decoratorId"), "booking", "Booking update",
      "Booking for " + string(body, "eventType") + " is now " + string(body, "status") + ".");
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private String createDecoratorProfile(String userId, String name, String phone, String location, Map<String, Object> body) {
    String decoratorId = id();
    String business = defaulted(string(body, "businessName"), name + " Decor");
    String bio = defaulted(string(body, "bio"), "Professional decorator on DecorAI GH.");
    String price = defaulted(string(body, "priceRange"), "Contact for quote");
    List<String> specs = strings(body.get("specialisations"));
    if (specs.isEmpty()) specs = List.of("Wedding", "Home Interior");
    List<String> portfolio = strings(body.get("portfolio"));
    double lat = doubleVal(body, "lat", CLIENT_LAT);
    double lng = doubleVal(body, "lng", CLIENT_LNG);
    jdbc.update(
      "insert into decorators (id,name,business_name,location,lat,lng,rating,reviews,phone,price_range,bio,specialisations,portfolio,verified,user_id) values (?,?,?,?,?,?,0,0,?,?,?,cast(? as jsonb),cast(? as jsonb),false,?)",
      decoratorId, name, business, location, lat, lng, phone, price, bio, writeArray(specs), writeArray(portfolio), userId
    );
    return decoratorId;
  }

  private String createShopProfile(String userId, String name, String phone, String location, Map<String, Object> body) {
    String shopId = id();
    String shopName = defaulted(string(body, "shopName"), name + " Shop");
    String category = defaulted(string(body, "category"), "General Decor");
    String area = defaulted(string(body, "area"), location);
    List<String> stock = strings(body.get("stock"));
    if (stock.isEmpty()) stock = List.of("vases", "cushions");
    jdbc.update(
      "insert into shops (id,name,category,area,location,lat,lng,rating,reviews,phone,radius_km,image,stock,verified,user_id) values (?,?,?,?,?,?,?,?,0,?,?,?,cast(? as jsonb),false,?)",
      shopId, shopName, category, area, location, doubleVal(body, "lat", CLIENT_LAT), doubleVal(body, "lng", CLIENT_LNG),
      0.0, phone, integer(body, "radiusKm", 10), nullable(string(body, "image")), writeArray(stock), userId
    );
    return shopId;
  }

  private void requireAdmin(String adminId) {
    Map<String, Object> user = getUser(adminId);
    if (!"admin".equals(user.get("role"))) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only.");
  }

  private void sendResetEmail(String email, String code) {
    String username = env("MAIL_USERNAME");
    if (username.isBlank()) return;
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(email);
      message.setFrom(username);
      message.setSubject("DecorAI GH — password reset code");
      message.setText(
        "Your DecorAI GH password reset code is: " + code + "\n\n"
          + "It expires in 20 minutes. If you did not request this, ignore this email.\n"
      );
      mailSender.send(message);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not send email. Check MAIL_USERNAME / MAIL_PASSWORD (Gmail app password).");
    }
  }

  private Map<String, Object> publicUser(Map<String, Object> user) {
    Map<String, Object> out = new LinkedHashMap<>(user);
    out.remove("passwordHash");
    out.put("isPro", isPro(out));
    out.put("canUseAi", isPro(out) || "admin".equals(out.get("role")));
    return out;
  }

  private boolean isPro(Map<String, Object> user) {
    if ("pro".equals(user.get("plan")) || "admin".equals(user.get("role"))) {
      Object exp = user.get("planExpiresAt");
      if (exp == null || "admin".equals(user.get("role"))) return true;
      try {
        return OffsetDateTime.parse(String.valueOf(exp)).isAfter(OffsetDateTime.now());
      } catch (Exception e) { return true; }
    }
    return false;
  }

  private List<Map<String, Object>> matchShops(List<String> items, double lat, double lng) {
    List<Map<String, Object>> rows = shops(null, lat, lng);
    List<Map<String, Object>> out = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      List<String> matched = matching(items, strings(row.get("stock")));
      if (!matched.isEmpty()) { row.put("matchedItems", matched); out.add(row); }
    }
    out.sort(Comparator.<Map<String, Object>>comparingInt(row -> strings(row.get("matchedItems")).size()).reversed()
      .thenComparingDouble(row -> ((Number) row.get("distanceKm")).doubleValue()));
    return out;
  }

  private List<Map<String, Object>> radiusMatches(List<String> items, double lat, double lng) {
    List<Map<String, Object>> rows = shops(null, lat, lng);
    rows.removeIf(row -> ((Number) row.get("distanceKm")).doubleValue() > ((Number) row.get("radiusKm")).doubleValue()
      || matching(items, strings(row.get("stock"))).isEmpty());
    return rows;
  }

  private List<String> matching(List<String> items, List<String> stock) {
    List<String> out = new ArrayList<>();
    for (String item : items) {
      String lower = item.toLowerCase(Locale.ROOT);
      if (stock.stream().anyMatch(value -> {
        String s = value.toLowerCase(Locale.ROOT);
        return s.contains(lower) || lower.contains(s) || List.of(lower.split(" ")).stream().anyMatch(word -> word.length() > 3 && s.contains(word));
      })) out.add(item);
    }
    return out;
  }

  private Map<String, Object> notify(String userId, String type, String title, String body) {
    String notifyId = id();
    jdbc.update("insert into notifications (id,user_id,type,title,body) values (?,?,?,?,?)", notifyId, userId, type, title, body);
    return jdbc.queryForObject("select * from notifications where id = ?", notificationMapper(), notifyId);
  }

  private Map<String, Object> booking(String id) {
    List<Map<String, Object>> rows = jdbc.query("select * from bookings where id = ?", bookingMapper(), id);
    if (rows.isEmpty()) throw notFound("Booking not found.");
    return rows.get(0);
  }

  private Map<String, Object> getUser(String id) {
    List<Map<String, Object>> rows = jdbc.query("select * from users where id = ?", userMapper(), id);
    if (rows.isEmpty()) throw notFound("User not found.");
    return rows.get(0);
  }

  private Map<String, Object> decoratorRaw(String id) {
    List<Map<String, Object>> rows = jdbc.query(
      "select *, specialisations::text as specialisations_json, portfolio::text as portfolio_json from decorators where id = ?",
      decoratorMapper(), id
    );
    if (rows.isEmpty()) throw notFound("Decorator not found.");
    return rows.get(0);
  }

  private RowMapper<Map<String, Object>> userMapper() {
    return (rs, index) -> map(
      "id", rs.getString("id"),
      "name", rs.getString("name"),
      "email", rs.getString("email"),
      "phone", rs.getString("phone"),
      "location", rs.getString("location"),
      "role", rs.getString("role"),
      "provider", rs.getString("provider"),
      "avatar", rs.getString("avatar"),
      "passwordHash", rs.getString("password_hash"),
      "plan", columnOr(rs, "plan", "free"),
      "planExpiresAt", timestampOrNull(rs, "plan_expires_at"),
      "decoratorId", columnOr(rs, "decorator_id", null),
      "shopId", columnOr(rs, "shop_id", null)
    );
  }

  private RowMapper<Map<String, Object>> shopMapper(double lat, double lng) {
    return (rs, index) -> map(
      "id", rs.getString("id"), "name", rs.getString("name"), "category", rs.getString("category"),
      "area", rs.getString("area"), "location", rs.getString("location"), "lat", rs.getDouble("lat"), "lng", rs.getDouble("lng"),
      "rating", rs.getDouble("rating"), "reviews", rs.getInt("reviews"), "phone", rs.getString("phone"),
      "verified", rs.getBoolean("verified"), "radiusKm", rs.getInt("radius_km"), "image", rs.getString("image"),
      "stock", jsonArray(rs.getString("stock_json")),
      "distanceKm", round(distance(lat, lng, rs.getDouble("lat"), rs.getDouble("lng"))),
      "userId", columnOr(rs, "user_id", null)
    );
  }

  private RowMapper<Map<String, Object>> decoratorMapper() {
    return (rs, index) -> map(
      "id", rs.getString("id"), "name", rs.getString("name"), "businessName", rs.getString("business_name"),
      "location", rs.getString("location"), "lat", rs.getDouble("lat"), "lng", rs.getDouble("lng"),
      "rating", rs.getDouble("rating"), "reviews", rs.getInt("reviews"),
      "specialisations", jsonArray(rs.getString("specialisations_json")),
      "priceRange", rs.getString("price_range"), "verified", rs.getBoolean("verified"),
      "phone", rs.getString("phone"), "bio", rs.getString("bio"),
      "portfolio", jsonArray(rs.getString("portfolio_json")),
      "userId", columnOr(rs, "user_id", null)
    );
  }

  private RowMapper<Map<String, Object>> bookingMapper() {
    return (rs, index) -> {
      OffsetDateTime created = null;
      try { created = rs.getObject("created_at", OffsetDateTime.class); } catch (Exception ignored) { }
      return map(
        "id", rs.getString("id"), "decoratorId", rs.getString("decorator_id"), "decoratorName", rs.getString("decorator_name"),
        "clientId", rs.getString("client_id"), "clientName", rs.getString("client_name"), "eventType", rs.getString("event_type"),
        "eventDate", rs.getString("event_date"), "venue", rs.getString("venue"), "budget", rs.getString("budget"),
        "designImage", rs.getString("design_image"), "brief", rs.getString("brief"), "status", rs.getString("status"),
        "createdAt", created == null ? OffsetDateTime.now().toString() : created.toString()
      );
    };
  }

  private RowMapper<Map<String, Object>> messageMapper() {
    return (rs, index) -> map(
      "id", rs.getString("id"), "bookingId", rs.getString("booking_id"), "from", rs.getString("sender_id"),
      "fromName", rs.getString("sender_name"), "text", rs.getString("text"),
      "at", rs.getObject("created_at", OffsetDateTime.class).toString()
    );
  }

  private RowMapper<Map<String, Object>> notificationMapper() {
    return (rs, index) -> map(
      "id", rs.getString("id"), "userId", rs.getString("user_id"), "type", rs.getString("type"),
      "title", rs.getString("title"), "body", rs.getString("body"), "read", rs.getBoolean("read"),
      "at", rs.getObject("created_at", OffsetDateTime.class).toString()
    );
  }

  private String columnOr(java.sql.ResultSet rs, String col, String fallback) {
    try { String v = rs.getString(col); return v == null ? fallback : v; }
    catch (Exception e) { return fallback; }
  }

  private String timestampOrNull(java.sql.ResultSet rs, String col) {
    try {
      OffsetDateTime t = rs.getObject(col, OffsetDateTime.class);
      return t == null ? null : t.toString();
    } catch (Exception e) { return null; }
  }

  private List<String> jsonArray(String source) {
    try { return json.readValue(source == null ? "[]" : source, new TypeReference<List<String>>() {}); }
    catch (Exception error) { return List.of(); }
  }

  private String writeArray(List<String> values) {
    try { return json.writeValueAsString(values); }
    catch (Exception e) { return "[]"; }
  }

  private String env(String key) {
    String fromSys = System.getenv(key);
    if (fromSys != null && !fromSys.isBlank()) return fromSys;
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

  private int integerFromEnv(String key, int fallback) {
    try { return Integer.parseInt(env(key)); } catch (Exception e) { return fallback; }
  }

  private static String id() { return UUID.randomUUID().toString().replace("-", "").substring(0, 16); }
  private static String string(Map<String, Object> body, String key) {
    Object value = body.get(key); return value == null ? "" : String.valueOf(value);
  }
  @SuppressWarnings("unchecked")
  private static List<String> strings(Object value) {
    if (value instanceof List<?> list) return list.stream().map(String::valueOf).toList();
    if (value instanceof String s && !s.isBlank()) {
      return List.of(s.split(",")).stream().map(String::trim).filter(v -> !v.isEmpty()).toList();
    }
    return List.of();
  }
  private static int integer(Map<String, Object> body, String key, int fallback) {
    Object value = body.get(key); return value instanceof Number number ? number.intValue() : fallback;
  }
  private static double doubleVal(Map<String, Object> body, String key, double fallback) {
    Object value = body.get(key);
    if (value instanceof Number n) return n.doubleValue();
    try { return Double.parseDouble(String.valueOf(value)); } catch (Exception e) { return fallback; }
  }
  private static String nullable(String value) { return value == null || value.isBlank() ? null : value; }
  private static String defaulted(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
  private static String lower(Object value) { return String.valueOf(value).toLowerCase(Locale.ROOT); }
  private static double round(double value) { return Math.round(value * 10d) / 10d; }
  private static double distance(double lat1, double lng1, double lat2, double lng2) {
    double dLat = Math.toRadians(lat2 - lat1), dLng = Math.toRadians(lng2 - lng1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371d * 2d * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  private static ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
  private static ResponseStatusException notFound(String message) { return new ResponseStatusException(HttpStatus.NOT_FOUND, message); }
  private static Map<String, Object> map(Object... values) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (int index = 0; index < values.length; index += 2) if (values[index + 1] != null) out.put(String.valueOf(values[index]), values[index + 1]);
    return out;
  }
}
