
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Investment, 
  BankAccount, 
  Notification, 
  InvestmentStatus, 
  Language,
  AppState 
} from './types';
import { 
  VIP_PLANS, 
  ANGOLAN_BANKS, 
  INITIAL_BANK_ACCOUNTS, 
  TRANSLATIONS,
  TELEGRAM_USERNAME 
} from './constants';
import { 
  TrendingUp, 
  Bell, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  Banknote,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Settings,
  Wallet,
  ExternalLink,
  DollarSign
} from 'lucide-react';

// --- Shared UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const variants: any = {
    primary: 'bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic tracking-wider shadow-lg shadow-red-900/40',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase italic tracking-wider',
    outline: 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800',
    ghost: 'text-neutral-400 hover:text-white',
    danger: 'bg-orange-600 hover:bg-orange-700 text-white'
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

// --- State Engine ---

const STORAGE_KEY = 'angola_milhoes_v2_final';

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {
    users: [],
    investments: [],
    bankAccounts: INITIAL_BANK_ACCOUNTS,
    notifications: [],
    totalCollected: 0,
    totalPaid: 0
  };
};

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'plan-details' | 'payment' | 'withdraw'>('landing');
  const [lang, setLang] = useState<Language>('pt');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<'50' | '75'>('50');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [withdrawData, setWithdrawData] = useState({ method: '', details: '' });
  const [activeWithdrawId, setActiveWithdrawId] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const notify = useCallback((userId: string, title: string, msg: string, type: any) => {
    const n: Notification = { id: Math.random().toString(36).substr(2, 9), userId, title, message: msg, type, createdAt: new Date().toISOString(), isRead: false };
    setState(s => ({ ...s, notifications: [n, ...s.notifications] }));
  }, []);

  const handleLogin = (user: string, pass: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) return setAuthError('Tente de novo em 24h');
    
    // ADMIN LOGIN: admin / 123456
    if (user === 'admin' && pass === '123456') {
      setCurrentUser({ id: 'admin', username: 'admin', passwordHash: '123456', isAdmin: true, isBlocked: false, createdAt: '' });
      setCurrentPage('admin');
      return;
    }

    const u = state.users.find(x => x.username === user && x.passwordHash === pass);
    if (u) {
      if (u.isBlocked) return setAuthError('Conta bloqueada por fraude.');
      setCurrentUser(u);
      setAttempts(0);
      setCurrentPage('dashboard');
    } else {
      const att = attempts + 1;
      setAttempts(att);
      if (att >= 3) {
        const u = Date.now() + 86400000;
        setLockoutUntil(u);
        setAuthError('Tente de novo em 24h.');
      } else {
        setAuthError(`Dados incorretos (${att}/3)`);
      }
    }
  };

  const createInvestment = () => {
    if (!currentUser || !selectedPlan || !selectedBank) return;
    const active = state.investments.filter(i => i.userId === currentUser.id && [InvestmentStatus.PENDING, InvestmentStatus.ACTIVE].includes(i.status));
    if (active.length >= 2) return alert('Máximo de 2 investimentos simultâneos.');

    const returns = selectedOption === '50' ? selectedPlan.return50 : selectedPlan.return75;
    const inv: Investment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      planId: selectedPlan.id,
      option: selectedOption,
      amount: selectedPlan.amount,
      expectedGain: returns.gain,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + returns.days * 86400000).toISOString(),
      status: InvestmentStatus.PENDING,
      daysPassed: 0,
      bankName: selectedBank
    };
    setState(s => ({ ...s, investments: [...s.investments, inv] }));
    notify(currentUser.id, 'Investimento Registrado', 'Aguardando validação do comprovativo via Telegram.', 'info');
    setCurrentPage('dashboard');
  };

  // --- Views ---

  const LandingPage = () => (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-black italic text-xl font-brand">A</div>
          <span className="text-2xl font-brand font-black uppercase italic tracking-tighter"><span className="text-red-600">Angola</span> Milhões</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => setCurrentPage('login')}>Entrar</Button>
          <Button onClick={() => setCurrentPage('signup')}>Começar</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl md:text-8xl font-brand font-black italic uppercase leading-none mb-6">Obtenha sua <br /><span className="text-red-600">Renda Extra</span></h1>
        <p className="text-neutral-500 max-w-2xl mx-auto text-lg mb-10">Invista em criptomoedas com especialistas angolanos. Um clique, lucro garantido.</p>
        <Button className="px-12 py-4 text-xl" onClick={() => setCurrentPage('signup')}>Investir Agora</Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
        {VIP_PLANS.map(p => (
          <Card key={p.id} className="group hover:border-red-600 transition-all cursor-pointer">
            <div className="text-red-600 font-brand font-black text-4xl mb-2">{p.name}</div>
            <div className="text-3xl font-bold mb-6">{p.amount.toLocaleString()} KZ</div>
            <div className="space-y-3 text-sm text-neutral-400 mb-8">
              <div className="flex justify-between border-b border-neutral-800 pb-2"><span>7 Dias (50%)</span><span className="text-white">{p.return50.gain.toLocaleString()} KZ</span></div>
              <div className="flex justify-between"><span>20 Dias (75%)</span><span className="text-white">{p.return75.gain.toLocaleString()} KZ</span></div>
            </div>
            <Button className="w-full" onClick={() => { setSelectedPlan(p); setCurrentPage('plan-details'); }}>Selecionar Plano</Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const Dashboard = () => {
    const myInvs = state.investments.filter(i => i.userId === currentUser?.id);
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800 p-6 flex justify-between items-center bg-black/50 backdrop-blur sticky top-0 z-50">
          <div className="font-brand font-black italic text-xl uppercase"><span className="text-red-600">Angola</span> Milhões</div>
          <div className="flex gap-4 items-center">
            <Bell className="text-neutral-500" />
            <Button variant="ghost" onClick={() => { setCurrentUser(null); setCurrentPage('landing'); }}><LogOut size={20}/></Button>
          </div>
        </header>
        <main className="p-6 max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-red-600/10 to-transparent">
              <div className="text-xs uppercase text-neutral-500 font-bold mb-1">Rendimento Pendente</div>
              <div className="text-4xl font-brand font-black">{myInvs.filter(i => i.status === InvestmentStatus.ACTIVE).reduce((a,b) => a+b.expectedGain, 0).toLocaleString()} KZ</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-600/10 to-transparent">
              <div className="text-xs uppercase text-neutral-500 font-bold mb-1">Total Recebido</div>
              <div className="text-4xl font-brand font-black text-blue-500">{myInvs.filter(i => i.status === InvestmentStatus.PAID).reduce((a,b) => a+b.expectedGain, 0).toLocaleString()} KZ</div>
            </Card>
          </div>

          <h2 className="text-2xl font-brand font-black italic uppercase">Seus <span className="text-red-600">Investimentos</span></h2>
          <div className="space-y-4">
            {myInvs.map(i => (
              <Card key={i.id} className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="font-bold text-lg">{VIP_PLANS.find(p => p.id === i.planId)?.name} ({i.option}%)</div>
                  <div className={`text-xs font-black uppercase tracking-widest ${i.status === InvestmentStatus.ACTIVE ? 'text-green-500' : 'text-orange-500'}`}>{i.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">{i.expectedGain.toLocaleString()} KZ</div>
                  <div className="text-[10px] text-neutral-500">{new Date(i.endDate).toLocaleDateString()}</div>
                </div>
                {i.status === InvestmentStatus.ACTIVE && new Date() >= new Date(i.endDate) && (
                  <Button variant="secondary" onClick={() => { setActiveWithdrawId(i.id); setCurrentPage('withdraw'); }}>Sacar Agora</Button>
                )}
              </Card>
            ))}
            {myInvs.length === 0 && <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-800 rounded-2xl">Nenhum investimento ainda.</div>}
          </div>
        </main>
        <a href={`https://t.me/${TELEGRAM_USERNAME.replace('@', '')}`} target="_blank" className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"><MessageCircle size={32}/></a>
      </div>
    );
  };

  const AdminPanel = () => {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3"><ShieldCheck className="text-red-600" size={32}/><span className="text-2xl font-brand font-black italic uppercase">Painel <span className="text-red-600">360º</span></span></div>
          <Button variant="outline" onClick={() => setCurrentPage('landing')}>Sair</Button>
        </header>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-600"><div className="text-xs text-neutral-500">Arrecadado</div><div className="text-2xl font-bold">{state.investments.reduce((a,b)=>a+b.amount, 0).toLocaleString()} KZ</div></Card>
          <Card className="border-l-4 border-l-green-600"><div className="text-xs text-neutral-500">Pagos</div><div className="text-2xl font-bold">{state.totalPaid.toLocaleString()} KZ</div></Card>
          <Card className="border-l-4 border-l-blue-600"><div className="text-xs text-neutral-500">Investidores</div><div className="text-2xl font-bold">{state.users.length}</div></Card>
          <Card className="border-l-4 border-l-orange-600"><div className="text-xs text-neutral-500">Pendentes</div><div className="text-2xl font-bold">{state.investments.filter(i=>i.status===InvestmentStatus.PENDING).length}</div></Card>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock className="text-orange-500"/> Ativações Pendentes</h3>
            <div className="space-y-3">
              {state.investments.filter(i=>i.status===InvestmentStatus.PENDING).map(i => (
                <div key={i.id} className="flex justify-between items-center p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-sm"><b>{state.users.find(u=>u.id===i.userId)?.username}</b> - {i.amount} KZ ({i.bankName})</div>
                  <Button className="text-xs" onClick={() => {
                    setState(s => ({ ...s, investments: s.investments.map(x => x.id === i.id ? { ...x, status: InvestmentStatus.ACTIVE } : x) }));
                    notify(i.userId, 'Ativado!', 'Seu investimento foi ativado com sucesso.', 'success');
                  }}>Ativar</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Wallet className="text-blue-500"/> Saques para Pagar</h3>
            <div className="space-y-3">
              {state.investments.filter(i=>i.status===InvestmentStatus.WITHDRAWAL_PENDING).map(i => (
                <div key={i.id} className="flex justify-between items-center p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-sm"><b>{state.users.find(u=>u.id===i.userId)?.username}</b> &rarr; <span className="text-red-500 font-bold">{i.expectedGain} KZ</span></div>
                  <Button variant="secondary" className="text-xs" onClick={() => {
                    setState(s => ({ ...s, totalPaid: s.totalPaid + i.expectedGain, investments: s.investments.map(x => x.id === i.id ? { ...x, status: InvestmentStatus.PAID } : x) }));
                    notify(i.userId, 'Pago!', 'Seu saque foi processado e enviado.', 'success');
                  }}>Confirmar Pago</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Settings className="text-red-600"/> Configurar Coordenadas Bancárias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.bankAccounts.map(b => (
                <div key={b.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                  <div className="text-red-600 font-bold">{b.bankName}</div>
                  <input type="text" value={b.iban} placeholder="IBAN" className="w-full bg-black border border-neutral-800 p-2 text-xs rounded" onChange={e => setState(s => ({...s, bankAccounts: s.bankAccounts.map(x => x.id === b.id ? {...x, iban: e.target.value} : x)}))}/>
                  <input type="text" value={b.holderName} placeholder="Titular" className="w-full bg-black border border-neutral-800 p-2 text-xs rounded" onChange={e => setState(s => ({...s, bankAccounts: s.bankAccounts.map(x => x.id === b.id ? {...x, holderName: e.target.value} : x)}))}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const render = () => {
    switch(currentPage) {
      case 'landing': return <LandingPage />;
      case 'login': return <AuthPage mode="login" onAuth={handleLogin} error={authError} setPage={setCurrentPage} />;
      case 'signup': return <AuthPage mode="signup" onAuth={(u:string, p:string) => {
        if(p.length > 6) return setAuthError('Max 6 dígitos');
        const newUser = { id: Math.random().toString(36).substr(2, 9), username: u, passwordHash: p, isAdmin: false, isBlocked: false, createdAt: new Date().toISOString() };
        setState(s => ({...s, users: [...s.users, newUser]}));
        setCurrentUser(newUser); setCurrentPage('dashboard');
      }} error={authError} setPage={setCurrentPage} />;
      case 'dashboard': return <Dashboard />;
      case 'admin': return <AdminPanel />;
      case 'plan-details': return <PlanDetails plan={selectedPlan} opt={selectedOption} setOpt={setSelectedOption} bank={selectedBank} setBank={setSelectedBank} onNext={() => setCurrentPage('payment')} setPage={setCurrentPage} />;
      case 'payment': return <Payment plan={selectedPlan} bank={selectedBank} accounts={state.bankAccounts} onConfirm={createInvestment} setPage={setCurrentPage} />;
      case 'withdraw': return <WithdrawalView onConfirm={(m,d) => {
        setState(s => ({ ...s, investments: s.investments.map(x => x.id === activeWithdrawId ? { ...x, status: InvestmentStatus.WITHDRAWAL_PENDING } : x) }));
        notify(currentUser!.id, 'Saque Solicitado', `Método ${m} em análise.`, 'info');
        setCurrentPage('dashboard');
      }} setPage={setCurrentPage} />;
      default: return <LandingPage />;
    }
  };

  return <div className="font-sans">{render()}</div>;
}

// --- Sub-Views ---

const AuthPage = ({ mode, onAuth, error, setPage }: any) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-4xl font-brand font-black italic uppercase text-center">{mode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
        <Card className="space-y-4">
          <input type="text" placeholder="Usuário" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" onChange={e => setU(e.target.value)}/>
          <input type="password" placeholder="Senha (6 dígitos)" maxLength={6} className="w-full bg-black border border-neutral-800 p-4 rounded-xl" onChange={e => setP(e.target.value)}/>
          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}
          <Button className="w-full py-4" onClick={() => onAuth(u, p)}>Continuar</Button>
          <Button variant="ghost" className="w-full text-sm" onClick={() => setPage(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Não tem conta? Cadastrar' : 'Já tem conta? Entrar'}</Button>
        </Card>
        <button className="flex items-center gap-2 text-neutral-600 hover:text-white mx-auto" onClick={() => setPage('landing')}><ArrowLeft size={16}/> Voltar</button>
      </div>
    </div>
  );
};

const PlanDetails = ({ plan, opt, setOpt, bank, setBank, onNext, setPage }: any) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <div className="max-w-xl w-full space-y-6">
      <Card className="space-y-8">
        <div className="text-center font-brand font-black italic text-4xl text-red-600">{plan?.name}</div>
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => setOpt('50')} className={`p-4 border-2 rounded-2xl cursor-pointer ${opt === '50' ? 'border-red-600 bg-red-600/5' : 'border-neutral-800'}`}>
            <div className="text-2xl font-bold">{plan?.return50.gain.toLocaleString()} KZ</div>
            <div className="text-[10px] uppercase text-red-600 font-black">7 Dias Úteis (50%)</div>
          </div>
          <div onClick={() => setOpt('75')} className={`p-4 border-2 rounded-2xl cursor-pointer ${opt === '75' ? 'border-red-600 bg-red-600/5' : 'border-neutral-800'}`}>
            <div className="text-2xl font-bold">{plan?.return75.gain.toLocaleString()} KZ</div>
            <div className="text-[10px] uppercase text-red-600 font-black">20 Dias Úteis (75%)</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ANGOLAN_BANKS.map(b => (
            <div key={b} onClick={() => setBank(b)} className={`p-2 border rounded text-[10px] text-center cursor-pointer ${bank === b ? 'bg-blue-600 border-blue-600' : 'border-neutral-800'}`}>{b}</div>
          ))}
        </div>
        <Button className="w-full py-4" disabled={!bank} onClick={onNext}>Confirmar e Pagar</Button>
        <Button variant="ghost" className="w-full" onClick={() => setPage('landing')}>Cancelar</Button>
      </Card>
    </div>
  </div>
);

const Payment = ({ plan, bank, accounts, onConfirm, setPage }: any) => {
  const acc = accounts.find((a: any) => a.bankName === bank) || accounts[0];
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="max-w-lg w-full space-y-6 border-red-600/50 border-2">
        <h2 className="text-2xl font-brand font-black italic uppercase text-center">Pagamento <span className="text-red-600">Obrigatório</span></h2>
        <div className="bg-neutral-950 p-6 rounded-2xl space-y-4">
          <div><div className="text-[10px] uppercase text-neutral-500">Valor</div><div className="text-2xl font-bold text-red-600">{plan?.amount.toLocaleString()} KZ</div></div>
          <div><div className="text-[10px] uppercase text-neutral-500">Banco Destino</div><div className="font-bold">{bank}</div></div>
          <div><div className="text-[10px] uppercase text-neutral-500">IBAN</div><div className="font-mono text-sm break-all">{acc.iban}</div></div>
          <div><div className="text-[10px] uppercase text-neutral-500">Titular</div><div className="font-bold">{acc.holderName}</div></div>
        </div>
        <div className="text-xs text-neutral-500 leading-relaxed italic">Envie o comprovativo para o nosso suporte Telegram imediatamente após a transferência para validar sua ativação.</div>
        <Button className="w-full bg-blue-600 flex justify-center items-center gap-2" onClick={() => window.open(`https://t.me/${TELEGRAM_USERNAME.replace('@', '')}`)}><ExternalLink size={16}/> Abrir Telegram</Button>
        <Button variant="outline" className="w-full" onClick={onConfirm}>Já paguei, ativar meu VIP</Button>
      </Card>
    </div>
  );
};

const WithdrawalView = ({ onConfirm, setPage }: any) => {
  const [m, setM] = useState('');
  const [d, setD] = useState('');
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full space-y-6">
        <h2 className="text-3xl font-brand font-black italic uppercase text-center">Efetuar <span className="text-red-600">Saque</span></h2>
        <select className="w-full bg-black border border-neutral-800 p-4 rounded-xl" onChange={e => setM(e.target.value)}>
          <option value="">Escolha como receber...</option>
          {ANGOLAN_BANKS.map(b => <option key={b} value={b}>IBAN - {b}</option>)}
          <option value="Binance">Crypto - Binance (USDT)</option>
          <option value="Redotpay">Crypto - Redotpay</option>
          <option value="Bybit">Crypto - Bybit</option>
        </select>
        <input type="text" placeholder="IBAN ou Carteira Cripto" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" onChange={e => setD(e.target.value)}/>
        <Button className="w-full py-4" disabled={!m || !d} onClick={() => onConfirm(m, d)}>Solicitar Pagamento</Button>
        <Button variant="ghost" className="w-full" onClick={() => setPage('dashboard')}>Voltar</Button>
      </Card>
    </div>
  );
};
