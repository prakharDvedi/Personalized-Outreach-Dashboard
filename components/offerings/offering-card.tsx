import Link from "next/link";

type Props = {
  id: string;
  name: string;
  content: string;
};

export function OfferingCard({ id, name, content }: Props) {
  return (
    <article className="rounded-xl border border-white-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-white/80">{content}</p>
        </div>
        <Link
          href={`/offerings/${id}`}
          className="rounded-md border border-white-300 px-3 py-1.5 text-xs font-medium hover:bg-white-50"
        >
          Edit
        </Link>
      </div>
    </article>
  );
}
