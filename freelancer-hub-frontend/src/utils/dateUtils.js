import { parseISO, format } from 'date-fns';

export const isValidDate = (date) => {
  return date && !isNaN(Date.parse(date));
};

export const safeParseISO = (dateString) => {
  if (!dateString) return new Date();
  return parseISO(dateString);
};

export const formatDate = (dateString) => {
  try {
    const date = safeParseISO(dateString);
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}; 