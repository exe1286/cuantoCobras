'use client';

import { useState, useEffect } from 'react';
import { dataService, Post } from '@/lib/data';
import { MessageSquare, PlusCircle, TrendingUp, Clock, Filter, ChevronRight, ThumbsUp, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const FORUM_CATEGORIES = [
  'Todos',
  'Impuestos y AFIP',
  'Ahorro y Presupuesto',
  'Inversiones',
  'Empleo y Salarios',
  'Otros'
];

export default function Foro() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState(FORUM_CATEGORIES[1]);
  
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [activeCategory, sortBy]);

  async function loadPosts() {
    let loadedPosts = activeCategory === 'Todos' 
      ? await dataService.getPosts() 
      : await dataService.getPosts(activeCategory);
      
    if (sortBy === 'trending') {
      loadedPosts = loadedPosts.sort((a, b) => (b.upvotes + b.commentsCount * 2) - (a.upvotes + a.commentsCount * 2));
    }
    
    setPosts(loadedPosts);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newBody.trim()) return;
    
    await dataService.createPost({
      userId: user.uid,
      authorName: user.email?.split('@')[0] || 'Anonimo',
      title: newTitle,
      body: newBody,
      flair: 'consulta', // Default flair for user posts
      category: newCategory
    });
    
    setIsCreating(false);
    setNewTitle('');
    setNewBody('');
    await loadPosts();
  }

  async function handleUpvote(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    e.stopPropagation();
    await dataService.upvotePost(postId);
    await loadPosts(); // Refresh quietly
  }

  return (
    <div className="max-w-screen-xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 lg:p-0 mb-12">
      
      {/* Sidebar - Categories */}
      <div className="col-span-1 space-y-4">
        {/* Forum Header Mobile/Desktop Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
           <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
             <MessageSquare className="w-6 h-6 text-indigo-500" />
             Foro Comunitario
           </h1>
           <p className="text-slate-500 text-sm mb-6">Discutí sobre salarios, inversiones y finanzas personales.</p>
           
           {user ? (
             <button 
               onClick={() => setIsCreating(true)}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
             >
                <PlusCircle className="w-5 h-5" />
                Crear Post
             </button>
           ) : (
             <div className="text-center p-3 text-sm font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-xl">
                Iniciá sesión para postear
             </div>
           )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hidden lg:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Categorías</h3>
          <ul className="space-y-1">
            {FORUM_CATEGORIES.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    activeCategory === cat 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && <ChevronRight className="w-4 h-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-1 lg:col-span-3 space-y-6">
        
        {/* Create Post Modal / Inline */}
        {isCreating && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-indigo-200 relative animate-in fade-in slide-in-from-top-4 duration-300">
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="Ej: ¿Qué broker recomiendan?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                >
                  {FORUM_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuerpo del post</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Desarrollá tu idea..."
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                  Publicar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
             <button 
               onClick={() => setSortBy('recent')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'recent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Clock className="w-4 h-4" /> Recientes
             </button>
             <button 
               onClick={() => setSortBy('trending')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'trending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <TrendingUp className="w-4 h-4" /> Populares
             </button>
          </div>
          
          <div className="lg:hidden">
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700"
            >
              {FORUM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map(post => (
            <Link href={`/foro/${post.id}`} key={post.id} className="block bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
               <div className="flex items-start gap-4">
                 
                 {/* Upvote Button (Desktop/Tablet layout mostly) */}
                 <button 
                   onClick={(e) => handleUpvote(e, post.id)}
                   className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group/vote"
                 >
                   <ThumbsUp className="w-5 h-5 text-slate-400 group-hover/vote:text-indigo-600 mb-1" />
                   <span className="text-sm font-bold text-slate-700 group-hover/vote:text-indigo-700">{post.upvotes}</span>
                 </button>

                 <div className="flex-1">
                   <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-md">
                         {post.category || post.flair}
                       </span>
                       <span className="text-xs font-mono text-slate-400 mt-1">u/{post.authorName}</span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{post.title}</h3>
                   <p className="text-slate-500 line-clamp-2 text-sm sm:text-base mb-4">{post.body}</p>
                   
                   <div className="flex items-center gap-4">
                     {/* Upvote Button for Mobile */}
                     <button 
                       onClick={(e) => handleUpvote(e, post.id)}
                       className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                     >
                        <ThumbsUp className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">{post.upvotes}</span>
                     </button>

                     <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                       <MessageSquare className="w-4 h-4 mr-1.5"/> {post.commentsCount} comentarios
                     </span>
                   </div>
                 </div>
               </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Nada por aquí</h3>
              <p className="text-slate-500 text-sm">Sé el primero en iniciar una conversación en esta categoría.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
