'use client'

import dynamic from 'next/dynamic'

const InvoiceDownload = dynamic(() => import('@/components/InvoiceDownload'), { ssr: false })

export default InvoiceDownload

