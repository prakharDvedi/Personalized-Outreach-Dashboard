type Props = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: Props) {
  return (
    <div className="rounded-xl border border-white-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
