import { create } from 'zustand'

const STORAGE_KEY = 'flowtaka_state';

const getInitialState = () => {
  const defaultState = {
    startingBalance: 0,
    monthlyIncome: 0,
    emergencyReserve: 0,
    cycleStartDate: new Date().toISOString().split('T')[0],
    transactions: [],
    debts: [],
    subscriptions: [],
    pinCode: '',
    isLocked: false,
    language: 'en',
    isSetup: false,
  };

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // If PIN is set, lock the app on startup
      if (parsed.pinCode) {
        parsed.isLocked = true;
      }
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load FlowTaka state:', e);
  }
  return defaultState;
};

export const useFinanceStore = create((set, get) => ({
  ...getInitialState(),

  // Save utility
  _save: (stateUpdate) => {
    set((state) => {
      const newState = { ...state, ...stateUpdate };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          startingBalance: newState.startingBalance,
          monthlyIncome: newState.monthlyIncome,
          emergencyReserve: newState.emergencyReserve,
          cycleStartDate: newState.cycleStartDate,
          transactions: newState.transactions,
          debts: newState.debts,
          subscriptions: newState.subscriptions,
          pinCode: newState.pinCode,
          isLocked: newState.isLocked,
          language: newState.language,
          isSetup: newState.isSetup,
        }));
      } catch (e) {
        console.error('Failed to save FlowTaka state:', e);
      }
      return newState;
    });
  },

  // Setup Action
  setupUser: (startingBalance, monthlyIncome, emergencyReserve, cycleStartDate) => {
    get()._save({
      startingBalance: Number(startingBalance) || 0,
      monthlyIncome: Number(monthlyIncome) || 0,
      emergencyReserve: Number(emergencyReserve) || 0,
      cycleStartDate: cycleStartDate || new Date().toISOString().split('T')[0],
      isSetup: true,
      transactions: [],
      debts: [],
      subscriptions: [],
    });
  },

  // Transaction Actions
  addTransaction: (amount, type, description, source = 'manual', date = null) => {
    const transaction = {
      id: crypto.randomUUID(),
      amount: Number(amount) || 0,
      type, // 'in' or 'out'
      description: description || (type === 'in' ? 'Income' : 'Expense'),
      timestamp: date ? new Date(date).toISOString() : new Date().toISOString(),
      source, // 'manual' or 'voice'
    };

    get()._save({
      transactions: [transaction, ...get().transactions],
    });

    // Check if description matches active debts to offer auto-settlement, handled in components
    return transaction;
  },

  deleteTransaction: (id) => {
    get()._save({
      transactions: get().transactions.filter(t => t.id !== id),
    });
  },

  // Debt Actions
  addDebt: (person, amount, type, dueDate = '', note = '') => {
    const debt = {
      id: crypto.randomUUID(),
      person,
      amount: Number(amount) || 0,
      type, // 'borrowed' (money we owe) or 'lent' (money owed to us)
      dueDate: dueDate || '',
      note: note || '',
      status: 'active', // 'active' or 'settled'
      repayments: [],
      timestamp: new Date().toISOString(),
    };

    // Log the initial cash flow transaction
    // If we borrow, cash comes IN. If we lend, cash goes OUT.
    const transType = type === 'borrowed' ? 'in' : 'out';
    const transDesc = type === 'borrowed' ? `Borrowed from ${person}` : `Lent to ${person}`;
    get().addTransaction(amount, transType, transDesc, 'manual');

    get()._save({
      debts: [debt, ...get().debts],
    });
  },

  addRepayment: (debtId, amount) => {
    const amountNum = Number(amount) || 0;
    const debts = get().debts.map((d) => {
      if (d.id === debtId) {
        const totalRepaid = d.repayments.reduce((acc, r) => acc + r.amount, 0) + amountNum;
        const status = totalRepaid >= d.amount ? 'settled' : 'active';
        return {
          ...d,
          status,
          repayments: [...d.repayments, { amount: amountNum, date: new Date().toISOString() }],
        };
      }
      return d;
    });

    const targetDebt = get().debts.find(d => d.id === debtId);
    if (targetDebt) {
      // Repaying money we borrowed = cash goes OUT
      // Receiving payment for money we lent = cash comes IN
      const transType = targetDebt.type === 'borrowed' ? 'out' : 'in';
      const transDesc = targetDebt.type === 'borrowed' 
        ? `Repaid part of debt to ${targetDebt.person}` 
        : `Received repayment from ${targetDebt.person}`;
      get().addTransaction(amountNum, transType, transDesc, 'manual');
    }

    get()._save({ debts });
  },

  settleDebt: (debtId) => {
    const targetDebt = get().debts.find(d => d.id === debtId);
    if (!targetDebt || targetDebt.status === 'settled') return;

    const totalRepaid = targetDebt.repayments.reduce((acc, r) => acc + r.amount, 0);
    const remainingAmount = targetDebt.amount - totalRepaid;

    if (remainingAmount > 0) {
      get().addRepayment(debtId, remainingAmount);
    } else {
      const debts = get().debts.map(d => d.id === debtId ? { ...d, status: 'settled' } : d);
      get()._save({ debts });
    }
  },

  // Subscription Actions
  addSubscription: (name, amount, frequency = 'monthly', nextDueDate = '') => {
    const sub = {
      id: crypto.randomUUID(),
      name,
      amount: Number(amount) || 0,
      frequency, // 'monthly' or 'yearly'
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };

    get()._save({
      subscriptions: [sub, ...get().subscriptions],
    });
  },

  deleteSubscription: (id) => {
    get()._save({
      subscriptions: get().subscriptions.filter(s => s.id !== id),
    });
  },

  // Processing Subscriptions on App Startup
  checkAndProcessRecurring: () => {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    const subs = get().subscriptions.map((sub) => {
      if (sub.nextDueDate && sub.nextDueDate <= today) {
        // Log transaction for subscription
        get().addTransaction(sub.amount, 'out', `Subscription: ${sub.name}`, 'manual');
        
        // Calculate next date (1 month or 1 year later)
        const dateObj = new Date(sub.nextDueDate);
        if (sub.frequency === 'yearly') {
          dateObj.setFullYear(dateObj.getFullYear() + 1);
        } else {
          dateObj.setMonth(dateObj.getMonth() + 1);
        }
        updated = true;
        return {
          ...sub,
          nextDueDate: dateObj.toISOString().split('T')[0],
        };
      }
      return sub;
    });

    if (updated) {
      get()._save({ subscriptions: subs });
    }
  },

  // Settings & Security Actions
  setLanguage: (language) => {
    get()._save({ language });
  },

  setPin: (pinCode) => {
    get()._save({ pinCode });
  },

  setLocked: (isLocked) => {
    set({ isLocked }); // Transient state, don't need to trigger full file write except for lock status
  },

  clearAllData: () => {
    get()._save({
      startingBalance: 0,
      monthlyIncome: 0,
      emergencyReserve: 0,
      cycleStartDate: new Date().toISOString().split('T')[0],
      transactions: [],
      debts: [],
      subscriptions: [],
      pinCode: '',
      isLocked: false,
      isSetup: false,
    });
  },

  // Import Backup
  importBackup: (backupData) => {
    try {
      const parsed = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
      get()._save({
        startingBalance: Number(parsed.startingBalance) || 0,
        monthlyIncome: Number(parsed.monthlyIncome) || 0,
        emergencyReserve: Number(parsed.emergencyReserve) || 0,
        cycleStartDate: parsed.cycleStartDate || new Date().toISOString().split('T')[0],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        debts: Array.isArray(parsed.debts) ? parsed.debts : [],
        subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
        pinCode: parsed.pinCode || '',
        language: parsed.language || 'en',
        isSetup: parsed.isSetup !== undefined ? parsed.isSetup : true,
      });
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },

  // Dynamic Financial Getters
  getCurrentBalance: () => {
    const { startingBalance, transactions } = get();
    const transactionSum = transactions.reduce((acc, t) => {
      return acc + (t.type === 'in' ? t.amount : -t.amount);
    }, 0);
    return startingBalance + transactionSum;
  },

  getUsableBalance: () => {
    const current = get().getCurrentBalance();
    return Math.max(0, current - get().emergencyReserve);
  },

  getRemainingDays: () => {
    const { cycleStartDate } = get();
    const start = new Date(cycleStartDate);
    const now = new Date();
    // Calculate difference in milliseconds and convert to days
    const diffTime = Math.abs(now - start);
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - (elapsedDays % 30));
  },

  getSubscriptionBurden: () => {
    return get().subscriptions.reduce((acc, s) => {
      // Annualized/Monthly conversion
      const monthlyAmount = s.frequency === 'yearly' ? s.amount / 12 : s.amount;
      return acc + monthlyAmount;
    }, 0);
  },

  getSafeToSpendToday: () => {
    const usable = get().getUsableBalance();
    const subBurden = get().getSubscriptionBurden();
    const remainingDays = get().getRemainingDays();
    
    // Remaining Cash minus subscription burden
    const remainingBudget = usable - subBurden;
    return Math.max(0, Math.round(remainingBudget / remainingDays));
  },

  getDebtHealthScore: () => {
    // Computes debt vs. active cash reserves
    // Score from 0 to 100
    // Active borrowed debt vs. current balance
    const activeDebts = get().debts
      .filter(d => d.status === 'active')
      .reduce((acc, d) => {
        const repaid = d.repayments.reduce((sum, r) => sum + r.amount, 0);
        return acc + (d.type === 'borrowed' ? (d.amount - repaid) : 0);
      }, 0);

    const balance = get().getCurrentBalance();
    if (activeDebts === 0) return { score: 100, level: 'safe' }; // Green
    if (balance <= 0) return { score: 0, level: 'dangerous' }; // Red
    
    const ratio = activeDebts / balance;
    if (ratio < 0.15) return { score: 90, level: 'safe' }; // Green
    if (ratio < 0.40) return { score: 65, level: 'manageable' }; // Yellow
    return { score: Math.max(0, Math.round(100 - (ratio * 150))), level: 'dangerous' }; // Red
  }
}));
