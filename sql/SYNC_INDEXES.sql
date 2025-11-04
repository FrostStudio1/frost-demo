-- ============================================================================
-- SYNC INDEXES FÖR OFFLINE-FIRST SYNC
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att optimera sync-queries
-- ============================================================================

-- Index för delta-läsningar (updated_at queries)
CREATE INDEX IF NOT EXISTS idx_wo_tenant_updated 
ON work_orders(tenant_id, updated_at DESC);

-- Index för deleted_at queries (soft deletes)
CREATE INDEX IF NOT EXISTS idx_wo_tenant_deleted 
ON work_orders(tenant_id, deleted_at DESC) 
WHERE deleted_at IS NOT NULL;

-- Composite index för common queries (tenant + status + updated_at)
CREATE INDEX IF NOT EXISTS idx_wo_tenant_status_updated 
ON work_orders(tenant_id, status, updated_at DESC);

-- ============================================================================
-- KLART! Indexes är nu skapade för optimal sync performance.
-- ============================================================================

