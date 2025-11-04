// app/lib/toast.ts
'use client'

import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    sonnerToast.success(message, options)
  },
  error: (message: string, options?: { duration?: number }) => {
    sonnerToast.error(message, options)
  },
  info: (message: string, options?: { duration?: number }) => {
    sonnerToast.info(message, options)
  },
  warning: (message: string, options?: { duration?: number }) => {
    sonnerToast.warning(message, options)
  },
}

