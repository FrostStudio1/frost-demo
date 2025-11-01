-- Create aeta_requests table for ÄTA work requests
CREATE TABLE IF NOT EXISTS aeta_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL, -- auth.users.id
  description TEXT NOT NULL,
  hours DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID, -- auth.users.id
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aeta_requests_tenant_id ON aeta_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aeta_requests_project_id ON aeta_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_aeta_requests_status ON aeta_requests(status);
CREATE INDEX IF NOT EXISTS idx_aeta_requests_created_at ON aeta_requests(created_at DESC);

-- Enable RLS
ALTER TABLE aeta_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own tenant's requests
CREATE POLICY "Users can view aeta requests for their tenant"
  ON aeta_requests FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Users can create requests for their tenant
CREATE POLICY "Users can create aeta requests for their tenant"
  ON aeta_requests FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    )
    AND requested_by = auth.uid()
  );

-- Only admins can update (approve/reject) requests
-- NOTE: You may want to add an 'is_admin' column to employees table
-- For now, we'll allow any user from the same tenant to update (you can restrict this later)
CREATE POLICY "Users can update aeta requests for their tenant"
  ON aeta_requests FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aeta_requests_updated_at
  BEFORE UPDATE ON aeta_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

