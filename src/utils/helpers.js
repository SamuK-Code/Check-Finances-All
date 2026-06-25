import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ========== BANCOS BRASILEIROS ==========
// Exportado para uso em CardsScreen.js e outros componentes
export const BRAZILIAN_BANKS = [
  { code: '001', name: 'Banco do Brasil', shortName: 'Banco do Brasil' },
  { code: '104', name: 'Caixa Econômica Federal', shortName: 'Caixa' },
  { code: '237', name: 'Bradesco', shortName: 'Bradesco' },
  { code: '341', name: 'Itaú Unibanco', shortName: 'Itaú' },
  { code: '033', name: 'Santander', shortName: 'Santander' },
  { code: '077', name: 'Banco Inter', shortName: 'Inter' },
  { code: '260', name: 'Nubank', shortName: 'Nubank' },
  { code: '336', name: 'C6 Bank', shortName: 'C6 Bank' },
  { code: '212', name: 'Banco Original', shortName: 'Original' },
  { code: '422', name: 'Banco Safra', shortName: 'Safra' },
  { code: '745', name: 'Citibank', shortName: 'Citi' },
  { code: '623', name: 'Banco PAN', shortName: 'PAN' },
  { code: '707', name: 'Banco Daycoval', shortName: 'Daycoval' },
  { code: '655', name: 'Banco Votorantim', shortName: 'BV' },
  { code: '318', name: 'Banco BMG', shortName: 'BMG' },
  { code: '070', name: 'Banco de Brasília (BRB)', shortName: 'BRB' },
  { code: '041', name: 'Banrisul', shortName: 'Banrisul' },
  { code: '047', name: 'Banese', shortName: 'Banese' },
  { code: '004', name: 'Banco do Nordeste', shortName: 'BNB' },
  { code: '003', name: 'Banco da Amazônia', shortName: 'Basa' },
  { code: '021', name: 'Banestes', shortName: 'Banestes' },
  { code: '748', name: 'Sicredi', shortName: 'Sicredi' },
  { code: '756', name: 'Sicoob', shortName: 'Sicoob' },
  { code: '121', name: 'Agibank', shortName: 'Agibank' },
  { code: '380', name: 'PicPay', shortName: 'PicPay' },
  { code: '290', name: 'PagBank', shortName: 'PagBank' },
  { code: '254', name: 'Paraná Banco', shortName: 'Paraná Banco' },
  { code: '208', name: 'BTG Pactual', shortName: 'BTG' },
  { code: '376', name: 'Banco JP Morgan', shortName: 'JP Morgan' },
  { code: '064', name: 'Goldman Sachs', shortName: 'Goldman Sachs' },
  // Bancos digitais/adicionais (códigos corrigidos para evitar duplicatas)
  { code: '735', name: 'Neon', shortName: 'Neon' },           // ← CORRIGIDO: era 655 (duplicado)
  { code: '323', name: 'Mercado Pago', shortName: 'Mercado Pago' },
  { code: '102', name: 'XP Investimentos', shortName: 'XP' },
  { code: '197', name: 'Stone', shortName: 'Stone' },
  { code: '340', name: 'Superdigital', shortName: 'Superdigital' },
  { code: '533', name: 'Will Bank', shortName: 'Will' },      // ← CORRIGIDO: era 290 (duplicado)
  { code: '368', name: 'Banco Carrefour', shortName: 'Carrefour' },
  { code: '630', name: 'Banco Smartbank', shortName: 'Smartbank' },
  { code: '739', name: 'Banco Cetelem', shortName: 'Cetelem' },
  { code: '757', name: 'Banco Keb Hana', shortName: 'Keb Hana' },
  { code: '091', name: 'Unicred', shortName: 'Unicred' },
  { code: '117', name: 'Advanced Cc', shortName: 'Advanced' },
  { code: '119', name: 'Banco Western Union', shortName: 'Western Union' },
  { code: '128', name: 'MS Bank', shortName: 'MS Bank' },
  { code: '129', name: 'UBS Brasil', shortName: 'UBS' },
  { code: '136', name: 'Unicred Cooperativa', shortName: 'Unicred Coop' },
  { code: '142', name: 'Broker Brasil', shortName: 'Broker' },
  { code: '143', name: 'Treviso Cc', shortName: 'Treviso' },
  { code: '144', name: 'Bexs Banco', shortName: 'Bexs' },
  { code: '159', name: 'Casa Credito', shortName: 'Casa Crédito' },
  { code: '173', name: 'BRL Trust', shortName: 'BRL Trust' },
  { code: '184', name: 'Banco Itaú BBA', shortName: 'Itaú BBA' },
  { code: '204', name: 'Banco Bradesco Cartões', shortName: 'Bradesco Cards' },
  { code: '228', name: 'Banco Itaú Consignado', shortName: 'Itaú Consig' },
  { code: '229', name: 'Banco Cruzeiro do Sul', shortName: 'Cruzeiro Sul' },
  { code: '230', name: 'Uniprime', shortName: 'Uniprime' },
  { code: '233', name: 'Banco Cifra', shortName: 'Cifra' },
  { code: '243', name: 'Banco Máxima', shortName: 'Máxima' },
  { code: '246', name: 'Banco ABC Brasil', shortName: 'ABC' },
  { code: '265', name: 'Banco Fator', shortName: 'Fator' },
  { code: '300', name: 'Banco de La Nacion Argentina', shortName: 'La Nación' },
  { code: '320', name: 'Banco Industrial e Comercial', shortName: 'BIC' },
  { code: '329', name: 'Qi Sociedade de Crédito', shortName: 'Qi' },
  { code: '330', name: 'Banco Bari', shortName: 'Bari' },
  { code: '335', name: 'Banco Digio', shortName: 'Digio' },
  { code: '366', name: 'Banco Société Générale', shortName: 'SocGen' },
  { code: '370', name: 'Banco Mizuho', shortName: 'Mizuho' },
  { code: '389', name: 'Banco Mercantil do Brasil', shortName: 'Mercantil' },
  { code: '394', name: 'Banco Bradesco Financiamentos', shortName: 'Bradesco Fin' },
  { code: '399', name: 'Kirton Bank', shortName: 'Kirton' },
  { code: '412', name: 'Banco Capital', shortName: 'Capital' },
  { code: '453', name: 'Banco Rural', shortName: 'Rural' },
  { code: '456', name: 'Banco MUFG Brasil', shortName: 'MUFG' },
  { code: '464', name: 'Banco Sumitomo Mitsui', shortName: 'Sumitomo' },
  { code: '473', name: 'Banco Caixa Geral', shortName: 'Caixa Geral' },
  { code: '477', name: 'Citibank N.A.', shortName: 'Citibank NA' },
  { code: '487', name: 'Deutsche Bank', shortName: 'Deutsche' },
  { code: '488', name: 'JPMorgan Chase Bank', shortName: 'JPMorgan' },
  { code: '492', name: 'ING Bank', shortName: 'ING' },
  { code: '494', name: 'Banco de La República', shortName: 'República' },
  { code: '495', name: 'Banco de La Provincia', shortName: 'Provincia' },
  { code: '505', name: 'Banco Credit Suisse', shortName: 'Credit Suisse' },
  { code: '545', name: 'Banco Senso Ccvm', shortName: 'Senso' },
  { code: '600', name: 'Banco Luso Brasileiro', shortName: 'Luso' },
  { code: '604', name: 'Banco Industrial do Brasil', shortName: 'Industrial' },
  { code: '610', name: 'Banco VR', shortName: 'VR' },
  { code: '611', name: 'Banco Paulista', shortName: 'Paulista' },
  { code: '612', name: 'Banco Guanabara', shortName: 'Guanabara' },
  { code: '613', name: 'Banco Pecúnia', shortName: 'Pecúnia' },
  { code: '626', name: 'Banco Ficsa', shortName: 'Ficsa' },
  { code: '633', name: 'Banco Rendimento', shortName: 'Rendimento' },
  { code: '634', name: 'Banco Triângulo', shortName: 'Triângulo' },
  { code: '637', name: 'Banco Sofisa', shortName: 'Sofisa' },
  { code: '638', name: 'Banco Prosper', shortName: 'Prosper' },
  { code: '641', name: 'Banco Alvorada', shortName: 'Alvorada' },
  { code: '643', name: 'Banco Pine', shortName: 'Pine' },
  { code: '652', name: 'Itaú Unibanco Holding', shortName: 'Itaú Hold' },
  { code: '653', name: 'Banco Indusval', shortName: 'Indusval' },
  { code: '654', name: 'Banco A.J. Renner', shortName: 'Renner' },
  { code: '712', name: 'Banco Ourinvest', shortName: 'Ourinvest' },
  { code: '719', name: 'Banco Banif', shortName: 'Banif' },
  { code: '721', name: 'Banco Credibel', shortName: 'Credibel' },
  { code: '734', name: 'Banco Gerdau', shortName: 'Gerdau' },
  { code: '740', name: 'Banco Barclays', shortName: 'Barclays' },
  { code: '741', name: 'Banco Ribeirão Preto', shortName: 'Ribeirão Preto' },
  { code: '743', name: 'Banco Semear', shortName: 'Semear' },
  { code: '746', name: 'Banco Modal', shortName: 'Modal' },
  { code: '747', name: 'Banco Rabobank', shortName: 'Rabobank' },
  { code: '751', name: 'Banco Scotiabank', shortName: 'Scotiabank' },
  { code: '752', name: 'Banco BNP Paribas', shortName: 'BNP' },
  { code: '753', name: 'NBC Bank Brasil', shortName: 'NBC' },
  { code: '755', name: 'Bank of America Merrill Lynch', shortName: 'BoA' },
];

// ========== FORMATAÇÃO DE MOEDA ==========
export const formatCurrencyInput = (value) => {
  let cleaned = value.replace(/[^\d.,]/g, '');
  let normalized = cleaned.replace(',', '.');
  const parts = normalized.split('.');
  if (parts.length > 2) {
    normalized = parts[0] + '.' + parts.slice(1).join('');
  }
  const displayValue = normalized.replace('.', ',');
  return displayValue;
};

export const parseCurrencyToNumber = (value) => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

// ========== FORMATAÇÃO DE DATA ==========
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

// ========== CARTÕES ==========
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