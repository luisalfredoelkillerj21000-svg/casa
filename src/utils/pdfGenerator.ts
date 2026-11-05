import { jsPDF } from 'jspdf';
import { getPlanData, LOT_WIDTH, LOT_DEPTH } from '../data/floorPlanData';
import { PlanVariant, Door, Window, Wall, DimensionLine, FurnitureItem, Room, Point } from '../types/blueprint';

/**
 * Generates a clean, standalone, architectural SVG string formatted for high-contrast white paper CAD printing.
 */
export function generateCadSvgString(variant: PlanVariant): string {
  const data = getPlanData(variant);
  const { rooms, walls, doors, windows, dimensions, furniture } = data;

  // ViewBox: from X: -1.8 to 9.8 (width 11.6m), Y: -1.4 to 16.0 (height 17.4m)
  const vbX = -1.8;
  const vbY = -1.4;
  const vbW = 11.6;
  const vbH = 17.4;

  const toPoly = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="1160" height="1740" style="background:#ffffff; font-family:'Plus Jakarta Sans', system-ui, sans-serif;">
  <defs>
    <!-- Light well diagonal hatch -->
    <pattern id="lightHatch" width="0.25" height="0.25" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="0.25" stroke="#94a3b8" stroke-width="0.03" stroke-opacity="0.6" />
    </pattern>
    <!-- Arrow marker for dimensions -->
    <marker id="pdfDimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 2 L 10 5 L 0 8 z" fill="#0f172a" />
    </marker>
    <!-- Stair arrow -->
    <marker id="pdfStairArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0284c7" />
    </marker>
  </defs>

  <!-- Lot boundary background -->
  <rect x="0" y="0" width="${LOT_WIDTH}" height="${LOT_DEPTH}" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.04" stroke-dasharray="0.2, 0.1" />

  <!-- ROOMS FILLS & LABELS -->
  <g id="rooms">
`;

  rooms.forEach((room) => {
    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (room.apartmentId === 'dpto1') {
      fill = 'rgba(16, 185, 129, 0.08)';
      stroke = 'rgba(16, 185, 129, 0.3)';
    } else if (room.apartmentId === 'dpto2') {
      fill = 'rgba(245, 158, 11, 0.08)';
      stroke = 'rgba(245, 158, 11, 0.3)';
    } else if (room.apartmentId === 'common') {
      fill = 'rgba(14, 165, 233, 0.08)';
      stroke = 'rgba(14, 165, 233, 0.3)';
    } else if (room.apartmentId === 'void') {
      fill = 'url(#lightHatch)';
      stroke = '#64748b';
    }

    svg += `    <polygon points="${toPoly(room.polygon)}" fill="${fill}" stroke="${stroke}" stroke-width="0.02" />\n`;
    // Label
    svg += `    <g transform="translate(${room.center.x}, ${room.center.y})">
      <text x="0" y="-0.10" text-anchor="middle" fill="#0f172a" font-size="0.28" font-weight="700">${room.name}</text>
      <text x="0" y="0.22" text-anchor="middle" fill="#475569" font-size="0.22" font-family="'JetBrains Mono', monospace" font-weight="600">${room.area.toFixed(2)} m²</text>
    </g>\n`;
  });

  svg += `  </g>

  <!-- CENTRAL LIGHT WELL ACCENT -->
  <g id="light-wells">
    <rect x="3.20" y="6.20" width="1.40" height="1.60" fill="url(#lightHatch)" stroke="#475569" stroke-width="0.04" stroke-dasharray="0.1, 0.05" />
    <line x1="3.20" y1="6.20" x2="4.60" y2="7.80" stroke="#64748b" stroke-width="0.02" stroke-dasharray="0.08, 0.08" />
    <line x1="4.60" y1="6.20" x2="3.20" y2="7.80" stroke="#64748b" stroke-width="0.02" stroke-dasharray="0.08, 0.08" />
    <text x="3.90" y="6.90" text-anchor="middle" fill="#475569" font-size="0.20" font-weight="700">DUCTO DE LUZ</text>
    <text x="3.90" y="7.25" text-anchor="middle" fill="#64748b" font-size="0.18">2.24 m²</text>
  </g>

  <!-- FURNITURE (ARCHITECTURAL BLOCKS) -->
  <g id="furniture">
`;

  furniture.forEach((f) => {
    const rx = -f.width / 2;
    const ry = -f.length / 2;
    svg += `    <g transform="translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})">
      <rect x="${rx}" y="${ry}" width="${f.width}" height="${f.length}" fill="#f1f5f9" stroke="#64748b" stroke-width="0.025" rx="0.04" />\n`;

    if (f.category === 'bed') {
      const pW = f.width * 0.38;
      const pH = f.length * 0.22;
      svg += `      <!-- Pillows -->
      <rect x="${rx + 0.08}" y="${ry + 0.08}" width="${pW}" height="${pH}" fill="#e2e8f0" stroke="#64748b" stroke-width="0.02" rx="0.03" />
      <rect x="${rx + f.width - pW - 0.08}" y="${ry + 0.08}" width="${pW}" height="${pH}" fill="#e2e8f0" stroke="#64748b" stroke-width="0.02" rx="0.03" />
      <!-- Duvet line -->
      <line x1="${rx}" y1="${ry + f.length * 0.35}" x2="${rx + f.width}" y2="${ry + f.length * 0.35}" stroke="#94a3b8" stroke-width="0.02" />\n`;
    } else if (f.category === 'bathroom') {
      svg += `      <circle cx="0" cy="0" r="${Math.min(f.width, f.length) * 0.35}" fill="#ffffff" stroke="#64748b" stroke-width="0.02" />\n`;
    } else if (f.category === 'kitchen') {
      svg += `      <circle cx="${rx + f.width * 0.3}" cy="0" r="0.15" fill="#ffffff" stroke="#64748b" stroke-width="0.02" />
      <circle cx="${rx + f.width * 0.7}" cy="0" r="0.15" fill="#ffffff" stroke="#64748b" stroke-width="0.02" />\n`;
    }
    svg += `    </g>\n`;
  });

  svg += `  </g>

  <!-- STAIRCASE IN FRONT-RIGHT (X: 5.85 to 7.85, Y: 0.15 to 3.75) -->
  <g id="stairs">
`;

  // Tramo 1 (X: 5.85 to 6.80)
  for (let i = 0; i < 8; i++) {
    const yPos = 0.15 + i * 0.32;
    svg += `    <line x1="5.85" y1="${yPos.toFixed(2)}" x2="6.80" y2="${yPos.toFixed(2)}" stroke="#1e293b" stroke-width="0.025" />
    <text x="6.05" y="${(yPos - 0.08).toFixed(2)}" fill="#475569" font-size="0.13" font-family="'JetBrains Mono', monospace">${i + 1}</text>\n`;
  }
  // Descanso
  svg += `    <line x1="5.85" y1="2.71" x2="7.85" y2="2.71" stroke="#0f172a" stroke-width="0.035" />\n`;
  // Tramo 2 (X: 6.90 to 7.85)
  for (let i = 0; i < 8; i++) {
    const yPos = 2.71 - (i + 1) * 0.32;
    svg += `    <line x1="6.90" y1="${yPos.toFixed(2)}" x2="7.85" y2="${yPos.toFixed(2)}" stroke="#1e293b" stroke-width="0.025" />
    <text x="7.60" y="${(yPos + 0.18).toFixed(2)}" fill="#475569" font-size="0.13" font-family="'JetBrains Mono', monospace">${16 - i}</text>\n`;
  }
  // Central railing
  svg += `    <rect x="6.80" y="0.15" width="0.10" height="2.56" fill="#475569" />
    <!-- Stair arrow -->
    <path d="M 6.35 0.35 L 6.35 3.20 L 7.35 3.20 L 7.35 3.75" fill="none" stroke="#0284c7" stroke-width="0.04" marker-end="url(#pdfStairArrow)" />
    <circle cx="6.35" cy="0.35" r="0.08" fill="#0284c7" />
    <text x="6.35" y="1.8" text-anchor="middle" transform="rotate(90 6.35 1.8)" fill="#0284c7" font-size="0.20" font-weight="700">SUBE (1° al 2° Piso)</text>
    <text x="7.35" y="3.55" text-anchor="middle" fill="#0284c7" font-size="0.18" font-weight="700">LLEGADA 2° PISO</text>
  </g>

  <!-- CIRCULATION PATHS TO APARTMENTS -->
  <g id="circulation">
    <path d="M 7.35 3.75 L 7.35 4.10 L 4.60 4.10" fill="none" stroke="#10b981" stroke-width="0.04" stroke-dasharray="0.08, 0.05" marker-end="url(#pdfStairArrow)" />
    <text x="5.60" y="3.90" text-anchor="middle" fill="#059669" font-size="0.18" font-weight="700">Acceso Dpto 1 ◄</text>
    <path d="M 7.35 3.75 L 7.35 5.50 L 5.60 5.50 L 5.60 6.20" fill="none" stroke="#d97706" stroke-width="0.04" stroke-dasharray="0.08, 0.05" marker-end="url(#pdfStairArrow)" />
    <text x="6.60" y="5.85" text-anchor="middle" fill="#d97706" font-size="0.18" font-weight="700">Acceso Dpto 2 ▼</text>
  </g>

  <!-- WALLS (STRUCTURAL MASONRY) -->
  <g id="walls">
`;

  walls.forEach((w) => {
    const isH = Math.abs(w.start.y - w.end.y) < 0.05;
    const minX = Math.min(w.start.x, w.end.x);
    const minY = Math.min(w.start.y, w.end.y);
    const len = isH ? Math.abs(w.end.x - w.start.x) : Math.abs(w.end.y - w.start.y);
    const rectW = isH ? len : w.thickness;
    const rectH = isH ? w.thickness : len;
    const pX = isH ? minX : minX - w.thickness / 2;
    const pY = isH ? minY - w.thickness / 2 : minY;

    svg += `    <rect x="${pX.toFixed(3)}" y="${pY.toFixed(3)}" width="${rectW.toFixed(3)}" height="${rectH.toFixed(3)}" fill="#0f172a" stroke="#0f172a" stroke-width="0.01" />\n`;
  });

  svg += `  </g>

  <!-- DOORS WITH OPENING ARCS -->
  <g id="doors">
`;

  doors.forEach((d) => {
    const r = d.width;
    const rad = (d.rotation * Math.PI) / 180;
    const sign = d.swingDirection === 'right' ? 1 : -1;
    const arcEndRad = rad + sign * (Math.PI / 2);
    const lineX = d.position.x + r * Math.cos(rad);
    const lineY = d.position.y + r * Math.sin(rad);
    const arcEndX = d.position.x + r * Math.cos(arcEndRad);
    const arcEndY = d.position.y + r * Math.sin(arcEndRad);
    const sweep = d.swingDirection === 'right' ? 1 : 0;

    svg += `    <g id="${d.id}">
      <!-- Door Leaf -->
      <line x1="${d.position.x}" y1="${d.position.y}" x2="${lineX.toFixed(3)}" y2="${lineY.toFixed(3)}" stroke="#0f172a" stroke-width="0.04" stroke-linecap="round" />
      <!-- Swing Arc -->
      <path d="M ${lineX.toFixed(3)} ${lineY.toFixed(3)} A ${r} ${r} 0 0 ${sweep} ${arcEndX.toFixed(3)} ${arcEndY.toFixed(3)}" fill="none" stroke="#0284c7" stroke-width="0.02" stroke-dasharray="0.06, 0.04" />
      <!-- Door Code Tag -->
      <circle cx="${(d.position.x + 0.15).toFixed(2)}" cy="${(d.position.y - 0.15).toFixed(2)}" r="0.14" fill="#ffffff" stroke="#0284c7" stroke-width="0.02" />
      <text x="${(d.position.x + 0.15).toFixed(2)}" y="${(d.position.y - 0.11).toFixed(2)}" text-anchor="middle" fill="#0284c7" font-size="0.12" font-weight="700">${d.code}</text>
    </g>\n`;
  });

  svg += `  </g>

  <!-- WINDOWS (SILL & DOUBLE GLAZING) -->
  <g id="windows">
`;

  windows.forEach((win) => {
    const isH = Math.abs(win.start.y - win.end.y) < 0.05;
    const minX = Math.min(win.start.x, win.end.x);
    const minY = Math.min(win.start.y, win.end.y);
    const len = isH ? Math.abs(win.end.x - win.start.x) : Math.abs(win.end.y - win.start.y);
    const midX = (win.start.x + win.end.x) / 2;
    const midY = (win.start.y + win.end.y) / 2;

    if (isH) {
      svg += `    <g id="${win.id}">
        <rect x="${minX}" y="${minY - 0.075}" width="${len}" height="0.15" fill="#ffffff" stroke="#0284c7" stroke-width="0.03" />
        <line x1="${minX}" y1="${minY - 0.025}" x2="${minX + len}" y2="${minY - 0.025}" stroke="#0284c7" stroke-width="0.02" />
        <line x1="${minX}" y1="${minY + 0.025}" x2="${minX + len}" y2="${minY + 0.025}" stroke="#0284c7" stroke-width="0.02" />
        <rect x="${midX - 0.22}" y="${minY - 0.32}" width="0.44" height="0.22" fill="#ffffff" stroke="#0284c7" stroke-width="0.02" rx="0.03" />
        <text x="${midX}" y="${minY - 0.17}" text-anchor="middle" fill="#0284c7" font-size="0.13" font-weight="700">${win.code}</text>
      </g>\n`;
    } else {
      svg += `    <g id="${win.id}">
        <rect x="${minX - 0.075}" y="${minY}" width="0.15" height="${len}" fill="#ffffff" stroke="#0284c7" stroke-width="0.03" />
        <line x1="${minX - 0.025}" y1="${minY}" x2="${minX - 0.025}" y2="${minY + len}" stroke="#0284c7" stroke-width="0.02" />
        <line x1="${minX + 0.025}" y1="${minY}" x2="${minX + 0.025}" y2="${minY + len}" stroke="#0284c7" stroke-width="0.02" />
        <rect x="${minX - 0.32}" y="${midY - 0.11}" width="0.24" height="0.22" fill="#ffffff" stroke="#0284c7" stroke-width="0.02" rx="0.03" />
        <text x="${minX - 0.20}" y="${midY + 0.04}" text-anchor="middle" fill="#0284c7" font-size="0.13" font-weight="700">${win.code}</text>
      </g>\n`;
    }
  });

  svg += `  </g>

  <!-- DIMENSION LINES (COTAS GENERALES Y PARCIALES) -->
  <g id="dimensions">
`;

  dimensions.forEach((dim) => {
    const isH = dim.orientation === 'horizontal';
    const offset = dim.offset;
    const isTotal = dim.level === 'total';
    const strokeW = isTotal ? '0.03' : '0.02';
    const textColor = isTotal ? '#0f172a' : '#334155';
    const textSize = isTotal ? '0.24' : '0.19';

    if (isH) {
      const minX = Math.min(dim.start.x, dim.end.x);
      const maxX = Math.max(dim.start.x, dim.end.x);
      const midX = (minX + maxX) / 2;
      svg += `    <!-- Dim H: ${dim.label} -->
      <line x1="${minX}" y1="${offset}" x2="${maxX}" y2="${offset}" stroke="#0f172a" stroke-width="${strokeW}" marker-start="url(#pdfDimArrow)" marker-end="url(#pdfDimArrow)" />
      <line x1="${minX}" y1="${offset - 0.15}" x2="${minX}" y2="${offset + 0.15}" stroke="#64748b" stroke-width="0.02" />
      <line x1="${maxX}" y1="${offset - 0.15}" x2="${maxX}" y2="${offset + 0.15}" stroke="#64748b" stroke-width="0.02" />
      <text x="${midX}" y="${offset - 0.08}" text-anchor="middle" fill="${textColor}" font-size="${textSize}" font-family="'JetBrains Mono', monospace" font-weight="${isTotal ? '800' : '600'}">${dim.label}</text>\n`;
    } else {
      const minY = Math.min(dim.start.y, dim.end.y);
      const maxY = Math.max(dim.start.y, dim.end.y);
      const midY = (minY + maxY) / 2;
      svg += `    <!-- Dim V: ${dim.label} -->
      <line x1="${offset}" y1="${minY}" x2="${offset}" y2="${maxY}" stroke="#0f172a" stroke-width="${strokeW}" marker-start="url(#pdfDimArrow)" marker-end="url(#pdfDimArrow)" />
      <line x1="${offset - 0.15}" y1="${minY}" x2="${offset + 0.15}" y2="${minY}" stroke="#64748b" stroke-width="0.02" />
      <line x1="${offset - 0.15}" y1="${maxY}" x2="${offset + 0.15}" y2="${maxY}" stroke="#64748b" stroke-width="0.02" />
      <text x="${offset + (offset < 0 ? -0.12 : 0.15)}" y="${midY}" text-anchor="middle" transform="rotate(-90 ${offset + (offset < 0 ? -0.12 : 0.15)} ${midY})" fill="${textColor}" font-size="${textSize}" font-family="'JetBrains Mono', monospace" font-weight="${isTotal ? '800' : '600'}">${dim.label}</text>\n`;
    }
  });

  svg += `  </g>

  <!-- FACHADA STREET CALLOUT & SYMBOLS -->
  <g id="annotations">
    <!-- Street Tag -->
    <rect x="0.15" y="-1.15" width="7.70" height="0.45" fill="#0f172a" rx="0.06" />
    <text x="4.00" y="-0.87" text-anchor="middle" fill="#ffffff" font-size="0.22" font-weight="700" letter-spacing="0.08em">▲ FACHADA PRINCIPAL A CALLE (ACCESO PEATONAL) ▲</text>

    <!-- Rear boundary tag -->
    <rect x="0.15" y="15.05" width="7.70" height="0.35" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.02" rx="0.04" />
    <text x="4.00" y="15.28" text-anchor="middle" fill="#64748b" font-size="0.18" font-weight="600">LÍMITE POSTERIOR DEL LOTE (100% TECHADO)</text>

    <!-- North Arrow Symbol at top-left -->
    <g transform="translate(-1.1, 0.5)">
      <circle cx="0" cy="0" r="0.45" fill="#ffffff" stroke="#0f172a" stroke-width="0.03" />
      <polygon points="0,-0.38 -0.15,0.25 0,0.12" fill="#0f172a" />
      <polygon points="0,-0.38 0.15,0.25 0,0.12" fill="#cbd5e1" stroke="#0f172a" stroke-width="0.02" />
      <text x="0" y="-0.48" text-anchor="middle" fill="#0f172a" font-size="0.22" font-weight="800">N</text>
    </g>

    <!-- Graphic Scale Bar at bottom-left -->
    <g transform="translate(-1.2, 14.5)">
      <text x="0" y="-0.2" fill="#0f172a" font-size="0.16" font-weight="700">ESCALA GRÁFICA</text>
      <rect x="0" y="0" width="0.5" height="0.08" fill="#0f172a" />
      <rect x="0.5" y="0" width="0.5" height="0.08" fill="#cbd5e1" stroke="#0f172a" stroke-width="0.01" />
      <rect x="1.0" y="0" width="1.0" height="0.08" fill="#0f172a" />
      <text x="0" y="0.22" font-size="0.12" fill="#475569">0</text>
      <text x="1.0" y="0.22" font-size="0.12" fill="#475569">1m</text>
      <text x="2.0" y="0.22" font-size="0.12" fill="#475569">2m</text>
    </g>
  </g>
</svg>`;

  return svg;
}

/**
 * Converts standalone SVG string into a high-resolution PNG data URL via HTML Canvas.
 */
export async function renderSvgToPngDataUrl(
  svgString: string,
  width: number = 2320,
  height: number = 3480
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into Image: ' + String(err)));
    };

    img.src = url;
  });
}

/**
 * Builds the professional multi-page architectural PDF (Lámina Técnica A3 / A4 con Membrete y Memoria Descriptiva).
 */
export async function generateArchitecturalPdf(
  variant: PlanVariant = '2bed',
  options: { format?: 'a3' | 'a4' } = { format: 'a3' }
): Promise<jsPDF> {
  const isA3 = options.format !== 'a4';
  const data = getPlanData(variant);
  const { areaSchedule, doors, windows } = data;

  // Initialize jsPDF: A3 landscape (420 x 297 mm) or A4 portrait (210 x 297 mm)
  const pdf = isA3
    ? new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
    : new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = isA3 ? 420 : 210;
  const pageH = isA3 ? 297 : 297;

  // 1. Generate CAD Blueprint Image
  const svgString = generateCadSvgString(variant);
  let planImgData = '';
  try {
    planImgData = await renderSvgToPngDataUrl(svgString, 2320, 3480);
  } catch (e) {
    console.error('Error rasterizing SVG to PNG:', e);
  }

  // -------------------------------------------------------------
  // PAGE 1: LÁMINA TÉCNICA ARQUITECTÓNICA (A3 HORIZONTAL)
  // -------------------------------------------------------------

  // Outer Border (Margins: 15mm left for binding, 10mm right, top, bottom)
  const mLeft = 15;
  const mTop = 10;
  const borderW = pageW - mLeft - 10;
  const borderH = pageH - mTop - 10;

  // Double architectural frame
  pdf.setDrawColor(15, 23, 42); // slate-900
  pdf.setLineWidth(0.8);
  pdf.rect(mLeft, mTop, borderW, borderH);

  pdf.setLineWidth(0.25);
  pdf.rect(mLeft + 1.5, mTop + 1.5, borderW - 3, borderH - 3);

  if (isA3) {
    // Left drawing zone (235mm width)
    const drawX = mLeft + 4;
    const drawY = mTop + 4;
    const drawW = 240;
    const drawH = borderH - 8;

    // Right sidebar zone (145mm width)
    const sideX = drawX + drawW + 4;
    const sideW = borderW - drawW - 12;

    // Inner dividing line between drawing and sidebar
    pdf.setLineWidth(0.5);
    pdf.line(sideX - 2, mTop + 1.5, sideX - 2, mTop + borderH - 1.5);

    // Render floor plan graphic
    if (planImgData) {
      // SVG aspect ratio is 11.6 : 17.4 -> 1 : 1.5
      const imgH = drawH - 18;
      const imgW = imgH / 1.5;
      const imgX = drawX + (drawW - imgW) / 2;
      const imgY = drawY + 2;

      pdf.addImage(planImgData, 'PNG', imgX, imgY, imgW, imgH);
    }

    // Drawing title under floor plan
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(15, 23, 42);
    pdf.text('PLANO DE DISTRIBUCIÓN ARQUITECTÓNICA · 2° PISO', drawX + drawW / 2, drawY + drawH - 8, {
      align: 'center',
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(
      'ESCALA 1:50 · NIVEL PISO TERMINADO N.P.T. +2.80m · COTAS EN METROS',
      drawX + drawW / 2,
      drawY + drawH - 3.5,
      { align: 'center' }
    );

    // ---------------------------------------------------------
    // SIDEBAR: CUADRO DE ÁREAS, VANOS, NOTAS Y MEMBRETE
    // ---------------------------------------------------------

    let curY = mTop + 4;

    // 1. CUADRO NORMATIVO DE ÁREAS
    pdf.setFillColor(15, 23, 42);
    pdf.rect(sideX, curY, sideW, 5.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('CUADRO NORMATIVO DE ÁREAS (m²)', sideX + sideW / 2, curY + 3.8, { align: 'center' });

    curY += 5.5;

    // Table rows
    const areaRows = [
      ['Área de Terreno (Lote)', '8.00m x 15.00m', '120.00 m²'],
      ['Área Techada 2° Piso', 'Total Construida', `${areaSchedule.builtArea.toFixed(2)} m²`],
      ['Área Libre (Ducto Central)', 'Reglamentaria RNE', `${areaSchedule.openArea.toFixed(2)} m² (${areaSchedule.openAreaPercentage}%)`],
      ['Dpto 1 (Frontal)', '2 Dorm, Sala, Cocina, Baño', `${areaSchedule.dpto1.area.toFixed(2)} m²`],
      ['Dpto 2 (Posterior Techado)', '2 Dorm Grandes, Sala, Baño', `${areaSchedule.dpto2.area.toFixed(2)} m²`],
      ['Escalera & Hall Común', 'Frontal Derecho / Distribuidor', `${areaSchedule.commonArea.area.toFixed(2)} m²`],
    ];

    pdf.setFontSize(7);
    areaRows.forEach(([col1, col2, col3], idx) => {
      const rowY = curY + idx * 4.6;
      pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      pdf.rect(sideX, rowY, sideW, 4.6, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.1);
      pdf.rect(sideX, rowY, sideW, 4.6, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(col1, sideX + 2, rowY + 3.2);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(col2, sideX + 48, rowY + 3.2);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(2, 132, 199);
      pdf.text(col3, sideX + sideW - 2, rowY + 3.2, { align: 'right' });
    });

    curY += areaRows.length * 4.6 + 4;

    // 2. CUADRO DE VANOS
    pdf.setFillColor(15, 23, 42);
    pdf.rect(sideX, curY, sideW, 5.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('CUADRO DE VANOS (PUERTAS Y VENTANAS)', sideX + sideW / 2, curY + 3.8, { align: 'center' });

    curY += 5.5;

    // Table Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(sideX, curY, sideW, 4.2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('TIPO', sideX + 2, curY + 3);
    pdf.text('ANCHO', sideX + 16, curY + 3);
    pdf.text('ALTO', sideX + 32, curY + 3);
    pdf.text('ALFÉIZAR', sideX + 48, curY + 3);
    pdf.text('DESCRIPCIÓN / UBICACIÓN', sideX + 70, curY + 3);

    curY += 4.2;

    const vanosItems: { code: string; w: string; h: string; alf: string; desc: string }[] = [];
    doors.slice(0, 6).forEach((d) => {
      vanosItems.push({
        code: d.code,
        w: `${d.width.toFixed(2)}m`,
        h: `${d.height.toFixed(2)}m`,
        alf: '0.00m',
        desc: d.name.substring(0, 30),
      });
    });
    windows.forEach((w) => {
      vanosItems.push({
        code: w.code,
        w: `${w.width.toFixed(2)}m`,
        h: `${w.height.toFixed(2)}m`,
        alf: `${w.sillHeight.toFixed(2)}m`,
        desc: w.roomName.substring(0, 30),
      });
    });

    pdf.setFontSize(6.2);
    vanosItems.slice(0, 10).forEach((item, idx) => {
      const rowY = curY + idx * 4.1;
      pdf.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      pdf.rect(sideX, rowY, sideW, 4.1, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.1);
      pdf.rect(sideX, rowY, sideW, 4.1, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(item.code.startsWith('P') ? 16 : 2, item.code.startsWith('P') ? 185 : 132, item.code.startsWith('P') ? 129 : 199);
      pdf.text(item.code, sideX + 2, rowY + 2.8);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text(item.w, sideX + 16, rowY + 2.8);
      pdf.text(item.h, sideX + 32, rowY + 2.8);
      pdf.text(item.alf, sideX + 48, rowY + 2.8);
      pdf.text(item.desc, sideX + 70, rowY + 2.8);
    });

    curY += Math.min(vanosItems.length, 10) * 4.1 + 4;

    // 3. ESPECIFICACIONES CONSTRUCTIVAS
    pdf.setFillColor(15, 23, 42);
    pdf.rect(sideX, curY, sideW, 5.0, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text('ESPECIFICACIONES CONSTRUCTIVAS CLAVE', sideX + sideW / 2, curY + 3.5, { align: 'center' });

    curY += 5.0;

    const specs = [
      '• Muros portantes de soga e=0.15m en ladrillo King Kong de 18 huecos.',
      '• Escalera de concreto armado f\'c=210 kg/cm² en frente derecho (16 pasos).',
      '• Fondo 100% techado para máxima habitabilidad de 4 dormitorios totales.',
      '• Ducto central de 2.24m² garantiza ventilación natural directa de baños.',
    ];

    pdf.setFontSize(6.3);
    specs.forEach((spec, idx) => {
      const rowY = curY + idx * 4.2;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(sideX, rowY, sideW, 4.2, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text(spec, sideX + 2, rowY + 3.0);
    });

    curY += specs.length * 4.2 + 4;

    // 4. MEMBRETE OFICIAL DE ARQUITECTURA (RÓTULO MUNICIPAL)
    const membreteH = mTop + borderH - 4 - curY;
    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.4);
    pdf.rect(sideX, curY, sideW, membreteH);

    // Header banner inside Membrete
    pdf.setFillColor(2, 132, 199); // Sky blue
    pdf.rect(sideX, curY, sideW, 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text('MEMBRETE TÉCNICO OFICIAL DE ARQUITECTURA', sideX + sideW / 2, curY + 4.2, { align: 'center' });

    const memStartY = curY + 6;
    const memH = membreteH - 6;

    // Grid in Membrete
    // Row 1: Proyecto
    pdf.setLineWidth(0.15);
    pdf.setDrawColor(203, 213, 225);
    pdf.line(sideX, memStartY + 10, sideX + sideW, memStartY + 10);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PROYECTO:', sideX + 2, memStartY + 3.5);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('VIVIENDA MULTIFAMILIAR · 2 DEPARTAMENTOS INDEPENDIENTES', sideX + 2, memStartY + 7.5);

    // Row 2: Especialidad y Plano
    pdf.line(sideX, memStartY + 20, sideX + sideW, memStartY + 20);
    pdf.line(sideX + sideW * 0.5, memStartY + 10, sideX + sideW * 0.5, memStartY + 20);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('ESPECIALIDAD:', sideX + 2, memStartY + 13.5);
    pdf.setFontSize(7.5);
    pdf.setTextColor(2, 132, 199);
    pdf.text('ARQUITECTURA', sideX + 2, memStartY + 18);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PLANO:', sideX + sideW * 0.5 + 2, memStartY + 13.5);
    pdf.setFontSize(7.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('DISTRIBUCIÓN 2° PISO', sideX + sideW * 0.5 + 2, memStartY + 18);

    // Row 3: Terreno, Escala, Fecha
    pdf.line(sideX, memStartY + 30, sideX + sideW, memStartY + 30);
    pdf.line(sideX + sideW * 0.33, memStartY + 20, sideX + sideW * 0.33, memStartY + 30);
    pdf.line(sideX + sideW * 0.66, memStartY + 20, sideX + sideW * 0.66, memStartY + 30);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('TERRENO:', sideX + 2, memStartY + 23.5);
    pdf.setFontSize(7);
    pdf.setTextColor(15, 23, 42);
    pdf.text('8.00m x 15.00m (120 m²)', sideX + 2, memStartY + 27.5);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('ESCALA:', sideX + sideW * 0.33 + 2, memStartY + 23.5);
    pdf.setFontSize(7);
    pdf.text('1 : 50', sideX + sideW * 0.33 + 2, memStartY + 27.5);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('FECHA:', sideX + sideW * 0.66 + 2, memStartY + 23.5);
    pdf.setFontSize(7);
    pdf.text('Noviembre 2026', sideX + sideW * 0.66 + 2, memStartY + 27.5);

    // Row 4: Escalera y Lámina
    pdf.line(sideX + sideW * 0.7, memStartY + 30, sideX + sideW * 0.7, memStartY + memH);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('CONFIGURACIÓN:', sideX + 2, memStartY + 34);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(16, 185, 129);
    pdf.text('Escalera Frontal Derecha · Fondo 100% Techado', sideX + 2, memStartY + 38.5);

    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('LÁMINA:', sideX + sideW * 0.7 + 2, memStartY + 34);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(2, 132, 199);
    pdf.text('A - 02', sideX + sideW * 0.7 + 4, memStartY + 41);
  }

  // -------------------------------------------------------------
  // PAGE 2: MEMORIA DESCRIPTIVA TÉCNICA FORMAL
  // -------------------------------------------------------------
  pdf.addPage(isA3 ? 'a3' : 'a4', isA3 ? 'landscape' : 'portrait');

  // Outer border on page 2
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.8);
  pdf.rect(mLeft, mTop, borderW, borderH);
  pdf.setLineWidth(0.25);
  pdf.rect(mLeft + 1.5, mTop + 1.5, borderW - 3, borderH - 3);

  // Page 2 Header Banner
  pdf.setFillColor(15, 23, 42);
  pdf.rect(mLeft + 4, mTop + 4, borderW - 8, 14, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('MEMORIA DESCRIPTIVA Y ESPECIFICACIONES TÉCNICAS', mLeft + (borderW) / 2, mTop + 10, {
    align: 'center',
  });
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184);
  pdf.text('EXPEDIENTE DE ARQUITECTURA · SEGUNDO PISO · 2 DEPARTAMENTOS INDEPENDIENTES', mLeft + (borderW) / 2, mTop + 15, {
    align: 'center',
  });

  // Content Columns (2 columns on A3)
  const colW = (borderW - 16) / 2;
  const col1X = mLeft + 6;
  const col2X = col1X + colW + 4;
  let p2Y1 = mTop + 24;
  let p2Y2 = mTop + 24;

  const renderSectionHeader = (x: number, y: number, w: number, title: string) => {
    pdf.setFillColor(241, 245, 249);
    pdf.rect(x, y, w, 5.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(2, 132, 199);
    pdf.text(title, x + 3, y + 4.0);
    return y + 7.5;
  };

  const renderParagraph = (x: number, y: number, w: number, text: string) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85);
    const lines = pdf.splitTextToSize(text, w);
    pdf.text(lines, x, y);
    return y + lines.length * 3.8 + 2;
  };

  // COLUMN 1
  p2Y1 = renderSectionHeader(col1X, p2Y1, colW, '1. GENERALIDADES Y DATOS DEL PREDIO');
  p2Y1 = renderParagraph(
    col1X,
    p2Y1,
    colW,
    'El proyecto se ubica sobre un lote urbano regular entre medianeras de 8.00 metros de frente por 15.00 metros de fondo, totalizando 120.00 m² de superficie de terreno. El primer nivel ya se encuentra edificado, por lo que el presente diseño plantea la estructuración y distribución del segundo piso sin comprometer los apoyos estructurales del piso inferior.'
  );

  p2Y1 = renderSectionHeader(col1X, p2Y1, colW, '2. NÚCLEO DE ACCESO Y ESCALERA EN EL FRENTE DERECHO');
  p2Y1 = renderParagraph(
    col1X,
    p2Y1,
    colW,
    'La escalera se emplaza en el frontal derecho (X: 5.85m a 7.85m, Y: 0.15m a 3.75m), con un ancho de tramo reglamentario de 0.95m y descanso intermedio en Y=2.71m. Esta disposición ofrece tres ventajas críticas: (a) acceso independiente desde la vía pública sin servidumbres, (b) liberación de 5.70 metros lineales en el frontis izquierdo para la sala y dormitorio del Dpto 1, y (c) continuidad para proyectar una futura azotea.'
  );

  p2Y1 = renderSectionHeader(col1X, p2Y1, colW, '3. DEPARTAMENTO 1 (FRONTAL - 46.50 m²)');
  p2Y1 = renderParagraph(
    col1X,
    p2Y1,
    colW,
    'Acceso directo desde el hall común. Alberga: Sala-comedor con kitchenette integrado (15.50 m²), Dormitorio Matrimonial con ventanal a calle (10.50 m²), Dormitorio Secundario (8.50 m²) con ventilación hacia el ducto interior, y Baño Completo (3.20 m²) con lavabo, inodoro y ducha con ventilación reglamentaria.'
  );

  p2Y1 = renderSectionHeader(col1X, p2Y1, colW, '4. DEPARTAMENTO 2 (POSTERIOR TECHADO - 64.20 m²)');
  p2Y1 = renderParagraph(
    col1X,
    p2Y1,
    colW,
    'Al techar el 100% del fondo del lote (eliminando el antiguo patio exterior), el Departamento 2 se consolida como una residencia familiar amplia. Contiene: Gran Sala-Comedor (18.20 m²), Cocina con isla desayunadora (8.50 m²), Baño familiar completo (3.80 m²), Dormitorio Suite King al fondo derecho (16.50 m²) y Dormitorio 2 al fondo izquierdo (16.20 m²).'
  );

  // COLUMN 2
  p2Y2 = renderSectionHeader(col2X, p2Y2, colW, '5. VENTILACIÓN, ILUMINACIÓN Y BIOCLIMATISMO');
  p2Y2 = renderParagraph(
    col2X,
    p2Y2,
    colW,
    'La habitabilidad térmica y lumínica se asegura mediante: (1) Ventanales frontales V-01 y V-02 que captan luz cenital y brisa directa de la calle; (2) Ducto de luz central de 2.24 m² (1.40m x 1.60m) situado en el baricentro del lote, el cual renueva el aire de los servicios higiénicos y permite la subida vertical de tuberías sanitarias de 4" y montantes eléctricas.'
  );

  p2Y2 = renderSectionHeader(col2X, p2Y2, colW, '6. CRITERIOS ESTRUCTURALES Y CONSTRUCTIVOS');
  p2Y2 = renderParagraph(
    col2X,
    p2Y2,
    colW,
    'Sistema de albañilería confinada con columnas de amarre y vigas soleras de concreto armado f\'c = 210 kg/cm². Muros perimetrales e interiores de soga con espesor terminado de 0.15m. Losa aligerada unidireccional de 0.20m de peralte con viguetas prefabricadas o convencionales espaciadas cada 0.40m, orientadas en el sentido más corto (luz de 3.20m a 4.00m).'
  );

  p2Y2 = renderSectionHeader(col2X, p2Y2, colW, '7. INSTALACIONES ELÉCTRICAS Y SANITARIAS');
  p2Y2 = renderParagraph(
    col2X,
    p2Y2,
    colW,
    'Cada departamento cuenta con tablero de distribución termo-magnética y diferencial independiente, alimentador desde el banco de medidores en fachada, red de agua fría en tubería PVC-SAP 1/2" clase 10 y desagüe en PVC-SAL 2" y 4" con pendiente mínima de 1.5% hacia las bajantes del pozo central.'
  );

  p2Y2 = renderSectionHeader(col2X, p2Y2, colW, '8. INDEPENDENCIA Y PROPIEDAD EXCLUSIVA');
  p2Y2 = renderParagraph(
    col2X,
    p2Y2,
    colW,
    'La solución arquitectónica permite la independización registral inmediata de ambas unidades inmobiliarias bajo el régimen de propiedad exclusiva y propiedad común, con reglamento interno y porcentajes de participación calculados según el cuadro de áreas normativo.'
  );

  return pdf;
}

/**
 * Directly downloads the generated architectural PDF file to the user's browser.
 */
export async function downloadPdfFile(
  variant: PlanVariant = '2bed',
  filename: string = 'Plano_Arquitectonico_8x15m_2doPiso.pdf'
): Promise<void> {
  const pdf = await generateArchitecturalPdf(variant, { format: 'a3' });
  pdf.save(filename);
}

/**
 * Directly downloads the standalone vector CAD SVG file.
 */
export function downloadSvgFile(
  variant: PlanVariant = '2bed',
  filename: string = 'Plano_CAD_8x15m_2doPiso.svg'
): void {
  const svgStr = generateCadSvgString(variant);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
