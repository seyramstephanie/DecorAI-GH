package gh.decorai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gh.decorai.DotEnv;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * DecorAI image client — Gemini models via OpenRouter only.
 *
 * Env (project root .env):
 *   OPENROUTER_API_KEY          required
 *   GEMINI_IMAGE_MODEL          default google/gemini-2.5-flash-image (model id, not an API key)
 *   GEMINI_VISION_MODEL         default google/gemini-2.5-flash
 *
 * OpenRouter:
 *   Chat:   POST https://openrouter.ai/api/v1/chat/completions
 *   Images: POST https://openrouter.ai/api/v1/images
 */
@Component
public class GeminiClient {
  private static final String OPENROUTER_CHAT = "https://openrouter.ai/api/v1/chat/completions";
  private static final String OPENROUTER_IMAGES = "https://openrouter.ai/api/v1/images";

  private static final String DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image";
  private static final String DEFAULT_VISION_MODEL = "google/gemini-2.5-flash";

  private static final String[] IMAGE_FALLBACKS = {
      "google/gemini-2.5-flash-image",
      "google/gemini-2.5-flash-image-preview",
      "google/gemini-3.1-flash-image",
      "google/gemini-3.1-flash-lite-image",
      "google/gemini-3-pro-image",
  };

  private static final String[] VISION_FALLBACKS = {
      "google/gemini-2.5-flash",
      "google/gemini-3.1-flash-lite",
      "google/gemini-3-flash-preview",
  };

  private final ObjectMapper json;
  private final HttpClient http = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(20))
      .build();

  public GeminiClient(ObjectMapper json) {
    this.json = json;
  }

  public String apiKey() {
    return firstNonBlank(
        DotEnv.get("OPENROUTER_API_KEY"),
        DotEnv.get("OPEN_ROUTER_API_KEY"),
        DotEnv.get("OR_API_KEY")
    );
  }

  public String provider() {
    return "openrouter";
  }

  public boolean configured() {
    return !apiKey().isBlank();
  }

  public String textModel() {
    return visionModel();
  }

  public String visionModel() {
    String m = firstNonBlank(DotEnv.get("GEMINI_VISION_MODEL"), DotEnv.get("GEMINI_TEXT_MODEL"));
    return toOpenRouterModel(m.isBlank() ? DEFAULT_VISION_MODEL : m, false);
  }

  public String imageModel() {
    String m = DotEnv.get("GEMINI_IMAGE_MODEL");
    return toOpenRouterModel(m == null || m.isBlank() ? DEFAULT_IMAGE_MODEL : m, true);
  }

  public String keyFingerprint() {
    String k = apiKey();
    if (k.isBlank()) return "(missing)";
    if (k.length() <= 8) return k.substring(0, 2) + "…(len=" + k.length() + ")";
    return k.substring(0, 4) + "…" + k.substring(k.length() - 4) + " (len=" + k.length() + ")";
  }

  public Map<String, Object> billingInfo() {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("provider", "openrouter");
    m.put("primaryImageModel", imageModel());
    m.put("visionModel", visionModel());
    m.put("billing", "openrouter-credits");
    m.put("approxUsdPerImage", "~0.039 for google/gemini-2.5-flash-image");
    m.put("note", "Add OPENROUTER_API_KEY and credits at https://openrouter.ai/settings/credits");
    m.put("imageFallbacks", List.of(IMAGE_FALLBACKS));
    return m;
  }

  public List<Map<String, Object>> generateContent(
      String model,
      List<Map<String, Object>> parts,
      boolean jsonOut,
      boolean imageOut
  ) throws Exception {
    return generateContent(model, parts, null, jsonOut, imageOut);
  }

  public List<Map<String, Object>> generateContent(
      String model,
      List<Map<String, Object>> parts,
      String systemInstruction,
      boolean jsonOut,
      boolean imageOut
  ) throws Exception {
    String key = apiKey();
    if (key.isBlank()) {
      throw new IllegalStateException(
          "OPENROUTER_API_KEY not set. Add it to root .env (https://openrouter.ai/keys), "
              + "top up credits, then restart npm run server."
      );
    }

    Exception last = null;
    List<String> tried = new ArrayList<>();
    for (String candidate : modelCandidates(model, imageOut)) {
      String resolved = toOpenRouterModel(candidate, imageOut);
      if (tried.contains(resolved)) continue;
      tried.add(resolved);
      try {
        if (imageOut) {
          // Room photo → decorated space is image+text editing. Chat modalities is the reliable path.
          // /images is a secondary fallback (text-to-image oriented).
          try {
            return callOpenRouterChatImage(resolved, parts, systemInstruction, key);
          } catch (Exception chatFirst) {
            System.err.println("[ai] chat image path failed: " + chatFirst.getMessage() + " — trying /images");
            return callOpenRouterImages(resolved, parts, systemInstruction, key);
          }
        }
        return callOpenRouterChat(resolved, parts, systemInstruction, jsonOut, key);
      } catch (GeminiHttpException e) {
        last = e;
        if (e.statusCode == 404 || e.statusCode == 400) {
          System.err.println("[ai] OpenRouter model unavailable: " + resolved + " → " + e.getMessage());
          continue;
        }
        throw e;
      }
    }
    throw new IllegalStateException(
        "No working OpenRouter model among " + tried + ". Last error: "
            + (last != null ? last.getMessage() : "unknown")
            + " — set OPENROUTER_API_KEY and GEMINI_IMAGE_MODEL=google/gemini-2.5-flash-image"
    );
  }

  private List<Map<String, Object>> callOpenRouterImages(
      String model,
      List<Map<String, Object>> parts,
      String systemInstruction,
      String key
  ) throws Exception {
    String promptText = combineText(systemInstruction, parts);
    ObjectNode body = json.createObjectNode();
    body.put("model", model);
    body.put("prompt", promptText);
    body.put("aspect_ratio", "3:4");
    body.put("resolution", "1K");
    body.put("n", 1);

    ArrayNode refs = body.putArray("input_references");
    for (Map<String, Object> p : parts) {
      if (!p.containsKey("inline_data")) continue;
      @SuppressWarnings("unchecked")
      Map<String, String> inline = (Map<String, String>) p.get("inline_data");
      String mime = inline.getOrDefault("mime_type", "image/jpeg");
      String data = inline.get("data");
      if (data == null || data.isBlank()) continue;
      ObjectNode ref = refs.addObject();
      ref.put("type", "image_url");
      ObjectNode imageUrl = ref.putObject("image_url");
      imageUrl.put("url", "data:" + mime + ";base64," + data);
    }

    System.out.println("[ai] OpenRouter POST /images model=" + model + " promptChars=" + promptText.length());
    HttpResponse<String> res = postJson(OPENROUTER_IMAGES, body, key);
    System.out.println("[ai] OpenRouter /images status=" + res.statusCode() + " bodyChars=" + (res.body() == null ? 0 : res.body().length()));
    if (res.statusCode() >= 400) {
      System.err.println("[ai] OpenRouter /images failed (" + res.statusCode() + "): " + truncate(res.body(), 300));
      throw GeminiHttpException.from(res.statusCode(), res.body(), model);
    }

    JsonNode root = json.readTree(res.body());
    List<Map<String, Object>> list = new ArrayList<>();
    JsonNode data = root.path("data");
    if (data.isArray()) {
      for (JsonNode img : data) {
        String b64 = img.path("b64_json").asText("");
        if (b64.isBlank()) b64 = extractDataUrlBase64(img.path("url").asText(""));
        if (b64.isBlank()) continue;
        String mime = img.path("media_type").asText("image/png");
        list.add(Map.of("inline_data", Map.of("mime_type", mime, "data", b64)));
      }
    }
    if (list.isEmpty()) {
      throw new IllegalStateException(
          "OpenRouter image model returned no image. Body: " + truncate(res.body(), 240)
      );
    }
    return list;
  }

  private List<Map<String, Object>> callOpenRouterChatImage(
      String model,
      List<Map<String, Object>> parts,
      String systemInstruction,
      String key
  ) throws Exception {
    ObjectNode body = json.createObjectNode();
    body.put("model", model);
    ArrayNode modalities = body.putArray("modalities");
    modalities.add("text");
    modalities.add("image");

    ArrayNode messages = body.putArray("messages");
    if (systemInstruction != null && !systemInstruction.isBlank()) {
      ObjectNode sys = messages.addObject();
      sys.put("role", "system");
      sys.put("content", systemInstruction);
    }
    ObjectNode user = messages.addObject();
    user.put("role", "user");
    ArrayNode content = user.putArray("content");
    for (Map<String, Object> p : parts) {
      if (p.containsKey("text")) {
        ObjectNode t = content.addObject();
        t.put("type", "text");
        t.put("text", String.valueOf(p.get("text")));
      }
      if (p.containsKey("inline_data")) {
        @SuppressWarnings("unchecked")
        Map<String, String> inline = (Map<String, String>) p.get("inline_data");
        String mime = inline.getOrDefault("mime_type", "image/jpeg");
        String data = inline.get("data");
        ObjectNode img = content.addObject();
        img.put("type", "image_url");
        ObjectNode imageUrl = img.putObject("image_url");
        imageUrl.put("url", "data:" + mime + ";base64," + data);
      }
    }

    System.out.println("[ai] OpenRouter POST /chat/completions (image) model=" + model);
    HttpResponse<String> res = postJson(OPENROUTER_CHAT, body, key);
    System.out.println("[ai] OpenRouter chat(image) status=" + res.statusCode() + " bodyChars=" + (res.body() == null ? 0 : res.body().length()));
    if (res.statusCode() >= 400) {
      System.err.println("[ai] OpenRouter chat(image) error: " + truncate(res.body(), 400));
      throw GeminiHttpException.from(res.statusCode(), res.body(), model);
    }
    return parseOpenRouterChatResponse(res.body(), model);
  }

  private List<Map<String, Object>> callOpenRouterChat(
      String model,
      List<Map<String, Object>> parts,
      String systemInstruction,
      boolean jsonOut,
      String key
  ) throws Exception {
    ObjectNode body = json.createObjectNode();
    body.put("model", model);
    if (jsonOut) {
      ObjectNode rf = body.putObject("response_format");
      rf.put("type", "json_object");
    }

    ArrayNode messages = body.putArray("messages");
    if (systemInstruction != null && !systemInstruction.isBlank()) {
      ObjectNode sys = messages.addObject();
      sys.put("role", "system");
      sys.put("content", systemInstruction);
    }
    ObjectNode user = messages.addObject();
    user.put("role", "user");
    ArrayNode content = user.putArray("content");
    for (Map<String, Object> p : parts) {
      if (p.containsKey("text")) {
        ObjectNode t = content.addObject();
        t.put("type", "text");
        t.put("text", String.valueOf(p.get("text")));
      }
      if (p.containsKey("inline_data")) {
        @SuppressWarnings("unchecked")
        Map<String, String> inline = (Map<String, String>) p.get("inline_data");
        String mime = inline.getOrDefault("mime_type", "image/jpeg");
        String data = inline.get("data");
        ObjectNode img = content.addObject();
        img.put("type", "image_url");
        ObjectNode imageUrl = img.putObject("image_url");
        imageUrl.put("url", "data:" + mime + ";base64," + data);
      }
    }

    System.out.println("[ai] OpenRouter POST /chat/completions model=" + model + " jsonOut=" + jsonOut);
    HttpResponse<String> res = postJson(OPENROUTER_CHAT, body, key);
    System.out.println("[ai] OpenRouter chat status=" + res.statusCode() + " bodyChars=" + (res.body() == null ? 0 : res.body().length()));
    if (res.statusCode() >= 400) {
      System.err.println("[ai] OpenRouter chat error: " + truncate(res.body(), 400));
      throw GeminiHttpException.from(res.statusCode(), res.body(), model);
    }
    return parseOpenRouterChatResponse(res.body(), model);
  }

  private List<Map<String, Object>> parseOpenRouterChatResponse(String body, String model) throws Exception {
    JsonNode root = json.readTree(body);
    JsonNode choices = root.path("choices");
    if (!choices.isArray() || choices.isEmpty()) {
      throw new IllegalStateException("OpenRouter returned no choices for " + model + ": " + truncate(body, 200));
    }
    JsonNode message = choices.path(0).path("message");
    List<Map<String, Object>> list = new ArrayList<>();

    // OpenRouter image models: message.images[] or content parts
    collectImages(message.path("images"), list);
    collectImages(root.path("images"), list);

    JsonNode content = message.path("content");
    if (content.isTextual()) {
      String text = content.asText();
      String embedded = extractDataUrlBase64(text);
      if (!embedded.isBlank() && text.toLowerCase(Locale.ROOT).contains("data:image")) {
        list.add(Map.of("inline_data", Map.of("mime_type", "image/png", "data", embedded)));
      } else if (!text.isBlank()) {
        list.add(Map.of("text", text));
      }
    } else if (content.isArray()) {
      for (JsonNode part : content) {
        String type = part.path("type").asText("");
        if ("text".equals(type) || part.has("text")) {
          String t = part.path("text").asText("");
          if (!t.isBlank()) list.add(Map.of("text", t));
        }
        if ("image_url".equals(type) || "output_image".equals(type) || part.has("image_url") || part.has("imageUrl")) {
          JsonNode imageUrl = part.has("image_url") ? part.get("image_url") : part.path("imageUrl");
          String url = imageUrl.path("url").asText(part.path("url").asText(""));
          String b64 = extractDataUrlBase64(url);
          if (b64.isBlank()) b64 = part.path("b64_json").asText(part.path("image_base64").asText(""));
          if (!b64.isBlank()) {
            list.add(Map.of("inline_data", Map.of("mime_type", "image/png", "data", b64)));
          }
        }
        // Some providers put base64 directly on the part
        if (part.has("inline_data") || part.has("inlineData")) {
          JsonNode inline = part.has("inline_data") ? part.get("inline_data") : part.get("inlineData");
          String data = inline.path("data").asText("");
          if (!data.isBlank()) {
            list.add(Map.of(
                "inline_data",
                Map.of(
                    "mime_type",
                    inline.path("mime_type").asText(inline.path("mimeType").asText("image/png")),
                    "data",
                    data
                )
            ));
          }
        }
      }
    }

    // Deep scan for data:image base64 anywhere in message (last resort)
    if (extractImage(list).isBlank()) {
      String raw = message.toString();
      int idx = raw.indexOf("data:image");
      if (idx >= 0) {
        String from = raw.substring(idx);
        // strip JSON escaping
        from = from.replace("\\/", "/").replace("\\u003d", "=");
        int end = from.indexOf('"');
        if (end > 0) from = from.substring(0, end);
        String b64 = extractDataUrlBase64(from);
        if (!b64.isBlank()) {
          list.add(Map.of("inline_data", Map.of("mime_type", "image/png", "data", b64)));
        }
      }
    }

    if (list.isEmpty()) {
      throw new IllegalStateException("OpenRouter empty message for " + model + ": " + truncate(body, 240));
    }
    if (extractImage(list).isBlank()) {
      String text = extractText(list);
      System.err.println("[ai] no image bytes in response for " + model + " text=" + truncate(text, 200));
    }
    return list;
  }

  private static void collectImages(JsonNode images, List<Map<String, Object>> list) {
    if (images == null || !images.isArray()) return;
    for (JsonNode img : images) {
      String url = img.path("image_url").path("url").asText(
          img.path("imageUrl").path("url").asText(img.path("url").asText(""))
      );
      String b64 = extractDataUrlBase64(url);
      if (b64.isBlank()) b64 = img.path("b64_json").asText(img.path("image_base64").asText(""));
      if (!b64.isBlank()) {
        list.add(Map.of("inline_data", Map.of("mime_type", "image/png", "data", b64)));
      }
    }
  }

  private HttpResponse<String> postJson(String url, ObjectNode body, String key) throws Exception {
    HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .timeout(Duration.ofSeconds(180))
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + key)
        .header("HTTP-Referer", "https://decorai.gh")
        .header("X-Title", "DecorAI GH")
        .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
        .build();
    return http.send(req, HttpResponse.BodyHandlers.ofString());
  }

  private List<String> modelCandidates(String preferred, boolean imageOut) {
    List<String> out = new ArrayList<>();
    if (preferred != null && !preferred.isBlank()) out.add(preferred.trim());
    for (String f : imageOut ? IMAGE_FALLBACKS : VISION_FALLBACKS) {
      if (!out.contains(f)) out.add(f);
    }
    if (imageOut) {
      out.removeIf(m -> m != null && !m.toLowerCase(Locale.ROOT).contains("image"));
      if (out.isEmpty()) out.add(DEFAULT_IMAGE_MODEL);
    }
    return out;
  }

  static String toOpenRouterModel(String model, boolean image) {
    if (model == null || model.isBlank()) {
      return image ? DEFAULT_IMAGE_MODEL : DEFAULT_VISION_MODEL;
    }
    String m = model.trim();
    if (m.contains("/")) return m;
    return switch (m) {
      case "gemini-2.5-flash-image", "gemini-2.5-flash-image-preview" -> "google/" + m;
      case "gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-3-pro-image" -> "google/" + m;
      case "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3-flash-preview",
           "gemini-2.0-flash", "gemini-2.5-pro" -> "google/" + m;
      default -> m.startsWith("gemini") ? "google/" + m : m;
    };
  }

  private static String combineText(String systemInstruction, List<Map<String, Object>> parts) {
    StringBuilder sb = new StringBuilder();
    if (systemInstruction != null && !systemInstruction.isBlank()) {
      sb.append(systemInstruction.trim()).append("\n\n");
    }
    for (Map<String, Object> p : parts) {
      if (p.get("text") != null) sb.append(String.valueOf(p.get("text"))).append("\n\n");
    }
    return sb.toString().trim();
  }

  private static String extractDataUrlBase64(String url) {
    if (url == null || url.isBlank()) return "";
    int comma = url.indexOf(',');
    if (url.startsWith("data:") && comma > 0) return url.substring(comma + 1).trim();
    if (!url.startsWith("http") && url.length() > 200) return url.trim();
    return "";
  }

  public static Map<String, Object> textPart(String text) {
    return Map.of("text", text);
  }

  public static Map<String, Object> imagePart(String base64, String mime) {
    return Map.of(
        "inline_data",
        Map.of("mime_type", mime == null || mime.isBlank() ? "image/jpeg" : mime, "data", base64)
    );
  }

  public static String extractText(List<Map<String, Object>> parts) {
    for (Map<String, Object> p : parts) {
      if (p.get("text") != null) return String.valueOf(p.get("text"));
    }
    return "";
  }

  @SuppressWarnings("unchecked")
  public static String extractImage(List<Map<String, Object>> parts) {
    for (Map<String, Object> p : parts) {
      Object inline = p.get("inline_data");
      if (inline instanceof Map<?, ?> m) {
        Object data = m.get("data");
        if (data != null && !String.valueOf(data).isBlank()) return String.valueOf(data);
      }
    }
    return "";
  }

  private static String firstNonBlank(String... values) {
    if (values == null) return "";
    for (String v : values) {
      if (v != null && !v.isBlank()) return v.trim();
    }
    return "";
  }

  private static String truncate(String s, int max) {
    if (s == null) return "";
    return s.length() <= max ? s : s.substring(0, max);
  }

  public static final class GeminiHttpException extends Exception {
    public final int statusCode;
    public final String model;

    public GeminiHttpException(int statusCode, String model, String message) {
      super(message);
      this.statusCode = statusCode;
      this.model = model;
    }

    static GeminiHttpException from(int status, String body, String model) {
      String msg = extractMessage(body);
      String hint;
      if (status == 400) {
        hint = "Bad request to model (check photo size / model id).";
      } else if (status == 401 || status == 403) {
        hint = "Invalid OPENROUTER_API_KEY. Create a key at https://openrouter.ai/keys and put it in root .env.";
      } else if (status == 404) {
        hint = "Model not available on OpenRouter: " + model + ". Use google/gemini-2.5-flash-image.";
      } else if (status == 402) {
        hint = "OpenRouter credits exhausted. Top up at https://openrouter.ai/settings/credits";
      } else if (status == 429) {
        hint = "Rate limited by OpenRouter/provider. Wait a moment and retry.";
      } else if (status >= 500) {
        hint = "Upstream provider error (" + status + "). Retry shortly.";
      } else {
        hint = "HTTP " + status;
      }
      String detail = msg.isBlank() ? truncate(body, 240) : msg;
      return new GeminiHttpException(status, model, hint + " | " + detail);
    }

    private static String extractMessage(String body) {
      if (body == null || body.isBlank()) return "";
      try {
        int i = body.indexOf("\"message\"");
        if (i < 0) return truncate(body, 200);
        int colon = body.indexOf(':', i);
        int q1 = body.indexOf('"', colon + 1);
        if (q1 < 0) return truncate(body, 200);
        StringBuilder sb = new StringBuilder();
        for (int p = q1 + 1; p < body.length(); p++) {
          char c = body.charAt(p);
          if (c == '\\' && p + 1 < body.length()) {
            sb.append(body.charAt(p + 1));
            p++;
            continue;
          }
          if (c == '"') break;
          sb.append(c);
        }
        return sb.toString().trim();
      } catch (Exception e) {
        return truncate(body, 200);
      }
    }
  }
}
