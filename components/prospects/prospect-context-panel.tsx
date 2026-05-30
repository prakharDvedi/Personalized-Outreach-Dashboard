type Props = {
  context: string;
};

export function ProspectContextPanel({ context }: Props) {
  return (
    <div className="rounded-lg border border-white-200 p-3">
      <h2 className="text-sm font-semibold">Compiled context</h2>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-white/80">
        {context || "No context yet."}
      </pre>
    </div>
  );
}
