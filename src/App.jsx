import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/financeStore';
import SetupScreen from './components/SetupScreen';
import PinLockScreen from './components/PinLockScreen';
import Dashboard from './components/Dashboard';
import DebtManager from './components/DebtManager';
import SubscriptionManager from './components/SubscriptionManager';
import AnalyticsView from './components/AnalyticsView';
import SettingsScreen from './components/SettingsScreen';
import AddTransactionModal from './components/AddTransactionModal';
import VoiceInputModal from './components/VoiceInputModal';

import { Home, Users, CreditCard, BarChart2, Settings, Mic, Plus, Lock } from 'lucide-react';

export default function App() {
  const isSetup = useFinanceStore(state => state.isSetup);
  const isLocked = useFinanceStore(state => state.isLocked);
  const checkAndProcessRecurring = useFinanceStore(state => state.checkAndProcessRecurring);
  const language = useFinanceStore(state => state.language);
  const setLocked = useFinanceStore(state => state.setLocked);
  const pinCode = useFinanceStore(state => state.pinCode);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'debts', 'subscriptions', 'analytics', 'settings'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Check recurring bills on mount
  useEffect(() => {
    if (isSetup) {
      checkAndProcessRecurring();
    }
  }, [isSetup]);

  // Lock app if screen goes idle or tab changes (basic security)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pinCode) {
        setLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pinCode]);

  // If not setup, show SetupScreen
  if (!isSetup) {
    return <SetupScreen />;
  }

  // If locked, show PinLockScreen
  if (isLocked) {
    return <PinLockScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenAdd={() => setIsAddOpen(true)} onOpenVoice={() => setIsVoiceOpen(true)} />;
      case 'debts':
        return <DebtManager />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <Dashboard onOpenAdd={() => setIsAddOpen(true)} onOpenVoice={() => setIsVoiceOpen(true)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: language === 'en' ? 'Home' : 'হোম' },
    { id: 'debts', icon: <Users className="w-5 h-5" />, label: language === 'en' ? 'Debts' : 'ঋণ' },
    { id: 'subscriptions', icon: <CreditCard className="w-5 h-5" />, label: language === 'en' ? 'Bills' : 'বিল' },
    { id: 'analytics', icon: <BarChart2 className="w-5 h-5" />, label: language === 'en' ? 'Stats' : 'চার্ট' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: language === 'en' ? 'Config' : 'সেটিংস' },
  ];

  return (
    <div className="app-shell min-h-svh flex flex-col justify-between bg-slate-950 pb-20 relative select-none">
      
      {/* Background Ambience */}
      <div className="ambient-glow -top-10 left-10 bg-emerald-500/10"></div>
      <div className="ambient-glow top-1/2 right-10 bg-cyan-500/5"></div>

      {/* Header bar */}
      <header className="flex justify-between items-center px-6 py-4 z-10 bg-slate-950/80 sticky top-0 backdrop-blur-md border-b border-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            FlowTaka
          </span>
        </div>
        
        {/* Quick Lock Button */}
        {pinCode && (
          <button 
            onClick={() => setLocked(true)}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            title={language === 'en' ? 'Lock App' : 'লক করুন'}
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Primary Tab View */}
      <main className="flex-1 px-6 pt-4 z-10 overflow-y-auto no-scrollbar">
        {renderActiveTab()}
      </main>

      {/* Floating Action Buttons (FABs) */}
      <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {/* Voice Floating Button */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-90 transition-all cursor-pointer"
          title="Voice Command"
        >
          <Mic className="w-6.5 h-6.5 stroke-[2.5]" />
        </button>

        {/* Manual Add Button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-11 h-11 rounded-full bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800 flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
          title="Manual Add"
        >
          <Plus className="w-5.5 h-5.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Floating Navigation Dock */}
      <nav className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto glass-nav rounded-2xl p-2 z-30 flex justify-between items-center border border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 py-1.5 flex flex-col items-center gap-1 transition-all rounded-xl cursor-pointer ${
              activeTab === item.id 
                ? 'text-emerald-400 font-bold bg-slate-900/60' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.icon}
            <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Log & Voice Modal Sheets */}
      <AddTransactionModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
      <VoiceInputModal 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
      />
    </div>
  );
}
