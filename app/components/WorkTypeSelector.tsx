type WorkTypeSelectorProps = {
  value: string,
  onChange: (type: string) => void
}
const options = [
  { id: 'work', label: 'Arbete', color: 'blue' },
  { id: 'evening', label: 'OB Kväll', color: 'purple' },
  { id: 'night', label: 'OB Natt', color: 'indigo' },
  { id: 'weekend', label: 'OB Helg', color: 'pink' },
  { id: 'vacation', label: 'Semester', color: 'green' },
  { id: 'sick', label: 'Sjuk', color: 'yellow' },
  { id: 'vabb', label: 'VAB', color: 'orange' },
  { id: 'absence', label: 'Frånvaro', color: 'gray' }
]

export default function WorkTypeSelector({ value, onChange }: WorkTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Typ av tidrapport</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map(opt => {
          const isActive = value === opt.id
          const colorClasses = {
            blue: isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
            purple: isActive ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
            indigo: isActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
            pink: isActive ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' : 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
            green: isActive ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
            yellow: isActive ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
            orange: isActive ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
            gray: isActive ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          }
          return (
            <button
              key={opt.id}
              type="button"
              className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all transform hover:scale-105 ${colorClasses[opt.color as keyof typeof colorClasses]}`}
              onClick={() => onChange(opt.id)}
            >{opt.label}</button>
          )
        })}
      </div>
    </div>
  )
}
