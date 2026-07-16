package gh.decorai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds the shared Neon database once. Subsequent starts only use persisted data. */
@Component
class DatabaseSeeder implements CommandLineRunner {
  private final JdbcTemplate jdbc;
  private final ObjectMapper json;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  DatabaseSeeder(JdbcTemplate jdbc, ObjectMapper json) { this.jdbc = jdbc; this.json = json; }

  @Override public void run(String... args) {
    // Every insert is idempotent. This backfills the complete demo directory into
    // a pre-existing Neon database without wiping data created by real users.
    seedUsers(); seedShops(); seedDecorators(); linkSeedProfiles(); seedBookings(); seedMessages(); seedNotifications();
  }

  private String array(String... values) {
    try { return json.writeValueAsString(List.of(values)); }
    catch (JsonProcessingException error) { throw new IllegalStateException(error); }
  }

  private void seedUsers() {
    addUser("u1", "Seyram Dede", "seyram@decorai.gh", "+233 24 000 1111", "Kumasi", "client", "pro");
    addUser("u2", "Akosua Mensah", "akosua@royaltouch.gh", "+233 24 555 1122", "Kumasi", "decorator", "pro");
    addUser("u3", "Kwame Boateng", "kwame@adumblooms.gh", "+233 24 111 2233", "Kumasi", "shop", "free");
    addUser("admin", "DecorAI Admin", "admin@decorai.gh", "+233 20 000 0000", "Accra", "admin", "pro");
  }

  private void addUser(String id, String name, String email, String phone, String location, String role, String plan) {
    jdbc.update(
      "insert into users (id,name,email,password_hash,phone,location,role,provider,plan) values (?,?,?,?,?,?,?,?,?) on conflict (id) do nothing",
      id, name, email, passwordEncoder.encode("1234"), phone, location, role, "email", plan
    );
  }

  private void seedShops() {
    shop("s1", "Adum Blooms & Events", "Florist", "Adum", "Kumasi", 6.6906, -1.6280, 4.8, 124, "+233 24 111 2233", 10, "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80", "fresh flowers", "floral arch", "centrepieces", "flower stands", "wreaths", "potted plant");
    shop("s2", "Kejetia Fabrics & Drapes", "Fabric Supplier", "Kejetia", "Kumasi", 6.6970, -1.6178, 4.6, 89, "+233 20 445 6677", 15, "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", "drapes", "kente runners", "chair covers", "table cloths", "backdrop fabric", "wall art", "frames");
    shop("s3", "Ahodwo Home & Furniture", "Furniture", "Ahodwo", "Kumasi", 6.6670, -1.6300, 4.7, 203, "+233 54 889 0011", 12, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", "sofa", "armchair", "cushions", "coffee table", "side table", "rug");
    shop("s4", "Bantama Lights & Sound", "Lighting Rental", "Bantama", "Kumasi", 6.7050, -1.6350, 4.5, 67, "+233 26 223 4455", 20, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", "string lights", "uplighting", "fairy lights", "floor lamp", "chandeliers", "stage lighting");
    shop("s5", "Osu Decor Mart", "General Decor", "Osu", "Accra", 5.5560, -0.1750, 4.9, 311, "+233 30 990 8877", 18, "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", "balloons", "balloon arch", "desk", "bed frame", "marble table", "vases", "candles", "frames");
    shop("s6", "Tamale Events Supply", "Event Rentals", "Central", "Tamale", 9.4008, -0.8393, 4.4, 42, "+233 24 667 7889", 25, "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80", "canopy", "plastic chairs", "stage skirting", "drapes", "balloon columns");
    shop("s7", "East Legon Interiors", "Furniture", "East Legon", "Accra", 5.6360, -0.1620, 4.8, 156, "+233 55 301 2244", 15, "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", "sofa", "accent chair", "bookshelf", "rug", "floor lamp", "wall art", "mirrors");
    shop("s8", "Kumasi Craft Village", "Handicrafts", "Ash Town", "Kumasi", 6.7000, -1.6100, 4.7, 98, "+233 24 909 5566", 12, "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", "woven baskets", "clay pots", "wood carvings", "beads", "kente cloth", "woven mats");
    shop("s9", "Takoradi Beach Decor", "General Decor", "Beach Road", "Takoradi", 4.8967, -1.7554, 4.5, 61, "+233 26 411 7788", 20, "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=800&q=80", "lanterns", "vases", "candles", "side table", "cushions", "string lights");
    shop("s10", "Cape Coast Canopies", "Event Rentals", "Kotokuraba", "Cape Coast", 5.1053, -1.2466, 4.6, 74, "+233 20 655 3311", 30, "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80", "canopy", "chairs", "stage", "drapes", "red carpet", "balloon arch");
  }

  private void shop(String id, String name, String category, String area, String location, double lat, double lng, double rating, int reviews, String phone, int radius, String image, String... stock) {
    jdbc.update(
      "insert into shops (id,name,category,area,location,lat,lng,rating,reviews,phone,radius_km,image,stock,verified) values (?,?,?,?,?,?,?,?,?,?,?,?,cast(? as jsonb),true) on conflict (id) do nothing",
      id, name, category, area, location, lat, lng, rating, reviews, phone, radius, image, array(stock)
    );
  }

  private void seedDecorators() {
    decorator("d1", "Akosua Mensah", "Royal Touch Decor", "Kumasi", 6.6931, -1.6244, 4.9, 87, "+233 24 555 1122", "GH₵2,000–8,000", "Award-winning wedding and church decorator serving Ashanti Region for 8 years.", new String[]{"Wedding", "Church Anniversary"}, new String[]{"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80", "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80"});
    decorator("d2", "Kofi Asante", "Asante Events GH", "Accra", 5.6037, -0.1870, 4.7, 132, "+233 20 777 3344", "GH₵1,500–6,000", "Corporate launches, birthdays and premium private events across Greater Accra.", new String[]{"Corporate", "Birthday"}, new String[]{"https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80"});
    decorator("d3", "Efua Boateng", "Serene Spaces", "Kumasi", 6.7085, -1.6305, 4.8, 54, "+233 54 222 9900", "GH₵3,000–15,000", "Interior styling for homes and offices — modern Ghanaian contemporary is my signature.", new String[]{"Home Interior", "Luxury"}, new String[]{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"});
    decorator("d4", "Randa Wuni", "Northern Elegance", "Tamale", 9.4008, -0.8393, 4.6, 29, "+233 26 888 4455", "GH₵1,000–5,000", "Traditional and modern event decoration across the Northern Region.", new String[]{"Funeral", "Traditional", "Wedding"}, new String[]{"https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80"});
    decorator("d5", "Ama Owusu", "Golden Gates Events", "Accra", 5.6500, -0.2000, 4.9, 210, "+233 24 300 7788", "GH₵5,000–25,000", "Premium weddings and galas — full venue transformation with in-house florals and lighting.", new String[]{"Wedding", "Luxury", "Corporate"}, new String[]{"https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"});
    decorator("d6", "Yaw Darko", "Darko Decor Works", "Takoradi", 4.9016, -1.7830, 4.5, 47, "+233 55 612 9900", "GH₵800–4,000", "Western Region parties, office launches and cosy home makeovers on any budget.", new String[]{"Birthday", "Corporate", "Home Interior"}, new String[]{"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"});
    decorator("d7", "Esi Cudjoe", "Coastal Blooms", "Cape Coast", 5.1315, -1.2795, 4.7, 63, "+233 20 218 4455", "GH₵1,200–6,000", "Dignified funerals and church celebrations along the coast, with traditional touches.", new String[]{"Funeral", "Church Anniversary", "Traditional"}, new String[]{"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"});
  }

  private void decorator(String id, String name, String business, String location, double lat, double lng, double rating, int reviews, String phone, String price, String bio, String[] specialisations, String[] portfolio) {
    jdbc.update(
      "insert into decorators (id,name,business_name,location,lat,lng,rating,reviews,phone,price_range,bio,specialisations,portfolio,verified) values (?,?,?,?,?,?,?,?,?,?,?,cast(? as jsonb),cast(? as jsonb),true) on conflict (id) do nothing",
      id, name, business, location, lat, lng, rating, reviews, phone, price, bio, array(specialisations), array(portfolio)
    );
  }

  /** Wire demo accounts so decorator/shop dashboards resolve without phone matching alone. */
  private void linkSeedProfiles() {
    jdbc.update("update users set decorator_id = 'd1', plan = 'pro' where id = 'u2' and decorator_id is null");
    jdbc.update("update decorators set user_id = 'u2' where id = 'd1' and user_id is null");
    jdbc.update("update users set shop_id = 's1' where id = 'u3' and shop_id is null");
    jdbc.update("update shops set user_id = 'u3' where id = 's1' and user_id is null");
    jdbc.update("update users set plan = 'pro' where id = 'u1' and (plan is null or plan = 'free')");
  }

  private void seedBookings() {
    jdbc.update("insert into bookings (id,decorator_id,decorator_name,client_id,client_name,event_type,event_date,venue,budget,brief,design_image,status,created_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict (id) do nothing",
      "b1", "d1", "Royal Touch Decor", "u1", "Seyram Dede", "Wedding", "24 Dec 2026", "Miklin Hotel, Kumasi", "6000",
      "[AI design attached] White & gold theme with floral arch and kente runners.", "attached-ai-design", "Confirmed", OffsetDateTime.parse("2026-07-01T10:00:00Z"));
    jdbc.update("insert into bookings (id,decorator_id,decorator_name,client_id,client_name,event_type,event_date,venue,budget,brief,status,created_at) values (?,?,?,?,?,?,?,?,?,?,?,?) on conflict (id) do nothing",
      "b2", "d3", "Serene Spaces", "u1", "Seyram Dede", "Home Interior", "15 Aug 2026", "Ahodwo, Kumasi", "4500",
      "Living room refresh — modern Ghanaian contemporary style.", "Enquiry", OffsetDateTime.parse("2026-07-08T15:30:00Z"));
  }

  private void seedMessages() {
    message("m1", "dm_d1_u1", "u1", "Seyram Dede", "Hello! I love your portfolio — are you free on 24 Dec?", "2026-07-10T09:00:00Z");
    message("m2", "dm_d1_u1", "d1", "Akosua Mensah", "Hi Seyram! Yes we are — send me your venue and I’ll draft a quote.", "2026-07-10T09:12:00Z");
  }

  private void message(String id, String thread, String sender, String name, String text, String at) {
    jdbc.update("insert into messages (id,booking_id,sender_id,sender_name,text,created_at) values (?,?,?,?,?,?) on conflict (id) do nothing",
      id, thread, sender, name, text, OffsetDateTime.parse(at));
  }

  private void seedNotifications() {
    notify("n1", "all", "digest", "Weekly Inspiration", "New luxury wedding styles trending in Kumasi this week — tap to explore.", false, OffsetDateTime.now().minusDays(1));
    notify("n2", "u1", "booking", "Booking confirmed", "Royal Touch Decor confirmed your Wedding booking for 24 Dec 2026.", false, OffsetDateTime.now().minusHours(5));
    notify("n3", "u1", "brief", "Decorator replied", "Akosua Mensah sent a quote draft for Miklin Hotel.", false, OffsetDateTime.now().minusHours(3));
    notify("n4", "u1", "radius", "Shops near you", "3 shops within 10 km stock items from your last AI design.", false, OffsetDateTime.now().minusHours(2));
    notify("n5", "u1", "digest", "Home refresh ideas", "Modern Ghanaian living-room palettes for Ahodwo homes.", true, OffsetDateTime.now().minusDays(2));
    notify("n6", "u1", "stock", "Item back in stock", "Kejetia Fabrics restocked kente runners this morning.", false, OffsetDateTime.now().minusMinutes(40));
    notify("n7", "admin", "brief", "New decorator signup", "Review pending decorator applications in Admin.", false, OffsetDateTime.now().minusHours(1));
  }

  private void notify(String id, String userId, String type, String title, String body, boolean read, OffsetDateTime at) {
    jdbc.update(
      "insert into notifications (id,user_id,type,title,body,read,created_at) values (?,?,?,?,?,?,?) on conflict (id) do nothing",
      id, userId, type, title, body, read, at
    );
  }
}
