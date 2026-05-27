'use client';

import { useState, useEffect } from 'react';
import { dataService, Profession } from '@/lib/data';
import { DollarSign, Search } from 'lucide-react';
import Link from 'next/link';
import { searchProfessions } from '@/lib/search';

export default function Salarios() {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      setProfessions(await dataService.getProfessions());
    }
    load();
  }, []);

  const filtered = searchProfessions(professions, query);
  const categories = Array.from(new Set(professions.map(profession => profession.category))).sort();

  return (
    <div className="max-w-screen-xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-0">
      
      {/* Header */}
      <div className="col-span-1 lg:col-span-12 bg-slate-900 text-white rounded-2xl p-8 lg:p-12 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <DollarSign className="w-12 h-12 text-emerald-400 mb-4 relative z-10" />
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 relative z-10 text-center">Buscador Salarial Colaborativo</h1>
        <p className="text-slate-400 text-center max-w-xl relative z-10 text-sm md:text-base">
          Explora sueldos reales en Argentina, aportados de forma anónima por la propia comunidad.
        </p>

        <div className="mt-6 z-10">
          <Link href="/salarios/aportar" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm inline-block">
            Aportar mi sueldo
          </Link>
        </div>
        
        <div className="w-full max-w-2xl relative mt-8 z-10">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar por profesión o rubro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700 rounded-xl text-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-400 transition-shadow"
          />
        </div>
        <div className="mt-4 relative z-10 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
          <span>{filtered.length} profesiones encontradas</span>
          <span>/</span>
          <span>{categories.length} rubros</span>
        </div>
      </div>

      {/* Grid of professions */}
      <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(prof => (
          <Link href={`/salarios/${prof.slug}`} key={prof.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 bg-slate-50 inline-block px-2 py-0.5 rounded-sm self-start">
              {prof.category}
            </span>
            <h3 className="text-lg font-bold text-slate-800 mb-6">{prof.name}</h3>
            <div className="mt-auto pt-4 border-t border-slate-100 text-emerald-600 text-xs font-bold tracking-wide uppercase flex items-center justify-between">
               Ver historial
               <span>&rarr;</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
             <p className="text-slate-500">No hay profesiones cargadas que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

    </div>
  );
}
