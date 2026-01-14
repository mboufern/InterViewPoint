import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { RecruitmentRun, InterviewResult } from '../types';

interface CalendarViewProps {
  runs: RecruitmentRun[];
  results: InterviewResult[];
  onSelectRun: (id: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const getColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
};

export const CalendarView: React.FC<CalendarViewProps> = ({ runs, results, onSelectRun }) => {
  
  const events = runs.map(run => {
      const count = results.filter(r => r.recruitmentRunId === run.id).length;
      
      // FullCalendar end date is exclusive for all-day events.
      // We add 1 day to the endDate to make it inclusive in the view.
      let end = run.endDate;
      if (end) {
          const endDate = new Date(end);
          endDate.setDate(endDate.getDate() + 1);
          end = endDate.toISOString().split('T')[0];
      }

      return {
          id: run.id,
          title: run.name,
          start: run.startDate,
          end: end, // If null, defaults to start date (1 day)
          extendedProps: {
              count
          },
          allDay: true,
          backgroundColor: getColor(run.id),
          borderColor: 'transparent'
      };
  });

  const renderEventContent = (eventInfo: any) => {
      return (
          <div className="flex justify-between items-center w-full px-1 overflow-hidden cursor-pointer">
              <span className="truncate font-semibold text-xs">{eventInfo.event.title}</span>
              {eventInfo.event.extendedProps.count > 0 && (
                  <span className="text-[9px] bg-white/30 px-1.5 py-0.5 rounded ml-1 font-bold">
                      {eventInfo.event.extendedProps.count}
                  </span>
              )}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
        <style>{`
            .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
            .fc .fc-button-primary { background-color: #ffffff; color: #475569; border-color: #e2e8f0; font-weight: 500; text-transform: capitalize; }
            .fc .fc-button-primary:hover { background-color: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
            .fc-theme-standard .fc-scrollgrid { border-color: #f1f5f9; }
            .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
            .fc .fc-col-header-cell-cushion { padding-top: 10px; padding-bottom: 10px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
            .fc-daygrid-day-number { font-size: 0.875rem; font-weight: 600; color: #64748b; padding: 8px; }
            .fc-day-today { background-color: #f8fafc !important; }
            .fc-event { border-radius: 4px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        `}</style>
        <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            events={events}
            eventContent={renderEventContent}
            eventClick={(info) => onSelectRun(info.event.id)}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            }}
            height="100%"
            dayMaxEvents={true}
        />
    </div>
  );
};