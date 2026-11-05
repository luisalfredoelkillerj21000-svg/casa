import React from 'react';
import { X, BookOpen, CheckCircle, ShieldCheck, Zap, Droplets, Compass } from 'lucide-react';

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalSpecsModal: React.FC<TechnicalSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold">Memoria Descriptiva y Criterios de Diseño</h3>
              <p className="text-xs text-slate-400">Proyecto: 2 Departamentos Independientes en 2do Piso (8.00m x 15.00m)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-sky-400" />
              1. Solución Arquitectónica para Lote de 8x15m
            </h4>
            <p>
              El terreno cuenta con una geometría rectangular estándar de <strong>8.00 metros de frontis por 15.00 metros de profundidad</strong>, con un área superficial de <strong>120.00 m²</strong>. Debido a que el primer piso ya está edificado, el proyecto respeta la modulación estructural de columnas y bajantes existentes, organizando el segundo piso en <strong>dos unidades residenciales totalmente independientes</strong> sin servidumbres de paso entre ellas.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. Ubicación de la Escalera en el Frente Derecho
            </h4>
            <p>
              Tal como se solicitó en la última revisión, la escalera se ubica en el <strong>frente derecho (X: 5.85m a 7.85m, Y: 0.15m a 3.75m)</strong>. Esta configuración aporta grandes ventajas funcionales:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-300">
              <li>
                <strong>Acceso peatonal independiente desde la calle:</strong> Permite ingresar directamente al segundo piso sin invadir la privacidad de los ocupantes de la primera planta.
              </li>
              <li>
                <strong>Frente continuo para Dpto 1:</strong> Libera 5.70 metros lineales ininterrumpidos en el frente izquierdo y central (X: 0.15m a 5.85m), permitiendo que tanto la sala como el dormitorio matrimonial tengan ventanales hacia la fachada principal.
              </li>
              <li>
                <strong>Continuidad vertical:</strong> El ojo y descanso de la escalera permiten prolongar el núcleo de circulación hacia un futuro 3er nivel o azotea/terraza de uso común.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              3. Independencia y Privacidad de los 2 Departamentos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
                <span className="font-bold text-emerald-400 block mb-1">Departamento 1 (Frontal - 46.50 m²)</span>
                <p className="text-[11px] text-slate-400">
                  Con vista directa a la calle principal. Dispone de sala-comedor luminosa, cocina americana integrada, baño completo, y 1 o 2 dormitorios (matrimonial a calle y dormitorio secundario).
                </p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
                <span className="font-bold text-amber-400 block mb-1">Departamento 2 (Posterior - 64.20 m²)</span>
                <p className="text-[11px] text-slate-400">
                  Fondo 100% techado sin patio exterior. Aprovecha todo el ancho del lote (8.00m) para albergar una amplia sala-comedor, cocina con barra, baño completo y 2 dormitorios de gran formato (~16 m² cada uno).
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              4. Bioclimatismo y Pozo de Luz Central
            </h4>
            <p>
              Con el fondo 100% techado para maximizar el área útil habitable, la ventilación e iluminación natural se resuelven con rigor técnico:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-300">
              <li>
                <strong>Fachada Exterior:</strong> Ventanales amplios (V-01 y V-02) que iluminan directamente la sala y el dormitorio principal del Dpto 1 con luz natural y aire fresco de la calle.
              </li>
              <li>
                <strong>Ducto / Pozo de Luz Central (2.24 m²):</strong> Ubicado en X: 3.20m a 4.60m, Y: 6.20m a 7.80m. Proporciona renovación de aire para los baños, área social y dormitorios interiores, albergando las montantes de instalaciones sanitarias de 4".
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors text-xs"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
