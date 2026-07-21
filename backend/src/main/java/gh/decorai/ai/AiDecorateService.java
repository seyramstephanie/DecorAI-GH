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
 * AI Decorate microservice — IMAGE-GEN first pipeline (not a chatbot).
 *
 * Core paid call: gemini-2.5-flash-image (~$0.039 ≈ 5¢ per decorated photo on Paid tier).
 * Analyze / verify / identify are best-effort helpers and never replace image generation.
 */
@Service
public class AiDecorateService {
  /** Server-side image gen retries when the model returns no image bytes. */
  private static final int MAX_ATTEMPTS = 3;
  private static final int MAX_PHOTO_B64_CHARS = 5_500_000;

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
    s.put("keyFingerprint", gemini.keyFingerprint());
    s.put("imageModel", gemini.imageModel());
    s.put("visionModel", gemini.visionModel());
    s.put("textModel", gemini.visionModel()); // legacy field
    s.put("pipeline", List.of("analyze(optional)", "image-generate", "verify(optional)", "identify(optional)"));
    s.put("billing", gemini.billingInfo());
    s.put("provider", gemini.provider());
    s.put("envKeys", List.of(
        "OPENROUTER_API_KEY",
        "GEMINI_IMAGE_MODEL",
        "GEMINI_VISION_MODEL"
    ));
    s.put("message", gemini.configured()
        ? "Ready via " + gemini.provider() + " — image model " + gemini.imageModel()
          + " (" + gemini.keyFingerprint() + "). Gemini models still used; OpenRouter supplies credits."
        : "Add OPENROUTER_API_KEY to root .env (https://openrouter.ai/keys), set GEMINI_IMAGE_MODEL=google/gemini-2.5-flash-image, restart npm run server");
    return s;
  }

  public Map<String, Object> decorate(
      String photoBase64,
      String eventType,
      String style,
      String vision,
      String mime
  ) {
    if (photoBase64 == null || photoBase64.isBlank()) {
      throw apiError(HttpStatus.BAD_REQUEST, "photoBase64 is required", "validate");
    }

    String b64 = photoBase64;
    String imageMime = mime == null || mime.isBlank() ? "image/jpeg" : mime;
    if (b64.contains(",")) {
      String head = b64.substring(0, b64.indexOf(','));
      if (head.contains("image/png")) imageMime = "image/png";
      else if (head.contains("image/webp")) imageMime = "image/webp";
      b64 = b64.substring(b64.indexOf(',') + 1);
    }
    b64 = b64.replaceAll("\\s", "");

    if (b64.length() > MAX_PHOTO_B64_CHARS) {
      throw apiError(
          HttpStatus.BAD_REQUEST,
          "Photo is too large for AI decorate. Retake with lower quality or crop the room.",
          "validate"
      );
    }

    if (!gemini.configured()) {
      return mockUnavailable(eventType, style, vision);
    }

    List<String> stages = new ArrayList<>();
    String usedImageModel = gemini.imageModel();
    try {
      stages.add("Preparing narrative decorate brief (Gemini image-edit template)…");
      Map<String, Object> analysis = analyzeSoft(b64, imageMime, stages);

      String roomType = str(analysis, "roomType", "room / venue");
      String spaceDescription = str(analysis, "spaceDescription", "");
      if (spaceDescription.isBlank()) {
        spaceDescription = "a real " + roomType + " photographed for professional decoration";
      }
      String structures = joinList(analysis.get("structures"));
      String zones = joinList(analysis.get("placementZones"));
      String lighting = str(analysis, "lighting", "match the photo");
      String palette = joinList(analysis.get("existingPalette"));
      String camera = str(analysis, "cameraNotes", "match original photo exactly");
      String furnitureHints = joinList(analysis.get("furnitureHints"));
      String constraints = joinList(analysis.get("constraints"));

      // Google-style narrative master prompt (full sentences, not keywords)
      String genPrompt = SystemPrompts.generationUserPrompt(
          roomType,
          spaceDescription,
          structures,
          zones,
          lighting,
          palette,
          eventType == null || eventType.isBlank() ? "Home Interior" : eventType,
          style == null || style.isBlank() ? "Modern" : style,
          vision == null ? "" : vision,
          camera,
          furnitureHints,
          constraints
      );

      String lastImage = "";
      int attempts = 0;
      for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        attempts = attempt;
        stages.add(attempt == 1
            ? "Generating decorated space with " + usedImageModel + " via " + gemini.provider() + "…"
            : "Refining design (attempt " + attempt + ")…");

        List<Map<String, Object>> parts = gemini.generateContent(
            gemini.imageModel(),
            List.of(
                GeminiClient.textPart(genPrompt),
                GeminiClient.imagePart(b64, imageMime)
            ),
            SystemPrompts.GENERATION_SYSTEM,
            false,
            true // ALWAYS image modalities — never chat-only
        );
        String generated = GeminiClient.extractImage(parts);
        if (generated == null || generated.isBlank()) {
          String text = GeminiClient.extractText(parts);
          System.err.println("[ai] image model returned no image. text=" + truncate(text, 160));
          // Surface model refusal on last attempt instead of a vague 502
          if (attempt == MAX_ATTEMPTS && text != null && !text.isBlank()) {
            throw apiError(
                HttpStatus.BAD_GATEWAY,
                "Image model did not return a design image. Model said: " + truncate(text, 280),
                "generate"
            );
          }
          continue;
        }
        lastImage = generated;

        stages.add("Checking room structure…");
        boolean preserved = verifySoft(b64, generated, structures, imageMime);
        if (preserved || attempt == MAX_ATTEMPTS) {
          stages.add("Identifying shop items…");
          List<String> items = identifySoft(generated);
          String warning = preserved ? null : "Structure check soft-failed — returning best design";
          if (!preserved) stages.add("Structure check soft-failed — returning best design");
          return result(generated, items, analysis, attempts, stages, true, warning, usedImageModel);
        }
      }

      if (lastImage.isBlank()) {
        throw apiError(
            HttpStatus.BAD_GATEWAY,
            "Image generation returned no image from " + usedImageModel + " via OpenRouter. "
                + "Use a clear room/venue photo (not a solid color). "
                + "Confirm OPENROUTER_API_KEY has credits (https://openrouter.ai/settings/credits). "
                + "Watch the API window for [ai] OpenRouter lines.",
            "generate"
        );
      }
      List<String> items = identifySoft(lastImage);
      return result(lastImage, items, analysis, attempts, stages, true,
          "Structure verification soft-failed after retries", usedImageModel);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (GeminiClient.GeminiHttpException e) {
      throw apiError(mapGeminiStatus(e.statusCode), e.getMessage(), "gemini");
    } catch (Exception e) {
      String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
      System.err.println("[ai] decorate failed: " + msg);
      throw apiError(HttpStatus.BAD_GATEWAY, "AI decorate failed: " + msg, "pipeline");
    }
  }

  /** Best-effort room analysis — never blocks image generation. */
  private Map<String, Object> analyzeSoft(String b64, String mime, List<String> stages) {
    Map<String, Object> fallback = defaultAnalysis();
    try {
      stages.add("Analysing your space (vision helper)…");
      List<Map<String, Object>> parts = gemini.generateContent(
          gemini.visionModel(),
          List.of(
              GeminiClient.textPart("Analyse this space photo and return the JSON schema only."),
              GeminiClient.imagePart(b64, mime)
          ),
          SystemPrompts.ANALYZE_SYSTEM,
          true,
          false
      );
      String text = GeminiClient.extractText(parts);
      JsonNode node = json.readTree(stripFences(text));
      Map<String, Object> out = new LinkedHashMap<>();
      out.put("roomType", node.path("roomType").asText("room"));
      out.put("spaceDescription", node.path("spaceDescription").asText(""));
      out.put("structures", toStringList(node.path("structures")));
      out.put("placementZones", toStringList(node.path("placementZones")));
      out.put("lighting", node.path("lighting").asText(""));
      out.put("existingPalette", toStringList(node.path("existingPalette")));
      out.put("cameraNotes", node.path("cameraNotes").asText(""));
      out.put("constraints", toStringList(node.path("constraints")));
      out.put("furnitureHints", toStringList(node.path("furnitureHints")));
      out.put("moodNow", node.path("moodNow").asText(""));
      return out;
    } catch (Exception e) {
      stages.add("Analysis skipped — using structure-safe defaults for image model");
      System.err.println("[ai] analyze soft-fail: " + e.getMessage());
      return fallback;
    }
  }

  private boolean verifySoft(String original, String generated, String structures, String mime) {
    try {
      List<Map<String, Object>> parts = gemini.generateContent(
          gemini.visionModel(),
          List.of(
              GeminiClient.textPart(SystemPrompts.verifyUserPrompt(structures)),
              GeminiClient.imagePart(original, mime),
              GeminiClient.imagePart(generated, "image/png")
          ),
          SystemPrompts.VERIFY_SYSTEM,
          true,
          false
      );
      JsonNode node = json.readTree(stripFences(GeminiClient.extractText(parts)));
      return node.path("preserved").asBoolean(true);
    } catch (Exception e) {
      System.err.println("[ai] verify soft-fail: " + e.getMessage());
      return true;
    }
  }

  private List<String> identifySoft(String generatedB64) {
    try {
      List<Map<String, Object>> parts = gemini.generateContent(
          gemini.visionModel(),
          List.of(
              GeminiClient.textPart(SystemPrompts.IDENTIFY_USER),
              GeminiClient.imagePart(generatedB64, "image/png")
          ),
          SystemPrompts.IDENTIFY_SYSTEM,
          true,
          false
      );
      JsonNode node = json.readTree(stripFences(GeminiClient.extractText(parts)));
      return toStringList(node.path("items"));
    } catch (Exception e) {
      System.err.println("[ai] identify soft-fail: " + e.getMessage());
      return List.of();
    }
  }

  private static Map<String, Object> defaultAnalysis() {
    Map<String, Object> analysis = new LinkedHashMap<>();
    analysis.put("roomType", "room / venue");
    analysis.put(
        "spaceDescription",
        "A real room or venue photographed for professional decoration, with architecture and viewpoint that must stay identical."
    );
    analysis.put("structures", List.of(
        "walls", "floor", "ceiling", "windows", "doors", "fixed fixtures as photographed"
    ));
    analysis.put("placementZones", List.of(
        "table tops", "corners", "centre floor", "wall hanging zones", "backdrop areas"
    ));
    analysis.put("lighting", "soft natural or interior lighting matching the original photo direction and intensity");
    analysis.put("existingPalette", List.of());
    analysis.put("cameraNotes", "captured from the exact same camera angle and perspective as the original photo");
    analysis.put("constraints", List.of("never change architecture", "same viewpoint", "clear circulation paths"));
    analysis.put("furnitureHints", List.of());
    analysis.put("moodNow", "neutral");
    return analysis;
  }

  private Map<String, Object> mockUnavailable(String eventType, String style, String vision) {
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("ok", false);
    out.put("mock", true);
    out.put("service", "ai-decorate-service");
    out.put("imageBase64", null);
    out.put("items", List.of());
    out.put("analysis", defaultAnalysis());
    out.put("attempts", 0);
    out.put("stages", List.of("Waiting for OPENROUTER_API_KEY"));
    out.put("eventType", eventType);
    out.put("style", style);
    out.put("vision", vision);
    out.put(
        "message",
        "Add OPENROUTER_API_KEY to root .env (https://openrouter.ai/keys). "
            + "We still call Gemini image models: GEMINI_IMAGE_MODEL=google/gemini-2.5-flash-image. "
            + "Top up OpenRouter credits, then restart: npm run server."
    );
    return out;
  }

  private Map<String, Object> result(
      String image,
      List<String> items,
      Map<String, Object> analysis,
      int attempts,
      List<String> stages,
      boolean ok,
      String warning,
      String imageModel
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
    out.put("imageModel", imageModel);
    out.put("billing", gemini.billingInfo());
    if (warning != null) out.put("warning", warning);
    return out;
  }

  private static ResponseStatusException apiError(HttpStatus status, String message, String stage) {
    return new ResponseStatusException(status, "[stage=" + stage + "] " + message);
  }

  private static HttpStatus mapGeminiStatus(int code) {
    if (code == 401 || code == 403) return HttpStatus.UNAUTHORIZED;
    if (code == 429) return HttpStatus.TOO_MANY_REQUESTS;
    if (code == 400) return HttpStatus.BAD_REQUEST;
    if (code == 404) return HttpStatus.BAD_GATEWAY;
    return HttpStatus.BAD_GATEWAY;
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

  private static String truncate(String s, int max) {
    if (s == null) return "";
    return s.length() <= max ? s : s.substring(0, max);
  }
}
