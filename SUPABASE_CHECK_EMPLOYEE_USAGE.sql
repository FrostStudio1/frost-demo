-- ============================================================================
-- KONTROLLERA VILKEN EMPLOYEE-RECORD SOM ANVÄNDS
-- ============================================================================
-- Kör denna SQL för att se vilken employee-record som har data kopplad
-- ============================================================================

-- 1. Kontrollera time_entries för varje employee
SELECT 
    e.id AS employee_id,
    e.full_name,
    e.role,
    COUNT(te.id) AS time_entries_count
FROM employees e
LEFT JOIN time_entries te ON te.employee_id = e.id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
GROUP BY e.id, e.full_name, e.role
ORDER BY time_entries_count DESC;

-- 2. Kontrollera payslips/other data
SELECT 
    e.id AS employee_id,
    e.full_name,
    e.role,
    e.created_at
FROM employees e
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at ASC;

-- 3. Se detaljerad info om båda
SELECT 
    e.id,
    e.full_name,
    e.role,
    e.email,
    e.tenant_id,
    e.created_at,
    e.updated_at,
    (SELECT COUNT(*) FROM time_entries WHERE employee_id = e.id) AS time_entries_count
FROM employees e
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at ASC;

-- ============================================================================
-- REKOMMENDATION BASERAT PÅ DATA:
-- ============================================================================
-- 
-- BEHÅLL: Den med flest time_entries (om det finns skillnad)
-- ELLER: Den med det riktiga namnet "Vilmer Frost" (istället för "Admin")
-- ELLER: Den senaste (om ingen har data)
--
-- TA BORT: Den som inte används eller har placeholder-namn
-- ============================================================================

