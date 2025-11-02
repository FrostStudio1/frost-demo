import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * API route för att skapa fakturor med service role
 * Verifierar tenant_id och hanterar saknade kolumner progressivt
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await req.json()
    const { tenant_id, project_id, client_id, customer_name, amount, desc, description, status, issue_date, rot_application_id } = payload

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      )
    }

    // Use service role for tenant verification and RLS bypass
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceKey)

    // Verify tenant exists
    const { data: tenantData, error: tenantError } = await adminSupabase
      .from('tenants')
      .select('id, name')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenantData) {
      console.error('❌ Tenant verification failed:', {
        tenant_id,
        error: tenantError,
        errorCode: tenantError?.code,
        errorMessage: tenantError?.message
      })
      
      // Try to list available tenants for debugging
      const { data: allTenants, error: listError } = await adminSupabase
        .from('tenants')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      console.error('Available tenants in database:', allTenants || [])
      
      return NextResponse.json(
        { 
          error: 'Tenant ID not found in database',
          details: tenantError?.message || 'Tenant does not exist',
          searchedTenantId: tenant_id,
          availableTenants: allTenants || [],
          suggestion: allTenants && allTenants.length > 0 
            ? `Please use one of the available tenant IDs: ${allTenants.map(t => t.id).join(', ')}`
            : 'No tenants found in database. Please complete onboarding first.',
        },
        { status: 400 }
      )
    }

    // CRITICAL: Use the tenant ID directly from the database query result
    // This ensures we use the exact UUID format and value from PostgreSQL
    const verifiedTenantId = tenantData.id
    
    console.log('Tenant verified:', { 
      requestedTenantId: tenant_id, 
      verifiedTenantId: verifiedTenantId,
      tenantName: tenantData.name,
      idsMatch: tenant_id === verifiedTenantId
    })

    // CRITICAL: "Touch" update to ensure tenant is visible in current transaction context
    // This is essential for foreign key constraint validation
    try {
      // Strategy 1: Try updating updated_at if it exists
      const touchResult = await adminSupabase
        .from('tenants')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', verifiedTenantId)
        .select('id')
      
      if (touchResult.error && touchResult.error.code !== '42703') {
        // Column doesn't exist error is ok, but other errors are not
        console.warn('Could not touch tenant with updated_at:', touchResult.error)
      }
      
      // Strategy 2: Also try updating name (no-op update to same value)
      if (tenantData.name) {
        await adminSupabase
          .from('tenants')
          .update({ name: tenantData.name })
          .eq('id', verifiedTenantId)
      }
      
      // Strategy 3: Always do a SELECT to ensure tenant is visible
      // This forces PostgreSQL to "see" the tenant in the transaction
      const verifySelect = await adminSupabase
        .from('tenants')
        .select('id')
        .eq('id', verifiedTenantId)
        .single()
      
      if (!verifySelect.data || verifySelect.error) {
        console.error('CRITICAL: Tenant not visible in transaction after touch:', {
          verifiedTenantId,
          error: verifySelect.error
        })
        return NextResponse.json(
          { 
            error: 'Tenant not visible in transaction. Please try again.',
            details: verifySelect.error?.message || 'Transaction isolation issue'
          },
          { status: 400 }
        )
      } else {
        console.log('✅ Tenant confirmed visible in transaction:', verifiedTenantId)
      }
    } catch (touchError: any) {
      console.warn('Could not touch tenant:', touchError)
      return NextResponse.json(
        { 
          error: 'Failed to verify tenant in transaction',
          details: touchError?.message || 'Unknown error'
        },
        { status: 400 }
      )
    }

    // Verify user has access to this tenant and check if admin
    const { data: employeeData } = await adminSupabase
      .from('employees')
      .select('id, tenant_id, role')
      .eq('auth_user_id', user.id)
      .eq('tenant_id', tenant_id)
      .limit(1)

    if (!employeeData || employeeData.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this tenant' },
        { status: 403 }
      )
    }

    // Check if user is admin
    const isAdmin = employeeData[0]?.role === 'admin' || employeeData[0]?.role === 'Admin' || employeeData[0]?.role === 'ADMIN'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required to create invoices' },
        { status: 403 }
      )
    }

    // Build payload progressively - USE VERIFIED TENANT ID FROM DATABASE
    const basePayload: any = {
      tenant_id: verifiedTenantId, // Use verified tenant ID from database
    }

    // Add description (try both 'desc' and 'description' columns)
    if (desc) {
      basePayload.desc = desc
      basePayload.description = desc
    } else if (description) {
      basePayload.desc = description
      basePayload.description = description
    }

    // Add optional fields
    if (project_id) basePayload.project_id = project_id
    if (client_id) basePayload.client_id = client_id
    if (customer_name) basePayload.customer_name = customer_name
    if (amount !== undefined) basePayload.amount = Number(amount) || 0
    if (status) basePayload.status = status
    if (issue_date) basePayload.issue_date = issue_date
    if (rot_application_id) basePayload.rot_application_id = rot_application_id

    // Final verification right before insert - use verified tenant ID
    const finalTenantCheck = await adminSupabase
      .from('tenants')
      .select('id')
      .eq('id', verifiedTenantId)
      .single()

    if (!finalTenantCheck.data || finalTenantCheck.error) {
      console.error('CRITICAL: Tenant not found in final check before insert:', {
        verifiedTenantId,
        error: finalTenantCheck.error
      })
      return NextResponse.json(
        { 
          error: 'Tenant verification failed before insert',
          details: finalTenantCheck.error?.message || 'Tenant not found'
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Final tenant check passed, using tenant_id:', verifiedTenantId)

    // Try progressively: start with all columns, then fallback
    let insertResult: any = null
    let insertError: any = null

    // Attempt 1: Try with all columns including desc
    insertResult = await adminSupabase
      .from('invoices')
      .insert([basePayload])
      .select()
      .single()

    // Attempt 2: If desc fails, try without desc (keep description)
    if (insertResult.error && (insertResult.error.code === '42703' || insertResult.error.message?.includes('desc'))) {
      const { desc: _, ...payloadWithoutDesc } = basePayload
      insertResult = await adminSupabase
        .from('invoices')
        .insert([payloadWithoutDesc])
        .select()
        .single()
    }

    // Attempt 3: If description also fails, try without both
    if (insertResult.error && (insertResult.error.code === '42703' || insertResult.error.message?.includes('description'))) {
      const { desc: _, description: __, ...payloadWithoutBoth } = basePayload
      insertResult = await adminSupabase
        .from('invoices')
        .insert([payloadWithoutBoth])
        .select()
        .single()
    }

    // Attempt 4: If customer_name fails, try without it
    if (insertResult.error && (insertResult.error.code === '42703' || insertResult.error.message?.includes('customer_name'))) {
      const { customer_name: _, ...payloadWithoutCustomerName } = basePayload
      insertResult = await adminSupabase
        .from('invoices')
        .insert([payloadWithoutCustomerName])
        .select()
        .single()
    }

    if (insertResult.error) {
      console.error('Error creating invoice (all fallbacks failed):', insertResult.error)
      
      // Handle foreign key constraint violation
      if (insertResult.error.code === '23503') {
        // Try to get more details about which foreign key failed
        const { data: tenantVerify } = await adminSupabase
          .from('tenants')
          .select('id')
          .eq('id', verifiedTenantId)
          .single()
        
        const { data: projectVerify } = project_id ? await adminSupabase
          .from('projects')
          .select('id')
          .eq('id', project_id)
          .single() : { data: null, error: null }
        
        const { data: clientVerify } = client_id ? await adminSupabase
          .from('clients')
          .select('id')
          .eq('id', client_id)
          .single() : { data: null, error: null }
        
        return NextResponse.json(
          { 
            error: 'Foreign key constraint violation',
            details: insertResult.error.message,
            hint: 'The tenant_id, project_id, or client_id does not exist in the database',
            diagnostics: {
              tenantExists: !!tenantVerify,
              projectExists: project_id ? !!projectVerify : 'N/A',
              clientExists: client_id ? !!clientVerify : 'N/A',
            }
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: insertResult.error.message || 'Failed to create invoice' },
        { status: 500 }
      )
    }

    const invoice = insertResult.data

    // If project_id is provided, create invoice lines from time entries
    if (project_id && invoice?.id) {
      try {
        // Fetch project rate
        const { data: projectData } = await adminSupabase
          .from('projects')
          .select('base_rate_sek')
          .eq('id', project_id)
          .single()

        const rate = Number(projectData?.base_rate_sek) || 360

        // Fetch unbilled time entries for this project
        const { data: timeEntries, error: entriesError } = await adminSupabase
          .from('time_entries')
          .select('id, hours_total, date, start_time, end_time')
          .eq('project_id', project_id)
          .eq('is_billed', false)
          .eq('tenant_id', verifiedTenantId)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })

        if (!entriesError && timeEntries && timeEntries.length > 0) {
          // Create invoice lines from time entries
          const invoiceLines = timeEntries.map((entry: any, index: number) => {
            const hours = Number(entry.hours_total) || 0
            const entryDate = entry.date ? new Date(entry.date).toLocaleDateString('sv-SE') : 'Okänt datum'
            const description = `Timmar ${entryDate}${entry.start_time ? ` (${entry.start_time.substring(0, 5)})` : ''}`
            
            return {
              invoice_id: invoice.id,
              tenant_id: verifiedTenantId,
              sort_order: index,
              description: description,
              quantity: hours,
              unit: 'tim',
              rate_sek: rate,
              amount_sek: hours * rate,
            }
          })

          // Insert invoice lines
          const { error: linesError } = await adminSupabase
            .from('invoice_lines')
            .insert(invoiceLines)

          if (linesError) {
            console.error('Error creating invoice lines:', linesError)
            // Continue anyway - invoice is created
          } else {
            // Recalculate total amount from invoice lines
            const totalAmount = invoiceLines.reduce((sum, line) => sum + Number(line.amount_sek || 0), 0)
            
            // Update invoice amount if it differs
            if (totalAmount > 0 && totalAmount !== Number(amount || 0)) {
              await adminSupabase
                .from('invoices')
                .update({ amount: totalAmount })
                .eq('id', invoice.id)
                .eq('tenant_id', verifiedTenantId)
              
              // Update local invoice object
              invoice.amount = totalAmount
            }

            console.log(`✅ Created ${invoiceLines.length} invoice lines from ${timeEntries.length} time entries`)
            
            // Mark time entries as billed
            const entryIds = timeEntries.map((e: any) => e.id)
            if (entryIds.length > 0) {
              const { error: updateError } = await adminSupabase
                .from('time_entries')
                .update({ is_billed: true })
                .in('id', entryIds)
                .eq('tenant_id', verifiedTenantId)
              
              if (updateError) {
                console.error('Error marking time entries as billed:', updateError)
                // Continue anyway - invoice and lines are created
              } else {
                console.log(`✅ Marked ${entryIds.length} time entries as billed`)
              }
            }
          }
        }
      } catch (linesError: any) {
        console.error('Error creating invoice lines from time entries:', linesError)
        // Continue - invoice is created even if lines fail
      }
    }

    return NextResponse.json({ data: invoice })
  } catch (err: any) {
    console.error('Error in invoices/create API:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

