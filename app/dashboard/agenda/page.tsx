"use client";

//* Libraries Imports
import { useMemo, useState } from "react";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Calendar, dateFnsLocalizer, Views, type SlotInfo, type View } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./_components/calendar-theme.css";

//* Components Imports
import CardSkeleton from "@/components/card-skeleton";
import { Button } from "@/components/ui/button";

//* Hooks Imports
import { useClients } from "@/hooks/use-clients";
import { useEventos, type EventoRecord } from "@/hooks/use-eventos";

import CalendarToolbar from "./_components/calendar-toolbar";
import DeleteEventoDialog from "./_components/delete-evento-dialog";
import EventoFormDialog from "./_components/evento-form-dialog";
import type { CalendarEvent } from "./_components/types";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

const messages = {
  today: "Hoje",
  previous: "Anterior",
  next: "Próximo",
  month: "Mês",
  week: "Semana",
  work_week: "Semana útil",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia inteiro",
  noEventsInRange: "Nenhum evento nesse período.",
  showMore: (total: number) => `+${total} mais`,
};

export default function AgendaPage() {
  const { eventos, isLoading, isSaving, deletingId, createEvento, updateEvento, deleteEvento } = useEventos();
  const { clients } = useClients();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoRecord | null>(null);
  const [initialRange, setInitialRange] = useState<{ start: Date; end: Date } | null>(null);
  const [deletingEvento, setDeletingEvento] = useState<EventoRecord | null>(null);

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      eventos.map((evento) => ({
        id: evento.id,
        title: evento.titulo,
        start: new Date(evento.data_inicio),
        end: new Date(evento.data_fim),
        allDay: evento.dia_inteiro,
        resource: evento,
      })),
    [eventos]
  );

  function openCreateDialog(range?: { start: Date; end: Date } | null) {
    setEditingEvento(null);
    setInitialRange(range ?? null);
    setIsFormOpen(true);
  }

  function openEditDialog(evento: EventoRecord) {
    setEditingEvento(evento);
    setInitialRange(null);
    setIsFormOpen(true);
  }

  function handleSelectSlot(slotInfo: SlotInfo) {
    openCreateDialog({ start: slotInfo.start, end: slotInfo.end });
  }

  function handleSelectEvent(event: CalendarEvent) {
    openEditDialog(event.resource);
  }

  function handleDeleteFromForm() {
    if (!editingEvento) return;
    setIsFormOpen(false);
    setDeletingEvento(editingEvento);
  }

  return (
    <section className="flex h-full min-h-[42rem] flex-col space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Agenda</p>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Eventos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Organize compromissos, reuniões e prazos.</p>
        </div>
        <Button type="button" className="h-11 px-4 font-bold" onClick={() => openCreateDialog()}><Plus />Novo evento</Button>
      </div>

      <div className="min-h-[36rem] flex-1">
        {isLoading ? (
          <CardSkeleton lines={10} className="h-full min-h-[36rem] p-6" />
        ) : (
        <Calendar
          localizer={localizer}
          culture="pt-BR"
          messages={messages}
          events={calendarEvents}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable
          popup
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{ toolbar: CalendarToolbar }}
          style={{ height: "100%" }}
        />
        )}
      </div>

      <EventoFormDialog
        key={`${editingEvento?.id ?? "new"}-${isFormOpen}`}
        open={isFormOpen}
        evento={editingEvento}
        clients={clients}
        isSaving={isSaving}
        initialRange={initialRange}
        onOpenChange={setIsFormOpen}
        onSubmit={(input) => (editingEvento ? updateEvento(editingEvento.id, input) : createEvento(input))}
        onDelete={editingEvento ? handleDeleteFromForm : undefined}
      />
      <DeleteEventoDialog
        open={Boolean(deletingEvento)}
        titulo={deletingEvento?.titulo ?? ""}
        isDeleting={Boolean(deletingId)}
        onOpenChange={(open) => { if (!open) setDeletingEvento(null); }}
        onConfirm={() => (deletingEvento ? deleteEvento(deletingEvento.id) : Promise.resolve(false))}
      />
    </section>
  );
}
