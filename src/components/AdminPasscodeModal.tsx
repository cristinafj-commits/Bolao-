import React, { useState, useEffect } from 'react';
import { X, Lock, Key, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPasscodeModal({ isOpen, onClose, onSuccess }: AdminPasscodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load passcode from localStorage or fallback to '2026'
  const getStoredPasscode = () => {
    const saved = localStorage.getItem('bolao_admin_passcode');
    return saved ? saved : '2026';
  };

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPasscode = getStoredPasscode();

    if (code === correctPasscode) {
      setError(null);
      onSuccess();
      onClose();
    } else {
      setError('Código de acesso incorreto. Tente novamente.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        id="passcode-modal-container"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 animate-bounce" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Acesso Restrito</h3>
              <p className="text-amber-100 text-[10px] text-left uppercase tracking-wider font-semibold">Painel Administrativo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Fechar"
            id="close-passcode-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500 text-left">
              Apenas o organizador do bolão pode incluir resultados oficiais, iniciar partidas ou resetar dados.
            </p>
            <p className="text-xs font-bold text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-100 flex items-center gap-1.5 text-left">
              <Key className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Digite o código de acesso para validar seu perfil.</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider text-left">
              Código de Acesso (Dica: o padrão é 2026)
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={code}
                onChange={(e) => {
                  setError(null);
                  setCode(e.target.value);
                }}
                placeholder="****"
                className="w-full text-center text-xl font-mono tracking-widest font-bold py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-300"
                id="passcode-input-field"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl animate-shake" id="passcode-error-msg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="text-left font-medium">{error}</span>
            </div>
          )}

          {/* Buttons Row */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
