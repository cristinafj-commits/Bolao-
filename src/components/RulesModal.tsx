import React from 'react';
import { X, HelpCircle, Award, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        id="rules-modal-container"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg tracking-tight">Regras de Pontuação</h3>
              <p className="text-emerald-100 text-xs">Entenda como funciona o ranking automático</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Fecar"
            id="close-rules-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-200 max-h-[80vh] overflow-y-auto">
          <p className="text-sm text-slate-400">
            A cada jogo finalizado (ou durante simulações ao vivo), o sistema reclassifica automaticamente os participantes de acordo com os seguintes critérios:
          </p>

          <div className="space-y-4">
            {/* Rule 1 */}
            <div className="flex gap-4 items-start p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 font-mono font-bold text-sm shrink-0 min-w-12 text-center">
                +3 pts
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Placar Exato
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Você acertou exatamente os gols de cada time. <span className="text-slate-300">(Ex: Palpite 2x1, Final 2x1)</span>.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-4 items-start p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 font-mono font-bold text-sm shrink-0 min-w-12 text-center">
                +1 pt
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-400" />
                  Acerto do Vencedor ou Empate
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Você acertou quem ganhou ou se terminou empatado, embora não tenha acertado o placar exato. <span className="text-slate-300">(Ex: Palpite 3x1, Final 1x0; ou Palpite 1x1, Final 2x2)</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Tiebreaker Rules */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">Critérios de Desempate:</h5>
            <ol className="list-decimal pl-4 text-xs text-slate-400 space-y-1.5">
              <li>Maior número de palpites com <strong className="text-slate-200">Placar Exato (+3)</strong>.</li>
              <li>Maior número de palpites com <strong className="text-slate-200">Outros Acertos (+1)</strong>.</li>
              <li>Ordem alfabética do participante.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 flex justify-end border-t border-slate-850">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition-all cursor-pointer"
            id="rules-modal-ack-btn"
          >
            Entendido, Boa Sorte!
          </button>
        </div>
      </div>
    </div>
  );
}
