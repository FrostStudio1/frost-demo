'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: string
  gradient: string
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', gradient: 'from-pink-500 to-purple-600' },
  { name: 'Employees', href: '/employees', icon: '👥', gradient: 'from-purple-500 to-blue-600' },
  { name: 'Projects', href: '/projects', icon: '🏗️', gradient: 'from-blue-500 to-cyan-600' },
  { name: 'Kunder', href: '/clients', icon: '👔', gradient: 'from-cyan-500 to-teal-600' },
  { name: 'Invoices', href: '/invoices', icon: '🧾', gradient: 'from-teal-500 to-green-600' },
  { name: 'Reports', href: '/reports', icon: '📈', gradient: 'from-green-500 to-emerald-600' },
  { name: 'ÄTA', href: '/aeta', icon: '⚠️', gradient: 'from-yellow-500 to-orange-600' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-lg border border-gray-200"
        aria-label={isOpen ? 'Stäng meny' : 'Öppna meny'}
        aria-expanded={isOpen}
      >
        <span className="text-2xl" aria-hidden="true">☰</span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        aria-label="Huvudnavigation"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Frost Bygg
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(item.href)
                      setIsOpen(false)
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    font-semibold text-sm transition-all duration-200
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-200`
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Gå till ${item.name}`}
                >
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
              aria-label="Gå till admin"
            >
              <span className="text-xl" aria-hidden="true">⚙️</span>
              <span>Admin</span>
            </button>
            <button
              onClick={() => router.push('/admin/aeta')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
              aria-label="Gå till ÄTA admin"
            >
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <span>ÄTA Admin</span>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </aside>
    </>
  )
}

