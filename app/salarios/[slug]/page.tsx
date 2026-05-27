'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService, Profession, SalaryReport } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Briefcase, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import {
  formatMoney,
  formatReportDate,
  getSalaryStats,
  MODALITY_LABELS,
  SENIORITY_LABELS,
  WORKLOAD_LABELS,
} from '@/lib/salary-utils';

export default function ProfessionSalariesPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [profession, setProfession] = useState<Profession | null>(null);
  const [salaries, setSalaries] = useState<SalaryReport[]>([]);
  const [filterSeniority, setFilterSeniority] = useState<string>('all');
  const [filterModality, setFilterModality] = useState<string>('all');
  const [filterWorkload, setFilterWorkload] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function loadData() {
      const loadedProfession = await dataService.getProfessionBySlug(slug as string);
      if (!isMounted) return;

      if (!loadedProfession) {
        router.push('/salarios');
        return;
      }

      const loadedSalaries = await dataService.getSalariesByProfessionId(loadedProfession.id);
      if (!isMounted) return;

      setProfession(loadedProfession);
      setSalaries(loadedSalaries);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router, slug]);

  const provinces = useMemo(() => (
    Array.from(new Set(salaries.map(salary => salary.province))).sort()
  ), [salaries]);

  const filteredSalaries = useMemo(() => salaries.filter(salary => {
    if (filterSeniority !== 'all' && salary.seniority !== filterSeniority) return false;
    if (filterModality !== 'all' && salary.modality !== filterModality) return false;
    if (filterWorkload !== 'all' && salary.workload !== filterWorkload) return false;
    if (filterProvince !== 'all' && salary.province !== filterProvince) return false;
    return true;
  }), [filterModality, filterProvince, filterSeniority, filterWorkload, salaries]);

  const stats = useMemo(() => getSalaryStats(filteredSalaries), [filteredSalaries]);
  const activeFilterCount = [filterSeniority, filterModality, filterWorkload, filterProvince]
    .filter(value => value !== 'all').length;

  const clearFilters = () => {
    setFilterSeniority('all');
    setFilterModality('all');
    setFilterWorkload('all');
    setFilterProvince('all');
  };

  if (!profession) {
    return <div className="p-8 text-center text-slate-500">Cargando...</div>;
  }

  const statCards = [
    { label: 'Mediana', value: stats.median, tone: 'bg-emerald-50 border-emerald-100 text-emerald-700', hint: 'La referencia mas estable' },
    { label: 'Promedio', value: stats.average, tone: 'bg-indigo-50 border-indigo-100 text-indigo-700', hint: 'Puede moverse con extremos' },
    { label: 'Minimo', value: stats.min, tone: 'bg-white border-slate-200 text-slate-800', hint: 'Reporte mas bajo' },
    { label: 'Maximo', value: stats.max, tone: 'bg-white border-slate-200 text-slate-800', hint: 'Reporte mas alto' },
  ];
  const shouldShowStats = stats.hasEnoughData;

  return (
    <div className="max-w-screen-xl mx-auto w-full p-4 lg:p-0 mb-12">
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
        <Link href="/salarios" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a salarios
        </Link>
        <Link href="/salarios/aportar" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm text-center">
          Aportar mi sueldo
        </Link>
      </div>

      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mb-3 inline-block">
              {profession.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">{profession.name}</h1>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl">
              Datos anonimos aportados por la comunidad. Las estadisticas excluyen valores extremos para que la referencia sea mas justa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Muestra</p>
              <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Filtros</p>
              <p className="text-2xl font-bold text-slate-900">{activeFilterCount}</p>
            </div>
          </div>
        </div>

        {salaries.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-y border-slate-100 py-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Provincia</label>
              <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Todas</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Seniority</label>
              <select value={filterSeniority} onChange={e => setFilterSeniority(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Todos</option>
                <option value="junior">Junior</option>
                <option value="semi">Semi Sr</option>
                <option value="senior">Senior</option>
                <option value="no_aplica">No aplica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contratacion</label>
              <select value={filterModality} onChange={e => setFilterModality(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Todas</option>
                <option value="en_blanco">En blanco</option>
                <option value="en_negro">En negro</option>
                <option value="monotributo">Monotributo</option>
                <option value="autonomo">Autonomo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jornada</label>
              <select value={filterWorkload} onChange={e => setFilterWorkload(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Todas</option>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="por_horas">Por horas / Proyecto</option>
              </select>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="mb-6 text-sm font-bold text-indigo-600 hover:text-indigo-800">
            Limpiar filtros
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className={`border rounded-2xl p-6 shadow-sm ${card.tone}`}>
              <p className="text-sm font-semibold opacity-80">{card.label}</p>
              <p className={`mt-1 font-bold ${shouldShowStats ? 'text-3xl' : 'text-xl'}`}>
                {shouldShowStats && card.value > 0 ? formatMoney(card.value) : 'Datos insuficientes'}
              </p>
              <p className="mt-2 text-xs opacity-70">
                {shouldShowStats ? card.hint : 'Se muestran los reportes, pero no se publica una referencia estadistica.'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 text-sm">Calidad de muestra</p>
              <p className="text-sm text-slate-500">
                {stats.hasEnoughData ? 'Hay suficientes reportes para una referencia inicial.' : 'Hay menos de 3 reportes; ocultamos promedio, mediana y extremos para no sobrerrepresentar un dato aislado.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 text-sm">Valores filtrados</p>
              <p className="text-sm text-slate-500">{stats.ignoredCount} reporte(s) fuera de rango no entran en las estadisticas.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 text-sm">Referencia sugerida</p>
              <p className="text-sm text-slate-500">Usa la mediana antes que el promedio cuando haya poca muestra.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reportes detallados</h2>
            <p className="text-sm text-slate-500">{filteredSalaries.length} aporte(s) coinciden con los filtros actuales.</p>
          </div>
        </div>

        {filteredSalaries.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
             <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-2">No hay reportes para estos filtros</h3>
             <p className="text-slate-500 mb-6">Proba limpiar filtros o aporta un nuevo sueldo.</p>
             {activeFilterCount > 0 ? (
               <button onClick={clearFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors inline-block">
                 Limpiar filtros
               </button>
             ) : (
               <Link href="/salarios/aportar" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors inline-block">
                 Aportar mi sueldo
               </Link>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSalaries.map(salary => (
              <article key={salary.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{formatMoney(salary.amountMonthly)}</h3>
                    <p className="text-xs font-mono text-slate-400">{formatReportDate(salary.createdAt)}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {MODALITY_LABELS[salary.modality]}
                  </span>
                </div>

                <div className="space-y-3 mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{SENIORITY_LABELS[salary.seniority]}</span>
                  </div>
                  {salary.workload && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{WORKLOAD_LABELS[salary.workload]}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{salary.province}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
