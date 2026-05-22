'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { dataService, Profile, Post, SalaryReport } from '@/lib/data';
import { Users, Trash2, ShieldAlert, FileText, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'salaries'>('posts');
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [salariesList, setSalariesList] = useState<SalaryReport[]>([]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== 'admin') {
      router.push('/');
      return;
    }
    
    async function loadData() {
      setUsersList(await dataService.getAllProfiles());
      setPostsList(await dataService.getAllPostsAdmin());
      setSalariesList(await dataService.getAllSalaryReports());
    }
    
    loadData();
  }, [profile, router]);

  const handleDeletePost = async (id: string) => {
    await dataService.deletePost(id);
    setPostsList(await dataService.getAllPostsAdmin());
  };

  const handleDeleteSalary = async (id: string) => {
    await dataService.deleteSalaryReport(id);
    setSalariesList(await dataService.getAllSalaryReports());
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Acceso Denegado</h1>
        <p className="text-slate-500 mt-2">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 mt-2">Gestiona el foro, salarios y usuarios reportados.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'posts' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Posts del Foro ({postsList.length})
          </button>
          
          <button
            onClick={() => setActiveTab('salaries')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'salaries' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Reportes de Sueldo ({salariesList.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users' ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Usuarios ({usersList.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="divide-y divide-slate-200">
              {postsList.length === 0 && (
                <div className="p-8 text-center text-slate-500">No hay posts.</div>
              )}
              {postsList.map(post => (
                <div key={post.id} className="p-4 sm:p-6 hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{post.flair}</span>
                      <span className="text-xs text-slate-400 font-mono">ID: {post.id} • Autor: {post.authorName}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 truncate">{post.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{post.body}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                    title="Eliminar post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Salaries Tab */}
          {activeTab === 'salaries' && (
            <div className="divide-y divide-slate-200">
              {salariesList.length === 0 && (
                <div className="p-8 text-center text-slate-500">No hay sueldos reportados.</div>
              )}
              {salariesList.map(salary => (
                <div key={salary.id} className="p-4 sm:p-6 hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-mono">ID: {salary.id} • Profesión ID: {salary.professionId}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      ${salary.amountMonthly.toLocaleString('es-AR')} <span className="font-normal text-slate-500">/ mes</span>
                    </h3>
                    <p className="text-sm text-slate-600 capitalize">
                      Modalidad: {salary.modality.replace('_', ' ')} • Seniority: {salary.seniority.replace('_', ' ')} • Provincia: {salary.province}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSalary(salary.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                    title="Eliminar reporte"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="divide-y divide-slate-200">
              {usersList.length === 0 && (
                <div className="p-8 text-center text-slate-500">No hay usuarios.</div>
              )}
              {usersList.map(u => (
                <div key={u.id} className="p-4 sm:p-6 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-4 shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
