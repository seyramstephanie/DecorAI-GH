CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'decorator', 'shop')),
  provider TEXT NOT NULL DEFAULT 'email',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  reviews INTEGER NOT NULL DEFAULT 0,
  phone TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  radius_km INTEGER NOT NULL DEFAULT 10,
  image TEXT,
  stock JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS decorators (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  reviews INTEGER NOT NULL DEFAULT 0,
  specialisations JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_range TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  phone TEXT NOT NULL,
  bio TEXT NOT NULL,
  portfolio JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  decorator_id VARCHAR(64) NOT NULL REFERENCES decorators(id),
  decorator_name TEXT NOT NULL,
  client_id VARCHAR(64) NOT NULL,
  client_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  design_image TEXT,
  brief TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('Enquiry', 'Confirmed', 'In Preparation', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  booking_id VARCHAR(128) NOT NULL,
  sender_id VARCHAR(64) NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('radius', 'brief', 'booking', 'digest', 'stock')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_client_idx ON bookings(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_decorator_idx ON bookings(decorator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_booking_idx ON messages(booking_id, created_at);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);
