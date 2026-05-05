// Date formatting and range helpers using date-fns
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday as dfIsToday, eachDayOfInterval, parseISO } from 'date-fns';

// Format a Date or ISO string to YYYY-MM-DD
export const formatDate = (date) => format(date instanceof Date ? date : parseISO(date), 'yyyy-MM-dd');

// Format a date for display (e.g. "Mon, May 5")
export const formatDisplay = (date) => format(date instanceof Date ? date : parseISO(date), 'EEE, MMM d');

// Format a date to full readable string
export const formatFull = (date) => format(date instanceof Date ? date : parseISO(date), 'MMMM d, yyyy');

// Get the start and end of the current week (Mon–Sun)
export const getWeekRange = (date = new Date()) => ({
  start: startOfWeek(date, { weekStartsOn: 1 }),
  end: endOfWeek(date, { weekStartsOn: 1 }),
});

// Get the start and end of the current month
export const getMonthRange = (date = new Date()) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

// Check if a date string or Date is today
export const isToday = (date) => dfIsToday(date instanceof Date ? date : parseISO(date));

// Get today's date string in YYYY-MM-DD format
export const today = () => format(new Date(), 'yyyy-MM-dd');

// Get tomorrow's date string
export const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return format(d, 'yyyy-MM-dd');
};

// Get an array of date strings for each day in the current week
export const getWeekDays = (date = new Date()) => {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
};

// Get an array of date strings for each day in the current month
export const getMonthDays = (date = new Date()) => {
  const { start, end } = getMonthRange(date);
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
};

// Format just the day abbreviation
export const formatDayAbbr = (dateStr) => format(parseISO(dateStr), 'EEE');
