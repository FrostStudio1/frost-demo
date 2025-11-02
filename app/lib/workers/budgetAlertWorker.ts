/**
 * Budget Alert Worker
 * Kontrollerar alla aktiva projekt med budget och skapar alerts när trösklar passerats
 * Körs varje 15:e minut via cron eller Edge Function
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function budgetAlertWorker() {
  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Hämta alla aktiva projekt med budget
    const { data: budgets, error: budgetsError } = await adminSupabase
      .from('project_budgets')
      .select(`
        *,
        projects!inner(id, tenant_id, status)
      `)
      .eq('projects.status', 'active')

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError)
      return { success: false, error: budgetsError.message }
    }

    if (!budgets || budgets.length === 0) {
      return { success: true, alertsCreated: 0, message: 'No active budgets found' }
    }

    let alertsCreated = 0
    const errors: string[] = []

    for (const budget of budgets) {
      try {
        const projectId = budget.project_id
        const tenantId = budget.tenant_id

        // Beräkna usage via SQL-funktion
        const { data: usageData, error: usageError } = await adminSupabase.rpc(
          'get_budget_usage',
          { p_project_id: projectId }
        )

        if (usageError || !usageData || usageData.length === 0) {
          console.warn(`No usage data for project ${projectId}`)
          continue
        }

        const usage = usageData[0]
        const thresholds = budget.alert_thresholds || []

        // Kontrollera varje threshold
        for (const threshold of thresholds) {
          if (!threshold.notify) continue

          // Bestäm alert_type och current_percentage
          let alertType: 'hours' | 'material' | 'total' = 'total'
          let currentPercentage = usage.total_percentage || 0

          if (threshold.type === 'hours') {
            alertType = 'hours'
            currentPercentage = usage.hours_percentage || 0
          } else if (threshold.type === 'material') {
            alertType = 'material'
            currentPercentage = usage.material_percentage || 0
          }

          // Om current >= threshold och ingen aktiv alert finns, skapa alert
          if (currentPercentage >= threshold.percentage) {
            // Kontrollera om alert redan finns
            const { data: existingAlert } = await adminSupabase
              .from('budget_alerts')
              .select('id')
              .eq('project_id', projectId)
              .eq('alert_type', alertType)
              .eq('threshold_percentage', threshold.percentage)
              .eq('status', 'active')
              .single()

            if (!existingAlert) {
              // Skapa alert via SQL-funktion
              const { data: alertId, error: alertError } = await adminSupabase.rpc(
                'create_budget_alert',
                {
                  p_project_id: projectId,
                  p_alert_type: alertType,
                  p_threshold_percentage: threshold.percentage,
                  p_current_percentage: currentPercentage,
                }
              )

              if (alertError) {
                console.error(`Error creating alert for project ${projectId}:`, alertError)
                errors.push(`Project ${projectId}: ${alertError.message}`)
              } else {
                alertsCreated++

                // Skicka notifikation till admins (TODO: implementera notifikationssystem)
                // await sendNotificationToAdmins(tenantId, {
                //   type: 'budget_alert',
                //   project_id: projectId,
                //   threshold: threshold.percentage,
                //   current: currentPercentage,
                // })
              }
            }
          }
        }
      } catch (error: any) {
        console.error(`Error processing budget ${budget.id}:`, error)
        errors.push(`Budget ${budget.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      alertsCreated,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error: any) {
    console.error('Error in budgetAlertWorker:', error)
    return { success: false, error: error.message }
  }
}

// Export för Edge Function eller cron
export default budgetAlertWorker

