import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { 
  Lock, Unlock, Languages, Download, Upload, Trash2, Key, AlertTriangle, 
  ShieldCheck, Coins, PiggyBank, Calendar, Save, Eye, EyeOff 
} from 'lucide-react';

export default function SettingsScreen() {
  const pinCode = useFinanceStore(state => state.pinCode);
  const setPin = useFinanceStore(state => state.setPin);
  const language = useFinanceStore(state => state.language);
  const setLanguage = useFinanceStore(state => state.setLanguage);
  const clearAllData = useFinanceStore(state => state.clearAllData);
  const transactions = useFinanceStore(state => state.transactions);
  const importBackup = useFinanceStore(state => state.importBackup);
  
  // Budget store values
  const startingBalance = useFinanceStore(state => state.startingBalance);
  const monthlyIncome = useFinanceStore(state => state.monthlyIncome);
  const emergencyReserve = useFinanceStore(state => state.emergencyReserve);
  const cycleStartDate = useFinanceStore(state => state.cycleStartDate);
  const updateBudget = useFinanceStore(state => state.updateBudget);

  // States for budget editing
  const [editStartBal, setEditStartBal] = useState(startingBalance);
  const [editIncome, setEditIncome] = useState(monthlyIncome);
  const [editReserve, setEditReserve] = useState(emergencyReserve);
  const [editDate, setEditDate] = useState(cycleStartDate);

  // Sync editing fields with store state on change
  useEffect(() => {
    setEditStartBal(startingBalance);
    setEditIncome(monthlyIncome);
    setEditReserve(emergencyReserve);
    setEditDate(cycleStartDate);
  }, [startingBalance, monthlyIncome, emergencyReserve, cycleStartDate]);

  // Store values for backup export
  const storeState = useFinanceStore(state => ({
    startingBalance: state.startingBalance,
    monthlyIncome: state.monthlyIncome,
    emergencyReserve: state.emergencyReserve,
    cycleStartDate: state.cycleStartDate,
    transactions: state.transactions,
    debts: state.debts,
    subscriptions: state.subscriptions,
    pinCode: state.pinCode,
    language: state.language,
    isSetup: state.isSetup,
  }));

  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinText, setShowPinText] = useState(false);

  const t = {
    en: {
      secTitle: "Security Settings",
      pinActive: "PIN Lock is active",
      pinInactive: "PIN Lock is disabled",
      setPinBtn: "Setup PIN Lock",
      disablePinBtn: "Disable PIN Lock",
      enterPin: "Enter 4-digit PIN",
      savePin: "Activate PIN",
      langTitle: "App Language / ভাষা",
      exportTitle: "Export & Backup",
      exportCsv: "Export CSV Report",
      exportJson: "Download JSON Backup",
      importJson: "Restore JSON Backup",
      dangerTitle: "Danger Zone",
      clearBtn: "Erase All Data",
      confirmClear: "WARNING: This will permanently delete all logs, debts, and setup parameters. Are you sure you want to reset?",
      successBackup: "Backup restored successfully!",
      errorBackup: "Invalid backup file.",
      csvName: "FlowTaka_Report.csv",
      backupName: "FlowTaka_Backup.json",
      
      // Budget edit translations
      budgetTitle: "Adjust Budget Goals",
      startBalLabel: "Starting Balance (৳)",
      incomeLabel: "Expected Monthly Income (৳)",
      reserveLabel: "Emergency Reserve (৳)",
      cycleLabel: "Billing Cycle Reset Date",
      saveBudgetBtn: "Save Budget Settings",
      successBudget: "Budget goals updated successfully!"
    },
    bn: {
      secTitle: "নিরাপত্তা সেটিংস",
      pinActive: "পিন লক চালু আছে",
      pinInactive: "পিন লক বন্ধ আছে",
      setPinBtn: "পিন লক সেট করুন",
      disablePinBtn: "পিন লক বন্ধ করুন",
      enterPin: "৪-ডিজিট পিন লিখুন",
      savePin: "পিন লক চালু করুন",
      langTitle: "অ্যাপের ভাষা / Language",
      exportTitle: "ডাটা এক্সপোর্ট ও ব্যাকআপ",
      exportCsv: "সিএসভি রিপোর্ট ডাউনলোড",
      exportJson: "জেসন ব্যাকআপ ডাউনলোড",
      importJson: "জেসন ব্যাকআপ রিস্টোর",
      dangerTitle: "ঝুঁকিপূর্ণ সেকশন",
      clearBtn: "সব ডাটা মুছে ফেলুন",
      confirmClear: "সতর্কতা: এটি স্থায়ীভাবে আপনার সমস্ত হিসাব, ঋণ এবং সেটিংস মুছে ফেলবে। আপনি কি নিশ্চিত?",
      successBackup: "ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!",
      errorBackup: "ত্রুটিপূর্ণ ব্যাকআপ ফাইল।",
      csvName: "ফ্লোটাকা_রিপোর্ট.csv",
      backupName: "ফ্লোটাকা_ব্যাকআপ.json",

      // Budget edit translations
      budgetTitle: "বাজেট ও লক্ষ্য সংশোধন",
      startBalLabel: "প্রারম্ভিক ব্যালেন্স (৳)",
      incomeLabel: "মাসিক আয়ের লক্ষ্য (৳)",
      reserveLabel: "জরুরী তহবিল (৳)",
      cycleLabel: "হিসাব চক্র শুরুর তারিখ",
      saveBudgetBtn: "বাজেট তথ্য সংশোধন করুন",
      successBudget: "বাজেট তথ্য সফলভাবে আপডেট করা হয়েছে!"
    }
  }[language];

  // PIN Actions
  const handleActivatePin = (e) => {
    e.preventDefault();
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      setPin(pinInput);
      setPinInput('');
      setShowPinSetup(false);
      setShowPinText(false);
    } else {
      alert(language === 'en' ? 'PIN must be exactly 4 digits' : 'পিন ঠিক ৪ সংখ্যার হতে হবে');
    }
  };

  const handleDisablePin = () => {
    setPin('');
  };

  // Budget Edit Submission
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    updateBudget(editStartBal, editIncome, editReserve, editDate);
    alert(t.successBudget);
  };

  // CSV Generation
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert(language === 'en' ? 'No transactions to export' : 'রপ্তানি করার মতো কোনো তথ্য নেই');
      return;
    }

    const headers = 'ID,Date,Type,Amount (BDT),Description,Source\n';
    const rows = transactions.map(t => {
      const dateStr = t.timestamp.split('T')[0];
      const cleanDesc = t.description.replace(/,/g, ' ');
      return `"${t.id}","${dateStr}","${t.type === 'in' ? 'Money In' : 'Money Out'}",${t.amount},"${cleanDesc}","${t.source}"`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', t.csvName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON State Export
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storeState, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', t.backupName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON State Import
  const handleImportJson = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const success = importBackup(event.target.result);
      if (success) {
        alert(t.successBackup);
        // Refresh page to load parsed state fully
        window.location.reload();
      } else {
        alert(t.errorBackup);
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset target value to allow re-uploading
  };

  const handleClear = () => {
    if (confirm(t.confirmClear)) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Language Toggle */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-cyan-400" />
          {t.langTitle}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-slate-900 border-slate-700 text-white font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('bn')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              language === 'bn'
                ? 'bg-slate-900 border-slate-700 text-white font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            বাংলা (Bangla)
          </button>
        </div>
      </div>

      {/* 2. Budget Editing Panel (Polish: Avoid wiping history) */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-3.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-emerald-400" />
          {t.budgetTitle}
        </h3>

        <form onSubmit={handleBudgetSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">{t.startBalLabel}</label>
              <input
                type="number"
                value={editStartBal}
                onChange={e => setEditStartBal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">{t.incomeLabel}</label>
              <input
                type="number"
                value={editIncome}
                onChange={e => setEditIncome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">{t.reserveLabel}</label>
              <input
                type="number"
                value={editReserve}
                onChange={e => setEditReserve(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">{t.cycleLabel}</label>
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            {t.saveBudgetBtn}
          </button>
        </form>
      </div>

      {/* 3. Security / PIN Lock */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-3.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Key className="w-4 h-4 text-emerald-400" />
          {t.secTitle}
        </h3>

        {pinCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4.5 h-4.5" />
              {t.pinActive}
            </div>
            <button
              onClick={handleDisablePin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-rose-400 hover:text-rose-300 font-bold border border-slate-850 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t.disablePinBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Unlock className="w-4.5 h-4.5" />
              {t.pinInactive}
            </div>
            
            {!showPinSetup ? (
              <button
                onClick={() => setShowPinSetup(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 font-bold border border-slate-850 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t.setPinBtn}
              </button>
            ) : (
              <form onSubmit={handleActivatePin} className="space-y-2.5 animate-fade-in pt-1">
                <div className="relative">
                  <input
                    type={showPinText ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder={t.enterPin}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center text-white text-xs tracking-widest placeholder-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText(!showPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinSetup(false);
                      setPinInput('');
                      setShowPinText(false);
                    }}
                    className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-lg text-[11px] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-500 text-slate-950 rounded-lg text-[11px] font-extrabold"
                  >
                    {t.savePin}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* 4. Export / Import */}
      <div className="p-4 rounded-3xl border border-slate-850 glass space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Download className="w-4 h-4 text-purple-400" />
          {t.exportTitle}
        </h3>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleExportCsv}
            className="w-full py-3 bg-slate-900/60 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            {t.exportCsv}
          </button>

          <button
            onClick={handleExportJson}
            className="w-full py-3 bg-slate-900/60 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            {t.exportJson}
          </button>

          {/* Import trigger: Polished single label mechanism (No overlay tap hacks) */}
          <label className="w-full py-3 bg-slate-900/60 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-200">
            <Upload className="w-4 h-4 text-emerald-400" />
            {t.importJson}
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Danger Zone */}
      <div className="p-4 rounded-3xl border border-rose-950/20 bg-rose-950/5 space-y-3.5">
        <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          {t.dangerTitle}
        </h3>
        
        <button
          onClick={handleClear}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(225,29,72,0.15)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {t.clearBtn}
        </button>
      </div>

    </div>
  );
}
