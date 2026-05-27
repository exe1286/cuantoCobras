'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { dataService, Profession, SalaryReport } from '@/lib/data';
import { FALLBACK_PROFESSIONS } from '@/lib/professions';
import { DollarSign, Send, AlertCircle, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { searchProfessions } from '@/lib/search';
import { formatReportDate, MAX_REASONABLE_SALARY, MIN_REASONABLE_SALARY } from '@/lib/salary-utils';

const PROVINCES = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán', 'CABA'
].sort();

export default function AportarSueldo() {
  const { user } = useAuth();
  const router = useRouter();

  const [professions, setProfessions] = useState<Profession[]>(FALLBACK_PROFESSIONS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [professionId, setProfessionId] = useState('');
  const [amountMonthly, setAmountMonthly] = useState('');
  const [modality, setModality] = useState<'en_blanco' | 'en_negro' | 'monotributo' | 'autonomo'>('en_blanco');
  const [workload, setWorkload] = useState<'full_time' | 'part_time' | 'por_horas'>('full_time');
  const [seniority, setSeniority] = useState<'junior' | 'semi' | 'senior' | 'no_aplica'>('junior');
  const [province, setProvince] = useState('CABA');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExistingReport, setIsLoadingExistingReport] = useState(false);
  const [existingReport, setExistingReport] = useState<SalaryReport | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const loadedProfessions = await dataService.getProfessions();
        if (isMounted && loadedProfessions.length > 0) {
          setProfessions(loadedProfessions);
        }
      } catch (err) {
        console.error('Error loading professions', err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.uid || !professionId) return;
    const currentUserId = user.uid;
    const currentProfessionId = professionId;

    let isMounted = true;

    async function loadExistingReport() {
      setIsLoadingExistingReport(true);
      const report = await dataService.getUserSalaryReportByProfession(currentUserId, currentProfessionId);
      if (!isMounted) return;

      setExistingReport(report || null);
      if (report) {
        setAmountMonthly(String(report.amountMonthly));
        setModality(report.modality);
        setWorkload(report.workload || 'full_time');
        setSeniority(report.seniority);
        setProvince(report.province);
      }
      setIsLoadingExistingReport(false);
    }

    loadExistingReport();

    return () => {
      isMounted = false;
    };
  }, [professionId, user?.uid]);

  // Group and sort professions
  const filteredProfessions = searchProfessions(professions, searchQuery);

  const professionsByCategory = filteredProfessions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Profession[]>);

  const sortedCategories = Object.keys(professionsByCategory).sort();
  sortedCategories.forEach(c => professionsByCategory[c].sort((a,b) => a.name.localeCompare(b.name)));

  const selectedProfession = professions.find(p => p.id === professionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (!user) {
      setError('Tenes que iniciar sesion para aportar o actualizar tu sueldo.');
      return;
    }
    
    if (!professionId) {
      setError('Por favor seleccioná una profesión.');
      return;
    }
    const parsedAmount = Number(amountMonthly);
    if (!amountMonthly || isNaN(parsedAmount) || parsedAmount < MIN_REASONABLE_SALARY) {
      setError(`Por favor ingresa un sueldo mensual mayor a $${MIN_REASONABLE_SALARY.toLocaleString('es-AR')}.`);
      return;
    }
    if (parsedAmount > MAX_REASONABLE_SALARY) {
      setError(`Ese monto parece demasiado alto. El maximo permitido es $${MAX_REASONABLE_SALARY.toLocaleString('es-AR')}.`);
      return;
    }

    const submissionKey = `${professionId}:${parsedAmount}:${modality}:${workload}:${seniority}:${province}`;
    const lastSubmission = window.localStorage.getItem('cuantocobras:last-salary-submission');
    if (lastSubmission) {
      const [lastKey, lastTimestamp] = lastSubmission.split('|');
      if (lastKey === submissionKey && Date.now() - Number(lastTimestamp) < 60000) {
        setError('Este aporte ya fue enviado hace menos de un minuto. Espera un momento antes de repetirlo.');
        return;
      }
    }

    if (!window.confirm('Confirmas que el monto es neto mensual, en mano, y que los datos son reales?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dataService.upsertSalaryReport({
        userId: user.uid,
        professionId,
        amountMonthly: parsedAmount,
        modality,
        workload,
        seniority,
        province,
      });
      window.localStorage.setItem('cuantocobras:last-salary-submission', `${submissionKey}|${Date.now()}`);
      setExistingReport(null);
      setSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/salarios');
      }, 3000);
    } catch (err) {
      console.error('Error creating salary report', err);

      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Ocurrió un error al guardar tu aporte. Intentá nuevamente.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full p-4 lg:p-0 my-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ingresá para aportar tu sueldo</h2>
          <p className="text-slate-500 mb-6">
            Para mantener la calidad de los datos, te pedimos que inicies sesión. Tu aporte seguirá siendo <strong className="text-slate-700">100% anónimo</strong> (no publicamos tu nombre ni foto).
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/salarios" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto w-full p-4 lg:p-0 my-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Aporte guardado con éxito!</h2>
          <p className="text-slate-500 mb-6">
            Gracias por ayudar a construir una comunidad más transparente. Tu dato ya forma parte de las estadísticas anónimas.
          </p>
          <p className="text-sm border border-slate-100 bg-slate-50 rounded-lg p-3 inline-block">
            Serás redirigido/a al buscador en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-4 lg:p-0 my-8">
      <div className="bg-slate-900 rounded-t-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">Aportá tu sueldo</h1>
            <p className="text-slate-400 text-sm mt-1">Tu aporte es 100% anónimo y ayuda a toda la comunidad.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
          <p>
            <strong>Importante:</strong> Para que los datos sean realmente útiles, te pedimos que aportes información verídica y precisa. 
            El sitio no solicita comprobantes ni recibos de sueldo, dependemos de la buena fe de la comunidad para construir referencias salariales justas para todos.
            Tu cuenta se usa solo para evitar duplicados y permitirte actualizar tu aporte. Publicamente no mostramos tu nombre, email ni foto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
               <AlertCircle className="w-4 h-4 shrink-0" />
               {error}
            </div>
          )}

          {/* Profesión con Buscador */}
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-2">Profesión o Puesto</label>
            <div 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all"
              onClick={() => setIsDropdownOpen(true)}
            >
              {selectedProfession ? (
                <div className="flex flex-col">
                  <span className="text-slate-900 font-medium">{selectedProfession.name}</span>
                  <span className="text-slate-500 text-xs">{selectedProfession.category}</span>
                </div>
              ) : (
                <span className="text-slate-400">Buscar tu profesión...</span>
              )}
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Escribí para buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-slate-900 text-sm"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {sortedCategories.length > 0 ? (
                    sortedCategories.map(cat => (
                      <div key={cat} className="mb-2 last:mb-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2 bg-slate-50 rounded-lg">{cat}</div>
                        <div className="mt-1">
                          {professionsByCategory[cat].map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setProfessionId(p.id);
                                setExistingReport(null);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                professionId === p.id 
                                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No se encontraron profesiones.
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              </>
            )}
          </div>

          {isLoadingExistingReport && (
            <div className="bg-slate-50 text-slate-600 p-4 rounded-xl text-sm border border-slate-200">
              Revisando si ya tenes un aporte para esta profesion...
            </div>
          )}

          {existingReport && (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100 flex gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Ya aportaste un sueldo para esta profesion.</p>
                <p className="mt-1">
                  Vamos a actualizar tu aporte existente en vez de crear otro. Ultima actualizacion: {formatReportDate(existingReport.updatedAt || existingReport.createdAt)}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sueldo */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sueldo neto mensual (en mano)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Ej: 850000"
                  value={amountMonthly}
                  onChange={(e) => setAmountMonthly(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                  min={MIN_REASONABLE_SALARY}
                  max={MAX_REASONABLE_SALARY}
                  step="1000"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Rango permitido: ${MIN_REASONABLE_SALARY.toLocaleString('es-AR')} a ${MAX_REASONABLE_SALARY.toLocaleString('es-AR')} netos mensuales.
              </p>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Provincia</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Modalidad de contratación</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'en_blanco', label: 'En Blanco' },
                { value: 'en_negro', label: 'En Negro' },
                { value: 'monotributo', label: 'Monotributo' },
                { value: 'autonomo', label: 'Autónomo' }
              ].map(mod => (
                <label
                  key={mod.value}
                  className={`border rounded-xl p-3 cursor-pointer text-center text-sm font-medium transition-colors ${
                    modality === mod.value 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={mod.value}
                    checked={modality === mod.value}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="hidden"
                  />
                  {mod.label}
                </label>
              ))}
            </div>
          </div>

          {/* Workload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Jornada Laboral</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'full_time', label: 'Full-Time (Jornada Completa)' },
                { value: 'part_time', label: 'Part-Time (Media Jornada)' },
                { value: 'por_horas', label: 'Por horas / Proyecto' }
              ].map(wl => (
                <label
                  key={wl.value}
                  className={`border rounded-xl p-3 cursor-pointer text-center text-sm font-medium transition-colors ${
                    workload === wl.value 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="workload"
                    value={wl.value}
                    checked={workload === wl.value}
                    onChange={(e) => setWorkload(e.target.value as any)}
                    className="hidden"
                  />
                  {wl.label}
                </label>
              ))}
            </div>
          </div>

          {/* Seniority */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Nivel de experiencia (Seniority)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'junior', label: 'Junior (0-2 años)' },
                { value: 'semi', label: 'Semi Sr (2-5 años)' },
                { value: 'senior', label: 'Senior (5+ años)' },
                { value: 'no_aplica', label: 'No aplica / Único' }
              ].map(sen => (
                <label
                  key={sen.value}
                  className={`border rounded-xl p-3 cursor-pointer text-center text-sm font-medium transition-colors ${
                    seniority === sen.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="seniority"
                    value={sen.value}
                    checked={seniority === sen.value}
                    onChange={(e) => setSeniority(e.target.value as any)}
                    className="hidden"
                  />
                  {sen.label}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/salarios" className="text-slate-500 hover:text-slate-700 font-medium text-sm">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingExistingReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {existingReport ? 'Actualizar aporte' : 'Publicar aporte'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
