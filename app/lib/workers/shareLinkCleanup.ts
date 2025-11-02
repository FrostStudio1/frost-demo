/**
 * Share Link Cleanup Worker
 * Rensar expired eller inaktiva publika länkar
 * Körs dagligen kl 02:00 via cron eller Edge Function
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function shareLinkCleanup() {
  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Hitta expired länkar
    const { data: expiredLinks, error: linksError } = await adminSupabase
      .from('public_links')
      .select('id, tenant_id, resource_type, resource_id')
      .eq('active', true)
      .or(`expires_at.lt.${new Date().toISOString()},and(max_views.not.is.null,view_count.gte.max_views)`)

    if (linksError) {
      console.error('Error fetching expired links:', linksError)
      return { success: false, error: linksError.message }
    }

    if (!expiredLinks || expiredLinks.length === 0) {
      return { success: true, deactivated: 0, message: 'No expired links found' }
    }

    let deactivated = 0
    const errors: string[] = []

    for (const link of expiredLinks) {
      try {
        // Inaktivera länk
        const { error: updateError } = await adminSupabase
          .from('public_links')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('id', link.id)

        if (updateError) {
          console.error(`Error deactivating link ${link.id}:`, updateError)
          errors.push(`Link ${link.id}: ${updateError.message}`)
        } else {
          deactivated++

          // Logga audit event
          try {
            await adminSupabase.rpc('append_audit_event', {
              p_tenant_id: link.tenant_id,
              p_table_name: 'public_links',
              p_record_id: link.id,
              p_action: 'update',
              p_old_values: { active: true },
              p_new_values: { active: false },
              p_changed_fields: ['active'],
              p_metadata: { reason: 'expired_or_max_views' },
            })
          } catch (auditError) {
            console.error(`Error logging audit for link ${link.id}:`, auditError)
          }
        }
      } catch (error: any) {
        console.error(`Error processing link ${link.id}:`, error)
        errors.push(`Link ${link.id}: ${error.message}`)
      }
    }

    // Rensa gamla events (>90 dagar)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: deletedEvents, error: deleteError } = await adminSupabase
      .from('public_link_events')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())
      .select('id')

    const cleanedEvents = deletedEvents?.length || 0

    if (deleteError) {
      console.error('Error cleaning old events:', deleteError)
      errors.push(`Event cleanup: ${deleteError.message}`)
    }

    return {
      success: true,
      deactivated,
      cleaned_events: cleanedEvents,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error: any) {
    console.error('Error in shareLinkCleanup:', error)
    return { success: false, error: error.message }
  }
}

export default shareLinkCleanup

