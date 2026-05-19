import type { Log } from "~~/shared/db";
import { createEventsAsync, EventAttributes } from "ics";

// Custom endpoint publishing all logs in the ics format. The endpoint can be added to e.g. outlook for easy overview.
export default defineEventHandler(async (event) => {
  const res = await $fetch<{ rows: { doc: Log }[] }>("/db/logs/_all_docs?include_docs=true").catch(() => {
    throw createError({ status: 500, message: "Failed to load logs from db" });
  });

  const formatTitle = (log: Log) => {
    if (!log.customerName && !log.projectName) return "Unknown log";
    if (!log.customerName) return log.projectName;
    return `${log.projectName ?? "Unknown project"} | ${log.customerName}`;
  };

  const events = res.rows.map<EventAttributes>(({ doc: log }) => ({
    title: formatTitle(log),
    start: new Date(log.startedAt).getTime(),
    startInputType: "utc",
    end: new Date(log.stoppedAt).getTime(),
    endInputType: "utc",
  }));

  const ics = await createEventsAsync(events, { calName: "PowerLog" });
  if (ics.error || ics.value === null) throw createError({ status: 500, message: "Failed to create ics events" });

  setResponseHeader(event, "Content-Type", "text/calendar");
  return ics.value;
});
