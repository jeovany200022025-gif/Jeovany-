
import { VIPPlan, BankAccount } from './types';

export const VIP_PLANS: VIPPlan[] = [
  { id: 'vip0', name: 'VIP 0', amount: 10000, return50: { gain: 15000, days: 7 }, return75: { gain: 17500, days: 20 } },
  { id: 'vip1', name: 'VIP 1', amount: 30000, return50: { gain: 45000, days: 7 }, return75: { gain: 52500, days: 20 } },
  { id: 'vip2', name: 'VIP 2', amount: 70000, return50: { gain: 105000, days: 7 }, return75: { gain: 122500, days: 20 } },
  { id: 'vip3', name: 'VIP 3', amount: 120000, return50: { gain: 180000, days: 7 }, return75: { gain: 210000, days: 20 } },
  { id: 'vip4', name: 'VIP 4', amount: 310000, return50: { gain: 465000, days: 7 }, return75: { gain: 542500, days: 20 } },
  { id: 'vip5', name: 'VIP 5', amount: 620000, return50: { gain: 930000, days: 7 }, return75: { gain: 1085000, days: 20 } },
];

export const ANGOLAN_BANKS = ['BFA', 'BAI', 'Atlântico', 'BIC', 'Banco SOL'];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = ANGOLAN_BANKS.map((bank, index) => ({
  id: `bank-${index}`,
  bankName: bank,
  accountNumber: '---',
  iban: 'AO06 0000 0000 0000 0000 0000 0',
  holderName: 'Aguardando Configuração Admin'
}));

export const TELEGRAM_USERNAME = '@auracapial9914';

export const TRANSLATIONS = {
  pt: {
    welcome: 'Bem-vindo ao Angola Milhões',
    subtitle: 'Ganhe renda extra com o mercado cripto sem sair de casa.',
    login: 'Entrar',
    signup: 'Cadastrar',
    logout: 'Sair',
    investNow: 'Investir Agora',
    lockoutMsg: 'Tente de novo em 24h.',
    limitReached: 'Limite de 2 investimentos ativos atingido.'
  },
  en: {
    welcome: 'Welcome to Angola Millions',
    subtitle: 'Earn extra income with crypto without leaving home.',
    login: 'Login',
    signup: 'Register',
    logout: 'Logout',
    investNow: 'Invest Now',
    lockoutMsg: 'Try again in 24h.',
    limitReached: 'Limit of 2 active investments reached.'
  }
};
