type TopOffering = {
  offeringId: string;
  offeringName: string;
  usage: number;
};

type Props = {
  topOfferings: TopOffering[];
};

export function TopOfferingsCard({ topOfferings }: Props) {
  return (
    <div className="rounded-xl border border-white-200 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        Top offerings by usage
      </h2>
      {topOfferings.length === 0 ? (
        <p className="mt-3 text-sm text-white/80">No message usage yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {topOfferings.map((item) => (
            <li
              key={item.offeringId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-white-800">{item.offeringName}</span>
              <span className="font-medium">{item.usage}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
