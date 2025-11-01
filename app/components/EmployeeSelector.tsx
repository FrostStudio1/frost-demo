type EmployeeSelectorProps = {
  value: string,
  onChange: (val: string) => void,
  dynamicEmployees?: { id: string, name: string }[]
}

export default function EmployeeSelector({ value, onChange, dynamicEmployees = [] }: EmployeeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Anställd</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="">Välj anställd</option>
        {dynamicEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
    </div>
  )
}
