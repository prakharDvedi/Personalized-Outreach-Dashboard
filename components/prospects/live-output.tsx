// this component is responsible for displaying the live output of the AI message generation process.
"use client";

type Props = {
  text: string;
};

export function LiveOutput({ text }: Props) {
  if (!text) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold">Live output</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{text}</p>
    </div>
  );
}