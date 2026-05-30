import Link from "next/link";

type Prospect = {
  id: string;
  name: string;
  inputs: unknown[];
};

type Props = {
  prospects: Prospect[];
};

export function ProspectList({ prospects }: Props) {
  return (
    <section className="space-y-3">
      {prospects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white-300 p-6 text-sm text-white/80">
          No prospects yet.
        </div>
      ) : (
        prospects.map((prospect) => (
          <article
            key={prospect.id}
            className="rounded-xl border border-white-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{prospect.name}</h3>
                <p className="mt-1 text-xs text-white-500">
                  Inputs: {prospect.inputs.length}
                </p>
              </div>
              <Link
                href={`/prospects/${prospect.id}`}
                className="rounded-md border border-white-300 px-3 py-1.5 text-xs font-medium hover:bg-white-50"
              >
                Open
              </Link>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
