//* Types Imports
import type { EventoRecord } from "@/hooks/use-eventos";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: EventoRecord;
};
