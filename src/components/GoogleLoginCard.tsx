import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Mail, UserCheck, Sparkles, Check, User, Info, Smile, Camera, Image } from 'lucide-react';
import { Participant } from '../types';
import { AVATARS } from '../utils';

const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

interface GoogleLoginCardProps {
  participants: Participant[];
  activeParticipantId: string;
  onGoogleLogin: (profile: { name: string; email: string; imageUrl?: string; avatar?: string }) => void;
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

  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState('⚽');
  const [imageUrlInput, setImageUrlInput] = useState(DEFAULT_AVATAR_URL);
  const [isDragging, setIsDragging] = useState(false);
  const [showLinkFields, setShowLinkFields] = useState(false);

  useEffect(() => {
    setShowLinkFields(false);
  }, [activeParticipantId]);

  // Compress and read image from device gallery
  const handleFileChange = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      setImageUrlInput(compressedBase64);
    } catch (err) {
      console.error('Error compressing image:', err);
    }
  };

  const compressImage = (file: File, maxWidth = 120, maxHeight = 120, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

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
      
      onGoogleLogin({
        name: nameInput.trim(),
        email: email,
        imageUrl: avatarType === 'image' ? (imageUrlInput.trim() || DEFAULT_AVATAR_URL) : '',
        avatar: avatarType === 'emoji' ? selectedEmoji : '⚽',
      });
    }

    // Reset inputs
    setEmailInput('');
    setNameInput('');
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-sm" id="login-card">
      <div>
        <h3 className="font-bold text-slate-900 tracking-tight flex items-center gap-2 text-base">
          <UserCheck className="w-5 h-5 text-amber-500" />
          {activeUser ? 'Perfil Cadastrado' : 'Cadastrar ou Acessar Perfil'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {activeUser 
            ? 'Seu cadastro de perfil está ativo e pronto para você enviar seus palpites!'
            : 'Utilize o seu e-mail para fazer seu cadastro ou acessar seu perfil no Bolão!'
          }
        </p>
      </div>

      {activeUser ? (
        /* Authenticated / Selected profile view */
        <div className="space-y-4">
          <div className="bg-emerald-50/40 rounded-xl border border-emerald-250 p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                {activeUser.imageUrl ? (
                  <img
                    src={activeUser.imageUrl}
                    alt={activeUser.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full aspect-square object-cover border border-emerald-500/30 ring-2 ring-emerald-500/10 shrink-0 shadow-sm"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl border border-slate-300">
                    {activeUser.avatar || '⚽'}
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[8px] font-bold text-slate-950 px-1 py-0.2 rounded-xs border border-white shadow-sm shadow-black/10">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-[10px] text-emerald-600 uppercase tracking-widest font-mono">
                  Sessão Ativa
                </h4>
                <p className="text-sm font-bold text-slate-900 truncate">{activeUser.name}</p>
                {activeUser.email ? (
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-600" title={activeUser.email}>
                      {activeUser.email}
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-700/80 font-mono font-medium mt-0.5">
                    Perfil Local / Nuvem
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap justify-between items-center gap-2">
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Sincronizado e Salvo
              </span>
              <div className="flex items-center gap-2">
                {!activeUser.email && (
                  <button
                    onClick={() => setShowLinkFields(!showLinkFields)}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {showLinkFields ? 'Fechar Vínculo' : 'Vincular E-mail'}
                  </button>
                )}
                <button
                  onClick={onGoogleLogout}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 flex items-center gap-1 transition cursor-pointer"
                  id="logout-button"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sair/Trocar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible fields for email/Google linking */}
          {showLinkFields && !activeUser.email && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3.5 text-left animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">Vincular E-mail de Segurança</h4>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Insira o seu e-mail para poder salvar seus palpites e restaurá-los a partir de outros dispositivos no futuro.
                </p>
              </div>

              <form onSubmit={handleEmailLoginSubmit} className="space-y-2.5">
                {errorMsg && (
                  <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
                    {errorMsg}
                  </p>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">Seu E-mail:</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: seu-email@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                
                {/* Pre-fill name based on active participant name so it only links email instead of showing avatar options */}
                <input type="hidden" value={activeUser.name} />

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Confirmar Vínculo de E-mail
                </button>
              </form>

              {clientId && (
                <div className="pt-2 border-t border-amber-200/60 space-y-2 text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    Ou vincule e valide com o Google oficial
                  </span>
                  <div className="flex justify-center">
                    <div id="google-auth-button-container"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Logged out: Sign in Form with any email when no active participant is found */
        <div className="space-y-4">
          <form onSubmit={handleEmailLoginSubmit} className="space-y-3">
            {errorMsg && (
              <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-rose-500 rounded-xs inline-block"></span>
                {errorMsg}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 font-semibold block">
                Seu E-mail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Ex: cristina.fj@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-250 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 outline-hidden placeholder:text-slate-400 transition-all font-mono"
                  id="login-email-input"
                />
              </div>
            </div>

            {/* Only require name if email is NOT already assigned to an existing participant */}
            {emailInput.trim() && !participants.some(p => p.email?.toLowerCase() === emailInput.trim().toLowerCase()) && (
              <div className="space-y-2 animate-in slide-in-from-top-1 duration-150">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-semibold block">
                    Seu Nome (Novo Cadastro) <span className="text-rose-450">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cristina Fernandes"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      translate="no"
                      className="notranslate w-full text-xs bg-slate-50 border border-slate-250 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 outline-hidden placeholder:text-slate-400 transition-all"
                      id="login-name-input"
                    />
                  </div>
                </div>

                {/* Custom Avatar Picker for New Registration */}
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-left">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Escolha sua Foto ou Emoji de Perfil
                  </span>

                  {/* Toggle Mode Buttons */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAvatarType('emoji')}
                      className={`py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        avatarType === 'emoji'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Emoji / Ícone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarType('image')}
                      className={`py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        avatarType === 'image'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Foto de Perfil</span>
                    </button>
                  </div>

                  {avatarType === 'emoji' ? (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-medium">Emoji Selecionado:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg bg-orange-100 p-1 rounded-md">{selectedEmoji}</span>
                          <input
                            type="text"
                            maxLength={4}
                            value={selectedEmoji}
                            onChange={(e) => setSelectedEmoji(e.target.value.trim() || '⚽')}
                            className="w-12 text-center text-xs bg-slate-50 border border-slate-250 focus:border-emerald-500 rounded-md py-0.5"
                            placeholder="Digitar"
                            title="Ou digite o emoji desejado"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-8 gap-1 bg-white p-2 rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                        {AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`text-lg p-1 rounded-md transition-all hover:bg-slate-100 flex items-center justify-center cursor-pointer ${
                              selectedEmoji === emoji ? 'bg-amber-100 border border-amber-400' : 'border border-transparent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      {/* Device Photo Upload (Drag & Drop + Native Select) */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Foto do seu Celular / Computador:</span>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            isDragging
                              ? 'border-amber-500 bg-amber-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-355 hover:bg-slate-50/50'
                          }`}
                          onClick={() => document.getElementById('device-photo-file-picker')?.click()}
                        >
                          <input
                            type="file"
                            id="device-photo-file-picker"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(e.target.files[0]);
                              }
                            }}
                          />
                          <Image className="w-6 h-6 text-slate-400" />
                          <div className="text-[10px] text-slate-600 font-medium">
                            <span className="text-amber-600 font-bold underline">Escolher foto da galeria</span> ou arraste aqui
                          </div>
                          <span className="text-[8px] text-slate-400">JPEG, PNG ou WEBP</span>
                        </div>
                      </div>

                      {/* Custom URL Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Ou cole o link de uma foto:</label>
                        <input
                          type="url"
                          placeholder="Cole o endereço da foto (HTTP/HTTPS)"
                          value={imageUrlInput.startsWith('data:image/') ? '' : imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-250 focus:border-amber-500 rounded-lg p-2 text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500/10 truncate font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Profile Live Preview Widget inside Registration Box! */}
                  <div className="bg-slate-100 border border-slate-205/80 p-2.5 rounded-xl flex items-center gap-2.5 shadow-3xs font-sans">
                    <div className="shrink-0">
                      {avatarType === 'image' ? (
                        <img
                          src={imageUrlInput || DEFAULT_AVATAR_URL}
                          alt="Preview"
                          className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-sm"
                          onError={(e) => {
                            // fallback if broken link
                            (e.target as any).src = DEFAULT_AVATAR_URL;
                          }}
                        />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 text-slate-700 flex items-center justify-center text-lg shadow-sm">
                          {selectedEmoji}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block text-left">Prévia do seu Perfil:</span>
                      <span translate="no" className="notranslate text-slate-800 font-extrabold text-xs truncate block text-left">
                        {nameInput.trim() || 'Seu Nome'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-amber-600 font-semibold italic text-left">
                  * Esse e-mail é novo! Escreva seu nome para se cadastrar na hora.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-550/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
              id="login-submit-button"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>Cadastrar / Acessar Perfil</span>
            </button>
          </form>

          {/* Google SSO button fallback (displays if Client ID is configured in AI Studio) */}
          {clientId && (
            <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
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
