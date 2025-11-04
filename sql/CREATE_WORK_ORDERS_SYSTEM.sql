-- ========= Extensions & schema =========

CREATE SCHEMA IF NOT EXISTS app;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- ========= Helpers: JWT/Role =========

CREATE OR REPLACE FUNCTION app.current_tenant_id()

RETURNS uuid LANGUAGE sql STABLE AS $$

  SELECT (NULLIF(current_setting('request.jwt.claims', true), '')::json->>'tenant_id')::uuid;

$$;



CREATE OR REPLACE FUNCTION app.current_role()

RETURNS text LANGUAGE sql STABLE AS $$

  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::json->>'role', 'employee');

$$;



CREATE OR REPLACE FUNCTION app.is_admin()

RETURNS boolean LANGUAGE sql STABLE AS $$

  SELECT app.current_role() = 'admin';

$$;



-- ========= util: set_updated_at =========

CREATE OR REPLACE FUNCTION app.set_updated_at()

RETURNS trigger LANGUAGE plpgsql AS $$

BEGIN

  NEW.updated_at := now();

  RETURN NEW;

END$$;



-- ========= Nummer-räknare per tenant/år =========

CREATE TABLE IF NOT EXISTS app.work_order_counters (

  tenant_id uuid NOT NULL,

  year int NOT NULL,

  counter int NOT NULL DEFAULT 0,

  PRIMARY KEY (tenant_id, year)

);



COMMENT ON TABLE app.work_order_counters IS 'Per-tenant räknare för arbetsordernummer (WO-YYYY-NNN).';



CREATE OR REPLACE FUNCTION app.next_work_order_number(p_tenant uuid)

RETURNS text

LANGUAGE plpgsql

AS $$

DECLARE

  v_year int := EXTRACT(YEAR FROM now())::int;

  v_counter int;

BEGIN

  INSERT INTO app.work_order_counters(tenant_id, year, counter)

  VALUES (p_tenant, v_year, 0)

  ON CONFLICT (tenant_id, year) DO NOTHING;



  UPDATE app.work_order_counters

  SET counter = counter + 1

  WHERE tenant_id = p_tenant AND year = v_year

  RETURNING counter INTO v_counter;



  RETURN format('WO-%s-%03s', v_year, v_counter);

END;

$$;



GRANT EXECUTE ON FUNCTION app.next_work_order_number(uuid) TO authenticated;



-- ========= work_orders =========

CREATE TABLE IF NOT EXISTS work_orders (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  number text NOT NULL,

  title text NOT NULL,

  description text,

  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,

  assigned_to uuid REFERENCES public.employees(id) ON DELETE SET NULL,

  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  status text NOT NULL CHECK (status IN ('new','assigned','in_progress','awaiting_approval','approved','completed')),

  priority text NOT NULL CHECK (priority IN ('critical','high','medium','low')),

  scheduled_date date,

  scheduled_start_time time,

  scheduled_end_time time,

  completed_at timestamptz,

  approved_at timestamptz,

  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now()

);



COMMENT ON TABLE work_orders IS 'Arbetsorder med statusflöde och planering.';

COMMENT ON COLUMN work_orders.number IS 'WO-YYYY-NNN; genereras via app.next_work_order_number.';

COMMENT ON COLUMN work_orders.status IS 'new → assigned → in_progress → awaiting_approval → approved → completed';

COMMENT ON COLUMN work_orders.priority IS 'critical|high|medium|low';



CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON work_orders(tenant_id);

CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_work_orders_assigned ON work_orders(tenant_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_work_orders_sched_date ON work_orders(tenant_id, scheduled_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_work_orders_tenant_number ON work_orders(tenant_id, number);



CREATE TRIGGER trg_work_orders_updated_at

BEFORE UPDATE ON work_orders

FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();



-- ========= work_order_photos =========

CREATE TABLE IF NOT EXISTS work_order_photos (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

  file_path text NOT NULL,

  thumbnail_path text,

  file_size_bytes int,

  mime_type text,

  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  uploaded_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_photo_maxsize CHECK (file_size_bytes IS NULL OR file_size_bytes < 52428800)

);



CREATE INDEX IF NOT EXISTS idx_work_order_photos_wo ON work_order_photos(work_order_id);



-- ========= work_order_status_history =========

CREATE TABLE IF NOT EXISTS work_order_status_history (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

  from_status text,

  to_status text NOT NULL CHECK (to_status IN ('new','assigned','in_progress','awaiting_approval','approved','completed')),

  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  changed_at timestamptz NOT NULL DEFAULT now(),

  reason text,

  CONSTRAINT chk_from_to_diff CHECK (from_status IS NULL OR from_status <> to_status)

);



CREATE INDEX IF NOT EXISTS idx_work_order_hist_wo ON work_order_status_history(work_order_id, changed_at DESC);



-- ========= push_subscriptions =========

CREATE TABLE IF NOT EXISTS push_subscriptions (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  device_id uuid NOT NULL,

  endpoint text NOT NULL UNIQUE,

  p256dh text NOT NULL,

  auth text NOT NULL,

  user_agent text,

  created_at timestamptz NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subs_tenant ON push_subscriptions(tenant_id);



-- ========= Status-history trigger =========

CREATE OR REPLACE FUNCTION app.trg_work_order_status_history()

RETURNS trigger LANGUAGE plpgsql AS $$

BEGIN

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN

    INSERT INTO work_order_status_history(work_order_id, from_status, to_status, changed_by, reason)

    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(NEW.approved_by, OLD.approved_by, auth.uid()), NULL);

  END IF;

  RETURN NEW;

END;

$$;



DROP TRIGGER IF EXISTS trg_work_orders_status_hist ON work_orders;

CREATE TRIGGER trg_work_orders_status_hist

AFTER UPDATE OF status ON work_orders

FOR EACH ROW EXECUTE FUNCTION app.trg_work_order_status_history();



-- ========= RLS =========

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_order_photos ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;



-- work_orders:

--  Admin: full access inom tenant

--  Employee: SELECT egna skapade eller tilldelade

DO $$

BEGIN

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wo_select_admin') THEN

    CREATE POLICY wo_select_admin ON work_orders

    FOR SELECT USING (tenant_id = app.current_tenant_id() AND app.is_admin());

  END IF;



  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wo_select_employee') THEN

    CREATE POLICY wo_select_employee ON work_orders

    FOR SELECT USING (

      tenant_id = app.current_tenant_id()

      AND (

        EXISTS (SELECT 1 FROM public.employees e WHERE e.auth_user_id = auth.uid() AND e.id = work_orders.assigned_to)

        OR work_orders.created_by = auth.uid()

      )

    );

  END IF;



  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wo_admin_all') THEN

    CREATE POLICY wo_admin_all ON work_orders

    FOR ALL USING (tenant_id = app.current_tenant_id() AND app.is_admin())

    WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());

  END IF;

END$$;



-- work_order_photos: följer work_orders-åtkomst

DO $$

BEGIN

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wop_select_tenant') THEN

    CREATE POLICY wop_select_tenant ON work_order_photos

    FOR SELECT USING (

      EXISTS (

        SELECT 1 FROM work_orders w

        WHERE w.id = work_order_photos.work_order_id

          AND w.tenant_id = app.current_tenant_id()

          AND (

            app.is_admin() OR

            w.created_by = auth.uid() OR

            EXISTS (SELECT 1 FROM public.employees e WHERE e.auth_user_id = auth.uid() AND e.id = w.assigned_to)

          )

      )

    );

  END IF;



  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wop_admin_all') THEN

    CREATE POLICY wop_admin_all ON work_order_photos

    FOR ALL USING (

      EXISTS (SELECT 1 FROM work_orders w WHERE w.id = work_order_photos.work_order_id AND w.tenant_id = app.current_tenant_id() AND app.is_admin())

    )

    WITH CHECK (

      EXISTS (SELECT 1 FROM work_orders w WHERE w.id = work_order_photos.work_order_id AND w.tenant_id = app.current_tenant_id() AND app.is_admin())

    );

  END IF;

END$$;



-- work_order_status_history: läsbar för samma som work_orders; skriv styrs via trigger/API (admin)

DO $$

BEGIN

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wosh_select_tenant') THEN

    CREATE POLICY wosh_select_tenant ON work_order_status_history

    FOR SELECT USING (

      EXISTS (

        SELECT 1 FROM work_orders w

        WHERE w.id = work_order_status_history.work_order_id

          AND w.tenant_id = app.current_tenant_id()

          AND (

            app.is_admin() OR

            w.created_by = auth.uid() OR

            EXISTS (SELECT 1 FROM public.employees e WHERE e.auth_user_id = auth.uid() AND e.id = w.assigned_to)

          )

      )

    );

  END IF;



  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wosh_admin_all') THEN

    CREATE POLICY wosh_admin_all ON work_order_status_history

    FOR ALL USING (

      EXISTS (SELECT 1 FROM work_orders w WHERE w.id = work_order_status_history.work_order_id AND w.tenant_id = app.current_tenant_id() AND app.is_admin())

    )

    WITH CHECK (

      EXISTS (SELECT 1 FROM work_orders w WHERE w.id = work_order_status_history.work_order_id AND w.tenant_id = app.current_tenant_id() AND app.is_admin())

    );

  END IF;

END$$;



-- push_subscriptions: user ser bara sina egna inom tenant

DO $$

BEGIN

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ps_select_self') THEN

    CREATE POLICY ps_select_self ON push_subscriptions

    FOR SELECT USING (tenant_id = app.current_tenant_id() AND user_id = auth.uid());

  END IF;



  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ps_modify_self') THEN

    CREATE POLICY ps_modify_self ON push_subscriptions

    FOR ALL USING (tenant_id = app.current_tenant_id() AND user_id = auth.uid())

    WITH CHECK (tenant_id = app.current_tenant_id() AND user_id = auth.uid());

  END IF;

END$$;

