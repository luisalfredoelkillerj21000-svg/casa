import React from 'react';
import { X, PieChart, Check, Building2, Home } from 'lucide-react';
import { AREA_SCHEDULE } from '../data/floorPlanData';

interface AreaScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: {
    totalLotArea: number;
    builtArea: number;
    openArea: number;
    openAreaPercentage: number;
    dpto1: {
      name: string;
      area: number;
      effectiveArea: number;
      bedrooms: number;
      bathrooms: number;
      rooms: string[];
    };
    dpto2: {
      name: string;
      area: number;
      effectiveArea: number;
      bedrooms: number;
      bathrooms: number;
      rooms: string[];
    };
    commonArea: {
      name: string;
      area: number;
      elements: string[];
    };
  };
}

export const AreaScheduleModal: React.FC<AreaScheduleModalProps> = ({ isOpen, onClose, schedule = AREA_SCHEDULE }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold">Cuadro Normativo de Áreas (8.00m x 15.00m)</h3>
              <p className="text-xs text-slate-400">Segundo Piso · Vivienda Multifamiliar (2 Departamentos)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Área de Terreno</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{schedule.totalLotArea.toFixed(2)} <span className="text-xs text-slate-400">m²</span></span>
            <span className="text-[11px] text-slate-500">8.00m x 15.00m</span>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Área Techada 2° Piso</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{schedule.builtArea.toFixed(2)} <span className="text-xs text-slate-400">m²</span></span>
            <span className="text-[11px] text-slate-400">{(100 - schedule.openAreaPercentage).toFixed(2)}% Ocupación</span>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Área Libre / Pozos</span>
            <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">{schedule.openArea.toFixed(2)} <span className="text-xs text-slate-400">m²</span></span>
            <span className="text-[11px] text-slate-400">{schedule.openAreaPercentage.toFixed(2)}% (Ventilación)</span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="border border-slate-800 rounded-lg overflow-hidden my-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-2.5 px-4">Unidad Funcional</th>
                <th className="py-2.5 px-4">Ambientes Incluidos</th>
                <th className="py-2.5 px-4 text-right">Área Neta</th>
                <th className="py-2.5 px-4 text-right">% Lote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {schedule.dpto1.name}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {schedule.dpto1.rooms.join(', ')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-white">{schedule.dpto1.effectiveArea.toFixed(2)} m²</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{((schedule.dpto1.effectiveArea / 120) * 100).toFixed(2)}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  {schedule.dpto2.name}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {schedule.dpto2.rooms.join(', ')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-white">{schedule.dpto2.effectiveArea.toFixed(2)} m²</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{((schedule.dpto2.effectiveArea / 120) * 100).toFixed(2)}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  {schedule.commonArea.name}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {schedule.commonArea.elements.join(', ')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-white">{schedule.commonArea.area.toFixed(2)} m²</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{((schedule.commonArea.area / 120) * 100).toFixed(2)}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 bg-slate-800/20">
                <td className="py-3 px-4 font-bold text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Pozos de Luz (Área Libre)
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Pozo de Luz Central + Patio de Luz Posterior (Ventilación Reglamentaria).
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-white">{schedule.openArea.toFixed(2)} m²</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{schedule.openAreaPercentage.toFixed(2)}%</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-800/90 font-bold border-t border-slate-700 text-white">
              <tr>
                <td className="py-3 px-4" colSpan={2}>ÁREA TOTAL DEL LOTE</td>
                <td className="py-3 px-4 text-right font-mono text-sky-400 text-sm">120.00 m²</td>
                <td className="py-3 px-4 text-right font-mono">100.00%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Technical Architectural Notes */}
        <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50 text-xs space-y-2">
          <div className="font-semibold text-sky-400 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            Cumplimiento de Parámetros Urbanísticos y Habitabilidad
          </div>
          <p className="text-slate-300">
            • <strong>Independencia total:</strong> Cada departamento cuenta con su propio medidor/subpanel eléctrico previsto, timbre, cerradura de seguridad y recorrido de evacuación despejado hacia la escalera.
          </p>
          <p className="text-slate-300">
            • <strong>Ventilación e iluminación natural:</strong> La fachada a calle abastece al Dpto 1, mientras que el ducto central (2.24 m²) ventila eficientemente los servicios higiénicos y el Dpto 2.
          </p>
          <p className="text-slate-300">
            • <strong>Escalera frontal derecha:</strong> Ubicada estratégicamente en el frente derecho (X: 5.85m a 7.85m), dejando el frente izquierdo libre y continuo para la sala y dormitorio matrimonial del Dpto 1 con vista a calle.
          </p>
          <p className="text-slate-300">
            • <strong>Fondo 100% techado:</strong> Al retirar el patio posterior y lavandería exterior, el Dpto 2 aprovecha los 8 metros completos de fondo para dos dormitorios amplios (~16 m² cada uno).
          </p>
        </div>
      </div>
    </div>
  );
};
