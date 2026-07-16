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
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Gemini HTTP client for the AI decorate microservice.
 * Key: GEMINI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY in root .env
 */
@Component
public class GeminiClient {
  private static final String API = "https://generativelanguage.googleapis.com/v1beta/models";
  private static final String TEXT_MODEL = "gemini-2.5-flash";
  private static final String IMAGE_MODEL = "gemini-2.5-flash-image";

  private final ObjectMapper json;
  private final HttpClient http = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(20))
      .build();

  public GeminiClient(ObjectMapper json) {
    this.json = json;
  }

  public String apiKey() {
    String k = DotEnv.get("GEMINI_API_KEY");
    if (k.isBlank()) k = DotEnv.get("EXPO_PUBLIC_GEMINI_API_KEY");
    return k == null ? "" : k.trim();
  }

  public boolean configured() {
    return !apiKey().isBlank();
  }

  public List<Map<String, Object>> generateContent(
      String model,
      List<Map<String, Object>> parts,
      boolean jsonOut,
      boolean imageOut
  ) throws Exception {
    String key = apiKey();
    if (key.isBlank()) throw new IllegalStateException("GEMINI_API_KEY not set in .env");

    ObjectNode body = json.createObjectNode();
    ArrayNode contents = body.putArray("contents");
    ObjectNode content = contents.addObject();
    ArrayNode partsNode = content.putArray("parts");
    for (Map<String, Object> p : parts) {
      ObjectNode part = partsNode.addObject();
      if (p.containsKey("text")) {
        part.put("text", String.valueOf(p.get("text")));
      }
      if (p.containsKey("inline_data")) {
        @SuppressWarnings("unchecked")
        Map<String, String> inline = (Map<String, String>) p.get("inline_data");
        ObjectNode inlineNode = part.putObject("inline_data");
        inlineNode.put("mime_type", inline.getOrDefault("mime_type", "image/jpeg"));
        inlineNode.put("data", inline.get("data"));
      }
    }
    if (jsonOut || imageOut) {
      ObjectNode gen = body.putObject("generationConfig");
      if (jsonOut) gen.put("responseMimeType", "application/json");
      if (imageOut) {
        ArrayNode mods = gen.putArray("responseModalities");
        mods.add("IMAGE");
        mods.add("TEXT");
      }
    }

    HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create(API + "/" + model + ":generateContent?key=" + key))
        .timeout(Duration.ofSeconds(120))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
        .build();

    HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
    if (res.statusCode() >= 400) {
      throw new IllegalStateException("Gemini " + res.statusCode() + ": " + res.body().substring(0, Math.min(240, res.body().length())));
    }
    JsonNode root = json.readTree(res.body());
    JsonNode partsOut = root.path("candidates").path(0).path("content").path("parts");
    List<Map<String, Object>> list = new ArrayList<>();
    if (partsOut.isArray()) {
      for (JsonNode p : partsOut) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        if (p.has("text")) m.put("text", p.get("text").asText());
        JsonNode inline = p.has("inlineData") ? p.get("inlineData") : p.get("inline_data");
        if (inline != null && !inline.isMissingNode()) {
          m.put("inline_data", Map.of(
              "mime_type", inline.path("mimeType").asText(inline.path("mime_type").asText("image/png")),
              "data", inline.path("data").asText()
          ));
        }
        list.add(m);
      }
    }
    return list;
  }

  public String textModel() { return TEXT_MODEL; }
  public String imageModel() { return IMAGE_MODEL; }

  public static Map<String, Object> textPart(String text) {
    return Map.of("text", text);
  }

  public static Map<String, Object> imagePart(String base64, String mime) {
    return Map.of("inline_data", Map.of("mime_type", mime == null ? "image/jpeg" : mime, "data", base64));
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
}
