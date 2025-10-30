'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'

type Customer = {
  id: string,
  name: string
  // ...lägg till fler fält om du vill!
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const tenant_id = localStorage.getItem('tenant_id')
    async function fetchCustomers() {
      const { data } = await supabase.from('customers').select('*').eq('tenant_id', tenant_id)
      setCustomers(data || [])
    }
    fetchCustomers()
  }, [])

  return (
    <div>
      <h1>Dina kunder</h1>
      {customers.map(cust => (
        <div key={cust.id}>{cust.name}</div>
      ))}
    </div>
  )
}
