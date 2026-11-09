import { addDays, addMonths, addWeeks, isAfter, startOfDay } from "date-fns";

export type RecurrenceType = "daily" | "weekly" | "monthly";

/** Default schedule horizon used when a recurring task has no range yet. */
export const getDefaultRecurrenceEnd = (start: Date, recurrence: RecurrenceType) => {
  const normalizedStart = startOfDay(start);
  if (recurrence === "daily") return addDays(normalizedStart, 29);
  if (recurrence === "weekly") return addWeeks(normalizedStart, 11);
  return addMonths(normalizedStart, 11);
};

export const getRecurrenceEnd = (
  start: Date,
  dueDate: Date | null | undefined,
  recurrence: RecurrenceType,
) => {
  const normalizedStart = startOfDay(start);
  const normalizedDueDate = dueDate ? startOfDay(dueDate) : null;
  return normalizedDueDate && isAfter(normalizedDueDate, normalizedStart)
    ? normalizedDueDate
    : getDefaultRecurrenceEnd(normalizedStart, recurrence);
};
