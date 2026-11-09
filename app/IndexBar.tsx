/** A 0–100 range bar with the 10/90 extreme zones shaded and a marker at the value. */
export default function IndexBar({ value, width = 'w-28' }: { value: number; width?: string }) {
  const color = value >= 90 ? 'bg-up' : value <= 10 ? 'bg-down' : 'bg-fg';
  return (
    <div className="flex items-center gap-2">
      <div className={`relative h-2 ${width} rounded-full bg-line/60`} aria-hidden>
        <div className="absolute inset-y-0 left-0 w-[10%] rounded-l-full bg-down/20" />
        <div className="absolute inset-y-0 right-0 w-[10%] rounded-r-full bg-up/20" />
        <div
          className={`absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-sm ${color}`}
          style={{ left: `${value}%` }}
        />
      </div>
      <span className="num w-7 text-right">{Math.round(value)}</span>
    </div>
  );
}
