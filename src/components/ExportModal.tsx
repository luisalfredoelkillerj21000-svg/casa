import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Check,
  Loader2,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { PlanVariant } from '../types/blueprint';
import { downloadPdfFile, downloadSvgFile, generateCadSvgString } from '../utils/pdfGenerator';
import { getPlanData } from '../data/floorPlanData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: PlanVariant;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  variant = '2bed',
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'sheet' | 'memoria'>('sheet');
  const [projectName, setProjectName] = useState('VIVIENDA MULTIFAMILIAR · 2 DPTO INDEPENDIENTES');
  const [ownerName, setOwnerName] = useState('PROPIETARIO GENERAL');

  if (!isOpen) return null;

  const planData = getPlanData(variant);
  const { areaSchedule } = planData;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setDownloadSuccess(null);
      await downloadPdfFile(variant, 'Plano_Arquitectonico_8x15m_2doPiso.pdf');
      setDownloadSuccess('¡PDF generado y descargado exitosamente!');
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadSvg = () => {
    downloadSvgFile(variant, 'Plano_CAD_8x15m_2doPiso.svg');
    setDownloadSuccess('¡Archivo CAD SVG vectorial descargado!');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Generador y Descarga de PDF Arquitectónico</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  Lámina A-02 Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plano técnico a escala 1:50 · Lote 8.00m x 15.00m · Escalera frontal derecha · Fondo techado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Content Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Live Sheet Preview & Sheet Tabs */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* View Mode Selector */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActivePreviewTab('sheet')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activePreviewTab === 'sheet'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pág 1: Lámina Técnica A3
                </button>
                <button
                  onClick={() => setActivePreviewTab('memoria')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activePreviewTab === 'memoria'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pág 2: Memoria Descriptiva
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Formato A3 (420 x 297 mm)
              </span>
            </div>

            {/* Simulated Architectural Sheet Preview Card */}
            {activePreviewTab === 'sheet' ? (
              <div className="relative bg-white text-slate-900 rounded-xl p-3 border-2 border-slate-700 shadow-xl overflow-hidden font-sans">
                {/* Architectural Double Border Frame */}
                <div className="border border-slate-900 p-2.5 bg-white">
                  <div className="grid grid-cols-12 gap-2">
                    {/* Left 8 cols: CAD Plan Mockup */}
                    <div className="col-span-7 border-r border-slate-300 pr-2 flex flex-col justify-between">
                      <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center text-[10px] font-mono text-slate-600 mb-2">
                        ▲ FACHADA PRINCIPAL (ACCESO CALLE) ▲
                      </div>

                      {/* Schematic mini layout */}
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                          <span className="font-bold text-emerald-800 block">DPTO 1 (Frontal)</span>
                          <span className="text-slate-500 block">46.50 m²</span>
                          <span className="text-emerald-700 font-bold">2 Dorm + Sala</span>
                        </div>
                        <div className="p-2 bg-sky-50 border border-sky-200 rounded text-right">
                          <span className="font-bold text-sky-800 block">ESCALERA DER.</span>
                          <span className="text-slate-500 block">7.20 m²</span>
                          <span className="text-sky-700 font-bold">16 Pasos</span>
                        </div>
                      </div>

                      {/* Light shaft in center */}
                      <div className="my-1.5 p-1 bg-slate-100 border border-dashed border-slate-400 rounded text-center text-[8px] font-mono text-slate-600">
                        DUCTO DE LUZ CENTRAL (2.24 m²)
                      </div>

                      {/* Dpto 2 rear 100% covered */}
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[9px] font-mono">
                        <span className="font-bold text-amber-800 block">DPTO 2 (Posterior - Fondo Techado)</span>
                        <div className="flex justify-between text-slate-600">
                          <span>Gran Sala + Cocina</span>
                          <span className="font-bold">64.20 m²</span>
                        </div>
                        <div className="mt-1 text-[8px] text-amber-700 font-semibold">
                          2 Dormitorios Amplios (~16 m² c/u)
                        </div>
                      </div>

                      <div className="mt-2 text-center pt-1 border-t border-slate-200 text-[9px] font-bold text-slate-800">
                        PLANO DE DISTRIBUCIÓN · ESCALA 1:50
                      </div>
                    </div>

                    {/* Right 5 cols: Schedules & Title Block */}
                    <div className="col-span-5 flex flex-col justify-between text-[8px] pl-1 space-y-1.5">
                      {/* Cuadro de áreas table */}
                      <div>
                        <div className="bg-slate-900 text-white font-bold p-1 text-center text-[8px] rounded-t">
                          CUADRO DE ÁREAS (m²)
                        </div>
                        <div className="border border-slate-300 divide-y divide-slate-200 text-[7.5px] bg-white">
                          <div className="flex justify-between p-0.5">
                            <span className="text-slate-600">Terreno Total:</span>
                            <span className="font-bold">120.00 m²</span>
                          </div>
                          <div className="flex justify-between p-0.5">
                            <span className="text-slate-600">Área Techada:</span>
                            <span className="font-bold text-sky-700">{areaSchedule.builtArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between p-0.5">
                            <span className="text-slate-600">Dpto 1 (Frontal):</span>
                            <span className="font-bold text-emerald-700">{areaSchedule.dpto1.area.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between p-0.5">
                            <span className="text-slate-600">Dpto 2 (Posterior):</span>
                            <span className="font-bold text-amber-700">{areaSchedule.dpto2.area.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between p-0.5">
                            <span className="text-slate-600">Ducto Central:</span>
                            <span className="font-bold text-slate-500">2.24 m²</span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Cuadro de Vanos */}
                      <div>
                        <div className="bg-slate-900 text-white font-bold p-1 text-center text-[8px] rounded-t">
                          CUADRO DE VANOS
                        </div>
                        <div className="border border-slate-300 divide-y divide-slate-200 text-[7px] bg-white p-0.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>P-01 (Acceso): 0.90 x 2.10m</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>V-01 (Calle): 1.80 x 1.50m</span>
                          </div>
                        </div>
                      </div>

                      {/* Official Title Block (Membrete) */}
                      <div className="border-2 border-slate-900 rounded text-[7.5px]">
                        <div className="bg-sky-600 text-white font-bold p-1 text-center uppercase tracking-wider text-[7px]">
                          MEMBRETE TÉCNICO
                        </div>
                        <div className="p-1.5 space-y-0.5 bg-slate-50">
                          <div>
                            <span className="text-slate-400 block text-[6px]">PROYECTO:</span>
                            <span className="font-bold text-slate-900 truncate block text-[7.5px]">
                              {projectName}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-0.5">
                            <div>
                              <span className="text-slate-400 block text-[6px]">ESCALA:</span>
                              <span className="font-bold text-slate-800">1:50</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block text-[6px]">LÁMINA:</span>
                              <span className="font-bold text-sky-600 text-[11px] leading-tight">A - 02</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                <div className="font-bold text-sky-400 border-b border-slate-800 pb-2">
                  Resumen de la Memoria Descriptiva incluida en el PDF:
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <p>
                    <strong>1. Terreno y Emplazamiento:</strong> Lote de 8.00m x 15.00m (120.00 m²). Primer piso ya construido. Escalera ubicada en el frontal derecho (X: 5.85m a 7.85m).
                  </p>
                  <p>
                    <strong>2. Departamento 1:</strong> 46.50 m² construidos, con sala-comedor, cocina abierta, baño y 2 dormitorios con vistas directas a la calle principal.
                  </p>
                  <p>
                    <strong>3. Departamento 2:</strong> 64.20 m² construidos con fondo 100% techado, gran salón, cocina con barra, baño completo y 2 dormitorios familiares (~16 m² cada uno).
                  </p>
                  <p>
                    <strong>4. Bioclimatismo:</strong> Pozo de luz central de 2.24 m² que ventila los baños y permite el paso de montantes sanitarias de 4".
                  </p>
                  <p>
                    <strong>5. Estructuración:</strong> Muros de albañilería confinada e=0.15m en ladrillo King Kong de 18 huecos y concreto f'c=210 kg/cm².
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Documento técnico preparado bajo estándares de habitabilidad y normativa RNE para trámites de licencia municipal o ejecución en obra.
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Download & Configuration Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Customization Options */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block text-sm">Personalizar Membrete</span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nombre del Proyecto:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Propietario:</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Páginas del documento:</span>
                  <span className="text-white font-bold">2 Páginas (A3 / A2)</span>
                </div>
                <div className="flex justify-between">
                  <span>Escala del plano:</span>
                  <span className="text-white font-bold">1 : 50</span>
                </div>
                <div className="flex justify-between">
                  <span>Escalera:</span>
                  <span className="text-emerald-400 font-bold">Frontal Derecho</span>
                </div>
                <div className="flex justify-between">
                  <span>Fondo:</span>
                  <span className="text-amber-400 font-bold">100% Techado</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="space-y-2.5 pt-2">
              {/* Primary PDF Download Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando PDF Vectorial...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Descargar PDF de Lámina A-02 (.pdf)</span>
                  </>
                )}
              </button>

              {/* Secondary SVG Vector CAD Download */}
              <button
                onClick={handleDownloadSvg}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                title="Descargar archivo vectorial compatible con AutoCAD, Rhino, Adobe Illustrator"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Descargar Plano CAD Vectorial (.svg)</span>
              </button>

              {/* Print Dialog Button */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700/60 transition-colors"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>Imprimir Directamente / Diálogo del Sistema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PDF listo para descarga inmediata a resolución nativa</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
