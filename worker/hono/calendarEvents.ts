import { extendByRecurrenceRule, getEventEnd } from "ts-ics";

import type { IcsDateObject, IcsEvent } from "ts-ics";

export type CalendarEvent = {
  id: string;
  start: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  end: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  title: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
};

type ExpandedIcsEvent = Omit<IcsEvent, "duration" | "end"> & {
  end: IcsDateObject;
  occurrenceId?: string;
};

type ExpandWindow = {
  start: Date;
  end: Date;
};

function sameTime(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
}

function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

function occurrenceKey(uid: string, recurrenceDate: Date): string {
  return `${uid}#${recurrenceDate.toISOString()}`;
}

function dateObjectFrom(dateObject: IcsDateObject, date: Date): IcsDateObject {
  return {
    ...dateObject,
    date,
  };
}

function isCancelled(event: IcsEvent): boolean {
  return event.status === "CANCELLED";
}

function eventEnd(event: IcsEvent): Date {
  return event.end?.date ?? getEventEnd(event);
}

function normalizeEvent(event: IcsEvent, occurrenceId?: string): ExpandedIcsEvent {
  const { duration: _duration, end: _end, ...rest } = event;
  return {
    ...rest,
    end: event.end ?? dateObjectFrom(event.start, getEventEnd(event)),
    occurrenceId,
  };
}

function overlapsWindow(event: IcsEvent | ExpandedIcsEvent, start: Date, end: Date): boolean {
  const eventStart = event.start.date;
  if (!eventStart) return false;
  const eventEndDate = eventEnd(event);
  return eventStart <= end && eventEndDate >= start;
}

function collectOverrides(events: IcsEvent[]): Map<string, IcsEvent> {
  const overrides = new Map<string, IcsEvent>();
  for (const event of events) {
    if (!event.recurrenceId) continue;
    overrides.set(occurrenceKey(event.uid, event.recurrenceId.value.date), event);
  }
  return overrides;
}

function expandRecurringEvent(
  event: IcsEvent,
  overrides: Map<string, IcsEvent>,
  window: ExpandWindow,
): ExpandedIcsEvent[] {
  if (!event.recurrenceRule) return [normalizeEvent(event)];

  const durationMs = eventEnd(event).getTime() - event.start.date.getTime();
  const overrideDates = [...overrides.values()]
    .filter((override) => override.uid === event.uid)
    .map((override) => override.recurrenceId?.value.date)
    .filter((date): date is Date => Boolean(date));
  const exceptions = [
    ...(event.exceptionDates ?? []).map((exception) => exception.date),
    ...overrideDates,
  ];
  const occurrenceStarts = extendByRecurrenceRule(event.recurrenceRule, {
    start: event.start.date,
    end: window.end,
    exceptions,
  }).filter((occurrenceStart) => {
    const occurrenceEnd = addMilliseconds(occurrenceStart, durationMs);
    return occurrenceStart <= window.end && occurrenceEnd >= window.start;
  });

  const expanded = occurrenceStarts.map((occurrenceStart) => {
    const occurrenceEnd = addMilliseconds(occurrenceStart, durationMs);
    const isFirstOccurrence = sameTime(occurrenceStart, event.start.date);
    const occurrenceId = isFirstOccurrence ? event.uid : occurrenceKey(event.uid, occurrenceStart);
    return {
      ...normalizeEvent(event, occurrenceId),
      start: dateObjectFrom(event.start, occurrenceStart),
      end: dateObjectFrom(event.end ?? event.start, occurrenceEnd),
    };
  });

  for (const override of overrides.values()) {
    if (override.uid !== event.uid || isCancelled(override)) continue;
    if (!overlapsWindow(override, window.start, window.end)) continue;
    expanded.push(
      normalizeEvent(override, occurrenceKey(event.uid, override.recurrenceId!.value.date)),
    );
  }

  return expanded;
}

export function expandCalendarEvents(events: IcsEvent[], window: ExpandWindow): ExpandedIcsEvent[] {
  const overrides = collectOverrides(events);
  return events.flatMap((event) => {
    if (event.recurrenceId || isCancelled(event)) return [];
    return expandRecurringEvent(event, overrides, window);
  });
}

export function filterEvents(
  events: ExpandedIcsEvent[],
  start: Date,
  end: Date,
): ExpandedIcsEvent[] {
  return events.filter((event) => overlapsWindow(event, start, end));
}

export function eventsToJson(events: ExpandedIcsEvent[]): CalendarEvent[] {
  return events
    .map((ev) => {
      const start = ev.start.date;
      const end = eventEnd(ev);
      const allDay = ev.start.type === "DATE";

      const fmt = (d: Date) => {
        if (allDay) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        } else {
          return d.toISOString();
        }
      };

      return {
        id: ev.occurrenceId ?? ev.uid ?? "",
        title: ev.summary ?? "",
        start: fmt(start),
        end: fmt(end),
        isAllDay: allDay,
        location: ev.location,
        description: ev.description,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
