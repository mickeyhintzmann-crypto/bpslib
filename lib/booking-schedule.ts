export const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;

export type SlotTime = (typeof SLOT_TIMES)[number];

export type DayTemplate = {
  dateKey: string;
  dateLabel: string;
  openSlotsCount: number;
  initialBooked: SlotTime[];
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });

const baseOpenSlots = (weekday: number) => {
  if (weekday === 0) {
    return 1;
  }
  if (weekday === 6) {
    return 2;
  }
  return 3;
};

const bookingPattern = (index: number, openSlotsCount: number): SlotTime[] => {
  const booked: SlotTime[] = [];

  if (openSlotsCount >= 3 && index % 6 === 0) {
    booked.push("11:00");
  }
  if (openSlotsCount >= 2 && index % 9 === 0) {
    booked.push("08:00");
  }
  if (openSlotsCount >= 3 && index % 11 === 0) {
    booked.push("13:30");
  }

  return Array.from(new Set(booked));
};

const acutePattern = (index: number, openSlotsCount: number): SlotTime[] => {
  const booked: SlotTime[] = [];

  if (openSlotsCount >= 3 && index % 3 === 0) {
    booked.push("11:00");
  }
  if (openSlotsCount >= 2 && index % 4 === 0) {
    booked.push("08:00");
  }
  if (openSlotsCount >= 3 && index % 5 === 0) {
    booked.push("13:30");
  }

  return Array.from(new Set(booked));
};

const buildTemplate = (
  days: number,
  bookedPattern: (index: number, openSlotsCount: number) => SlotTime[]
): DayTemplate[] => {
  const start = new Date();
  const templates: DayTemplate[] = [];

  for (let index = 0; index < days; index += 1) {
    const dayDate = addDays(start, index);
    const openSlotsCount = baseOpenSlots(dayDate.getDay());

    templates.push({
      dateKey: toDateKey(dayDate),
      dateLabel: formatDateLabel(dayDate),
      openSlotsCount,
      initialBooked: bookedPattern(index, openSlotsCount)
    });
  }

  return templates;
};

export const createBookingTemplates = (days = 30) => buildTemplate(days, bookingPattern);

export const createAcuteTemplates = (days = 14) => buildTemplate(days, acutePattern);

export const slotKey = (dateKey: string, time: SlotTime) => `${dateKey}::${time}`;

export const slotRange = (startTime: SlotTime, requiredSlots: number): SlotTime[] => {
  const startIndex = SLOT_TIMES.findIndex((time) => time === startTime);
  if (startIndex === -1) {
    return [];
  }
  return SLOT_TIMES.slice(startIndex, startIndex + requiredSlots);
};

export const availableSlotTimes = (template: DayTemplate, blocked: Set<string>) => {
  return SLOT_TIMES.slice(0, template.openSlotsCount).filter(
    (time) => !blocked.has(slotKey(template.dateKey, time))
  );
};

export const validStartTimes = (
  template: DayTemplate,
  blocked: Set<string>,
  requiredSlots: number
): SlotTime[] => {
  const available = new Set(availableSlotTimes(template, blocked));
  const maxStart = template.openSlotsCount - requiredSlots;

  if (maxStart < 0) {
    return [];
  }

  const starts: SlotTime[] = [];

  for (let index = 0; index <= maxStart; index += 1) {
    const start = SLOT_TIMES[index];
    const range = slotRange(start, requiredSlots);
    const canFit = range.length === requiredSlots && range.every((slot) => available.has(slot));

    if (canFit) {
      starts.push(start);
    }
  }

  return starts;
};
