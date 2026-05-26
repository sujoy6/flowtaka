import React from 'react';
import { useFinanceStore } from '../store/financeStore';
import { TrendingUp, Sparkles, CreditCard, ShieldAlert, Award } from 'lucide-react';

export default function AnalyticsView() {
  const transactions = useFinanceStore(state => state.transactions);
  const getCurrentBalance = useFinanceStore(state => state.getCurrentBalance);
  const getSubscriptionBurden = useFinanceStore(state => state.getSubscriptionBurden);
  const getSafeToSpendToday = useFinanceStore(state => state.getSafeToSpendToday);
  const getDebtHealthScore = useFinanceStore(state => state.getDebtHealthScore);
  const language = useFinanceStore(state => state.language);
  const monthlyIncome = useFinanceStore(state => state.monthlyIncome);

  const currentBalance = getCurrentBalance();
  const subBurden = getSubscriptionBurden();
  const safeToSpend = getSafeToSpendToday();
  const debtHealth = getDebtHealthScore();

  const t = {
    en: {
      title: "FlowTaka Insights",
      overview: "Income vs Expenses (30 Days)",
      burnDown: "30-Day Budget Burn-down",
      income: "Income",
      expense: "Expenses",
      insightsTitle: "Smart Analytics Insights",
      noData: "Insufficient transaction data to populate charts. Log more daily transactions to view visualizations.",
      statDays: "30-Day Net Flow",
    },
    bn: {
      title: "ফ্লোটাকা ইনসাইটস",
      overview: "আয় বনাম ব্যয় (৩০ দিন)",
      burnDown: "৩০ দিনের খরচের গতিবিধি",
      income: "মোট আয়",
      expense: "মোট ব্যয়",
      insightsTitle: "স্মার্ট অ্যানালিটিক্স ইনসাইটস",
      noData: "চার্ট তৈরির জন্য যথেষ্ট লেনদেনের তথ্য নেই। নতুন হিসাব যোগ করুন।",
      statDays: "৩০ দিনের নেট গতিবিধি",
    }
  }[language];

  // Calculate 30-day totals
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentTransactions = transactions.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);
  
  const totalIncome = recentTransactions
    .filter(t => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = recentTransactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate 30 points for burn-down chart representing daily balance
  // Start from balance 30 days ago and apply each day's transactions
  const dailyBalances = [];
  let tempBalance = currentBalance;
  
  // Sort transaction in reverse order (latest first) to trace back
  const sortedTrans = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Initialize daily balances array
  for (let i = 0; i < 30; i++) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dailyBalances.unshift({ date: dayDate, balance: tempBalance });
    
    // Reverse transactions that happened on this day
    const dayTrans = sortedTrans.filter(t => t.timestamp.split('T')[0] === dayDate);
    dayTrans.forEach(t => {
      if (t.type === 'in') {
        tempBalance -= t.amount;
      } else {
        tempBalance += t.amount;
      }
    });
  }

  // Find max and min for scaling SVG chart
  const balancesOnly = dailyBalances.map(d => d.balance);
  const maxBal = Math.max(...balancesOnly, 1000);
  const minBal = Math.min(...balancesOnly, 0);
  const balRange = maxBal - minBal;

  // Map 30 points to SVG viewBox: width = 300, height = 120
  const chartPoints = dailyBalances.map((item, idx) => {
    const x = (idx / 29) * 300;
    // Invert Y because SVG coordinates start from top-left (0,0)
    const y = 120 - ((item.balance - minBal) / balRange) * 100 - 10; // offset slightly
    return { x, y, balance: item.balance, date: item.date };
  });

  // Build SVG Path
  const linePath = chartPoints.length > 0 
    ? `M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Area path for gradient fill
  const areaPath = chartPoints.length > 0
    ? `${linePath} L 300 120 L 0 120 Z`
    : '';

  // Rule-based smart insights
  const generateInsights = () => {
    const insightsList = [];

    // Safe to spend alert
    if (safeToSpend > 1000) {
      insightsList.push({
        id: 'spend-safe',
        icon: <Award className="w-4.5 h-4.5 text-emerald-400" />,
        text: language === 'en' 
          ? `You have a healthy daily spending limit of ৳${safeToSpend}.`
          : `আপনার দৈনিক নিরাপদ খরচ সীমা ৳${safeToSpend}, যা বেশ সন্তোষজনক।`,
        type: 'safe'
      });
    } else {
      insightsList.push({
        id: 'spend-warning',
        icon: <ShieldAlert className="w-4.5 h-4.5 text-amber-400" />,
        text: language === 'en' 
          ? `Your daily allowance is down to ৳${safeToSpend}. Try reducing non-essential expenses.`
          : `আপনার দৈনিক খরচের লিমিট কমে ৳${safeToSpend} হয়েছে। অপ্রয়োজনীয় ব্যয় কমান।`,
        type: 'warning'
      });
    }

    // Weekly Burn rate calculation (last 7 days vs previous 7 days)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const spend7 = transactions
      .filter(t => t.type === 'out' && new Date(t.timestamp) >= last7Days)
      .reduce((sum, t) => sum + t.amount, 0);

    const spendPrev7 = transactions
      .filter(t => t.type === 'out' && new Date(t.timestamp) >= last14Days && new Date(t.timestamp) < last7Days)
      .reduce((sum, t) => sum + t.amount, 0);

    if (spendPrev7 > 0) {
      const diff = spend7 - spendPrev7;
      const pct = Math.round((Math.abs(diff) / spendPrev7) * 100);
      if (diff > 0) {
        insightsList.push({
          id: 'burn-rate',
          icon: <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />,
          text: language === 'en' 
            ? `Your weekly burn rate increased by ${pct}% compared to last week.`
            : `গত সপ্তাহের তুলনায় এই সপ্তাহে আপনার খরচের হার ${pct}% বৃদ্ধি পেয়েছে।`,
          type: 'danger'
        });
      } else if (diff < 0) {
        insightsList.push({
          id: 'burn-rate-good',
          icon: <Award className="w-4.5 h-4.5 text-emerald-400" />,
          text: language === 'en' 
            ? `Excellent! You spent ${pct}% less this week compared to last week.`
            : `অভিনন্দন! গত সপ্তাহের চেয়ে এই সপ্তাহে আপনার খরচ ${pct}% হ্রাস পেয়েছে।`,
          type: 'safe'
        });
      }
    }

    // Subscription Burden insight
    if (subBurden > 0 && monthlyIncome > 0) {
      const subPct = Math.round((subBurden / monthlyIncome) * 100);
      if (subPct > 15) {
        insightsList.push({
          id: 'sub-burden',
          icon: <CreditCard className="w-4.5 h-4.5 text-purple-400" />,
          text: language === 'en' 
            ? `Fixed recurring subscriptions consume ${subPct}% of your regular monthly income.`
            : `মাসিক সাবস্ক্রিপশন ও বিল আপনার মোট আয়ের ${subPct}% গ্রহণ করছে।`,
          type: 'warning'
        });
      }
    }

    // Debt hazard
    if (debtHealth.level === 'dangerous') {
      insightsList.push({
        id: 'debt-hazard',
        icon: <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />,
        text: language === 'en'
          ? "Your debt health is critical. Settle pending borrowed amounts to release dynamic budget blockages."
          : "ঋণের পরিমাণ অত্যন্ত ঝুঁকিপূর্ণ! দ্রুত করজ বা ঋণ পরিশোধ করুন।",
        type: 'danger'
      });
    }

    return insightsList;
  };

  const insights = generateInsights();

  // SVG Scaling values for Bar Chart
  const maxBarVal = Math.max(totalIncome, totalExpense, 1000);
  const incBarHeight = totalIncome > 0 ? (totalIncome / maxBarVal) * 80 : 5;
  const expBarHeight = totalExpense > 0 ? (totalExpense / maxBarVal) * 80 : 5;

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Bar Chart: Income vs Expense */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
          {t.overview}
        </h3>

        {recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">{t.noData}</p>
        ) : (
          <div className="flex items-end justify-around py-4 h-44">
            
            {/* Income Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <span className="text-[10px] text-slate-400 font-bold">৳{Math.round(totalIncome)}</span>
              <div className="w-12 bg-slate-900 rounded-t-xl overflow-hidden relative" style={{ height: '80px' }}>
                <div 
                  className="w-full absolute bottom-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  style={{ height: `${incBarHeight}px` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">{t.income}</span>
            </div>

            {/* Net Flow Mid Display */}
            <div className="text-center py-6 flex flex-col items-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">{t.statDays}</span>
              <span className={`text-md font-extrabold ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalIncome - totalExpense >= 0 ? '+' : ''}৳{Math.round(totalIncome - totalExpense)}
              </span>
            </div>

            {/* Expense Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <span className="text-[10px] text-slate-400 font-bold">৳{Math.round(totalExpense)}</span>
              <div className="w-12 bg-slate-900 rounded-t-xl overflow-hidden relative" style={{ height: '80px' }}>
                <div 
                  className="w-full absolute bottom-0 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  style={{ height: `${expBarHeight}px` }}
                />
              </div>
              <span className="text-xs font-bold text-rose-400">{t.expense}</span>
            </div>

          </div>
        )}
      </div>

      {/* 2. Line Chart: 30-day cumulative balance burn-down */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.burnDown}</h3>
        
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">{t.noData}</p>
        ) : (
          <div className="py-2">
            <svg viewBox="0 0 300 120" className="w-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="50%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Area path */}
              {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

              {/* Line path */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Glowing Indicator dots at endpoints */}
              {chartPoints.length > 0 && (
                <>
                  <circle cx={chartPoints[chartPoints.length - 1].x} cy={chartPoints[chartPoints.length - 1].y} r="5" fill="#3b82f6" />
                  <circle cx={chartPoints[chartPoints.length - 1].x} cy={chartPoints[chartPoints.length - 1].y} r="8" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.4" className="animate-ping" />
                </>
              )}
            </svg>

            {/* Custom axis labels */}
            <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2 px-1">
              <span>30 days ago</span>
              <span>Today (৳{Math.round(currentBalance)})</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. AI Smart Insights Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {t.insightsTitle}
        </h3>

        <div className="space-y-2.5">
          {insights.map((insight, idx) => (
            <div 
              key={insight.id || idx}
              className={`p-3.5 rounded-2xl border flex gap-3 items-start glass transition-all ${
                insight.type === 'danger' 
                  ? 'border-rose-500/20 bg-rose-500/5' 
                  : insight.type === 'warning' 
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5'
              }`}
            >
              <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-800 shrink-0">
                {insight.icon}
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
