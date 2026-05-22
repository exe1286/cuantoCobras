'use client';

import { useState, useEffect } from 'react';
import { dataService, Profession, Post } from '@/lib/data';
import { Search, TrendingUp, MessageSquare, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [allProfessions, setAllProfessions] = useState<Profession[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentSalaries, setRecentSalaries] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      setProfessions(await dataService.getTopProfessions());
      setAllProfessions(await dataService.getProfessions());
      setPosts(await dataService.getTrendingPosts());
      setRecentSalaries(await dataService.getRecentSalaries());
    }
    load();
  }, []);

  const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const searchResults = query.trim() !== '' 
    ? allProfessions.filter(p => {
        const queryNormalized = normalizeString(query);
        const matchNameOrCat = normalizeString(p.name).includes(queryNormalized) || normalizeString(p.category).includes(queryNormalized);
        if (matchNameOrCat) return true;
        if (p.keywords) {
          return p.keywords.some(k => normalizeString(k).includes(queryNormalized));
        }
        return false;
      })
    : [];

  return (
    <div className="max-w-screen-xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-0">
      
      {/* Search Header Hero (Bento full width) */}
      <div className="col-span-1 lg:col-span-12 bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          ¿Cuánto cobra un...?
        </h1>
        <div className="w-full max-w-2xl relative mb-8 z-50">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Search className="w-6 h-6" />
          </span>
          <input
            type="text"
            aria-label="Buscar profesión"
            placeholder="Buscar profesión (ej. Programador Web, Plomero...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-xl text-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 transition-shadow"
          />
          {query.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left z-50">
              {searchResults.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto">
                  {searchResults.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/salarios/${p.slug}`}
                        className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                      >
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{p.category}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-4 text-center text-slate-500 text-sm">
                  No se encontraron resultados para "{query}"
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
          <span>Profesiones más buscadas:</span>
          {professions.map(p => (
            <Link key={p.id} href={`/salarios/${p.slug}`} className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full text-slate-700 transition-colors font-medium text-xs">
              {p.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Forums Section (Bento Grid Left) */}
      <div className="col-span-1 lg:col-span-8 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lo que se está hablando ahora</h2>
          </div>
          <Link href="/foro" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Ver foro &rarr;</Link>
        </div>
        <div className="space-y-4 flex-1">
          {posts.map(post => (
            <Link href={`/foro/${post.id}`} key={post.id} className="block border border-slate-100 rounded-xl p-5 bg-slate-50/50 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-md">
                  {post.category || post.flair}
                </span>
                <span className="text-xs font-mono text-slate-400">hace unas horas · u/{post.authorName}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">{post.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.body}</p>
              <div className="flex gap-3 text-xs font-medium text-slate-500">
                <span className="flex items-center text-emerald-600">▲ {post.upvotes}</span>
                <span className="w-px h-3 bg-slate-300 my-auto"></span>
                <span className="flex items-center"><MessageSquare className="w-3.5 h-3.5 mr-1.5"/> {post.commentsCount} comentarios</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Salaries Widget (Bento Grid Right) */}
      <div className="col-span-1 lg:col-span-4 bg-slate-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-slate-800 text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Últimos sueldos</h2>
            </div>
            <Link href="/salarios" className="text-xs text-slate-400 hover:text-white">Ver todos</Link>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2" style={{ maxHeight: '420px' }}>
            {recentSalaries.map(salary => (
              <Link href={`/salarios/${salary.profession?.slug}`} key={salary.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 hover:border-slate-600 transition-colors block">
                <p className="text-xs font-bold text-slate-400 mb-1">{salary.profession?.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <p className="text-2xl font-bold text-white">${salary.amountMonthly.toLocaleString('es-AR')}</p>
                  <p className="text-xs text-slate-500 font-medium">/ mes</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase tracking-widest">{salary.modality.replace('_', ' ')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase tracking-widest">{salary.seniority.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/salarios/aportar" className="mt-6 w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-colors">
            Aportá tu sueldo
          </Link>
        </div>
      </div>

    </div>
  );
}
