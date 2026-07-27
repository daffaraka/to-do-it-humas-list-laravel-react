import { differenceInDays, startOfDay } from "date-fns";

export const getDaysRemaining = (dateString: string) => {
  const target = startOfDay(new Date(dateString));
  const now = startOfDay(new Date());
  const diff = differenceInDays(target, now);

  if (diff < 0) {
    return { text: `Terlewat ${Math.abs(diff)} hari`, isOverdue: true };
  } else if (diff === 0) {
    return { text: `Batas waktu hari ini`, isOverdue: false };
  } else {
    return { text: `Sisa waktu ${diff} hari`, isOverdue: false };
  }
};

