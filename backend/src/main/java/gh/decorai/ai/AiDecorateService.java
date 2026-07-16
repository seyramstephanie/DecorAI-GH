package gh.decorai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * AI Decorate microservice — FR-07..FR-14 pipeline:
 * analyse space → structure-safe generation prompt → image → verify → identify shop items.
 */
@Service
public class AiDecorateService {
  private static final int MAX_ATTEMPTS = 3;

  private final GeminiClient gemini;
  private final ObjectMapper json;

  public AiDecorateService(GeminiClient gemini, ObjectMapper json) {
    this.gemini = gemini;
    this.json = json;
  }

  public Map<String, Object> status() {
    Map<String, Object> s = new LinkedHashMap<>();
    s.put("service", "ai-decorate-service");
    s.put("configured", gemini.configured());
    s.put("textModel", gemini.textModel());
    s.put("imageModel", gemini.imageModel());
    s.put("pipeline", List.of("analyze", "generate", "verify", "identify"));
    s.put("message", gemini.configured()
        ? "Ready — GEMINI_API_KEY loaded"
        : "Add GEMINI_API_KEY (or EXPO_PUBLIC_GEMINI_API_KEY) to root .env and restart API");
    return s;
  }

  /**
   * Full decorate pipeline. photoBase64 without data-URL prefix.
   */
  public Map<String, Object> decorate(
      String photoBase64,
      String eventType,
      String style,
      String vision,
      String mime
  ) {
    if (photoBase64 == null || photoBase64.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photoBase64 is required");
    }
    // strip data URL prefix if present
    String b64 = photoBase64;
    String imageMime = mime == null || mime.isBlank() ? "image/jpeg" : mime;
    if (b64.contains(",")) {
      String head = b64.substring(0, b64.indexOf(','));
      if (head.contains("image/png")) imageMime = "image/png";
      b64 = b64.substring(b64.indexOf(',') + 1);
    }

    if (!gemini.configured()) {
      // Explicit mock response so clients know keys are missing (not a fake design)
      return mockUnavailable(eventType, style, vision);
    }

    List<String> stages = new ArrayList<>();
    try {
      stages.add("Analysing your space…");
      Map<String, Object> analysis = analyze(b64, imageMime);

      String roomType = str(analysis, "roomType", "room");
      String structures = joinList(analysis.get("structures"));
      String zones = joinList(analysis.get("placementZones"));
      String lighting = str(analysis, "lighting", "natural");
      String palette = joinList(analysis.get("existingPalette"));
      String camera = str(analysis, "cameraNotes", "match original photo");

      String genPrompt = SystemPrompts.generationUserPrompt(
          roomType, structures, zones, lighting, palette,
          eventType == null ? "Home Interior" : eventType,
          style == null ? "Modern" : style,
          vision == null ? "" : vision,
          camera
      );

      String lastImage = "";
      int attempts = 0;
      for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        attempts = attempt;
        stages.add(attempt == 1 ? "Generating finished design…" : "Refining design (attempt " + attempt + ")…");
        List<Map<String, Object>> parts = gemini.generateContent(
            gemini.imageModel(),
            List.of(
                GeminiClient.textPart(SystemPrompts.GENERATION_SYSTEM + "\n\n" + genPrompt),
                GeminiClient.imagePart(b64, imageMime)
            ),
            false,
            true
        );
        String generated = GeminiClient.extractImage(parts);
        if (generated == null || generated.isBlank()) continue;
        lastImage = generated;

        stages.add("Checking room structure…");
        boolean preserved = verify(b64, generated, structures, imageMime);
        if (preserved) {
          stages.add("Identifying shop items…");
          List<String> items = identify(generated);
          return result(generated, items, analysis, attempts, stages, true, null);
        }
      }

      if (lastImage.isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Image generation returned no image. Try another photo.");
      }
      stages.add("Structure check soft-failed — returning best design");
      List<String> items = identify(lastImage);
      return result(lastImage, items, analysis, attempts, stages, true, "Structure verification soft-failed after retries");
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "AI decorate failed: " + e.getMessage()
      );
    }
  }

  private Map<String, Object> analyze(String b64, String mime) throws Exception {
    List<Map<String, Object>> parts = gemini.generateContent(
        gemini.textModel(),
        List.of(
            GeminiClient.textPart(SystemPrompts.ANALYZE_SYSTEM + "\n\nAnalyse this space photo and return the JSON schema."),
            GeminiClient.imagePart(b64, mime)
        ),
        true,
        false
    );
    String text = GeminiClient.extractText(parts);
    JsonNode node = json.readTree(stripFences(text));
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("roomType", node.path("roomType").asText("room"));
    out.put("structures", toStringList(node.path("structures")));
    out.put("placementZones", toStringList(node.path("placementZones")));
    out.put("lighting", node.path("lighting").asText(""));
    out.put("existingPalette", toStringList(node.path("existingPalette")));
    out.put("cameraNotes", node.path("cameraNotes").asText(""));
    return out;
  }

  private boolean verify(String original, String generated, String structures, String mime) {
    try {
      List<Map<String, Object>> parts = gemini.generateContent(
          gemini.textModel(),
          List.of(
              GeminiClient.textPart(SystemPrompts.VERIFY_SYSTEM + "\n\n" + SystemPrompts.verifyUserPrompt(structures)),
              GeminiClient.imagePart(original, mime),
              GeminiClient.imagePart(generated, "image/png")
          ),
          true,
          false
      );
      JsonNode node = json.readTree(stripFences(GeminiClient.extractText(parts)));
      return node.path("preserved").asBoolean(true);
    } catch (Exception e) {
      // Don't block the client if verifier fails
      return true;
    }
  }

  private List<String> identify(String generatedB64) {
    try {
      List<Map<String, Object>> parts = gemini.generateContent(
          gemini.textModel(),
          List.of(
              GeminiClient.textPart(SystemPrompts.IDENTIFY_SYSTEM + "\n\n" + SystemPrompts.IDENTIFY_USER),
              GeminiClient.imagePart(generatedB64, "image/png")
          ),
          true,
          false
      );
      JsonNode node = json.readTree(stripFences(GeminiClient.extractText(parts)));
      return toStringList(node.path("items"));
    } catch (Exception e) {
      return List.of();
    }
  }

  private Map<String, Object> mockUnavailable(String eventType, String style, String vision) {
    Map<String, Object> analysis = new LinkedHashMap<>();
    analysis.put("roomType", "space");
    analysis.put("structures", List.of("walls", "floor", "ceiling"));
    analysis.put("placementZones", List.of("centre", "corners"));
    analysis.put("lighting", "unknown");
    analysis.put("existingPalette", List.of());
    analysis.put("cameraNotes", "");

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("ok", false);
    out.put("mock", true);
    out.put("service", "ai-decorate-service");
    out.put("imageBase64", null);
    out.put("items", List.of());
    out.put("analysis", analysis);
    out.put("attempts", 0);
    out.put("stages", List.of("Waiting for GEMINI_API_KEY"));
    out.put("eventType", eventType);
    out.put("style", style);
    out.put("vision", vision);
    out.put("message", "Add GEMINI_API_KEY to root .env (Google AI Studio), restart API, then retry Decorate with AI.");
    return out;
  }

  private Map<String, Object> result(
      String image,
      List<String> items,
      Map<String, Object> analysis,
      int attempts,
      List<String> stages,
      boolean ok,
      String warning
  ) {
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("ok", ok);
    out.put("mock", false);
    out.put("service", "ai-decorate-service");
    out.put("imageBase64", image);
    out.put("items", items);
    out.put("analysis", analysis);
    out.put("attempts", attempts);
    out.put("stages", stages);
    if (warning != null) out.put("warning", warning);
    return out;
  }

  private static List<String> toStringList(JsonNode arr) {
    List<String> out = new ArrayList<>();
    if (arr != null && arr.isArray()) {
      arr.forEach(n -> {
        if (!n.asText("").isBlank()) out.add(n.asText());
      });
    }
    return out;
  }

  private static String joinList(Object o) {
    if (o instanceof List<?> list) {
      List<String> s = new ArrayList<>();
      for (Object x : list) if (x != null && !String.valueOf(x).isBlank()) s.add(String.valueOf(x));
      return s.isEmpty() ? "(none listed)" : String.join("; ", s);
    }
    return o == null ? "(none listed)" : String.valueOf(o);
  }

  private static String str(Map<String, Object> m, String k, String fallback) {
    Object v = m.get(k);
    if (v == null || String.valueOf(v).isBlank()) return fallback;
    return String.valueOf(v);
  }

  private static String stripFences(String text) {
    if (text == null) return "{}";
    String t = text.trim();
    if (t.startsWith("```")) {
      int nl = t.indexOf('\n');
      if (nl > 0) t = t.substring(nl + 1);
      if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
    }
    return t.trim();
  }
}
