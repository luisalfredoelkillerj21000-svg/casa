import React, { useState, useRef, useEffect } from 'react';
import { Room, LayerState, Door, Window, DimensionLine, FurnitureItem, PlanData } from '../types/blueprint';
import {
  LOT_WIDTH,
  LOT_DEPTH,
  ROOMS,
  DOORS,
  WINDOWS,
  DIMENSIONS,
  FURNITURE,
  WALLS,
} from '../data/floorPlanData';
import { ZoomIn, ZoomOut, Maximize2, Ruler, Eye, Layers } from 'lucide-react';

interface Blueprint2DProps {
  selectedRoom: Room | null;
  onSelectRoom: (room: Room | null) => void;
  activeApartmentFilter: 'all' | 'dpto1' | 'dpto2' | 'common';
  layers: LayerState;
  blueprintTheme: 'blueprint' | 'white' | 'sepia';
  planData?: PlanData;
}

export const Blueprint2D: React.FC<Blueprint2DProps> = ({
  selectedRoom,
  onSelectRoom,
  activeApartmentFilter,
  layers,
  blueprintTheme,
  planData,
}) => {
  const currentRooms = planData?.rooms || ROOMS;
  const currentDoors = planData?.doors || DOORS;
  const currentWindows = planData?.windows || WINDOWS;
  const currentFurniture = planData?.furniture || FURNITURE;
  const currentWalls = planData?.walls || WALLS;
  // SVG ViewBox coordinate system:
  // Lot is 8m x 15m. Adding margin around for dimension lines:
  // X: -1.5m to 10.0m (width = 11.5m)
  // Y: -1.8m to 16.5m (height = 18.3m)
  const baseViewBox = { x: -1.5, y: -1.8, width: 11.2, height: 18.4 };
  const [viewBox, setViewBox] = useState(baseViewBox);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  // Measure tool state
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [measurePointA, setMeasurePointA] = useState<{ x: number; y: number } | null>(null);
  const [measurePointB, setMeasurePointB] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    setScale((prev) => {
      const newScale = Math.min(Math.max(prev * factor, 0.5), 3.5);
      const newWidth = baseViewBox.width / newScale;
      const newHeight = baseViewBox.height / newScale;
      const cx = viewBox.x + viewBox.width / 2;
      const cy = viewBox.y + viewBox.height / 2;
      setViewBox({
        x: cx - newWidth / 2,
        y: cy - newHeight / 2,
        width: newWidth,
        height: newHeight,
      });
      return newScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setViewBox(baseViewBox);
    setMeasurePointA(null);
    setMeasurePointB(null);
  };

  // Convert client pointer to SVG meters coordinates
  const clientToSvgCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return {
      x: viewBox.x + nx * viewBox.width,
      y: viewBox.y + ny * viewBox.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMeasureMode) {
      const coords = clientToSvgCoords(e.clientX, e.clientY);
      // Snap to 0.05m
      const snapped = {
        x: Math.round(coords.x * 20) / 20,
        y: Math.round(coords.y * 20) / 20,
      };
      if (!measurePointA || (measurePointA && measurePointB)) {
        setMeasurePointA(snapped);
        setMeasurePointB(null);
      } else {
        setMeasurePointB(snapped);
      }
      return;
    }
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMeasureMode && measurePointA && !measurePointB) {
      // preview measurement
      return;
    }
    if (!isPanning) return;
    const dx = ((e.clientX - panStart.x) / (svgRef.current?.clientWidth || 800)) * viewBox.width;
    const dy = ((e.clientY - panStart.y) / (svgRef.current?.clientHeight || 600)) * viewBox.height;
    setViewBox((prev) => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy,
    }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Theme configuration
  const themeStyles = {
    blueprint: {
      bg: '#081426',
      grid: '#172e4c',
      wallFill: '#142944',
      wallStroke: '#38bdf8',
      textPrimary: '#f0f9ff',
      textSecondary: '#7dd3fc',
      dimensionColor: '#38bdf8',
      doorArc: '#0284c7',
      furnitureStroke: '#64748b',
      furnitureFill: '#0f243d',
      lotBorder: '#0284c7',
      stairStroke: '#38bdf8',
    },
    white: {
      bg: '#ffffff',
      grid: '#f1f5f9',
      wallFill: '#334155',
      wallStroke: '#0f172a',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      dimensionColor: '#dc2626',
      doorArc: '#2563eb',
      furnitureStroke: '#64748b',
      furnitureFill: '#f8fafc',
      lotBorder: '#94a3b8',
      stairStroke: '#0f172a',
    },
    sepia: {
      bg: '#fbfbf8',
      grid: '#f1efe7',
      wallFill: '#292524',
      wallStroke: '#1c1917',
      textPrimary: '#1c1917',
      textSecondary: '#57534e',
      dimensionColor: '#b45309',
      doorArc: '#0d9488',
      furnitureStroke: '#78716c',
      furnitureFill: '#f5f5f4',
      lotBorder: '#a8a29e',
      stairStroke: '#1c1917',
    },
  }[blueprintTheme];

  // Helper for polygon string
  const toPolyString = (points: { x: number; y: number }[]) => {
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  };

  // Calculate measured distance
  const measuredDistance =
    measurePointA && measurePointB
      ? Math.hypot(measurePointB.x - measurePointA.x, measurePointB.y - measurePointA.y).toFixed(2)
      : null;

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden bg-slate-950">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Quick Legend & Scale Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium">
          <span className="text-sky-400 font-mono">Escala 1:50</span>
          <span className="text-slate-500">·</span>
          <span>Lote: 8.00m x 15.00m (120 m²)</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400">2do Piso</span>
        </div>

        {/* Right: Zoom and Measure Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-slate-700/60 shadow-lg text-xs">
          <button
            onClick={() => handleZoom(1.2)}
            title="Acercar plano"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.83)}
            title="Alejar plano"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Ajustar a pantalla"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={() => {
              setIsMeasureMode(!isMeasureMode);
              setMeasurePointA(null);
              setMeasurePointB(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium ${
              isMeasureMode
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{isMeasureMode ? 'Midiendo...' : 'Regla'}</span>
          </button>
        </div>
      </div>

      {/* Floating Measure readout when active */}
      {isMeasureMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-xl flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          {measuredDistance ? (
            <span>Distancia medida: {measuredDistance} m</span>
          ) : measurePointA ? (
            <span>Haz clic en el segundo punto</span>
          ) : (
            <span>Haz clic en el primer punto para medir</span>
          )}
        </div>
      )}

      {/* Main SVG Blueprint Canvas */}
      <div
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-full transition-transform duration-75"
          style={{ backgroundColor: themeStyles.bg }}
        >
          <defs>
            {/* Architectural Hatch for Light Wells */}
            <pattern id="lightWellHatch" width="0.2" height="0.2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="0.2" stroke="#94a3b8" strokeWidth="0.03" strokeOpacity="0.4" />
            </pattern>
            {/* Grid pattern 1m x 1m */}
            <pattern id="metricGrid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke={themeStyles.grid} strokeWidth="0.02" />
            </pattern>
            {/* Arrow Marker for Dimensions */}
            <marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill={themeStyles.dimensionColor} />
            </marker>
            {/* Stair Direction Arrow */}
            <marker id="stairArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* 1m Grid */}
          {layers.grid && (
            <rect
              x={-1.5}
              y={-1.8}
              width={11.2}
              height={18.4}
              fill="url(#metricGrid)"
              pointerEvents="none"
            />
          )}

          {/* Lot Boundary (Lindero) 8.00 x 15.00 */}
          <rect
            x={0}
            y={0}
            width={LOT_WIDTH}
            height={LOT_DEPTH}
            fill="none"
            stroke={themeStyles.lotBorder}
            strokeWidth="0.04"
            strokeDasharray="0.2, 0.1"
          />

          {/* Calle / Frente indicator */}
          <g>
            <rect x={0} y={-1.2} width={LOT_WIDTH} height={0.8} fill="rgba(56, 189, 248, 0.05)" />
            <text
              x={LOT_WIDTH / 2}
              y={-0.8}
              textAnchor="middle"
              fill={themeStyles.textSecondary}
              fontSize="0.32"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              ▲ FRENTE / CALLE PRINCIPAL (8.00 m) ▲
            </text>
            <text
              x={LOT_WIDTH / 2}
              y={15.5}
              textAnchor="middle"
              fill={themeStyles.textSecondary}
              fontSize="0.26"
              fontWeight="500"
            >
              ▼ LINDERO POSTERIOR (8.00 m) ▼
            </text>
            <text
              x={-1.0}
              y={LOT_DEPTH / 2}
              textAnchor="middle"
              transform={`rotate(-90 -1.0 ${LOT_DEPTH / 2})`}
              fill={themeStyles.textSecondary}
              fontSize="0.26"
              fontWeight="500"
            >
              ◄ LINDERO IZQUIERDO (15.00 m) ◄
            </text>
            <text
              x={9.0}
              y={LOT_DEPTH / 2}
              textAnchor="middle"
              transform={`rotate(90 9.0 ${LOT_DEPTH / 2})`}
              fill={themeStyles.textSecondary}
              fontSize="0.26"
              fontWeight="500"
            >
              ► LINDERO DERECHO (15.00 m) ►
            </text>
          </g>

          {/* Rooms Interactive Polygons */}
          <g id="rooms-layer">
            {currentRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const isHovered = hoveredRoom?.id === room.id;
              const isMatchFilter =
                activeApartmentFilter === 'all' ||
                room.apartmentId === activeApartmentFilter ||
                (activeApartmentFilter === 'common' && room.apartmentId === 'common');
              const opacity = isMatchFilter ? 1 : 0.25;

              let fillColor = 'transparent';
              if (room.apartmentId === 'dpto1') {
                fillColor = isSelected ? 'rgba(16, 185, 129, 0.25)' : isHovered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.06)';
              } else if (room.apartmentId === 'dpto2') {
                fillColor = isSelected ? 'rgba(245, 158, 11, 0.25)' : isHovered ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.06)';
              } else if (room.apartmentId === 'common') {
                fillColor = isSelected ? 'rgba(56, 189, 248, 0.25)' : isHovered ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.06)';
              } else if (room.apartmentId === 'void') {
                fillColor = 'url(#lightWellHatch)';
              }

              return (
                <g key={room.id} opacity={opacity}>
                  <polygon
                    points={toPolyString(room.polygon)}
                    fill={fillColor}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#7dd3fc' : 'none'}
                    strokeWidth={isSelected ? '0.08' : isHovered ? '0.05' : '0'}
                    className="cursor-pointer transition-all duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isMeasureMode) onSelectRoom(room);
                    }}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                  />

                  {/* Room Label & Area */}
                  {layers.labels && (
                    <g pointerEvents="none" transform={`translate(${room.center.x}, ${room.center.y})`}>
                      <text
                        x={0}
                        y={-0.12}
                        textAnchor="middle"
                        fill={themeStyles.textPrimary}
                        fontSize={room.apartmentId === 'void' ? '0.24' : '0.28'}
                        fontWeight="700"
                      >
                        {room.name}
                      </text>
                      <text
                        x={0}
                        y={0.20}
                        textAnchor="middle"
                        fill={themeStyles.textSecondary}
                        fontSize="0.22"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="500"
                      >
                        {room.area.toFixed(2)} m²
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Light Wells Hatch & Accent Lines */}
          {layers.lightWells && (
            <g id="light-wells-layer" pointerEvents="none">
              {/* Central Light Well: X: 3.20 - 4.60, Y: 6.20 - 7.80 */}
              <rect
                x={3.20}
                y={6.20}
                width={1.40}
                height={1.60}
                fill="url(#lightWellHatch)"
                stroke="#64748b"
                strokeWidth="0.04"
                strokeDasharray="0.1, 0.05"
              />
              <line x1={3.20} y1={6.20} x2={4.60} y2={7.80} stroke="#64748b" strokeWidth="0.02" strokeDasharray="0.08, 0.08" />
              <line x1={4.60} y1={6.20} x2={3.20} y2={7.80} stroke="#64748b" strokeWidth="0.02" strokeDasharray="0.08, 0.08" />
              <text x={3.90} y={6.85} textAnchor="middle" fill="#94a3b8" fontSize="0.18" fontWeight="600">
                POZO DE LUZ
              </text>
              <text x={3.90} y={7.15} textAnchor="middle" fill="#94a3b8" fontSize="0.16" fontFamily="monospace">
                CENTRAL (2.24 m²)
              </text>
            </g>
          )}

          {/* Furniture & Equipment Layer */}
          {layers.furniture && (
            <g id="furniture-layer" pointerEvents="none">
              {currentFurniture.map((item) => {
                const isMatchFilter =
                  activeApartmentFilter === 'all' ||
                  item.apartmentId === activeApartmentFilter ||
                  (activeApartmentFilter === 'common' && item.apartmentId === 'common');
                const opacity = isMatchFilter ? 0.85 : 0.2;

                return (
                  <g
                    key={item.id}
                    transform={`translate(${item.position.x}, ${item.position.y}) rotate(${item.rotation})`}
                    opacity={opacity}
                  >
                    {/* Render Category Shapes */}
                    {item.category === 'bed' && (
                      <g>
                        {/* Bed Frame */}
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={item.length}
                          rx={0.08}
                          fill={themeStyles.furnitureFill}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.03"
                        />
                        {/* Headboard */}
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={0.20}
                          fill={themeStyles.furnitureStroke}
                        />
                        {/* Pillows */}
                        <rect
                          x={-item.width / 2 + 0.15}
                          y={-item.length / 2 + 0.25}
                          width={item.width / 2 - 0.25}
                          height={0.35}
                          rx={0.05}
                          fill="none"
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.02"
                        />
                        <rect
                          x={0.10}
                          y={-item.length / 2 + 0.25}
                          width={item.width / 2 - 0.25}
                          height={0.35}
                          rx={0.05}
                          fill="none"
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.02"
                        />
                        {/* Quilt Fold */}
                        <line
                          x1={-item.width / 2}
                          y1={0.2}
                          x2={item.width / 2}
                          y2={0.2}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.02"
                        />
                      </g>
                    )}

                    {item.category === 'sofa' && (
                      <g>
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={item.length}
                          rx={0.08}
                          fill={themeStyles.furnitureFill}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.03"
                        />
                        {/* Backrest */}
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={0.20}
                          height={item.length}
                          fill={themeStyles.furnitureStroke}
                          opacity={0.3}
                        />
                        {/* Armrests */}
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={0.15}
                          fill={themeStyles.furnitureStroke}
                          opacity={0.3}
                        />
                        <rect
                          x={-item.width / 2}
                          y={item.length / 2 - 0.15}
                          width={item.width}
                          height={0.15}
                          fill={themeStyles.furnitureStroke}
                          opacity={0.3}
                        />
                      </g>
                    )}

                    {item.category === 'table' && (
                      <g>
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={item.length}
                          rx={0.05}
                          fill={themeStyles.furnitureFill}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.03"
                        />
                        {/* Chairs around table */}
                        {item.length >= 1.2 && (
                          <>
                            <circle cx={-item.width / 2 - 0.18} cy={-0.3} r={0.15} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={-item.width / 2 - 0.18} cy={0.3} r={0.15} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={item.width / 2 + 0.18} cy={-0.3} r={0.15} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={item.width / 2 + 0.18} cy={0.3} r={0.15} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                          </>
                        )}
                      </g>
                    )}

                    {item.category === 'kitchen' && (
                      <g>
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={item.length}
                          fill={themeStyles.furnitureFill}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.03"
                        />
                        {/* Stove burners if counter */}
                        {item.name.includes('Mesada') && (
                          <g transform="translate(0, -0.4)">
                            <circle cx={-0.12} cy={-0.12} r={0.08} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={0.12} cy={-0.12} r={0.06} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={-0.12} cy={0.12} r={0.06} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <circle cx={0.12} cy={0.12} r={0.08} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                          </g>
                        )}
                      </g>
                    )}

                    {item.category === 'bathroom' && (
                      <g>
                        {item.name.includes('Inodoro') ? (
                          <g>
                            {/* Water tank */}
                            <rect x={-0.22} y={-0.35} width={0.44} height={0.20} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            {/* Bowl */}
                            <path
                              d="M -0.18 -0.15 C -0.22 0.15, 0.22 0.15, 0.18 -0.15 Z"
                              fill={themeStyles.furnitureFill}
                              stroke={themeStyles.furnitureStroke}
                              strokeWidth="0.02"
                            />
                          </g>
                        ) : item.name.includes('Lavamanos') || item.name.includes('Vanitorio') ? (
                          <g>
                            <rect x={-item.width / 2} y={-item.length / 2} width={item.width} height={item.length} fill={themeStyles.furnitureFill} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                            <ellipse cx={0} cy={0} rx={0.18} ry={0.25} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.02" />
                          </g>
                        ) : (
                          // Shower
                          <g>
                            <rect x={-item.width / 2} y={-item.length / 2} width={item.width} height={item.length} fill="none" stroke={themeStyles.furnitureStroke} strokeWidth="0.03" />
                            <line x1={-item.width / 2} y1={-item.length / 2} x2={item.width / 2} y2={item.length / 2} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" strokeDasharray="0.05, 0.05" />
                            <line x1={item.width / 2} y1={-item.length / 2} x2={-item.width / 2} y2={item.length / 2} stroke={themeStyles.furnitureStroke} strokeWidth="0.02" strokeDasharray="0.05, 0.05" />
                            <circle cx={0} cy={0} r={0.06} fill={themeStyles.furnitureStroke} />
                          </g>
                        )}
                      </g>
                    )}

                    {item.category === 'closet' && (
                      <g>
                        <rect
                          x={-item.width / 2}
                          y={-item.length / 2}
                          width={item.width}
                          height={item.length}
                          fill={themeStyles.furnitureFill}
                          stroke={themeStyles.furnitureStroke}
                          strokeWidth="0.03"
                        />
                        <line x1={-item.width / 2} y1={-item.length / 2} x2={item.width / 2} y2={item.length / 2} stroke={themeStyles.furnitureStroke} strokeWidth="0.015" />
                        <line x1={item.width / 2} y1={-item.length / 2} x2={-item.width / 2} y2={item.length / 2} stroke={themeStyles.furnitureStroke} strokeWidth="0.015" />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Escalera Frontal Derecha Detail */}
          <g id="stairs-detail-layer">
            {/* Box: X: 5.85 to 7.85, Y: 0.15 to 3.75 */}
            {/* 16 steps total: 8 steps up tramo 1, descanso, 8 steps up tramo 2 */}
            {/* Tramo 1 (X: 5.85 to 6.80) */}
            {Array.from({ length: 8 }).map((_, i) => {
              const yPos = 0.15 + i * 0.32;
              return (
                <g key={`step1_${i}`}>
                  <line
                    x1={5.85}
                    y1={yPos}
                    x2={6.80}
                    y2={yPos}
                    stroke={themeStyles.stairStroke}
                    strokeWidth="0.025"
                  />
                  <text
                    x={6.05}
                    y={yPos - 0.08}
                    fill={themeStyles.textSecondary}
                    fontSize="0.14"
                    fontFamily="monospace"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}

            {/* Descanso intermedio en Y = 2.71 a 3.75 */}
            <line x1={5.85} y1={2.71} x2={7.85} y2={2.71} stroke={themeStyles.stairStroke} strokeWidth="0.03" />

            {/* Tramo 2 (X: 6.90 to 7.85) */}
            {Array.from({ length: 8 }).map((_, i) => {
              const yPos = 2.71 - (i + 1) * 0.32;
              return (
                <g key={`step2_${i}`}>
                  <line
                    x1={6.90}
                    y1={yPos}
                    x2={7.85}
                    y2={yPos}
                    stroke={themeStyles.stairStroke}
                    strokeWidth="0.025"
                  />
                  <text
                    x={7.60}
                    y={yPos + 0.18}
                    fill={themeStyles.textSecondary}
                    fontSize="0.14"
                    fontFamily="monospace"
                  >
                    {16 - i}
                  </text>
                </g>
              );
            })}

            {/* Ojo de escalera / Baranda central */}
            <rect
              x={6.80}
              y={0.15}
              width={0.10}
              height={2.56}
              fill={themeStyles.stairStroke}
            />

            {/* Sube Direction Arrow Path */}
            <path
              d="M 6.35 0.35 L 6.35 3.20 L 7.35 3.20 L 7.35 3.75"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.04"
              markerEnd="url(#stairArrow)"
            />
            {/* Start circle */}
            <circle cx={6.35} cy={0.35} r={0.08} fill="#38bdf8" />
            <text
              x={6.35}
              y={1.8}
              textAnchor="middle"
              transform="rotate(90 6.35 1.8)"
              fill="#38bdf8"
              fontSize="0.22"
              fontWeight="700"
              letterSpacing="0.1em"
            >
              SUBE (1er al 2do Piso)
            </text>
            <text
              x={7.35}
              y={3.55}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="0.20"
              fontWeight="700"
            >
              LLEGADA 2° PISO
            </text>
          </g>

          {/* Circulation arrows & Independent Entries */}
          {layers.circulation && (
            <g id="circulation-layer" pointerEvents="none">
              {/* Common Hall path to Door 1 */}
              <path
                d="M 7.35 3.75 L 7.35 4.10 L 4.60 4.10"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.04"
                strokeDasharray="0.08, 0.05"
                markerEnd="url(#stairArrow)"
              />
              <text x={5.60} y={3.90} textAnchor="middle" fill="#10b981" fontSize="0.18" fontWeight="700">
                Acceso Dpto 1 ◄
              </text>

              {/* Common Hall path to Door 2 */}
              <path
                d="M 7.35 3.75 L 7.35 5.50 L 5.60 5.50 L 5.60 6.20"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.04"
                strokeDasharray="0.08, 0.05"
                markerEnd="url(#stairArrow)"
              />
              <text x={6.50} y={5.85} textAnchor="middle" fill="#f59e0b" fontSize="0.18" fontWeight="700">
                Acceso Dpto 2 ▼
              </text>
            </g>
          )}

          {/* Walls Layer (Structural Masonry) */}
          {layers.walls && (
            <g id="walls-layer">
              {currentWalls.map((wall) => {
                const isH = Math.abs(wall.start.y - wall.end.y) < 0.05;
                const minX = Math.min(wall.start.x, wall.end.x);
                const minY = Math.min(wall.start.y, wall.end.y);
                const length = isH ? Math.abs(wall.end.x - wall.start.x) : Math.abs(wall.end.y - wall.start.y);
                const w = isH ? length : wall.thickness;
                const h = isH ? wall.thickness : length;
                const posX = isH ? minX : minX - wall.thickness / 2;
                const posY = isH ? minY - wall.thickness / 2 : minY;

                return (
                  <rect
                    key={wall.id}
                    x={posX}
                    y={posY}
                    width={w}
                    height={h}
                    fill={themeStyles.wallFill}
                    stroke={themeStyles.wallStroke}
                    strokeWidth="0.02"
                  />
                );
              })}

              {/* Structural Columns (0.25 x 0.25) at key load points */}
              {[
                { x: 0.15, y: 0.15 },
                { x: 2.15, y: 0.15 },
                { x: 4.80, y: 0.15 },
                { x: 7.85, y: 0.15 },
                { x: 2.15, y: 3.75 },
                { x: 2.15, y: 6.20 },
                { x: 4.80, y: 6.20 },
                { x: 7.85, y: 6.20 },
                { x: 0.15, y: 10.60 },
                { x: 4.80, y: 10.60 },
                { x: 7.85, y: 10.60 },
                { x: 0.15, y: 14.85 },
                { x: 4.00, y: 14.85 },
                { x: 7.85, y: 14.85 },
              ].map((col, idx) => (
                <rect
                  key={`col_${idx}`}
                  x={col.x - 0.12}
                  y={col.y - 0.12}
                  width={0.24}
                  height={0.24}
                  fill={themeStyles.textPrimary}
                  stroke={themeStyles.wallStroke}
                  strokeWidth="0.02"
                />
              ))}
            </g>
          )}

          {/* Windows Layer */}
          {layers.windows && (
            <g id="windows-layer">
              {currentWindows.map((win) => {
                const isHorizontal = Math.abs(win.start.y - win.end.y) < 0.1;
                const minX = Math.min(win.start.x, win.end.x);
                const minY = Math.min(win.start.y, win.end.y);
                const w = isHorizontal ? win.width : 0.16;
                const h = isHorizontal ? 0.16 : win.width;

                return (
                  <g key={win.id} transform={`translate(${minX}, ${minY - 0.08})`}>
                    {/* Window Sill Cutout */}
                    <rect
                      x={0}
                      y={0}
                      width={w}
                      height={h}
                      fill={themeStyles.bg}
                      stroke="#38bdf8"
                      strokeWidth="0.03"
                    />
                    {/* Glass Glazing Double Line */}
                    {isHorizontal ? (
                      <>
                        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#38bdf8" strokeWidth="0.04" />
                        <line x1={0} y1={0.03} x2={w} y2={0.03} stroke="#64748b" strokeWidth="0.015" />
                        <line x1={0} y1={h - 0.03} x2={w} y2={h - 0.03} stroke="#64748b" strokeWidth="0.015" />
                      </>
                    ) : (
                      <>
                        <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#38bdf8" strokeWidth="0.04" />
                        <line x1={0.03} y1={0} x2={0.03} y2={h} stroke="#64748b" strokeWidth="0.015" />
                        <line x1={w - 0.03} y1={0} x2={w - 0.03} y2={h} stroke="#64748b" strokeWidth="0.015" />
                      </>
                    )}
                    {/* Window Code Badge */}
                    <rect
                      x={w / 2 - 0.3}
                      y={h / 2 - 0.15}
                      width={0.6}
                      height={0.3}
                      rx={0.06}
                      fill={themeStyles.bg}
                      stroke="#38bdf8"
                      strokeWidth="0.02"
                    />
                    <text
                      x={w / 2}
                      y={h / 2 + 0.07}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="0.18"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {win.code}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Doors Layer with swing arcs */}
          {layers.doors && (
            <g id="doors-layer">
              {currentDoors.map((door) => {
                const r = door.width;
                // Draw door leaf line and 90-degree swing arc
                return (
                  <g key={door.id} transform={`translate(${door.position.x}, ${door.position.y}) rotate(${door.rotation})`}>
                    {/* Frame stops */}
                    <rect x={-0.05} y={-0.05} width={0.1} height={0.1} fill={themeStyles.wallStroke} />
                    <rect x={r - 0.05} y={-0.05} width={0.1} height={0.1} fill={themeStyles.wallStroke} />

                    {/* Door Leaf (opened at 90°) */}
                    <rect
                      x={0}
                      y={door.swingDirection === 'right' ? -0.04 : -r}
                      width={door.swingDirection === 'right' ? 0.04 : 0.04}
                      height={r}
                      fill={themeStyles.wallStroke}
                    />

                    {/* Circular swing arc */}
                    <path
                      d={
                        door.swingDirection === 'right'
                          ? `M ${r} 0 A ${r} ${r} 0 0 0 0 ${-r}`
                          : `M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`
                      }
                      fill="none"
                      stroke={themeStyles.doorArc}
                      strokeWidth="0.02"
                      strokeDasharray="0.05, 0.03"
                    />

                    {/* Door Code Badge */}
                    <g transform={`translate(${r / 2}, ${door.swingDirection === 'right' ? -r / 2 : r / 2})`}>
                      <rect
                        x={-0.28}
                        y={-0.14}
                        width={0.56}
                        height={0.28}
                        rx={0.06}
                        fill={themeStyles.bg}
                        stroke={themeStyles.doorArc}
                        strokeWidth="0.02"
                      />
                      <text
                        x={0}
                        y={0.06}
                        textAnchor="middle"
                        fill={themeStyles.doorArc}
                        fontSize="0.16"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        {door.code}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Dimension Lines (Cotas Arquitectónicas) */}
          {layers.dimensions && (
            <g id="dimensions-layer" pointerEvents="none">
              {DIMENSIONS.map((dim) => {
                const isH = dim.orientation === 'horizontal';

                return (
                  <g key={dim.id}>
                    {/* Extension Witness Lines */}
                    {isH ? (
                      <>
                        <line x1={dim.start.x} y1={0} x2={dim.start.x} y2={dim.offset - 0.15} stroke={themeStyles.dimensionColor} strokeWidth="0.015" />
                        <line x1={dim.end.x} y1={0} x2={dim.end.x} y2={dim.offset - 0.15} stroke={themeStyles.dimensionColor} strokeWidth="0.015" />
                      </>
                    ) : (
                      <>
                        <line x1={dim.start.x > 5 ? LOT_WIDTH : 0} y1={dim.start.y} x2={dim.offset + (dim.offset > 5 ? 0.15 : -0.15)} y2={dim.start.y} stroke={themeStyles.dimensionColor} strokeWidth="0.015" />
                        <line x1={dim.end.x > 5 ? LOT_WIDTH : 0} y1={dim.end.y} x2={dim.offset + (dim.offset > 5 ? 0.15 : -0.15)} y2={dim.end.y} stroke={themeStyles.dimensionColor} strokeWidth="0.015" />
                      </>
                    )}

                    {/* Main Dimension Line */}
                    <line
                      x1={dim.start.x}
                      y1={isH ? dim.offset : dim.start.y}
                      x2={dim.end.x}
                      y2={isH ? dim.offset : dim.end.y}
                      stroke={themeStyles.dimensionColor}
                      strokeWidth="0.025"
                      markerStart="url(#dimArrow)"
                      markerEnd="url(#dimArrow)"
                    />

                    {/* Dimension Value Text */}
                    <text
                      x={isH ? (dim.start.x + dim.end.x) / 2 : dim.offset + (dim.offset > 5 ? 0.25 : -0.25)}
                      y={isH ? dim.offset - 0.08 : (dim.start.y + dim.end.y) / 2 + 0.08}
                      textAnchor="middle"
                      transform={!isH ? `rotate(-90 ${dim.offset + (dim.offset > 5 ? 0.25 : -0.25)} ${(dim.start.y + dim.end.y) / 2})` : undefined}
                      fill={themeStyles.dimensionColor}
                      fontSize={dim.level === 'total' ? '0.28' : '0.22'}
                      fontWeight={dim.level === 'total' ? '700' : '600'}
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {dim.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Interactive Measurement Line in measure mode */}
          {isMeasureMode && measurePointA && (
            <g pointerEvents="none">
              <circle cx={measurePointA.x} cy={measurePointA.y} r={0.12} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.03" />
              {measurePointB && (
                <>
                  <circle cx={measurePointB.x} cy={measurePointB.y} r={0.12} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.03" />
                  <line
                    x1={measurePointA.x}
                    y1={measurePointA.y}
                    x2={measurePointB.x}
                    y2={measurePointB.y}
                    stroke="#f59e0b"
                    strokeWidth="0.06"
                    strokeDasharray="0.1, 0.05"
                  />
                  <g transform={`translate(${(measurePointA.x + measurePointB.x) / 2}, ${(measurePointA.y + measurePointB.y) / 2 - 0.2})`}>
                    <rect x={-0.6} y={-0.2} width={1.2} height={0.4} rx={0.08} fill="#0f172a" stroke="#f59e0b" strokeWidth="0.03" />
                    <text x={0} y={0.08} textAnchor="middle" fill="#f59e0b" fontSize="0.24" fontFamily="monospace" fontWeight="bold">
                      {measuredDistance} m
                    </text>
                  </g>
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Floating Hover Tooltip if hovering a room */}
      {hoveredRoom && !selectedRoom && (
        <div className="absolute bottom-5 left-5 z-20 bg-slate-900/95 text-white p-3 rounded-lg border border-slate-700 shadow-xl max-w-xs pointer-events-none text-xs">
          <div className="font-bold text-sky-400 text-sm">{hoveredRoom.name}</div>
          <div className="text-slate-400 font-mono mt-0.5">{hoveredRoom.dimensions} · {hoveredRoom.area.toFixed(2)} m²</div>
          <div className="text-slate-300 mt-1">{hoveredRoom.apartmentName}</div>
          <div className="text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="text-amber-400 font-medium">Ventilación:</span> {hoveredRoom.ventilation}
          </div>
        </div>
      )}
    </div>
  );
};
