-- Create crop_categories table
CREATE TABLE IF NOT EXISTS crop_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES crop_categories(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Create app_stats table
CREATE TABLE IF NOT EXISTS app_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create system_stats table
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'Operational',
  last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  server_load INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('Operational', 'Maintenance', 'Offline')),
  CONSTRAINT valid_server_load CHECK (server_load BETWEEN 0 AND 100)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_crop_categories_updated_at
  BEFORE UPDATE ON crop_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON farmers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_stats_updated_at
  BEFORE UPDATE ON app_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_stats_updated_at
  BEFORE UPDATE ON system_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert dummy data for farmers
INSERT INTO farmers (name, email, phone, address, last_active_at) VALUES
('John Smith', 'john.smith@example.com', '+1234567890', '123 Farm St, Rural City', NOW()),
('Maria Garcia', 'maria.garcia@example.com', '+1234567891', '456 Crop Ave, Farm Town', NOW()),
('David Johnson', 'david.johnson@example.com', '+1234567892', '789 Harvest Rd, Field City', NOW()),
('Sarah Williams', 'sarah.williams@example.com', '+1234567893', '321 Plant Ln, Green Valley', NOW()),
('Michael Brown', 'michael.brown@example.com', '+1234567894', '654 Agriculture Dr, Rural Heights', NOW());

-- Insert initial system stats with dummy data
INSERT INTO system_stats (status, server_load, active_users)
VALUES ('Operational', 42, 891)
ON CONFLICT DO NOTHING;

-- Insert initial app stats with dummy data
INSERT INTO app_stats (downloads)
VALUES (12543)
ON CONFLICT DO NOTHING;

-- Insert dummy activity logs
INSERT INTO activity_log (type, description) VALUES
('FARMER_REGISTRATION', 'New farmer registration: John Smith'),
('CROP_CATEGORY', 'Crop category added: Vegetables'),
('CROP_ADDED', 'New crop added: Sweet Corn'),
('PROFILE_UPDATE', 'Updated farmer profile: Maria Garcia'),
('CROP_ADDED', 'New crop added: Tomatoes'),
('FARMER_REGISTRATION', 'New farmer registration: David Johnson'); 