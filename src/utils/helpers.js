import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return format(date, 'dd/MM', { locale: ptBR });
  } catch {
    return dateString;
  }
};

export const formatDateFull = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia!';
  if (hour < 18) return 'Boa tarde!';
  return 'Boa noite!';
};

export const getMonthYear = () => {
  return format(new Date(), "MMMM yyyy", { locale: ptBR });
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

export const getDaysLeft = (deadline) => {
  const today = new Date();
  const due = new Date(deadline);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

export const isAfterClosingDate = (purchaseDateStr, closingDay) => {
  if (!closingDay || !purchaseDateStr) return false;

  const purchaseDate = new Date(purchaseDateStr + 'T00:00:00');
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const closingDate = new Date(currentYear, currentMonth, parseInt(closingDay), 0, 0, 0);

  if (purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear) {
    return purchaseDate.getDate() > closingDate.getDate();
  }

  return false;
};

export const getDueDate = (closingDay, monthsAhead = 0) => {
  if (!closingDay) return null;

  const today = new Date();
  const targetMonth = today.getMonth() + monthsAhead;
  const targetYear = today.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;

  const dueDate = new Date(targetYear, month, parseInt(closingDay) + 7);

  return dueDate.toISOString().split('T')[0];
};

export const getClosingDate = (closingDay, monthsAhead = 0) => {
  if (!closingDay) return null;

  const today = new Date();
  const targetMonth = today.getMonth() + monthsAhead;
  const targetYear = today.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;

  return new Date(targetYear, month, parseInt(closingDay)).toISOString().split('T')[0];
};

export const getDaysUntilClosing = (closingDay) => {
  if (!closingDay) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  let closingDate;

  if (currentDay > parseInt(closingDay)) {
    closingDate = new Date(currentYear, currentMonth + 1, parseInt(closingDay));
  } else {
    closingDate = new Date(currentYear, currentMonth, parseInt(closingDay));
  }

  const diffMs = closingDate - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const getInvoiceMonth = (purchaseDateStr, closingDay) => {
  if (!closingDay || !purchaseDateStr) return getCurrentMonth();

  const purchaseDate = new Date(purchaseDateStr + 'T00:00:00');
  const purchaseDay = purchaseDate.getDate();
  const purchaseMonth = purchaseDate.getMonth();
  const purchaseYear = purchaseDate.getFullYear();

  if (purchaseDay > parseInt(closingDay)) {
    const nextMonth = purchaseMonth + 1;
    const nextYear = purchaseYear + Math.floor(nextMonth / 12);
    const finalMonth = nextMonth % 12;
    return `${nextYear}-${String(finalMonth + 1).padStart(2, '0')}`;
  }

  return `${purchaseYear}-${String(purchaseMonth + 1).padStart(2, '0')}`;
};

export const formatInvoiceMonth = (invoiceMonthStr) => {
  if (!invoiceMonthStr) return '';
  const [year, month] = invoiceMonthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
};

export const getCardGradientColors = (gradientClass) => {
  const gradients = {
    'card-gradient-purple': ['#4C1D95', '#7C3AED', '#A855F7'],
    'card-gradient-blue': ['#0C4A6E', '#0369A1', '#06B6D4'],
    'card-gradient-green': ['#064E3B', '#059669', '#34D399'],
    'card-gradient-red': ['#7F1D1D', '#DC2626', '#FB7185'],
    'card-gradient-orange': ['#7C2D12', '#EA580C', '#FDBA74'],
    'card-gradient-pink': ['#831843', '#DB2777', '#F9A8D4'],
    'card-gradient-cyan': ['#134E4A', '#0D9488', '#5EEAD4'],
    'card-gradient-lime': ['#3F6212', '#65A30D', '#BEF264'],
    'card-gradient-holo': ['#8B5CF6', '#C084FC', '#F0ABFC', '#67E8F9'],
    'card-gradient-dark': ['#18181B', '#3F3F46', '#7C3AED', '#D946EF'],
    'card-gradient-synth': ['#BE185D', '#7C3AED', '#0891B2'],
    'card-gradient-sunset': ['#881337', '#C2410C', '#F59E0B'],
    'card-gradient-midnight': ['#1E1B4B', '#4338CA', '#7C3AED'],
    'card-gradient-aurora': ['#0F766E', '#0EA5E9', '#F472B6'],
    'card-gradient-fire': ['#991B1B', '#EA580C', '#FACC15'],
    'card-solid-black': ['#1C1917', '#1C1917', '#1C1917'],
    'card-solid-white': ['#F5F5F4', '#F5F5F4', '#F5F5F4'],
    'card-solid-gold': ['#D4AF37', '#D4AF37', '#D4AF37'],
    'card-template-dark': null,
    'card-template-color': null,
    'card-template-gold': null,
    'card-template-holo': null,
    'card-template-carbon': null,
    'card-template-marble': null,
    'card-template-glass': null,
  };

  return gradients[gradientClass] || gradients['card-gradient-purple'];
};

export const isCardTemplate = (gradientClass) => {
  return gradientClass?.startsWith('card-template-');
};

export const isCardSolid = (gradientClass) => {
  return gradientClass?.startsWith('card-solid-');
};

export const isCardGradient = (gradientClass) => {
  return gradientClass?.startsWith('card-gradient-');
};

export const getCardTemplateImage = (gradientClass) => {
  const templates = {
    'card-template-dark':   require('../../assets/images/card-template-dark.png'),
    'card-template-color':   require('../../assets/images/card-template-color.png'),
    'card-template-gold':   require('../../assets/images/card-template-gold.png'),
    'card-template-holo':   require('../../assets/images/card-template-holo.png'),
    'card-template-carbon': require('../../assets/images/card-template-carbon.png'),
    'card-template-marble': require('../../assets/images/card-template-marble.png'),
    'card-template-glass':  require('../../assets/images/card-template-glass.png'),
  };
  return templates[gradientClass] || null;
};