type TimeRangePickerProps = {
  start: string,
  end: string,
  setStart: (val: string) => void,
  setEnd: (val: string) => void
}
export default function TimeRangePicker({ start, end, setStart, setEnd }: TimeRangePickerProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Tidsperiod</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start" className="block text-xs text-gray-500 mb-2">Starttid</label>
          <input
            type="time"
            id="start"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-xs text-gray-500 mb-2">Sluttid</label>
          <input
            type="time"
            id="end"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
        </div>
      </div>
    </div>
  )
}
