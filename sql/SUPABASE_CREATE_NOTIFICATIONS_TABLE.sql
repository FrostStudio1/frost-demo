-- Create notifications table for admin notifications
-- Supports both general (to all users) and private (to specific user) notifications

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = general notification to all users
  recipient_employee_id UUID REFERENCES employees(id) ON DELETE CASCADE, -- Alternative: target specific employee
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Optional link to navigate when clicked
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration date
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_employee_id ON notifications(recipient_employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications or general notifications for their tenant
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  USING (
    -- Can read if it's a general notification (recipient_id is NULL) for their tenant
    (recipient_id IS NULL AND tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    ))
    OR
    -- Or if it's specifically sent to them
    recipient_id = auth.uid()
    OR
    -- Or if it's sent to their employee record
    recipient_employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Policy: Users can update read status of their own notifications
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (
    recipient_id = auth.uid()
    OR
    recipient_employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
    OR
    (recipient_id IS NULL AND tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    ))
  )
  WITH CHECK (
    recipient_id = auth.uid()
    OR
    recipient_employee_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
    OR
    (recipient_id IS NULL AND tenant_id IN (
      SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()
    ))
  );

-- Policy: Only admins can create notifications
CREATE POLICY "Only admins can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'Admin', 'ADMIN')
      AND tenant_id = notifications.tenant_id
    )
  );

-- Policy: Only admins can delete notifications
CREATE POLICY "Only admins can delete notifications"
  ON notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'Admin', 'ADMIN')
      AND tenant_id = notifications.tenant_id
    )
  );

-- Function to clean up expired notifications (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT INSERT, DELETE ON notifications TO authenticated;

