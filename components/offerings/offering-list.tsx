import { OfferingCard } from "./offering-card";

type Offering = {
  id: string;
  name: string;
  content: string;
};

type Props = {
  offerings: Offering[];
};

export function OfferingList({ offerings }: Props) {
  return (
    <section className="space-y-3">
      {offerings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white-300 p-6 text-sm text-white/80">
          No offerings yet. Create your first offering above.
        </div>
      ) : (
        offerings.map((offering) => (
          <OfferingCard key={offering.id} {...offering} />
        ))
      )}
    </section>
  );
}
