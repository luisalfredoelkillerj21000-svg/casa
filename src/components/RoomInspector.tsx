import React from 'react';
import { Room } from '../types/blueprint';
import { X, Sun, Wind, Maximize2, CheckCircle2, Home } from 'lucide-react';

interface RoomInspectorProps {
  room: Room | null;
  onClose: () => void;
}

export const RoomInspector: React.FC<RoomInspectorProps> = ({ room, onClose }) => {
  if (!room) return null;

  const getAptColor = () => {
    if (room.apartmentId === 'dpto1') return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (room.apartmentId === 'dpto2') return 'text-amber-400 bg-amber-950/60 border-amber-800';
    if (room.apartmentId === 'common') return 'text-sky-400 bg-sky-950/60 border-sky-800';
    return 'text-slate-400 bg-slate-900 border-slate-800';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800">
        <div>
          <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md border mb-2 ${getAptColor()}`}>
            {room.apartmentName}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">{room.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-800">
        <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <div className="text-[11px] text-slate-400 font-medium">Área Útil</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
            {room.area.toFixed(2)} <span className="text-xs font-normal text-slate-400">m²</span>
          </div>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <div className="text-[11px] text-slate-400 font-medium">Dimensiones</div>
          <div className="text-sm font-bold text-white font-mono mt-1">{room.dimensions}</div>
        </div>
      </div>

      {/* Description */}
      <div className="py-4 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Descripción Arquitectónica
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">{room.description}</p>
      </div>

      {/* Lighting & Ventilation */}
      <div className="py-4 border-b border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Condiciones Bioclimáticas
        </h4>
        <div className="flex items-start gap-2.5 text-xs text-slate-300">
          <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-medium">Iluminación Natural:</strong>
            {room.lightSource}
          </div>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-300">
          <Wind className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-medium">Ventilación Reglamentaria:</strong>
            {room.ventilation}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-4 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Equipamiento y Acabados
        </h4>
        <ul className="space-y-2">
          {room.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Tips */}
      <div className="mt-auto pt-4 text-xs text-slate-400 italic">
        * Cumple con la normativa de habitabilidad para viviendas entre medianeras (8x15m).
      </div>
    </div>
  );
};
