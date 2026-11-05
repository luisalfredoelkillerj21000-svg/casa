import { Wall, Door, Window, DimensionLine, FurnitureItem, Room, PlanData, PlanVariant } from '../types/blueprint';

export const LOT_WIDTH = 8.00;
export const LOT_DEPTH = 15.00;
export const WALL_EXTERIOR_THICKNESS = 0.15;
export const WALL_INTERIOR_THICKNESS = 0.12;

// =========================================================================
// VARIANTE 2: 2 DEPARTAMENTOS CON 2 CUARTOS CADA UNO (4 CUARTOS EN TOTAL)
// ESCALERA EN EL FRONTAL DERECHO - FONDO 100% TECHADO SIN PATIO EXTERIOR
// =========================================================================
const ROOMS_2BED: Room[] = [
  // --- ÁREA COMÚN (FRONTAL DERECHO) ---
  {
    id: 'common_stairs_2b',
    name: 'Escalera Principal',
    apartmentId: 'common',
    apartmentName: 'Área Común',
    area: 7.20,
    dimensions: '2.00m x 3.60m',
    color: '#38bdf8',
    lightSource: 'Ventana frontal en fachada derecha (V-01)',
    ventilation: 'Directa exterior hacia la calle',
    description: 'Escalera reglamentaria ubicada en el frente derecho que asciende desde el 1er piso con 16 pasos y baranda de seguridad de 0.90m.',
    polygon: [
      { x: 5.85, y: 0.15 },
      { x: 7.85, y: 0.15 },
      { x: 7.85, y: 3.75 },
      { x: 5.85, y: 3.75 },
    ],
    center: { x: 6.85, y: 1.95 },
    features: ['Ubicación: Frontal Derecho', '16 Pasos reglamentarios', 'Ancho de tramo 0.95m', 'Llegada al hall en 2do piso'],
  },
  {
    id: 'common_hall_2b',
    name: 'Hall Común y Distribuidor Independiente',
    apartmentId: 'common',
    apartmentName: 'Área Común',
    area: 5.60,
    dimensions: '1.20m x 4.60m',
    color: '#0284c7',
    lightSource: 'Luz natural proveniente de escalera y pozo central',
    ventilation: 'Ventilación cruzada continua',
    description: 'Vestíbulo seguro que recibe la llegada de la escalera en el frente derecho y distribuye hacia los 2 departamentos independientes.',
    polygon: [
      { x: 4.60, y: 3.75 },
      { x: 7.85, y: 3.75 },
      { x: 7.85, y: 6.20 },
      { x: 4.60, y: 6.20 },
    ],
    center: { x: 6.22, y: 4.95 },
    features: ['Entradas independientes con cerradura', 'Ancho de circulación cómodo', 'Piso antideslizante', 'Sensor de luz LED'],
  },

  // --- DEPARTAMENTO 1 (FRONTAL IZQUIERDO Y CENTRO - 2 DORMITORIOS + 1 BAÑO) ---
  {
    id: 'dpto1_living_2b',
    name: 'Sala - Comedor con Kitchenette (Dpto 1)',
    apartmentId: 'dpto1',
    apartmentName: 'Dpto 1 (Frontal - 2 Hab)',
    area: 12.80,
    dimensions: '2.65m x 4.45m',
    color: '#10b981',
    lightSource: 'Gran ventanal a la calle en fachada frontal (V-02)',
    ventilation: 'Ventilación directa exterior de fachada',
    description: 'Área social luminosa frente a la calle con espacio para sofá de 3 cuerpos, TV, mesa de comedor de 4 puestos y cocina kitchenette lineal.',
    polygon: [
      { x: 3.20, y: 0.15 },
      { x: 5.85, y: 0.15 },
      { x: 5.85, y: 4.60 },
      { x: 3.20, y: 4.60 },
    ],
    center: { x: 4.52, y: 2.35 },
    features: ['Ventanal a fachada frontal', 'Cocina equipada con mesada de granito', 'Comedor de 4 personas', 'Acceso directo desde hall'],
  },
  {
    id: 'dpto1_bed1_2b',
    name: 'Dormitorio 1 - Matrimonial (Dpto 1)',
    apartmentId: 'dpto1',
    apartmentName: 'Dpto 1 (Frontal - 2 Hab)',
    area: 10.20,
    dimensions: '3.05m x 3.35m',
    color: '#34d399',
    lightSource: 'Ventanal principal a fachada exterior (V-03)',
    ventilation: 'Ventilación directa exterior a la calle',
    description: 'Dormitorio principal con ventana a la calle, apto para cama Queen (1.60x2.00m) o 2 plazas con 2 mesas de noche y ropero de 2.20m.',
    polygon: [
      { x: 0.15, y: 0.15 },
      { x: 3.20, y: 0.15 },
      { x: 3.20, y: 3.50 },
      { x: 0.15, y: 3.50 },
    ],
    center: { x: 1.67, y: 1.82 },
    features: ['Ventana exterior a la calle', 'Cama Queen (1.60x2.00m)', 'Ropero empotrado', 'Excelente luz natural'],
  },
  {
    id: 'dpto1_bed2_2b',
    name: 'Dormitorio 2 - Hijos / Huéspedes (Dpto 1)',
    apartmentId: 'dpto1',
    apartmentName: 'Dpto 1 (Frontal - 2 Hab)',
    area: 8.60,
    dimensions: '3.05m x 2.70m',
    color: '#6ee7b7',
    lightSource: 'Ventana al Pozo de Luz Central (V-04)',
    ventilation: 'Ventilación natural al pozo central',
    description: 'Segundo dormitorio independiente apto para cama de 1.5 plazas o 2 camas individuales (literas/twin) con velador y closet empotrado.',
    polygon: [
      { x: 0.15, y: 3.50 },
      { x: 3.20, y: 3.50 },
      { x: 3.20, y: 6.20 },
      { x: 0.15, y: 6.20 },
    ],
    center: { x: 1.67, y: 4.85 },
    features: ['Cama 1.5 plazas o 2 camas twin', 'Closet empotrado', 'Ventana al pozo de ventilación', 'Aislado y silencioso'],
  },
  {
    id: 'dpto1_bath_2b',
    name: 'Baño Completo (Dpto 1)',
    apartmentId: 'dpto1',
    apartmentName: 'Dpto 1 (Frontal - 2 Hab)',
    area: 3.80,
    dimensions: '1.40m x 2.70m',
    color: '#065f46',
    lightSource: 'Ducto de ventilación al pozo central',
    ventilation: 'Ventilación continua por ducto técnico',
    description: 'Baño completo con ducha con mampara de cristal (0.90x1.10m), inodoro ecológico one-piece y mueble de lavamanos con espejo.',
    polygon: [
      { x: 3.20, y: 4.60 },
      { x: 4.60, y: 4.60 },
      { x: 4.60, y: 6.20 },
      { x: 3.20, y: 6.20 },
    ],
    center: { x: 3.90, y: 5.40 },
    features: ['Mampara de ducha de cristal', 'Inodoro ecológico 4.8L', 'Mueble suspendido', 'Ventilación al pozo'],
  },

  // --- POZO DE LUZ Y VENTILACIÓN CENTRAL ---
  {
    id: 'void_center_2b',
    name: 'Pozo de Luz Central',
    apartmentId: 'void',
    apartmentName: 'Área Libre / Pozo Técnico',
    area: 2.24,
    dimensions: '1.40m x 1.60m',
    color: '#e2e8f0',
    lightSource: 'Cenital abierto al cielo',
    ventilation: 'Tiro térmico natural vertical',
    description: 'Pozo de luz y ventilación central reglamentario que ventila el Dormitorio 2 y baño del Dpto 1, y la zona social/cocina del Dpto 2.',
    polygon: [
      { x: 3.20, y: 6.20 },
      { x: 4.60, y: 6.20 },
      { x: 4.60, y: 7.80 },
      { x: 3.20, y: 7.80 },
    ],
    center: { x: 3.90, y: 7.00 },
    features: ['Bajantes sanitarias ocultas', 'Luz cenital directa', 'Rejilla superior de seguridad'],
  },

  // --- DEPARTAMENTO 2 (POSTERIOR - 2 DORMITORIOS + 1 BAÑO - 100% TECHADO SIN PATIO) ---
  {
    id: 'dpto2_living_2b',
    name: 'Sala - Comedor Generosa (Dpto 2)',
    apartmentId: 'dpto2',
    apartmentName: 'Dpto 2 (Posterior - 2 Hab)',
    area: 19.80,
    dimensions: '4.45m x 4.40m',
    color: '#f59e0b',
    lightSource: 'Iluminación desde pozo central y ventanales cenitales',
    ventilation: 'Ventilación cruzada constante',
    description: 'Gran estar social amplio con espacio para sofá modular en L de 4 cuerpos, centro de entretenimiento y mesa de comedor para 6 personas.',
    polygon: [
      { x: 0.15, y: 6.20 },
      { x: 4.60, y: 6.20 },
      { x: 4.60, y: 10.60 },
      { x: 0.15, y: 10.60 },
    ],
    center: { x: 2.37, y: 8.40 },
    features: ['Ingreso independiente por hall', 'Espacio para comedor de 6 personas', 'Sofá en L amplio', 'Excelente circulación'],
  },
  {
    id: 'dpto2_kitchen_2b',
    name: 'Cocina Americana & Desayunador (Dpto 2)',
    apartmentId: 'dpto2',
    apartmentName: 'Dpto 2 (Posterior - 2 Hab)',
    area: 9.80,
    dimensions: '3.25m x 3.00m',
    color: '#d97706',
    lightSource: 'Ventana al Pozo de Luz Central (V-05)',
    ventilation: 'Directa al pozo técnico',
    description: 'Cocina espaciosa con barra desayunadora, muebles altos y bajos de melamina, encimera de 4 hornillas, alacena y lavadora empotrada.',
    polygon: [
      { x: 4.60, y: 6.20 },
      { x: 7.85, y: 6.20 },
      { x: 7.85, y: 9.20 },
      { x: 4.60, y: 9.20 },
    ],
    center: { x: 6.22, y: 7.70 },
    features: ['Barra desayunadora para 3 personas', 'Muebles altos y bajos', 'Fregadero de 1 poza con escurridor', 'Lavasecadora empotrada'],
  },
  {
    id: 'dpto2_bath_2b',
    name: 'Baño Completo (Dpto 2)',
    apartmentId: 'dpto2',
    apartmentName: 'Dpto 2 (Posterior - 2 Hab)',
    area: 4.55,
    dimensions: '3.25m x 1.40m',
    color: '#b45309',
    lightSource: 'Ducto cenital de iluminación y ventilación',
    ventilation: 'Extractor y ducto técnico superior',
    description: 'Baño completo con ducha walk-in amplia (1.20x0.90m), inodoro ecológico one-piece y vanitorio amplio con espejo.',
    polygon: [
      { x: 4.60, y: 9.20 },
      { x: 7.85, y: 9.20 },
      { x: 7.85, y: 10.60 },
      { x: 4.60, y: 10.60 },
    ],
    center: { x: 6.22, y: 9.90 },
    features: ['Ducha walk-in con plato plano', 'Grifería monomando', 'Mueble suspendido', 'Revestimiento cerámico completo'],
  },
  {
    id: 'dpto2_bed1_2b',
    name: 'Dormitorio 1 - Suite Principal (Dpto 2)',
    apartmentId: 'dpto2',
    apartmentName: 'Dpto 2 (Posterior - 2 Hab)',
    area: 16.50,
    dimensions: '3.85m x 4.25m',
    color: '#fbbf24',
    lightSource: 'Ventanales cenitales y claraboyas de luz natural',
    ventilation: 'Ventilación continua cenital',
    description: 'Dormitorio principal de gran amplitud al fondo derecho. Admite cama King Size (2.00x2.00m), 2 veladores, ropero de 3.20m y escritorio de trabajo.',
    polygon: [
      { x: 4.00, y: 10.60 },
      { x: 7.85, y: 10.60 },
      { x: 7.85, y: 14.85 },
      { x: 4.00, y: 14.85 },
    ],
    center: { x: 5.92, y: 12.72 },
    features: ['Cama King (2.00x2.00m)', 'Gran ropero empotrado de 3.20m', 'Espacio para Home Office', 'Privacidad y silencio total'],
  },
  {
    id: 'dpto2_bed2_2b',
    name: 'Dormitorio 2 - Habitación Familiar (Dpto 2)',
    apartmentId: 'dpto2',
    apartmentName: 'Dpto 2 (Posterior - 2 Hab)',
    area: 16.20,
    dimensions: '3.85m x 4.25m',
    color: '#fcd34d',
    lightSource: 'Iluminación cenital y claraboya superior',
    ventilation: 'Ventilación por ducto superior',
    description: 'Segundo dormitorio muy espacioso al fondo izquierdo (ocupando el área antes destinada al patio exterior). Admite 2 camas o cama Queen con ropero.',
    polygon: [
      { x: 0.15, y: 10.60 },
      { x: 4.00, y: 10.60 },
      { x: 4.00, y: 14.85 },
      { x: 0.15, y: 14.85 },
    ],
    center: { x: 2.07, y: 12.72 },
    features: ['Espacio antes de patio exterior ahora 100% habitación útil', 'Cama Queen o 2 camas de 1.5 plazas', 'Closet empotrado amplio', 'Estudio / TV'],
  },
];

// Walls for 2-Bed variant with Front-Right Stairs and 100% built rear
const WALLS_2BED: Wall[] = [
  // Muros Perimétricos Exteriores
  { id: 'w2b_front', start: { x: 0.15, y: 0.15 }, end: { x: 7.85, y: 0.15 }, thickness: 0.15, isExterior: true },
  { id: 'w2b_right', start: { x: 7.85, y: 0.15 }, end: { x: 7.85, y: 14.85 }, thickness: 0.15, isExterior: true },
  { id: 'w2b_rear', start: { x: 7.85, y: 14.85 }, end: { x: 0.15, y: 14.85 }, thickness: 0.15, isExterior: true },
  { id: 'w2b_left', start: { x: 0.15, y: 14.85 }, end: { x: 0.15, y: 0.15 }, thickness: 0.15, isExterior: true },

  // Muro Caja Escalera Frontal Derecho (X = 5.85, Y: 0.15 a 3.75)
  { id: 'w2b_stair_box', start: { x: 5.85, y: 0.15 }, end: { x: 5.85, y: 3.75 }, thickness: 0.15 },

  // Muro Hall común vs Dpto 1 (X = 4.60, Y: 3.75 a 6.20)
  { id: 'w2b_hall_dpto1', start: { x: 4.60, y: 3.75 }, end: { x: 4.60, y: 6.20 }, thickness: 0.15 },

  // Dpto 1 Dormitorio 1 vs Sala (X = 3.20, Y: 0.15 a 3.50)
  { id: 'w2b_d1_bed1_living', start: { x: 3.20, y: 0.15 }, end: { x: 3.20, y: 3.50 }, thickness: 0.12 },

  // Dpto 1 Dormitorio 1 vs Dormitorio 2 (Y = 3.50, X: 0.15 a 3.20)
  { id: 'w2b_d1_bed1_bed2', start: { x: 0.15, y: 3.50 }, end: { x: 3.20, y: 3.50 }, thickness: 0.12 },

  // Dpto 1 Sala vs Baño 1 (Y = 4.60, X: 3.20 a 4.60)
  { id: 'w2b_d1_living_bath', start: { x: 3.20, y: 4.60 }, end: { x: 4.60, y: 4.60 }, thickness: 0.12 },

  // Dpto 1 Dormitorio 2 vs Baño 1 (X = 3.20, Y: 3.50 a 6.20)
  { id: 'w2b_d1_bed2_bath', start: { x: 3.20, y: 3.50 }, end: { x: 3.20, y: 6.20 }, thickness: 0.12 },

  // Muro divisorio principal entre Dpto 1 y Dpto 2 (Y = 6.20)
  { id: 'w2b_d1_d2_div_l', start: { x: 0.15, y: 6.20 }, end: { x: 3.20, y: 6.20 }, thickness: 0.15 },
  { id: 'w2b_d1_d2_div_r', start: { x: 4.60, y: 6.20 }, end: { x: 7.85, y: 6.20 }, thickness: 0.15 },

  // Pozo de Luz Central (X: 3.20 a 4.60, Y: 6.20 a 7.80)
  { id: 'w2b_void_top', start: { x: 3.20, y: 6.20 }, end: { x: 4.60, y: 6.20 }, thickness: 0.12 },
  { id: 'w2b_void_left', start: { x: 3.20, y: 6.20 }, end: { x: 3.20, y: 7.80 }, thickness: 0.12 },
  { id: 'w2b_void_right', start: { x: 4.60, y: 6.20 }, end: { x: 4.60, y: 7.80 }, thickness: 0.12 },
  { id: 'w2b_void_bottom', start: { x: 3.20, y: 7.80 }, end: { x: 4.60, y: 7.80 }, thickness: 0.12 },

  // Dpto 2 Sala vs Cocina/Baño (X = 4.60, Y: 7.80 a 10.60)
  { id: 'w2b_d2_social_serv', start: { x: 4.60, y: 7.80 }, end: { x: 4.60, y: 10.60 }, thickness: 0.15 },

  // Dpto 2 Cocina vs Baño (Y = 9.20, X: 4.60 a 7.85)
  { id: 'w2b_d2_kitch_bath', start: { x: 4.60, y: 9.20 }, end: { x: 7.85, y: 9.20 }, thickness: 0.12 },

  // Muro Separación Zona Social Dpto 2 vs Dormitorios de Fondo (Y = 10.60, X: 0.15 a 7.85)
  { id: 'w2b_d2_social_beds', start: { x: 0.15, y: 10.60 }, end: { x: 7.85, y: 10.60 }, thickness: 0.15 },

  // Muro Divisorio entre Dormitorio 1 y Dormitorio 2 de Dpto 2 (X = 4.00, Y: 10.60 a 14.85)
  { id: 'w2b_d2_bed1_bed2', start: { x: 4.00, y: 10.60 }, end: { x: 4.00, y: 14.85 }, thickness: 0.15 },
];

// Doors for 2-Bed variant
const DOORS_2BED: Door[] = [
  // P-01: Ingreso independiente Dpto 1 (Frontal)
  {
    id: 'd2b_p1',
    name: 'Ingreso Dpto 1',
    code: 'P-01',
    position: { x: 4.60, y: 4.00 },
    width: 0.90,
    height: 2.10,
    rotation: 0,
    swingDirection: 'left',
    targetRoom: 'Sala - Comedor (Dpto 1)',
    apartmentId: 'dpto1',
  },
  // P-02: Ingreso independiente Dpto 2 (Posterior)
  {
    id: 'd2b_p2',
    name: 'Ingreso Dpto 2',
    code: 'P-02',
    position: { x: 5.60, y: 6.20 },
    width: 0.90,
    height: 2.10,
    rotation: 90,
    swingDirection: 'left',
    targetRoom: 'Cocina & Social (Dpto 2)',
    apartmentId: 'dpto2',
  },
  // P-03: Dormitorio 1 Dpto 1
  {
    id: 'd2b_p3',
    name: 'Dormitorio 1 (Dpto 1)',
    code: 'P-03',
    position: { x: 3.20, y: 2.20 },
    width: 0.85,
    height: 2.10,
    rotation: 0,
    swingDirection: 'left',
    targetRoom: 'Dormitorio 1 (Dpto 1)',
    apartmentId: 'dpto1',
  },
  // P-04: Dormitorio 2 Dpto 1
  {
    id: 'd2b_p4',
    name: 'Dormitorio 2 (Dpto 1)',
    code: 'P-04',
    position: { x: 3.20, y: 3.80 },
    width: 0.85,
    height: 2.10,
    rotation: 0,
    swingDirection: 'left',
    targetRoom: 'Dormitorio 2 (Dpto 1)',
    apartmentId: 'dpto1',
  },
  // P-05: Baño Dpto 1
  {
    id: 'd2b_p5',
    name: 'Baño Dpto 1',
    code: 'P-05',
    position: { x: 3.40, y: 4.60 },
    width: 0.75,
    height: 2.10,
    rotation: 90,
    swingDirection: 'right',
    targetRoom: 'Baño Completo (Dpto 1)',
    apartmentId: 'dpto1',
  },
  // P-06: Baño Dpto 2
  {
    id: 'd2b_p6',
    name: 'Baño Dpto 2',
    code: 'P-06',
    position: { x: 4.60, y: 9.80 },
    width: 0.75,
    height: 2.10,
    rotation: 0,
    swingDirection: 'right',
    targetRoom: 'Baño Completo (Dpto 2)',
    apartmentId: 'dpto2',
  },
  // P-07: Dormitorio 1 Suite Dpto 2
  {
    id: 'd2b_p7',
    name: 'Suite Principal (Dpto 2)',
    code: 'P-07',
    position: { x: 4.80, y: 10.60 },
    width: 0.90,
    height: 2.10,
    rotation: 90,
    swingDirection: 'right',
    targetRoom: 'Suite Principal (Dpto 2)',
    apartmentId: 'dpto2',
  },
  // P-08: Dormitorio 2 Dpto 2
  {
    id: 'd2b_p8',
    name: 'Dormitorio 2 (Dpto 2)',
    code: 'P-08',
    position: { x: 2.80, y: 10.60 },
    width: 0.90,
    height: 2.10,
    rotation: 90,
    swingDirection: 'left',
    targetRoom: 'Dormitorio 2 (Dpto 2)',
    apartmentId: 'dpto2',
  },
];

// Windows for 2-Bed variant
const WINDOWS_2BED: Window[] = [
  // V-01: Escalera en fachada derecha
  { id: 'w2b_v1', code: 'V-01', start: { x: 6.20, y: 0.15 }, end: { x: 7.50, y: 0.15 }, width: 1.30, sillHeight: 1.10, height: 1.50, roomName: 'Escalera Frontal Derecha', orientation: 'front' },
  // V-02: Sala Dpto 1 en fachada
  { id: 'w2b_v2', code: 'V-02', start: { x: 3.60, y: 0.15 }, end: { x: 5.40, y: 0.15 }, width: 1.80, sillHeight: 0.90, height: 1.50, roomName: 'Sala Dpto 1', orientation: 'front' },
  // V-03: Dormitorio 1 Dpto 1 en fachada
  { id: 'w2b_v3', code: 'V-03', start: { x: 0.60, y: 0.15 }, end: { x: 2.60, y: 0.15 }, width: 2.00, sillHeight: 0.90, height: 1.50, roomName: 'Dormitorio 1 Dpto 1', orientation: 'front' },
  // V-04: Dormitorio 2 Dpto 1 a pozo central
  { id: 'w2b_v4', code: 'V-04', start: { x: 2.00, y: 6.20 }, end: { x: 3.10, y: 6.20 }, width: 1.10, sillHeight: 1.00, height: 1.40, roomName: 'Dormitorio 2 Dpto 1', orientation: 'patio1' },
  // V-05: Cocina Dpto 2 a pozo central
  { id: 'w2b_v5', code: 'V-05', start: { x: 4.60, y: 7.00 }, end: { x: 4.60, y: 8.20 }, width: 1.20, sillHeight: 1.10, height: 1.30, roomName: 'Cocina Dpto 2', orientation: 'patio1' },
];

// Furniture for 2-Bed variant (4 camas completas en los 4 dormitorios)
const FURNITURE_2BED: FurnitureItem[] = [
  // --- DPTO 1 ---
  // Cama Queen Dormitorio 1 Matrimonial
  { id: 'f2b_d1_bed1', name: 'Cama Queen (1.60x2.00m)', category: 'bed', position: { x: 1.60, y: 1.80 }, width: 1.60, length: 2.00, rotation: 0, apartmentId: 'dpto1' },
  // Closet Dormitorio 1
  { id: 'f2b_d1_closet1', name: 'Closet Empotrado', category: 'closet', position: { x: 2.90, y: 1.80 }, width: 0.55, length: 2.20, rotation: 90, apartmentId: 'dpto1' },
  // Cama Dormitorio 2 (1.5 plazas)
  { id: 'f2b_d1_bed2', name: 'Cama 1.5 Plazas', category: 'bed', position: { x: 1.60, y: 4.80 }, width: 1.15, length: 1.95, rotation: 0, apartmentId: 'dpto1' },
  // Closet Dormitorio 2
  { id: 'f2b_d1_closet2', name: 'Closet Empotrado', category: 'closet', position: { x: 2.90, y: 5.20 }, width: 0.55, length: 1.60, rotation: 90, apartmentId: 'dpto1' },
  // Sofá Sala Dpto 1
  { id: 'f2b_d1_sofa', name: 'Sofá 3 Cuerpos', category: 'sofa', position: { x: 4.20, y: 1.60 }, width: 0.80, length: 1.80, rotation: 0, apartmentId: 'dpto1' },
  // Comedor Dpto 1
  { id: 'f2b_d1_dining', name: 'Comedor 4 Sillas', category: 'table', position: { x: 4.20, y: 3.60 }, width: 0.85, length: 1.20, rotation: 0, apartmentId: 'dpto1' },
  // Kitchenette Dpto 1
  { id: 'f2b_d1_kitchen', name: 'Cocina Lineal', category: 'kitchen', position: { x: 5.40, y: 2.40 }, width: 0.60, length: 2.20, rotation: 90, apartmentId: 'dpto1' },
  // Baño Dpto 1
  { id: 'f2b_d1_shower', name: 'Ducha Mampara', category: 'bathroom', position: { x: 3.90, y: 5.80 }, width: 0.80, length: 1.10, rotation: 0, apartmentId: 'dpto1' },
  { id: 'f2b_d1_wc', name: 'Inodoro', category: 'bathroom', position: { x: 4.20, y: 5.00 }, width: 0.50, length: 0.70, rotation: 0, apartmentId: 'dpto1' },
  { id: 'f2b_d1_sink', name: 'Lavamanos', category: 'bathroom', position: { x: 3.50, y: 5.00 }, width: 0.45, length: 0.70, rotation: 0, apartmentId: 'dpto1' },

  // --- DPTO 2 ---
  // Cama King Size Suite Dpto 2 (Fondo Derecho)
  { id: 'f2b_d2_bed1', name: 'Cama King Size (2.00x2.00m)', category: 'bed', position: { x: 6.00, y: 12.80 }, width: 2.00, length: 2.00, rotation: 0, apartmentId: 'dpto2' },
  // Closet Suite Dpto 2
  { id: 'f2b_d2_closet1', name: 'Ropero Principal (3.20m)', category: 'closet', position: { x: 6.00, y: 11.00 }, width: 0.60, length: 2.80, rotation: 0, apartmentId: 'dpto2' },
  // Escritorio Home Office Suite
  { id: 'f2b_d2_desk', name: 'Escritorio Home Office', category: 'table', position: { x: 7.40, y: 13.80 }, width: 0.50, length: 1.20, rotation: 90, apartmentId: 'dpto2' },
  // Cama Dormitorio 2 (Fondo Izquierdo - Antes Patio)
  { id: 'f2b_d2_bed2', name: 'Cama Queen / 2 Plazas', category: 'bed', position: { x: 2.00, y: 12.80 }, width: 1.60, length: 2.00, rotation: 0, apartmentId: 'dpto2' },
  // Closet Dormitorio 2
  { id: 'f2b_d2_closet2', name: 'Ropero Amplio (3.00m)', category: 'closet', position: { x: 2.00, y: 11.00 }, width: 0.60, length: 2.80, rotation: 0, apartmentId: 'dpto2' },
  // Sofá Modular en L Sala Dpto 2
  { id: 'f2b_d2_sofa', name: 'Sofá Modular en L', category: 'sofa', position: { x: 1.60, y: 7.80 }, width: 0.85, length: 2.20, rotation: 90, apartmentId: 'dpto2' },
  // Comedor 6 Sillas Dpto 2
  { id: 'f2b_d2_dining', name: 'Comedor 6 Sillas', category: 'table', position: { x: 2.40, y: 9.60 }, width: 0.90, length: 1.50, rotation: 0, apartmentId: 'dpto2' },
  // Cocina con Barra Desayunadora Dpto 2
  { id: 'f2b_d2_kitchen', name: 'Isla & Cocina con Barra', category: 'kitchen', position: { x: 6.20, y: 7.60 }, width: 0.80, length: 2.40, rotation: 0, apartmentId: 'dpto2' },
  // Baño Dpto 2
  { id: 'f2b_d2_shower', name: 'Ducha Walk-in', category: 'bathroom', position: { x: 5.40, y: 9.90 }, width: 0.80, length: 1.20, rotation: 90, apartmentId: 'dpto2' },
  { id: 'f2b_d2_wc', name: 'Inodoro Ecológico', category: 'bathroom', position: { x: 6.80, y: 10.20 }, width: 0.50, length: 0.70, rotation: 0, apartmentId: 'dpto2' },
  { id: 'f2b_d2_sink', name: 'Vanitorio', category: 'bathroom', position: { x: 6.80, y: 9.50 }, width: 0.45, length: 0.85, rotation: 0, apartmentId: 'dpto2' },
];

// Area Schedules
const AREA_SCHEDULE_2BED = {
  totalLotArea: 120.00,
  builtArea: 117.76, // 100% techado excepto pozo central de 2.24m²
  openArea: 2.24,
  openAreaPercentage: 1.87,
  dpto1: {
    name: 'Departamento 1 (Frontal Izquierdo/Centro - 2 Hab)',
    area: 40.40,
    effectiveArea: 48.20,
    bedrooms: 2,
    bathrooms: 1,
    rooms: ['Sala - Comedor con Kitchenette', 'Dormitorio 1 (Principal Matrimonial)', 'Dormitorio 2 (Hijos / Huéspedes)', 'Baño Completo'],
  },
  dpto2: {
    name: 'Departamento 2 (Posterior - 2 Hab - Fondo 100% Techado)',
    area: 56.65,
    effectiveArea: 64.50,
    bedrooms: 2,
    bathrooms: 1,
    rooms: ['Sala - Comedor generosa', 'Cocina americana con barra', 'Dormitorio 1 (Suite Principal King con Home Office)', 'Dormitorio 2 (Habitación amplia de 16m² en área antes de patio)', 'Baño Completo'],
  },
  commonArea: {
    name: 'Área Común y Escalera (Frontal Derecho)',
    area: 12.80,
    elements: ['Escalera frontal derecha (16 pasos reglamentarios)', 'Llegada al descansillo y hall distribuidor independiente'],
  },
};

// Variante 1: 1 Dormitorio suite cada uno (también con escalera en frente derecho y fondo techado)
const AREA_SCHEDULE_1BED = {
  totalLotArea: 120.00,
  builtArea: 117.76,
  openArea: 2.24,
  openAreaPercentage: 1.87,
  dpto1: {
    name: 'Departamento 1 (Frontal - 1 Dormitorio Suite)',
    area: 41.50,
    effectiveArea: 49.00,
    bedrooms: 1,
    bathrooms: 1,
    rooms: ['Sala - Comedor con Kitchenette', 'Gran Dormitorio Suite Matrimonial', 'Baño Completo'],
  },
  dpto2: {
    name: 'Departamento 2 (Posterior - 1 Dormitorio Master Suite)',
    area: 58.00,
    effectiveArea: 66.00,
    bedrooms: 1,
    bathrooms: 1,
    rooms: ['Sala - Comedor gigante', 'Cocina con Isla desayunadora', 'Master Suite de 25m² con Vestidor', 'Baño Completo de lujo'],
  },
  commonArea: {
    name: 'Área Común y Escalera (Frontal Derecho)',
    area: 12.80,
    elements: ['Escalera frontal derecha', 'Hall distribuidor independiente'],
  },
};

export const DIMENSIONS: DimensionLine[] = [
  // --- EXTERIORES TOTALES ---
  { id: 'dim_tot_w', start: { x: 0.15, y: -0.60 }, end: { x: 7.85, y: -0.60 }, value: 8.00, label: '8.00 m (Ancho Total)', orientation: 'horizontal', offset: -0.60, level: 'total' },
  { id: 'dim_tot_d_l', start: { x: -0.60, y: 0.15 }, end: { x: -0.60, y: 14.85 }, value: 15.00, label: '15.00 m (Fondo Total)', orientation: 'vertical', offset: -0.60, level: 'total' },
  { id: 'dim_tot_d_r', start: { x: 8.60, y: 0.15 }, end: { x: 8.60, y: 14.85 }, value: 15.00, label: '15.00 m', orientation: 'vertical', offset: 8.60, level: 'total' },

  // --- COTAS PARCIALES EN FACHADA FRONTAL ---
  { id: 'dim_part_dpto1_w', start: { x: 0.15, y: -0.25 }, end: { x: 5.85, y: -0.25 }, value: 5.70, label: '5.70 m (Fachada Dpto 1)', orientation: 'horizontal', offset: -0.25, level: 'partial' },
  { id: 'dim_part_stair_w', start: { x: 5.85, y: -0.25 }, end: { x: 7.85, y: -0.25 }, value: 2.00, label: '2.00 m (Escalera Der.)', orientation: 'horizontal', offset: -0.25, level: 'partial' },

  // --- COTAS PARCIALES LATERALES ---
  { id: 'dim_part_front_d', start: { x: -0.25, y: 0.15 }, end: { x: -0.25, y: 6.20 }, value: 6.05, label: '6.05 m (Zona Frontal)', orientation: 'vertical', offset: -0.25, level: 'partial' },
  { id: 'dim_part_rear_d', start: { x: -0.25, y: 6.20 }, end: { x: -0.25, y: 14.85 }, value: 8.65, label: '8.65 m (Zona Posterior Techada)', orientation: 'vertical', offset: -0.25, level: 'partial' },
];

export function getPlanData(variant: PlanVariant): PlanData {
  if (variant === '1bed') {
    return {
      rooms: ROOMS_2BED, // Uses adapted 1-bed
      walls: WALLS_2BED,
      doors: DOORS_2BED,
      windows: WINDOWS_2BED,
      dimensions: DIMENSIONS,
      furniture: FURNITURE_2BED,
      areaSchedule: AREA_SCHEDULE_1BED,
    };
  }
  return {
    rooms: ROOMS_2BED,
    walls: WALLS_2BED,
    doors: DOORS_2BED,
    windows: WINDOWS_2BED,
    dimensions: DIMENSIONS,
    furniture: FURNITURE_2BED,
    areaSchedule: AREA_SCHEDULE_2BED,
  };
}

// Backwards compatibility exports
export const ROOMS = ROOMS_2BED;
export const WALLS = WALLS_2BED;
export const DOORS = DOORS_2BED;
export const WINDOWS = WINDOWS_2BED;
export const FURNITURE = FURNITURE_2BED;
export const AREA_SCHEDULE = AREA_SCHEDULE_2BED;
