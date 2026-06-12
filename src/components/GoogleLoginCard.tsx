import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Mail, UserCheck, Sparkles, Check, User, Info } from 'lucide-react';
import { Participant } from '../types';

interface GoogleLoginCardProps {
  participants: Participant[];
  activeParticipantId: string;
  onGoogleLogin: (profile: { name: string; email: string; imageUrl: string }) => void;
  onGoogleLogout: () => void;
}

export default function GoogleLoginCard({
  participants,
  activeParticipantId,
  onGoogleLogin,
  onGoogleLogout,
}: GoogleLoginCardProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

  // Current active user who is signed in via email/Google
  const activeUser = participants.find((p) => p.id === activeParticipantId);

  // Load Google Identity Services Script if client ID is set
  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [clientId]);

  // Initialize official Google button if configured
  useEffect(() => {
    if (clientId && scriptLoaded && (window as any).google?.accounts?.id && (!activeUser || !activeUser.email)) {
      try {
        const googleObj = (window as any).google;
        googleObj.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            const payload = parseJwt(response.credential);
            if (payload) {
              onGoogleLogin({
                name: payload.name || payload.given_name || 'Usuário Google',
                email: payload.email || '',
                imageUrl: payload.picture || '',
              });
            }
          },
        });

        googleObj.accounts.id.renderButton(
          document.getElementById('google-auth-button-container'),
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '240',
          }
        );
      } catch (err) {
        console.error('Error rendering Google button:', err);
      }
    }
  }, [clientId, scriptLoaded, activeUser]);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }

    const email = emailInput.trim().toLowerCase();
    
    // Validate basic email structure
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      return;
    }

    // Check if we are logging in as an existing participant with this email
    const existing = participants.find((p) => p.email?.toLowerCase() === email);

    if (existing) {
      onGoogleLogin({
        name: existing.name,
        email: existing.email || email,
        imageUrl: existing.imageUrl || '',
      });
    } else {
      // Registering a brand new participant with this name and email!
      if (!nameInput.trim()) {
        setErrorMsg('E-mail novo detectado! Digite o seu Nome para criar o perfil.');
        return;
      }
      
      // Select a nice colorful randomized placeholder avatar based on name
      const nameLength = nameInput.trim().length;
      const avatarColors = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
      ];
      const selectedAvatar = avatarColors[nameLength % avatarColors.length];

      onGoogleLogin({
        name: nameInput.trim(),
        email: email,
        imageUrl: selectedAvatar,
      });
    }

    // Reset inputs
    setEmailInput('');
    setNameInput('');
  };

  const handleUsePreset = (name: string, email: string) => {
    onGoogleLogin({
      name,
      email,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="login-card">
      <div>
        <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-base">
          <UserCheck className="w-5 h-5 text-amber-500" />
          Acessar Seus Palpites
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Entre com qualquer e-mail para salvar palpites ou carregar seu perfil
        </p>
      </div>

      {activeUser && activeUser.email ? (
        /* Authenticated session view */
        <div className="bg-slate-950/60 rounded-xl border border-emerald-500/20 p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              {activeUser.imageUrl ? (
                <img
                  src={activeUser.imageUrl}
                  alt={activeUser.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500/30 ring-2 ring-emerald-500/10 shadow-md"
                />
              ) : (
                <span className="w-12 h-12 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xl border border-slate-700">
                  {activeUser.avatar || '⚽'}
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[8px] font-bold text-slate-950 px-1 py-0.2 rounded-xs border border-slate-900 shadow-sm shadow-black/50">
                OK
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
                Sessão Ativa
              </h4>
              <p className="text-sm font-bold text-white truncate">{activeUser.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate" title={activeUser.email}>
                  {activeUser.email}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-850 flex justify-between items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sincronizado e Salvo
            </span>
            <button
              onClick={onGoogleLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 flex items-center gap-1 transition cursor-pointer"
              id="logout-button"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair / Trocar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Logged out: Sign in Form with any email */
        <div className="space-y-4">
          <form onSubmit={handleEmailLoginSubmit} className="space-y-3">
            {errorMsg && (
              <p className="text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/15 rounded-lg p-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-rose-500 rounded-xs inline-block"></span>
                {errorMsg}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium block">
                Seu E-mail <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-650">
                  <Mail className="w-4 h-4 text-slate-550" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Ex: cristina.fj@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-xl pl-9 pr-3 py-2 text-white outline-hidden placeholder:text-slate-650 transition-all font-mono"
                  id="login-email-input"
                />
              </div>
            </div>

            {/* Only require name if email is NOT already assigned to an existing participant */}
            {emailInput.trim() && !participants.some(p => p.email?.toLowerCase() === emailInput.trim().toLowerCase()) && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
                <label className="text-[11px] text-slate-400 font-medium block">
                  Seu Nome (Novo Cadastro) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-650">
                    <User className="w-4 h-4 text-slate-550" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cristina Fernandes"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-xl pl-9 pr-3 py-2 text-white outline-hidden placeholder:text-slate-650 transition-all"
                    id="login-name-input"
                  />
                </div>
                <p className="text-[10px] text-amber-500/90 font-medium italic">
                  * Esse e-mail é novo! Escreva seu nome para se cadastrar na hora.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
              id="login-submit-button"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>Entrar / Cadastrar Perfil</span>
            </button>
          </form>

          {/* Quick Shortcuts for Cristina or any other participant */}
          <div className="pt-2 border-t border-slate-850 space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Atalhos Rápidos de Acesso
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleUsePreset('Cristina Fernandes', 'cristina.fj@gmail.com')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs text-slate-300 font-medium flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Entrar como <strong>Cristina Fernandes</strong></span>
                </div>
                <span className="text-[10px] text-slate-550 group-hover:text-slate-300 font-mono">
                  cristina.fj@gmail.com
                </span>
              </button>
            </div>
          </div>

          {/* Google SSO button fallback (displays if Client ID is configured in AI Studio) */}
          {clientId && (
            <div className="pt-2 border-t border-slate-850 space-y-2.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center">
                Ou use validação Google Oficial
              </span>
              <div className="flex justify-center" id="google-auth-button-parent">
                <div id="google-auth-button-container"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
