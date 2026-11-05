import React, { useState } from 'react';
import { Blueprint2D } from './components/Blueprint2D';
import { Blueprint3D } from './components/Blueprint3D';
import { RoomInspector } from './components/RoomInspector';
import { AreaScheduleModal } from './components/AreaScheduleModal';
import { VanosScheduleModal } from './components/VanosScheduleModal';
import { TechnicalSpecsModal } from './components/TechnicalSpecsModal';
import { ExportModal } from './components/ExportModal';
import { Room, LayerState, PlanVariant } from './types/blueprint';
import { getPlanData } from './data/floorPlanData';
import {
  Layers,
  Printer,
  Compass,
  FileSpreadsheet,
  DoorOpen,
  Info,
  Maximize2,
  SlidersHorizontal,
  Home,
  Check,
  Bed,
  Download,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');
  const [planVariant, setPlanVariant] = useState<PlanVariant>('2bed'); // Default to 2 bedrooms per apartment
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeApartmentFilter, setActiveApartmentFilter] = useState<'all' | 'dpto1' | 'dpto2' | 'common'>('all');
  const [blueprintTheme, setBlueprintTheme] = useState<'blueprint' | 'white' | 'sepia'>('blueprint');

  // Modals state
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isVanosModalOpen, setIsVanosModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(true);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);

  // Active plan dataset based on selected variant
  const planData = getPlanData(planVariant);

  // Layers state
  const [layers, setLayers] = useState<LayerState>({
    walls: true,
    doors: true,
    windows: true,
    dimensions: true,
    furniture: true,
    labels: true,
    circulation: true,
    lightWells: true,
    grid: true,
  });

  const toggleLayer = (layerKey: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleVariantChange = (variant: PlanVariant) => {
    setPlanVariant(variant);
    setSelectedRoom(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Contract (§2: Brand title, concise single-line nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
            8x15
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Plano 2do Piso · 2 Departamentos
            </h1>
            <div className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:block">
              Lote 8.00m x 15.00m <span className="text-slate-600">·</span> Escalera Frente Derecho <span className="text-slate-600">·</span> Fondo 100% Techado
            </div>
          </div>
        </div>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('2d')}
            className={`transition-colors whitespace-nowrap pb-0.5 ${
              activeTab === '2d' ? 'text-sky-400 font-bold border-b-2 border-sky-400' : 'hover:text-white'
            }`}
          >
            Plano 2D CAD
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`transition-colors whitespace-nowrap pb-0.5 ${
              activeTab === '3d' ? 'text-sky-400 font-bold border-b-2 border-sky-400' : 'hover:text-white'
            }`}
          >
            Modelo 3D
          </button>
          <button
            onClick={() => setIsAreaModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Cuadro de Áreas
          </button>
          <button
            onClick={() => setIsVanosModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Cuadro de Vanos
          </button>
          <button
            onClick={() => setIsSpecsModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Memoria Descriptiva
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile view switch buttons */}
          <div className="flex lg:hidden bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('2d')}
              className={`px-2.5 py-1 rounded font-medium ${
                activeTab === '2d' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-2.5 py-1 rounded font-medium ${
                activeTab === '3d' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              3D
            </button>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 rounded-lg transition-all whitespace-nowrap shadow-sm shadow-sky-500/25 active:scale-95"
            title="Generar y descargar lámina PDF oficial"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar PDF / Lámina</span>
            <span className="sm:hidden">Descargar PDF</span>
          </button>
        </div>
      </header>

      {/* Sub-header Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs shrink-0 z-20">
        {/* Left: Distribution Variant Switcher + Apartment Filter */}
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          {/* Variant Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700/80 shrink-0">
            <button
              onClick={() => handleVariantChange('2bed')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-semibold ${
                planVariant === '2bed'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>2 Cuartos c/u (4 Hab)</span>
            </button>
            <button
              onClick={() => handleVariantChange('1bed')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-xs font-semibold ${
                planVariant === '1bed'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>1 Cuarto c/u (Suites)</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800 shrink-0 hidden sm:block" />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1 hidden md:inline">
              Filtro:
            </span>
            <button
              onClick={() => setActiveApartmentFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                activeApartmentFilter === 'all'
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Ver Todo
            </button>
            <button
              onClick={() => setActiveApartmentFilter('dpto1')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                activeApartmentFilter === 'dpto1'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Dpto 1 Frente ({planVariant === '2bed' ? '2 Hab' : '1 Hab'})
            </button>
            <button
              onClick={() => setActiveApartmentFilter('dpto2')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                activeApartmentFilter === 'dpto2'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Dpto 2 Fondo ({planVariant === '2bed' ? '2 Hab' : '1 Hab'})
            </button>
            <button
              onClick={() => setActiveApartmentFilter('common')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                activeApartmentFilter === 'common'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Escalera & Hall
            </button>
          </div>
        </div>

        {/* Right: 2D Blueprint Theme & Layers Control */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === '2d' && (
            <>
              {/* Theme switch */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
                <button
                  onClick={() => setBlueprintTheme('blueprint')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    blueprintTheme === 'blueprint' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Estilo Azul CAD"
                >
                  Azul CAD
                </button>
                <button
                  onClick={() => setBlueprintTheme('white')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    blueprintTheme === 'white' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Papel Blanco Técnico"
                >
                  Blanco
                </button>
                <button
                  onClick={() => setBlueprintTheme('sepia')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    blueprintTheme === 'sepia' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Plano Cálido"
                >
                  Cálido
                </button>
              </div>

              {/* Layers Toggle Button */}
              <button
                onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  isLayersPanelOpen
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Capas</span>
              </button>
            </>
          )}

          {/* Quick Info Modals in sub-bar for smaller screens */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setIsAreaModalOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-md"
              title="Cuadro de Áreas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsVanosModalOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-md"
              title="Cuadro de Vanos"
            >
              <DoorOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSpecsModalOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-md"
              title="Memoria Descriptiva"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Layers Drawer / Popover */}
        {isLayersPanelOpen && activeTab === '2d' && (
          <div className="absolute top-3 right-4 z-30 bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl w-60 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Capas del Plano
              </span>
              <button
                onClick={() => setIsLayersPanelOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'walls', label: 'Muros y Columnas' },
                { key: 'doors', label: 'Puertas con Giro' },
                { key: 'windows', label: 'Ventanas y Vanos' },
                { key: 'dimensions', label: 'Cotas y Medidas' },
                { key: 'furniture', label: 'Mobiliario y Cocinas' },
                { key: 'labels', label: 'Nombres y Áreas m²' },
                { key: 'circulation', label: 'Circulación y Flechas' },
                { key: 'lightWells', label: 'Pozos de Ventilación' },
                { key: 'grid', label: 'Malla Métrica (1m)' },
              ].map((item) => {
                const isActive = layers[item.key as keyof LayerState];
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key as keyof LayerState)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <span>{item.label}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        isActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2D vs 3D Component */}
        {activeTab === '2d' ? (
          <Blueprint2D
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            activeApartmentFilter={activeApartmentFilter}
            layers={layers}
            blueprintTheme={blueprintTheme}
            planData={planData}
          />
        ) : (
          <Blueprint3D
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            activeApartmentFilter={activeApartmentFilter}
            planData={planData}
            planVariant={planVariant}
          />
        )}

        {/* Room Inspector Drawer */}
        <RoomInspector room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      </div>

      {/* Modals */}
      <AreaScheduleModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        schedule={planData.areaSchedule}
      />
      <VanosScheduleModal
        isOpen={isVanosModalOpen}
        onClose={() => setIsVanosModalOpen(false)}
        doors={planData.doors}
        windows={planData.windows}
      />
      <TechnicalSpecsModal isOpen={isSpecsModalOpen} onClose={() => setIsSpecsModalOpen(false)} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        variant={planVariant}
      />
    </div>
  );
}
