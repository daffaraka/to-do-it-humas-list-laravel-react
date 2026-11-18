import type { FavoriteSummary } from "@/lib/avicennaWay";

export function AvicennaWayFavoriteSummary({
  summary,
}: {
  summary: FavoriteSummary;
}) {
  return (
    <div className="border-t border-borderBase px-4 py-3 text-sm font-semibold text-textSecondary">
      <div>
        Total poin Perilaku Favorit:{" "}
        <span className="text-indigo-500">{summary.totalPoints}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-medium text-textSecondary">
        {summary.byName.length > 0 ? (
          summary.byName.map(([name, points], index) => (
            <span key={name}>
              {index + 1}. {name}:{" "}
              <span className="text-indigo-500">{points} Favorite</span>
            </span>
          ))
        ) : (
          <span className="font-normal">
            Belum ada nama yang dipilih sebagai favorit.
          </span>
        )}
      </div>
    </div>
  );
}
