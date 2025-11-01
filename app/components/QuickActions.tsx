type Action = { icon: string; label: string; href: string; color?: string }
const actions: Action[] = [
  { icon: "➕", label: "Rapportera tid", href: "/reports/new", color: "blue-600" },
  { icon: "🧾", label: "Skapa faktura", href: "/invoices/new" },
  { icon: "🏗️", label: "Nytt projekt", href: "/projects/new" },
  { icon: "⚠️", label: "ÄTA-arbete", href: "/aeta", color: "yellow-500" },
]
export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {actions.map(a =>
        <a
          key={a.label}
          href={a.href}
          className={`flex flex-col items-center px-4 py-2 rounded-lg shadow bg-white hover:bg-gray-50`}
        >
          <span className={`text-2xl text-${a.color || 'blue-600'}`}>{a.icon}</span>
          <span className="mt-1 text-xs">{a.label}</span>
        </a>
      )}
    </div>
  )
}
