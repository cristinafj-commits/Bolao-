import React, { useRef, useState } from 'react';
import { Database, Download, Upload, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Participant, Match, Guess } from '../types';

interface DataBackupCardProps {
  participants: Participant[];
  matches: Match[];
  guesses: Guess[];
  activeParticipantId: string;
  onImportData: (data: {
    participants: Participant[];
    matches: Match[];
    guesses: Guess[];
    activeParticipantId: string;
  }) => void;
  onResetDatabase: () => void;
}

export default function DataBackupCard({
  participants,
  matches,
  guesses,
  activeParticipantId,
  onImportData,
  onResetDatabase,
}: DataBackupCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        activeParticipantId,
        participants,
        matches,
        guesses,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bolao_copa_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg('✅ Backup baixado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('Erro ao gerar arquivo de backup.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!json.participants || !json.matches || !json.guesses) {
          throw new Error('Formato de backup inválido.');
        }

        onImportData({
          participants: json.participants,
          matches: json.matches,
          guesses: json.guesses,
          activeParticipantId: json.activeParticipantId || json.participants[0]?.id || 'p2',
        });

        setSuccessMsg('🎉 Backup importado e aplicado!');
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err) {
        setErrorMsg('Arquivo inválido ou corrompido. Certifique-se de usar um arquivo .json de backup do Bolão.');
        setTimeout(() => setErrorMsg(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again if needed
    e.target.value = '';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="data-backup-card">
      <div>
        <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-base">
          <Database className="w-5 h-5 text-emerald-400" />
          Dados & Backup Offline
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Tudo é salvo no seu navegador. Exporte para backup ou envie seus palpites para amigos.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleExport}
          className="py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-755 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
          title="Exportar palpites e participantes"
          id="export-backup-btn"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar JSON</span>
        </button>

        <button
          onClick={handleImportClick}
          className="py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-755 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
          title="Importar arquivo de backup .json"
          id="import-backup-btn"
        >
          <Upload className="w-4 h-4 text-amber-500" />
          <span>Importar JSON</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        id="import-file-input"
      />

      <div className="pt-3 border-t border-slate-850">
        <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200 block">Armazenamento Local</span>
            <span>Sem nuvem, seguro e 100% privado.</span>
          </div>
          <button
            onClick={onResetDatabase}
            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-lg flex items-center gap-1 transition"
            id="reset-db-under-backup-btn"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
