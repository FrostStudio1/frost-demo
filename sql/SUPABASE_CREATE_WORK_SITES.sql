-- Create work_sites table for GPS-based work location tracking
-- This table stores work sites (arbetsplatser) with GPS coordinates and radius

CREATE TABLE IF NOT EXISTS work_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 100, -- Radie för vad som räknas som "på plats" (meter)
  auto_checkin_enabled BOOLEAN DEFAULT false, -- Om auto-checkin ska vara aktiv
  auto_checkin_distance INTEGER DEFAULT 500, -- Avstånd för auto-checkin (meter, default 500m)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for tenant_id lookups
CREATE INDEX IF NOT EXISTS idx_work_sites_tenant_id ON work_sites(tenant_id);

-- Create index for location queries (optional, for geographic searches)
CREATE INDEX IF NOT EXISTS idx_work_sites_location ON work_sites(latitude, longitude);

-- Enable RLS
ALTER TABLE work_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view work sites for their tenant
CREATE POLICY "Users can view work sites for their tenant"
  ON work_sites
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Only admins can insert/update/delete work sites
CREATE POLICY "Admins can manage work sites for their tenant"
  ON work_sites
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM employees 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM employees 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add GPS tracking columns to time_entries
ALTER TABLE time_entries 
  ADD COLUMN IF NOT EXISTS start_location_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS start_location_lng DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS end_location_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS end_location_lng DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS work_site_id UUID REFERENCES work_sites(id);

-- Create index for work_site_id
CREATE INDEX IF NOT EXISTS idx_time_entries_work_site_id ON time_entries(work_site_id);

-- Optional: Create table for detailed GPS tracking points (for tracking movement)
CREATE TABLE IF NOT EXISTS gps_tracking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for GPS tracking points
CREATE INDEX IF NOT EXISTS idx_gps_tracking_time_entry ON gps_tracking_points(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_tenant ON gps_tracking_points(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_timestamp ON gps_tracking_points(timestamp);

-- Enable RLS on GPS tracking
ALTER TABLE gps_tracking_points ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own GPS tracking points
CREATE POLICY "Users can view their own GPS tracking"
  ON gps_tracking_points
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert their own GPS tracking points
CREATE POLICY "Users can insert their own GPS tracking"
  ON gps_tracking_points
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all GPS tracking for their tenant
CREATE POLICY "Admins can view all GPS tracking for their tenant"
  ON gps_tracking_points
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM employees 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

