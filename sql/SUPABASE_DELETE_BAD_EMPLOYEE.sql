-- ============================================================================
-- TA BORT EMPLOYEE-RECORD MED FEL TENANT_ID
-- ============================================================================
-- Employee e5ad1c35-146b-4bc2-aed6-521ad30c5d97 har tenant_id som INTE finns
-- ============================================================================

-- 1. KONTROLLERA FÖRST att denna employee INTE har data
SELECT 
    'time_entries' AS table_name,
    COUNT(*) AS count
FROM time_entries
WHERE employee_id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'

UNION ALL

SELECT 
    'payslips' AS table_name,
    COUNT(*) AS count
FROM payslips
WHERE employee_id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';

-- 2. OM count är 0 för båda - Ta bort employee
-- DELETE FROM employees
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'
--   AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- 3. ELLER - Om den HAR data, migrera data till rätt employee först
-- UPDATE time_entries
-- SET employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'  -- Vilmer Frost
-- WHERE employee_id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';
--
-- UPDATE payslips
-- SET employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
-- WHERE employee_id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';
--
-- DELETE FROM employees
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';

-- 4. VERIFIERA RESULTAT
SELECT 
    id,
    full_name,
    tenant_id,
    auth_user_id,
    role
FROM employees
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY created_at DESC;

-- Du bör nu bara se employees med tenant_id: 6c7b7f99-3e6b-4125-ac9b-fecab5899a81
-- ============================================================================

