/**
 * Utility to calculate store opening status based on Horário de Brasília (America/Sao_Paulo).
 * Business Hours: Segunda a Sábado das 18:00 às 23:30 (Domingo: Fechado).
 */

export interface StoreStatus {
  isOpen: boolean;
  statusLabel: string;
  shortLabel: string;
  nextEventText: string;
  scheduleText: string;
  badgeBg: string;
  dotColor: string;
  textColor: string;
}

export function getStoreStatus(): StoreStatus {
  try {
    const now = new Date();

    // Use Intl.DateTimeFormat parts for 100% resilient parsing across iOS, Android & Safari
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hourCycle: 'h23',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    });

    const parts = formatter.formatToParts(now);
    let weekdayStr = '';
    let hours = 0;
    let minutes = 0;

    for (const part of parts) {
      if (part.type === 'weekday') weekdayStr = part.value;
      if (part.type === 'hour') hours = parseInt(part.value, 10);
      if (part.type === 'minute') minutes = parseInt(part.value, 10);
    }

    // Map weekday abbreviations to Sunday (0) through Saturday (6)
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const dayOfWeek = weekdayMap[weekdayStr] ?? now.getDay();
    const currentMinutes = hours * 60 + minutes;

    const openMinutes = 18 * 60; // 18:00
    const closeMinutes = 23 * 60 + 30; // 23:30

    // Segunda a Sábado: dias 1 a 6
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;
    const isOpen = isWorkingDay && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

    let nextEventText = '';
    if (isOpen) {
      nextEventText = 'Fecha às 23:30';
    } else if (dayOfWeek === 0) {
      // Domingo
      nextEventText = 'Abre segunda às 18:00';
    } else if (currentMinutes < openMinutes) {
      // Antes das 18:00 em dia útil
      nextEventText = 'Abre hoje às 18:00';
    } else {
      // Após 23:30 em dia útil
      if (dayOfWeek === 6) {
        nextEventText = 'Abre segunda às 18:00';
      } else {
        nextEventText = 'Abre amanhã às 18:00';
      }
    }

    return {
      isOpen,
      statusLabel: isOpen ? 'Aberto agora' : 'Fechado agora',
      shortLabel: isOpen ? 'Aberto' : 'Fechado',
      nextEventText,
      scheduleText: 'Segunda a Sábado: 18:00 às 23:30',
      badgeBg: isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-100 border-zinc-200',
      dotColor: isOpen ? 'bg-emerald-500' : 'bg-zinc-400',
      textColor: isOpen ? 'text-emerald-700' : 'text-zinc-600',
    };
  } catch (e) {
    // Graceful fallback
    return {
      isOpen: true,
      statusLabel: 'Aberto agora',
      shortLabel: 'Aberto',
      nextEventText: '18:00 às 23:30',
      scheduleText: 'Segunda a Sábado: 18:00 às 23:30',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    };
  }
}
