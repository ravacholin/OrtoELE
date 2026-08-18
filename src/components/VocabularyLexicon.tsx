import React, { useState } from 'react';
import { UserProfile, OrthoWordItem } from '../types';
import { ORTHOGRAPHY_WORD_BANK } from '../data/orthographyBank';
import { srsManager } from '../utils/srsEngine';
import { speechService } from '../utils/speech';
import { Search, Volume2, ArrowRight } from 'lucide-react';

interface VocabularyLexiconProps {
  profile: UserProfile;
  onOpenCoach: (targetWord?: OrthoWordItem, sentence?: string) => void;
  onTrainWord: (wordItem: OrthoWordItem) => void;
}

export const VocabularyLexicon: React.FC<VocabularyLexiconProps> = ({
  onTrainWord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedWord, setSelectedWord] = useState<OrthoWordItem | null>(null);

  const srsStates = srsManager.getSrsItems();

  const filteredWords = ORTHOGRAPHY_WORD_BANK.filter(item => {
    const wordMeaning = item.meaning || item.semanticField || item.rule;
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wordMeaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLvl = selectedLevel === 'all' || item.level === selectedLevel;
    return matchesSearch && matchesCat && matchesLvl;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">LEXICÓN MENTAL</span>
          <h2 className="text-2xl font-bold font-sans text-neutral-100">
            Diccionario de Adquisición & Huellas Ortográficas
          </h2>
        </div>
        <div className="text-xs text-neutral-400">
          <span className="font-bold text-neutral-100">{filteredWords.length}</span> términos catalogados
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-neutral-950 p-4 border border-neutral-800 text-xs">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por palabra, regla o significado..."
            className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-neutral-300 focus:outline-none focus:border-neutral-600"
          >
            <option value="all">Todas las categorías</option>
            <option value="accentuation">Acentuación</option>
            <option value="spellings">Grafías dudosas (b/v, g/j...)</option>
            <option value="punctuation">Puntuación</option>
            <option value="morphology">Morfología & Sufijos</option>
          </select>
        </div>

        {/* Level Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-neutral-300 focus:outline-none focus:border-neutral-600"
          >
            <option value="all">Todos los niveles (A1-C2)</option>
            <option value="A1">A1 · Acceso</option>
            <option value="A2">A2 · Plataforma</option>
            <option value="B1">B1 · Umbral</option>
            <option value="B2">B2 · Avanzado</option>
            <option value="C1">C1 · Dominio</option>
          </select>
        </div>
      </div>

      {/* Main Lexicon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => {
          const srsState = srsStates[item.id]?.state || 'NUEVO';
          const meaning = item.meaning || item.semanticField || item.rule;
          const exSentence = item.exampleSentence || item.examples?.[0]?.sentence || '';
          const accentType = item.accentType || item.subcategory;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedWord(item)}
              className="border border-neutral-800 bg-neutral-950 hover:border-neutral-700 p-4 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xl font-bold text-neutral-100 group-hover:text-neutral-300 transition-colors">
                  {item.word}
                </span>
                <span className={`text-[10px] px-2 py-0.5 font-bold uppercase border ${
                  srsState === 'DOMINADO' ? 'border-emerald-900 bg-emerald-950/40 text-emerald-300' :
                  srsState === 'ESTABLE' ? 'border-blue-900 bg-blue-950/40 text-blue-300' :
                  srsState === 'APRENDIENDO' ? 'border-amber-900 bg-amber-950/40 text-amber-300' :
                  'border-neutral-800 bg-neutral-900 text-neutral-500'
                }`}>
                  {srsState}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-neutral-400 font-sans line-clamp-2">{meaning}</div>
                {exSentence && (
                  <div className="text-[11px] text-neutral-500 italic font-sans truncate">«{exSentence}»</div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                <span>Nivel {item.level}</span>
                <span className="text-neutral-400 uppercase">{accentType}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Word Detail Modal / Inspector */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl font-mono">
            <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">FICHA DE LEXICÓN</span>
                <h3 className="text-3xl font-bold text-neutral-100">{selectedWord.word}</h3>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-neutral-500 hover:text-neutral-200 text-xs"
              >
                CERRAR [ESC]
              </button>
            </div>

            {/* Word Characteristics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-neutral-900 p-2.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">SÍLABAS</span>
                <span className="text-neutral-200 font-bold">{selectedWord.syllables.join(' · ')}</span>
              </div>
              <div className="bg-neutral-900 p-2.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">TIPO ACENTUAL</span>
                <span className="text-neutral-200 font-bold uppercase">{selectedWord.accentType || selectedWord.subcategory}</span>
              </div>
              <div className="bg-neutral-900 p-2.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">NIVEL MCER</span>
                <span className="text-neutral-200 font-bold">{selectedWord.level}</span>
              </div>
              <div className="bg-neutral-900 p-2.5 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">CATEGORÍA</span>
                <span className="text-neutral-200 font-bold uppercase truncate">{selectedWord.category}</span>
              </div>
            </div>

            {/* Definition & Example */}
            <div className="space-y-3 text-xs font-sans">
              <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-1.5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Significado & Uso:</span>
                <p className="text-neutral-200 leading-relaxed">{selectedWord.meaning || selectedWord.semanticField}</p>
                {selectedWord.examples?.[0] && (
                  <p className="text-neutral-400 italic text-[11px] pt-1">«{selectedWord.examples[0].sentence}»</p>
                )}
              </div>

              <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Regla & Explicación Fonológica:</span>
                <p className="text-neutral-300 leading-relaxed">{selectedWord.rule}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => speechService.speak(selectedWord.word, { rate: 0.9 })}
                className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 px-4 py-2.5 text-xs flex items-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Escuchar pronunciación</span>
              </button>

              <button
                onClick={() => {
                  onTrainWord(selectedWord);
                  setSelectedWord(null);
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2.5 text-xs flex items-center space-x-1.5"
              >
                <span>Entrenar en laboratorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
