package gh.decorai.shared;

/** Logical microservice names in the modular monolith (deployable as separate processes later). */
public final class ServiceIds {
  public static final String GATEWAY = "gateway";
  public static final String AUTH = "auth-service";
  public static final String CATALOG = "catalog-service";
  public static final String BILLING = "billing-service";
  public static final String BOOKINGS = "bookings-service";
  public static final String NOTIFICATIONS = "notifications-service";
  public static final String AI = "ai-decorate-service";
  public static final String MAIL = "mail-service";

  private ServiceIds() {}
}
