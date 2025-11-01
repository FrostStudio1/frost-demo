type DatePickerProps = {
  value: string,
  onChange: (val: string) => void
}
export default function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Datum</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </div>
  )
}
