'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService, Profession, SalaryReport } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, User, Building, MapPin, Briefcase } from 'lucide-react';

export default function ProfessionSalariesPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [profession, setProfession] = useState<Profession | null>(null);
  const [salaries, setSalaries] = useState<SalaryReport[]>([]);
  
  const [filterSeniority, setFilterSeniority] = useState<string>('all');
  const [filterModality, setFilterModality] = useState<string>('all');
  const [filterWorkload, setFilterWorkload] = useState<string>('all');

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  async function loadData() {
    const p = await dataService.getProfessionBySlug(slug as string);
    if (!p) {
      router.push('/salarios');
      return;
    }
    setProfession(p);
    setSalaries(await dataService.getSalariesByProfessionId(p.id));
  }

  if (!profession) {
    return <div className="p-8 text-center text-slate-500">Cargando...</div>;
  }

  // Calculate stats
  const filteredSalaries = salaries.filter(s => {
    if (filterSeniority !== 'all' && s.seniority !== filterSeniority) return false;
    if (filterModality !== 'all' && s.modality !== filterModality) return false;
    if (filterWorkload !== 'all' && s.workload !== filterWorkload) return false;
    return true;
  });

  const amounts = filteredSalaries.map(s => s.amountMonthly).sort((a, b) => a - b);
  const averageSalary = amounts.length > 0 ? amounts.reduce((acc, curr) => acc + curr, 0) / amounts.length : 0;
  const minSalary = amounts.length > 0 ? amounts[0] : 0;
  const maxSalary = amounts.length > 0 ? amounts[amounts.length - 1] : 0;

  return (
    <div className="max-w-screen-xl mx-auto w-full p-4 lg:p-0 mb-12">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al buscador
        </Link>
        <Link href="/salarios/aportar" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
          Aportar mi sueldo
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8 bg-gradient-to-br from-white to-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mb-3 inline-block">
              {profession.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900">{profession.name}</h1>
          </div>
          <div className="bg-slate-100 rounded-2xl px-5 py-3 border border-slate-200 text-right">
            <p className="text-slate-500 text-sm font-medium">Muestra basada en</p>
            <p className="text-2xl font-bold text-slate-800">
              {filteredSalaries.length} <span className="text-base font-normal text-slate-500">reportes</span>
            </p>
          </div>
        </div>
        
        {salaries.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-100 py-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Seniority</label>
              <select value={filterSeniority} onChange={e => setFilterSeniority(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Suma total (Todos)</option>
                <option value="junior">Junior (0-2 años)</option>
                <option value="semi">Semi Sr (2-5 años)</option>
                <option value="senior">Senior (5+ años)</option>
                <option value="no_aplica">No aplica / Único</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Modalidad</label>
              <select value={filterModality} onChange={e => setFilterModality(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Suma total (Todos)</option>
                <option value="en_blanco">En Blanco</option>
                <option value="en_negro">En Negro</option>
                <option value="monotributo">Monotributo</option>
                <option value="autonomo">Autónomo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jornada</label>
              <select value={filterWorkload} onChange={e => setFilterWorkload(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">Suma total (Todos)</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="por_horas">Por horas / Proyecto</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <p className="text-slate-500 text-sm font-medium mb-1 line-clamp-1">Sueldo Mínimo Reportado</p>
            <p className="text-3xl font-bold text-slate-700">
              ${minSalary > 0 ? minSalary.toLocaleString('es-AR', { maximumFractionDigits: 0 }) : '---'}
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
            <p className="text-indigo-600 text-sm font-medium mb-1 relative z-10 line-clamp-1">Sueldo Promedio</p>
            <p className="text-4xl font-bold text-indigo-700 relative z-10">
              ${averageSalary > 0 ? averageSalary.toLocaleString('es-AR', { maximumFractionDigits: 0 }) : '---'}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <p className="text-slate-500 text-sm font-medium mb-1 line-clamp-1">Sueldo Máximo Reportado</p>
            <p className="text-3xl font-bold text-slate-700">
              ${maxSalary > 0 ? maxSalary.toLocaleString('es-AR', { maximumFractionDigits: 0 }) : '---'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Reportes detallados</h2>
        {filteredSalaries.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
             <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-2">No hay reportes de sueldo para estos filtros</h3>
             <p className="text-slate-500 mb-6">Intentá limpiar los filtros o aportá un nuevo sueldo.</p>
             {(filterSeniority !== 'all' || filterModality !== 'all' || filterWorkload !== 'all') ? (
               <button 
                 onClick={() => {
                   setFilterSeniority('all');
                   setFilterModality('all');
                   setFilterWorkload('all');
                 }}
                 className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors inline-block"
               >
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
              <div key={salary.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">${salary.amountMonthly.toLocaleString('es-AR')}</h3>
                    <p className="text-xs font-mono text-slate-400">hace unos días</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {salary.modality.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3 mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium capitalize">Seniority: {salary.seniority.replace('_', ' ')}</span>
                  </div>
                  {salary.workload && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="capitalize text-slate-600">Modalidad: {salary.workload.replace('_', ' ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Provincia: {salary.province}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
