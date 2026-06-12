import React, { useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, Check, Smile } from 'lucide-react';
import { Participant } from '../types';
import { AVATARS } from '../utils';

interface ParticipantSelectorProps {
  participants: Participant[];
  activeParticipantId: string;
  onSelectParticipant: (id: string) => void;
  onAddParticipant: (name: string, avatar: string) => void;
  onDeleteParticipant: (id: string) => void;
}

export default function ParticipantSelector({
  participants,
  activeParticipantId,
  onSelectParticipant,
  onAddParticipant,
  onDeleteParticipant,
}: ParticipantSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    onAddParticipant(newParticipantName.trim(), selectedAvatar);
    setNewParticipantName('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="participant-selector-card">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-base">
            <Smile className="w-5 h-5 text-emerald-400" />
            Participantes Ativos
          </h3>
          <p className="text-xs text-slate-400">Escolha um perfil para gerenciar e salvar palpites</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            showAddForm
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          id="toggle-add-participant-btn"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {showAddForm ? 'Cancelar' : 'Cadastrar'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-150" id="add-participant-form">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nome do Participante</label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Ex: João Silva"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white outline-hidden transition-all placeholder:text-slate-500"
              id="new-participant-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Selecione um Avatar (Emoji)</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-900/60 rounded-xl border border-slate-850">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-xl p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center ${
                    selectedAvatar === emoji ? 'bg-emerald-500/20 border border-emerald-500 scale-110' : 'border border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
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
          return (
            <div
              key={p.id}
              onClick={() => onSelectParticipant(p.id)}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md shadow-emerald-950/10'
                  : 'bg-slate-950/40 border-slate-850 hover:bg-slate-850/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700"
                  />
                ) : (
                  <span className="text-xl shrink-0 bg-slate-800/80 rounded-lg w-10 h-10 flex items-center justify-center border border-slate-700/50">
                    {p.avatar}
                  </span>
                )}
                <div>
                  <h4 className="font-medium text-sm text-white flex items-center gap-1.5 flex-wrap">
                    {p.name}
                    {p.isGoogleUser && (
                      <span className="bg-amber-500/10 text-amber-400 text-[8px] px-1 py-0.2 rounded-xs font-semibold" title={p.email}>
                        Google
                      </span>
                    )}
                    {isActive && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Ativo
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {p.isGoogleUser ? `Conectado: ${p.email}` : 'Clique para enviar ou editar palpites'}
                  </p>
                </div>
              </div>

              {participants.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteParticipant(p.id);
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Excluir participante"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
