// Every user sees the same calendar day, whatever their device timezone.
const timeZone = "Asia/Jakarta";
const locale = "en-GB";

const dateFormat = new Intl.DateTimeFormat(locale, {
  timeZone,
  dateStyle: "medium",
});
const dateTimeFormat = new Intl.DateTimeFormat(locale, {
  timeZone,
  dateStyle: "medium",
  timeStyle: "short",
});

/** ISO timestamp from the API -> "27 Nov 2026". */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** ISO timestamp from the API -> "27 Nov 2026, 14:05". */
export const formatDateTime = (iso: string) =>
  dateTimeFormat.format(new Date(iso));
