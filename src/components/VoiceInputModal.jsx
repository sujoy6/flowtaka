import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { parseTransactionText } from '../utils/nlpParser';
import { Mic, MicOff, X, Check, Volume2, HelpCircle, Edit3, Keyboard } from 'lucide-react';

export default function VoiceInputModal({ isOpen, onClose }) {
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const addDebt = useFinanceStore(state => state.addDebt);
  const language = useFinanceStore(state => state.language);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);

  // Editable parsed values
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('out');
  const [editPerson, setEditPerson] = useState('');

  const recognitionRef = useRef(null);

  const t = {
    en: {
      title: "FlowTaka Voice AI",
      listening: "Listening...",
      instruction: "Say something like: 'Lunch 250' or 'আজকে বাজার করলাম ৮৫০ টাকা'",
      speakNow: "Tap mic to start speaking",
      parseTitle: "Verify Parser Result",
      amount: "Amount (৳)",
      desc: "Description",
      type: "Type",
      person: "Person Name",
      save: "Approve & Log",
      notSupported: "Speech recognition is not supported in this browser. Please type your phrase:",
      offlineFallback: "Offline Fallback: Enter natural text",
      confidence: "Confidence",
      recheck: "Try Speaking Again",
      manualType: "Type Command Manually"
    },
    bn: {
      title: "ফ্লোটাকা ভয়েস এআই",
      listening: "শুনছি...",
      instruction: "বলুন: 'রিকশা ১২০' অথবা 'বেতন পেলাম ২৫০০০ টাকা'",
      speakNow: "কথা বলতে মাইক্রোফোন চাপুন",
      parseTitle: "পার্সার তথ্য যাচাই করুন",
      amount: "পরিমাণ (৳)",
      desc: "বিবরণ",
      type: "ধরণ",
      person: "ব্যক্তির নাম",
      save: "নিশ্চিত করুন",
      notSupported: "এই ব্রাউজারে ভয়েস সাপোর্ট নেই। নিচে লিখে দিন:",
      offlineFallback: "অফলাইন টেক্সট ইনপুট",
      confidence: "নিশ্চয়তা স্কোর",
      recheck: "আবার বলুন",
      manualType: "লিখে কমান্ড দিন"
    }
  }[language];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFallbackMode(true);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    // Set recognition language based on app language config
    // bn-BD if app is in Bangla, else en-US (which captures Banglish well)
    rec.lang = language === 'bn' ? 'bn-BD' : 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
      setTranscript('');
      setParsedResult(null);
    };

    rec.onerror = (e) => {
      console.error(e);
      if (e.error === 'not-allowed') {
        setErrorMsg(language === 'en' ? 'Microphone permission denied' : 'মাইক্রোফোনের অনুমতি পাওয়া যায়নি');
      } else {
        setErrorMsg(language === 'en' ? 'Speech unrecognized or connection lost' : 'কথা বোঝা যায়নি অথবা সংযোগ বিচ্ছিন্ন');
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      setTranscript(resultText);
      handleParse(resultText, confidence);
    };

    recognitionRef.current = rec;
  }, [language, isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (fallbackMode) return;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already running or state error
        recognitionRef.current.stop();
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleParse = (text, confidence = 0.9) => {
    const result = parseTransactionText(text);
    if (result && result.success) {
      setParsedResult(result);
      setEditAmount(result.amount.toString());
      setEditDesc(result.description);
      setEditType(result.type);
      setEditPerson(result.person || '');
    } else {
      setErrorMsg(language === 'en' ? 'Could not understand amount or details.' : 'হিসাব বুঝতে সমস্যা হয়েছে।');
    }
  };

  const handleManualParseSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      handleParse(transcript, 1.0);
    }
  };

  const handleSave = () => {
    const amountVal = parseFloat(editAmount);
    if (!amountVal || amountVal <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount.' : 'অনুগ্রহ করে সঠিক পরিমাণ লিখুন।');
      return;
    }

    if (parsedResult.subtype === 'borrowed' || parsedResult.subtype === 'lent') {
      const targetPerson = editPerson.trim() || 'Someone';
      addDebt(targetPerson, amountVal, parsedResult.subtype, '', editDesc.trim());
    } else {
      addTransaction(amountVal, editType, editDesc.trim() || 'Voice Entry', 'voice');
    }

    // Reset and close
    setTranscript('');
    setParsedResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Sheet Container */}
      <div className="relative w-full max-w-md bg-slate-900/95 border-t border-slate-800 rounded-t-[32px] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] z-10 overflow-hidden max-h-[90svh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto my-3 cursor-pointer" onClick={onClose}></div>

        {/* Title */}
        <div className="flex justify-between items-center px-6 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            {t.title}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 no-scrollbar">
          
          {/* Wave & Mic Section */}
          {!parsedResult && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              
              {/* Animation waveforms */}
              <div className="flex items-end justify-center gap-1.5 h-16 w-32">
                {[
                  isListening ? 'animate-wave-bounce-1' : 'h-[6px]',
                  isListening ? 'animate-wave-bounce-2' : 'h-[6px]',
                  isListening ? 'animate-wave-bounce-3' : 'h-[6px]',
                  isListening ? 'animate-wave-bounce-4' : 'h-[6px]',
                  isListening ? 'animate-wave-bounce-2' : 'h-[6px]',
                  isListening ? 'animate-wave-bounce-1' : 'h-[6px]',
                ].map((animClass, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400 origin-bottom transition-all duration-300 ${animClass}`}
                    style={{ minHeight: '6px' }}
                  />
                ))}
              </div>

              {/* Pulsing Mic Button */}
              {!fallbackMode ? (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    isListening
                      ? 'bg-emerald-500 text-slate-950 animate-mic-pulse'
                      : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700 shadow-lg'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 stroke-[2.5]" />
                  ) : (
                    <Mic className="w-8 h-8 stroke-[2.5]" />
                  )}
                </button>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Keyboard className="w-7 h-7" />
                </div>
              )}

              {/* Status instructions */}
              <div className="text-center space-y-1.5 max-w-xs">
                <p className="text-sm font-bold text-white">
                  {isListening ? t.listening : t.speakNow}
                </p>
                <p className="text-xs text-slate-500 leading-normal">
                  {t.instruction}
                </p>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                  {errorMsg}
                </p>
              )}

              {/* Force text fallback button */}
              {!fallbackMode && (
                <button
                  type="button"
                  onClick={() => setFallbackMode(true)}
                  className="text-[11px] font-semibold text-slate-500 underline hover:text-slate-300"
                >
                  {t.manualType}
                </button>
              )}
            </div>
          )}

          {/* Text Input Fallback Mode */}
          {fallbackMode && !parsedResult && (
            <form onSubmit={handleManualParseSubmit} className="space-y-4 py-4">
              <p className="text-xs text-slate-400 leading-normal">
                {t.notSupported}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'en' ? "e.g. Rickshaw 120" : "যেমন: বাজার ৮৫০"}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl active:scale-95 transition-all text-xs cursor-pointer"
                >
                  {language === 'en' ? 'Parse' : 'পার্স'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFallbackMode(false)}
                className="text-[11px] text-slate-500 underline"
              >
                {language === 'en' ? 'Back to Voice' : 'কণ্ঠস্বরে ফিরে যান'}
              </button>
            </form>
          )}

          {/* Parsed Verification Panel */}
          {parsedResult && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-3">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">
                  {t.parseTitle}
                </span>

                {/* Voice Input Log line */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">{language === 'en' ? 'Voice Transcription' : 'রেকর্ডকৃত কথা'}</span>
                  <p className="text-xs italic text-slate-300 font-medium">"{parsedResult.rawText}"</p>
                </div>

                {/* Editing Form fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">{t.amount}</label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">{t.type}</label>
                    <select
                      value={editType}
                      onChange={e => setEditType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="out">{language === 'en' ? 'Expense' : 'খরচ'}</option>
                      <option value="in">{language === 'en' ? 'Income' : 'আয়'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">{t.desc}</label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                  />
                </div>

                {(parsedResult.subtype === 'borrowed' || parsedResult.subtype === 'lent') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">{t.person}</label>
                    <input
                      type="text"
                      value={editPerson}
                      onChange={e => setEditPerson(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setParsedResult(null);
                    setTranscript('');
                    startListening();
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  {t.recheck}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  {t.save}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
