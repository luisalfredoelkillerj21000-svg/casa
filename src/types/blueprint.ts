export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number; // in meters (0.15 for exterior/bearing, 0.10 for interior partitions)
  isExterior?: boolean;
}

export interface Door {
  id: string;
  name: string;
  code: string; // e.g. "P-01"
  position: Point; // pivot point
  width: number; // in meters (e.g. 0.90, 0.80)
  height: number;
  rotation: number; // in degrees (0, 90, 180, 270)
  swingDirection: 'left' | 'right';
  targetRoom: string;
  apartmentId: 'dpto1' | 'dpto2' | 'common';
}

export interface Window {
  id: string;
  code: string; // e.g. "V-01"
  start: Point;
  end: Point;
  width: number;
  sillHeight: number; // alfeizar
  height: number;
  roomName: string;
  orientation: 'front' | 'rear' | 'patio1' | 'patio2';
}

export interface DimensionLine {
  id: string;
  start: Point;
  end: Point;
  value: number; // in meters
  label: string;
  orientation: 'horizontal' | 'vertical';
  offset: number; // distance from wall
  level: 'total' | 'partial';
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'bed' | 'sofa' | 'table' | 'kitchen' | 'bathroom' | 'laundry' | 'closet' | 'storage';
  position: Point;
  width: number;
  length: number;
  rotation: number; // degrees
  apartmentId: 'dpto1' | 'dpto2' | 'common';
}

export interface Room {
  id: string;
  name: string;
  apartmentId: 'dpto1' | 'dpto2' | 'common' | 'void';
  apartmentName: string;
  area: number; // m²
  dimensions: string; // e.g. "3.80m x 3.50m"
  color: string;
  lightSource: string;
  ventilation: string;
  description: string;
  polygon: Point[];
  center: Point;
  features: string[];
}

export interface LayerState {
  walls: boolean;
  doors: boolean;
  windows: boolean;
  dimensions: boolean;
  furniture: boolean;
  labels: boolean;
  circulation: boolean;
  lightWells: boolean;
  grid: boolean;
}

export type PlanVariant = '1bed' | '2bed';

export interface PlanData {
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  dimensions: DimensionLine[];
  furniture: FurnitureItem[];
  areaSchedule: {
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
