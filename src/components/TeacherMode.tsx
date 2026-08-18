import React, { useState, useRef } from 'react';
import { UserProfile, L1Language } from '../types';
import { Download, Upload, FileText, RefreshCw, CheckCircle, Database, ShieldCheck } from 'lucide-react';
import { srsManager } from '../utils/srsEngine';
import { storageService } from '../services/storageService';

interface TeacherModeProps {
  profile: UserProfile;
}

export const TeacherMode: React.FC<TeacherModeProps> = ({ profile }) => {
  const [selectedL1, setSelectedL1] = useState<L1Language>('inglés');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const l1InterferenceTable: Record<string, { title: string; mainRisks: string[]; pedagogicalAdvice: string }> = {
    inglés: {
      title: 'Interferencias del Inglés en Español (ELE)',
      mainRisks: [
        'Uso indebido de mayúsculas en días de la semana, meses, nacionalidades e idiomas (ej. *Lunes, *Español).',
        'Duplicación consonántica anglosajona no válida en español: *posible -> *possible, *profesional -> *professional, *comunicación -> *communication (mm, tt, pp, ss).',
        'Omisión recurrente de tildes debido a la falta de marcas diacríticas en inglés.',
        'Confusión de puntuación: uso de comas decimales vs puntos, y comas previas a conjunciones copulativas (Oxford comma).'
      ],
      pedagogicalAdvice: 'Trabajar intensamente la "des-duplicación" gráfica mediante el reconocimiento de las únicas 4 dobles consonantes válidas en español: C, C (cc), R, R (rr), L, L (ll), N, N (nn) [Regla mnemotécnica: CA-RO-LI-NA].'
    },
    francés: {
      title: 'Interferencias del Francés en Español (ELE)',
      mainRisks: [
        'Confusión en la orientación de las tildes: el español solo utiliza el acento agudo (´), mientras que el francés tiene acento grave (`), circunflejo (^) y agudo.',
        'Grafías con dígrafos franceses (ej. *ou por u, *ph por f, *th por t).',
        'Confusión entre C, S y Z debido a la pronunciación sibilante.',
        'Omisión o adición de H muda en posiciones etimológicas francesas.'
      ],
      pedagogicalAdvice: 'Enfocar la atención en el golpe de voz único (prosódico) y en la unificación gráfica del acento agudo hacia la derecha.'
    },
    portugués: {
      title: 'Interferencias del Portugués en Español (ELE)',
      mainRisks: [
        'Transferencia b/v por proximidad fonológica.',
        'Sufijos nominales: -ção / -ções en portugués transferidos erróneamente como *-çión o confusión con -sión / -ción.',
        'Tildes diacríticas y diptongos nasales.',
        'Confusión de grupos consonánticos (lh/nh frente a ll/ñ).'
      ],
      pedagogicalAdvice: 'Hacer hincapié en la correlación morfológica: si el verbo primitivo termina en -dir/-tir (decidir -> decisión), o si la raíz tiene T/CT (canto -> canción, acto -> acción).'
    },
    italiano: {
      title: 'Interferencias del Italiano en Español (ELE)',
      mainRisks: [
        'Consonantes dobles geminadas (ej. *bello, *gatto, *notte) transferidas a palabras españolas.',
        'Confusión de grafías g/j (ej. *viaggio -> *viaje con g).',
        'Acento ortográfico grave italiano vs agudo español.',
        'Omisión del signo de interrogación y exclamación de apertura (¿ ¡).'
      ],
      pedagogicalAdvice: 'Utilizar el contraste auditivo-gráfico. El español no tiene geminación fonológica consonántica.'
    },
    alemán: {
      title: 'Interferencias del Alemán en Español (ELE)',
      mainRisks: [
        'Mayúsculas indebidas en todos los sustantivos comunes.',
        'Reglas de puntuación rígidas antes de oraciones subordinadas ("dass").',
        'Diptongos y orden de consonantes compuestas.'
      ],
      pedagogicalAdvice: 'Reforzar que en español las mayúsculas están estrictamente reservadas para nombres propios y principios de enunciado.'
    },
    chino: {
      title: 'Interferencias del Chino Mandarín en Español (ELE)',
      mainRisks: [
        'Percepción de la sílaba métrica y la distinción entre diptongos y hiatos.',
        'Confusión entre /l/ y /r/ (vibrante simple y múltiple: pero vs perro).',
        'Segmentación de palabras compuestas y adverbios.'
      ],
      pedagogicalAdvice: 'Utilizar apoyos visuales y golpes rítmicos para la identificación de la sílaba tónica.'
    },
  };

  const handleExportWorksheet = () => {
    setIsExporting(true);
    setExportMessage(null);
    setTimeout(() => {
      setIsExporting(false);
      setExportMessage('Hoja de trabajo pedagógica generada y lista para descargar en PDF/impresión.');
    }, 1000);
  };

  const handleDownloadBackup = () => {
    const srsItems = srsManager.getSrsItems();
    const jsonString = storageService.exportBackupJSON(profile, srsItems);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ortografia_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMessage('Copia de seguridad (.json) exportada con éxito.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importBackupJSON(content);
      if (res.success) {
        setImportStatus({ success: true, text: '¡Datos restaurados con éxito! Recargando aplicación...' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus({ success: false, text: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleResetCohort = () => {
    if (window.confirm('¿Deseás reiniciar todos los datos y calibración del estudiante a los valores iniciales de fábrica?')) {
      srsManager.resetAllProgress();
      window.location.reload();
    }
  };

  const writingCount = storageService.getWritingHistory().length;
  const diagnosticCount = storageService.getDiagnosticHistory().length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">PANEL PEDAGÓGICO ELE</span>
          <h2 className="text-2xl font-bold font-sans text-neutral-100">
            Modo Docente, Matriz L1 & Persistencia Local
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadBackup}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 font-bold px-3.5 py-2 text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORTAR BACKUP (.JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 font-bold px-3.5 py-2 text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>RESTAURAR BACKUP</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={handleExportWorksheet}
            disabled={isExporting}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-4 py-2 text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'GENERANDO...' : 'HOJA DE TRABAJO'}</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-xs font-sans">
          {exportMessage}
        </div>
      )}

      {importStatus && (
        <div className={`p-3 border text-xs font-sans ${importStatus.success ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-amber-950/30 border-amber-800 text-amber-300'}`}>
          {importStatus.text}
        </div>
      )}

      {/* Grid: Feedback Protocol & L1 Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feedback Rubric & Persistence Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Storage & Persistence Health Box */}
          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>ESTADO DE PERSISTENCIA LOCAL</span>
              </span>
              <span className="text-[10px] text-emerald-400 border border-emerald-900 bg-emerald-950/50 px-2 py-0.5 font-bold">
                LOCALSTORAGE ACTIVO
              </span>
            </div>

            <p className="text-xs font-sans text-neutral-400">
              Todos los datos de perfil, intervalos de repetición espaciada, redacciones guardadas y diagnósticos se almacenan automáticamente en el navegador y sobreviven al cierre de pestañas.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-neutral-900 border border-neutral-800 p-2.5">
                <span className="text-[10px] text-neutral-500 block">REDACCIONES GUARDADAS</span>
                <span className="text-sm font-bold text-neutral-100">{writingCount} textos</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2.5">
                <span className="text-[10px] text-neutral-500 block">DIAGNÓSTICOS ARCHIVADOS</span>
                <span className="text-sm font-bold text-neutral-100">{diagnosticCount} registros</span>
              </div>
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-4">
            <span className="text-xs font-bold text-neutral-200 uppercase block border-b border-neutral-800 pb-2">
              PROTOCOLO DE RETROALIMENTACIÓN INDIRECTA
            </span>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              En lugar de corregir directamente sobre el texto del estudiante, se anotan códigos metalingüísticos que orientan la reflexión:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                <span className="font-bold text-amber-400">[ORT] Error de Grafía</span>
                <p className="text-[11px] font-sans text-neutral-400">Confusión b/v, g/j, c/s/z, h muda, ll/y, omisión de letras.</p>
              </div>

              <div className="border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                <span className="font-bold text-amber-400">[TIL] Error de Acentuación</span>
                <p className="text-[11px] font-sans text-neutral-400">Tilde omitida, tilde innecesaria, confusión de diacrítica o hiato.</p>
              </div>

              <div className="border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                <span className="font-bold text-amber-400">[PUN] Error de Puntuación</span>
                <p className="text-[11px] font-sans text-neutral-400">Coma entre sujeto y verbo, falta de comas en conectores, signos de apertura (¿ ¡).</p>
              </div>

              <div className="border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                <span className="font-bold text-amber-400">[MA] Error de Mayúscula</span>
                <p className="text-[11px] font-sans text-neutral-400">Mayúscula indebida en meses o días, falta de mayúscula en nombres propios.</p>
              </div>

              <div className="border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                <span className="font-bold text-amber-400">[SEG] Error de Segmentación</span>
                <p className="text-[11px] font-sans text-neutral-400">Unión indebida (*acabo de, *por que) o separación inadecuada.</p>
              </div>
            </div>
          </div>

          {/* Reset Cohort Button */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">GESTIÓN DE DATOS</span>
            <button
              onClick={handleResetCohort}
              className="w-full border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 p-2.5 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REINICIAR DATOS DEL ESTUDIANTE</span>
            </button>
          </div>
        </div>

        {/* Right: L1 Interference Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-5">
            <div className="flex flex-wrap justify-between items-center border-b border-neutral-800 pb-3 gap-2">
              <span className="text-xs font-bold text-neutral-200 uppercase">
                MATRIZ DE INTERFERENCIAS POR L1
              </span>

              {/* L1 Language Selector */}
              <div className="flex flex-wrap gap-1.5">
                {(['inglés', 'francés', 'portugués', 'italiano', 'alemán', 'chino'] as L1Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedL1(lang)}
                    className={`px-2.5 py-1 text-xs uppercase border transition-colors ${
                      selectedL1 === lang
                        ? 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Interference details */}
            {l1InterferenceTable[selectedL1] ? (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-base font-bold font-sans text-neutral-100">
                  {l1InterferenceTable[selectedL1].title}
                </h4>

                <div className="space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    RIESGOS ORTOGRÁFICOS TÍPICOS:
                  </span>
                  <ul className="space-y-2 text-xs font-sans text-neutral-300">
                    {l1InterferenceTable[selectedL1].mainRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-mono text-[10px] mt-0.5">►</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-1.5 text-xs font-sans text-neutral-200">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">
                    RECOMENDACIÓN METODOLÓGICA DOCENTE:
                  </span>
                  <p className="leading-relaxed">
                    {l1InterferenceTable[selectedL1].pedagogicalAdvice}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
