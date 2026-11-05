import React from 'react';
import { X, Grid, DoorClosed } from 'lucide-react';
import { Door, Window } from '../types/blueprint';
import { DOORS, WINDOWS } from '../data/floorPlanData';

interface VanosScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doors?: Door[];
  windows?: Window[];
}

export const VanosScheduleModal: React.FC<VanosScheduleModalProps> = ({
  isOpen,
  onClose,
  doors = DOORS,
  windows = WINDOWS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <DoorClosed className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold">Cuadro de Vanos (Puertas y Ventanas)</h3>
              <p className="text-xs text-slate-400">Especificaciones Técnicas para Carpintería y Cerrajería</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Puertas Table */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
            1. Cuadro de Puertas (P)
          </h4>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Ancho (m)</th>
                  <th className="py-2 px-3">Alto (m)</th>
                  <th className="py-2 px-3">Tipo de Puerta</th>
                  <th className="py-2 px-3">Ubicación / Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {doors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{d.code}</td>
                    <td className="py-2.5 px-3 font-mono">{d.width.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{d.height.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {d.code === 'P-01' || d.code === 'P-02'
                        ? 'Madera maciza / Cerradura de seguridad multipunto'
                        : d.code.includes('bath') || d.targetRoom.includes('Baño')
                        ? 'Contraplacada antihumedad / Rejilla inferior'
                        : 'Contraplacada enchapada en cedro/roble'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{d.targetRoom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ventanas Table */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
            2. Cuadro de Ventanas (V)
          </h4>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Ancho (m)</th>
                  <th className="py-2 px-3">Alto (m)</th>
                  <th className="py-2 px-3">Alféizar (m)</th>
                  <th className="py-2 px-3">Tipo de Vidrio y Marco</th>
                  <th className="py-2 px-3">Ambiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {windows.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{w.code}</td>
                    <td className="py-2.5 px-3 font-mono">{w.width.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{w.height.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{w.sillHeight.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {w.orientation === 'front'
                        ? 'Vidrio templado 6mm / Perfilería aluminio negro'
                        : w.code === 'V-07'
                        ? 'Vidrio catedral/esmerilado batiente'
                        : 'Vidrio crudo incoloro 6mm corredizo'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{w.roomName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 p-3 bg-slate-800/40 rounded-lg border border-slate-700/40 text-[11px] text-slate-400">
          * Todas las medidas de vanos corresponden a obra limpia en metros. Verificar en obra antes de la fabricación de carpinterías.
        </div>
      </div>
    </div>
  );
};
