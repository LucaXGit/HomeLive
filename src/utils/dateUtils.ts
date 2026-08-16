const DAY_NAMES = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
];

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function formatDateKey(
  date: Date
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function startOfWeek(
  date: Date
): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const currentDay =
    result.getDay();

  const difference =
    currentDay === 0
      ? -6
      : 1 - currentDay;

  result.setDate(
    result.getDate() + difference
  );

  return result;
}

export function addDays(
  date: Date,
  amount: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

export function getWeekDays(
  weekStart: Date
): Date[] {
  return Array.from(
    { length: 7 },
    (_, index) =>
      addDays(weekStart, index)
  );
}

export function getShortDayName(
  date: Date
): string {
  return DAY_NAMES[date.getDay()];
}

export function getWeekLabel(
  weekStart: Date
): string {
  const weekEnd =
    addDays(weekStart, 6);

  const startDay =
    weekStart.getDate();

  const endDay =
    weekEnd.getDate();

  const startMonth =
    MONTH_NAMES[
      weekStart.getMonth()
    ];

  const endMonth =
    MONTH_NAMES[
      weekEnd.getMonth()
    ];

  if (
    weekStart.getMonth() ===
      weekEnd.getMonth() &&
    weekStart.getFullYear() ===
      weekEnd.getFullYear()
  ) {
    return `${startDay} - ${endDay} de ${startMonth} de ${weekStart.getFullYear()}`;
  }

  return `${startDay} de ${startMonth} - ${endDay} de ${endMonth} de ${weekEnd.getFullYear()}`;
}

export function parseDateKey(
  dateKey: string
): Date {
  const [year, month, day] =
    dateKey.split('-').map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export function formatReadableDate(
  dateKey: string
): string {
  const date = parseDateKey(dateKey);

  return date.toLocaleDateString(
    'es-MX',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );
}