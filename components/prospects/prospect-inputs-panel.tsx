type ProspectInput = {
  type: string;
  rawValue: string;
};

type Props = {
  inputs: ProspectInput[];
};

export function ProspectInputsPanel({ inputs }: Props) {
  return (
    <div className="rounded-lg border border-white-200 p-3">
      <h2 className="text-sm font-semibold">Current inputs</h2>
      {inputs.length === 0 ? (
        <p className="mt-2 text-sm text-white-500">No inputs yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {inputs.map((input, idx) => (
            <li
              key={`${input.type}-${idx}`}
              className="rounded-md border border-white-100 p-2 text-sm"
            >
              <p className="font-medium">{input.type.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs text-white/80">{input.rawValue}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
