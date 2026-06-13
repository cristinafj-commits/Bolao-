import React, { useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, Check, Smile, Lock, Unlock, Pencil, Image, Camera } from 'lucide-react';
import { Participant } from '../types';
import { AVATARS } from '../utils';

interface ParticipantSelectorProps {
  participants: Participant[];
  activeParticipantId: string;
  onSelectParticipant: (id: string) => void;
  onAddParticipant: (name: string, avatar: string, imageUrl?: string) => void;
  onDeleteParticipant: (id: string) => void;
  isAdminMode?: boolean;
  onUnlockParticipant?: (id: string) => void;
  onUpdateAvatar?: (id: string, avatar: string, imageUrl?: string) => void;
  onLockGuesses?: () => void;
  onGoToGuesses?: () => void;
}

export default function ParticipantSelector({
  participants,
  activeParticipantId,
  onSelectParticipant,
  onAddParticipant,
  onDeleteParticipant,
  isAdminMode,
  onUnlockParticipant,
  onUpdateAvatar,
  onLockGuesses,
  onGoToGuesses,
}: ParticipantSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');
  
  // Registration custom photo states
  const [regAvatarType, setRegAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [regImageUrl, setRegImageUrl] = useState('');
  const [isDraggingReg, setIsDraggingReg] = useState(false);

  // Specific editing states
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [editAvatarEmoji, setEditAvatarEmoji] = useState('⚽');
  const [editingAvatarType, setEditingAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);

  const activeParticipant = participants.find((p) => p.id === activeParticipantId);

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

  const handleRegFileChange = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setRegImageUrl(compressed);
    } catch (e) {
      console.error('Error compressing registration image:', e);
    }
  };

  const handleEditFileChange = async (file: File, participantId: string) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setEditingImageUrl(compressed);
      if (onUpdateAvatar) {
        onUpdateAvatar(participantId, '', compressed);
      }
    } catch (e) {
      console.error('Error compressing edit image:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    onAddParticipant(
      newParticipantName.trim(), 
      regAvatarType === 'emoji' ? selectedAvatar : '⚽', 
      regAvatarType === 'image' ? regImageUrl : undefined
    );
    setNewParticipantName('');
    setRegImageUrl('');
    setRegAvatarType('emoji');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-sm" id="participant-selector-card">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 tracking-tight flex items-center gap-2 text-base">
            <Smile className="w-5 h-5 text-emerald-500" />
            Participantes
          </h3>
          <p className="text-xs text-slate-500">
            {isAdminMode 
              ? 'Painel Admin: Selecione, exclua ou libere participantes'
              : 'Lista de participantes cadastrados no Bolão'
            }
          </p>
        </div>
        {isAdminMode && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showAddForm
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            id="toggle-add-participant-btn"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showAddForm ? 'Cancelar' : 'Novo Perfil'}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-150" id="add-participant-form">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nome do Participante</label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Ex: João Silva"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 rounded-xl px-3.5 py-2 text-slate-850 outline-hidden transition-all placeholder:text-slate-400"
              id="new-participant-input"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Escolha seu Avatar ou Foto de Perfil
            </span>

            {/* Toggle Mode Buttons */}
            <div className="grid grid-cols-2 gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setRegAvatarType('emoji')}
                className={`py-1 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  regAvatarType === 'emoji'
                    ? 'bg-white text-slate-900 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smile className="w-3.5 h-3.5 text-emerald-600" />
                <span>Emoji / Ícone</span>
              </button>
              <button
                type="button"
                onClick={() => setRegAvatarType('image')}
                className={`py-1 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  regAvatarType === 'image'
                    ? 'bg-white text-slate-900 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto da Galeria</span>
              </button>
            </div>

            {regAvatarType === 'emoji' ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold">Emoji Selecionado:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-base bg-emerald-50 p-1 rounded-md">{selectedAvatar}</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={selectedAvatar}
                      onChange={(e) => setSelectedAvatar(e.target.value.trim() || '⚽')}
                      className="w-12 text-center text-xs bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-md py-0.5 font-bold"
                      placeholder="Emoji"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1 p-1 bg-white rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-lg p-1 rounded-md transition-all hover:bg-slate-100 flex items-center justify-center cursor-pointer ${
                        selectedAvatar === emoji ? 'bg-emerald-500/10 border border-emerald-450 scale-105' : 'border border-transparent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingReg(true);
                  }}
                  onDragLeave={() => setIsDraggingReg(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingReg(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleRegFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isDraggingReg
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-emerald-450 hover:bg-slate-55/40'
                  }`}
                  onClick={() => document.getElementById('participant-reg-file-picker')?.click()}
                >
                  <input
                    type="file"
                    id="participant-reg-file-picker"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleRegFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <Image className="w-5 h-5 text-slate-400" />
                  <div className="text-[10px] text-slate-600 font-bold">
                    <span className="text-emerald-600 underline">Buscar foto da galeria</span> ou solte aqui
                  </div>
                  <span className="text-[8px] text-slate-400">JPEG, PNG ou WEBP auto-comprimido</span>
                </div>
              </div>
            )}

            {/* Profile Live Preview Badge */}
            <div className="bg-slate-100/80 border border-slate-200 p-2 rounded-xl flex items-center gap-2">
              <div className="shrink-0">
                {regAvatarType === 'image' && regImageUrl ? (
                  <img
                    src={regImageUrl}
                    alt="Preview"
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-3xs"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-sm shadow-3xs">
                    {selectedAvatar}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <span className="text-[8px] uppercase font-bold text-slate-400 block">Identidade Visual:</span>
                <span className="text-slate-800 font-bold text-xs truncate block leading-none">
                  {newParticipantName.trim() || 'Novo Participante'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-md"
            id="submit-participant-btn"
          >
            Adicionar Participante
          </button>
        </form>
      )}

      {/* Participants Quick List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-2" id="participants-list">
        {participants.map((p) => {
          const isActive = p.id === activeParticipantId;
          const isEditingThis = editingAvatarId === p.id;
          return (
            <div key={p.id} className="space-y-1">
              <div
                onClick={() => {
                  if (isAdminMode) {
                    onSelectParticipant(p.id);
                  }
                }}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isAdminMode ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isActive
                    ? 'bg-emerald-50/70 border-emerald-500/50 shadow-xs'
                    : `bg-slate-50/60 border-slate-200/80 ${isAdminMode ? 'hover:bg-slate-100/80' : ''}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar shrink-0">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg aspect-square object-cover border border-slate-200"
                      />
                    ) : (
                      <span className="text-xl bg-slate-200/80 rounded-lg w-10 h-10 flex items-center justify-center border border-slate-300/60 font-bold select-none">
                        {p.avatar}
                      </span>
                    )}
                    {isAdminMode && onUpdateAvatar && !p.locked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAvatarId(isEditingThis ? null : p.id);
                          setEditAvatarEmoji(p.avatar);
                          setEditingImageUrl(p.imageUrl || '');
                          setEditingAvatarType(p.imageUrl ? 'image' : 'emoji');
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-full p-1 hover:bg-slate-50 shadow-xs cursor-pointer text-slate-500 transition-all opacity-100 group-hover/avatar:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                        title="Editar Foto ou Ícone"
                        id={`edit-avatar-btn-${p.id}`}
                      >
                        <Pencil className="w-2.5 h-2.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-850 flex items-center gap-1.5 flex-wrap">
                      {p.name}
                      {p.isGoogleUser && (
                        <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded-xs font-semibold" title={p.email}>
                          Google
                        </span>
                      )}
                      {p.locked && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[8px] px-1.5 py-0.2 rounded-xs font-semibold flex items-center gap-0.5" title="Palpites finalizados e bloqueados">
                          <Lock className="w-2.5 h-2.5 text-amber-700" />
                          Trancado
                        </span>
                      )}
                      {isActive && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5" title="Perfil selecionado para preencher os palpites">
                          <Check className="w-2.5 h-2.5" />
                          Selecionado
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {isActive 
                        ? (p.locked ? '✓ Seu perfil está trancado para edições.' : '👉 Seu perfil ativo (Preencha os palpites abaixo)')
                        : (p.locked ? '🔒 Palpites trancados.' : '📝 Palpites em rascunho.')
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isAdminMode && onUpdateAvatar && !p.locked && !p.imageUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAvatarId(isEditingThis ? null : p.id);
                        setEditAvatarEmoji(p.avatar);
                      }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-emerald-600 text-slate-400 rounded-lg hover:bg-emerald-500/10 transition-all cursor-pointer"
                      title="Editar Emoji"
                      id={`edit-avatar-trigger-btn-${p.id}`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isAdminMode && participants.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteParticipant(p.id);
                      }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Excluir participante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isEditingThis && (
                <div 
                  className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3.5 animate-in slide-in-from-top-2 duration-150 text-left mx-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider">
                      Atualizar Avatar / Foto de {p.name}
                    </span>

                    {/* Selector Tabs */}
                    <div className="grid grid-cols-2 gap-1 bg-white p-0.5 rounded-lg border border-slate-205">
                      <button
                        type="button"
                        onClick={() => setEditingAvatarType('emoji')}
                        className={`py-1 rounded-md text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          editingAvatarType === 'emoji'
                            ? 'bg-slate-100 text-slate-805'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Smile className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Emoji</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAvatarType('image')}
                        className={`py-1 rounded-md text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          editingAvatarType === 'image'
                            ? 'bg-slate-100 text-slate-805'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Foto</span>
                      </button>
                    </div>

                    {editingAvatarType === 'emoji' ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center bg-white p-1 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-semibold">Editar emoji direto:</span>
                          <input
                            type="text"
                            maxLength={4}
                            value={editAvatarEmoji}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setEditAvatarEmoji(val);
                              if (val && onUpdateAvatar) {
                                onUpdateAvatar(p.id, val, '');
                              }
                            }}
                            className="w-12 text-center text-xs bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-md py-0.5 font-bold font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-8 gap-1.5 p-1 bg-white rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                          {AVATARS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setEditAvatarEmoji(emoji);
                                if (onUpdateAvatar) {
                                  onUpdateAvatar(p.id, emoji, '');
                                }
                              }}
                              className={`text-lg p-1 rounded-md hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center ${
                                editAvatarEmoji === emoji ? 'bg-emerald-500/10 border border-emerald-450 scale-105' : 'border border-transparent'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        {/* Drag and drop gallery uploader */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingEdit(true);
                          }}
                          onDragLeave={() => setIsDraggingEdit(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingEdit(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleEditFileChange(e.dataTransfer.files[0], p.id);
                            }
                          }}
                          className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isDraggingEdit
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-slate-200 bg-white hover:border-emerald-450 hover:bg-slate-55/40'
                          }`}
                          onClick={() => document.getElementById(`edit-photo-file-picker-${p.id}`)?.click()}
                        >
                          <input
                            type="file"
                            id={`edit-photo-file-picker-${p.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleEditFileChange(e.target.files[0], p.id);
                              }
                            }}
                          />
                          <Image className="w-5 h-5 text-slate-400" />
                          <div className="text-[10px] text-slate-600 font-bold">
                            <span className="text-emerald-600 underline">Escolher do celular</span> ou arraste
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-205/65">
                    <button
                      type="button"
                      onClick={() => setEditingAvatarId(null)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer text-center shadow-3xs"
                    >
                      Concluído
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actively Selected Profile Lock/Console Action */}
      {activeParticipant && !isAdminMode && (
        <div className="mt-3.5 p-4 rounded-xl border flex flex-col gap-4 text-left transition-all bg-white border-slate-200/90 shadow-2xs" id="active-profile-action-panel">
          
          {/* GUESSING STAGE CTA (ACTIVE/LOCKED COMPATIBLE) */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg border bg-emerald-50 border-emerald-100 text-emerald-700 shrink-0">
                <Smile className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold block tracking-wider uppercase text-[10px] text-emerald-800">
                  Etapa de Palpites
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed block">
                  {activeParticipant.locked
                    ? 'Seus palpites estão cadastrados e bloqueados para edições.'
                    : 'Acesse a tabela para cadastrar ou editar seus palpites com este perfil ativo.'}
                </span>
              </div>
            </div>

            {onGoToGuesses && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToGuesses();
                }}
                className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-xs uppercase tracking-wider ${
                  activeParticipant.locked
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-emerald-600 hover:bg-emerald-500 animate-pulse'
                }`}
                style={{ animationDuration: '2.5s' }}
              >
                <span>
                  {activeParticipant.locked ? '🔍 Ver Meus Palpites nos Jogos' : '👉 PREENCHER MEUS PALPITES ⚽'}
                </span>
              </button>
            )}
          </div>

          {/* FINAL LOCK STAGE */}
          {!activeParticipant.locked && onLockGuesses && (
            <div className="pt-3.5 border-t border-slate-100/80 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg border bg-amber-50 border-amber-100 text-amber-700 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold block tracking-wider uppercase text-[10px] text-amber-800">
                    Etapa 2: Validar e Bloquear (Opcional)
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed block">
                    Quando tiver finalizado o preenchimento de todos os seus palpites, você pode trancá-los para maior segurança. 
                    <strong className="text-amber-850 font-extrabold block mt-0.5">⚠️ Atenção: Após bloquear, não poderá mais fazer edições!</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLockGuesses();
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-extrabold text-xs rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 shrink-0 uppercase tracking-wider mt-1"
                id="btn-lock-all-guesses"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Salvar & Bloquear de uma vez</span>
              </button>
            </div>
          )}

          {activeParticipant.locked && (
            <div className="pt-2 border-t border-slate-100/90 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold justify-center uppercase tracking-wider">
              <span>✓ Participação Devidamente Trancada na Nuvem</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
