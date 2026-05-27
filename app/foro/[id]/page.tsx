'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService, Post, Reply } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';
import { MessageSquare, ArrowLeft, ThumbsUp, Send, Reply as ReplyIcon } from 'lucide-react';
import Link from 'next/link';

function ReplyNode({ 
  reply, 
  allReplies, 
  onVote, 
  onReply, 
  replyingTo, 
  setReplyingTo, 
  user,
  newReplyBody,
  setNewReplyBody,
  handleReplySubmit,
  depth = 0 
}: { 
  reply: Reply, 
  allReplies: Reply[], 
  onVote: (id: string) => void,
  onReply: (id: string) => void,
  replyingTo: string | null,
  setReplyingTo: (v: string | null) => void,
  user: any,
  newReplyBody: string,
  setNewReplyBody: (v: string) => void,
  handleReplySubmit: (e: React.FormEvent, parentId?: string) => void,
  depth?: number
}) {
  const childReplies = allReplies.filter(r => r.parentId === reply.id);

  return (
    <div className={`flex gap-3 sm:gap-4 ${depth > 0 ? 'mt-4' : ''}`}>
      {/* Indentation line wrapper */}
      <div className="flex flex-col items-center">
        <button 
           onClick={() => onVote(reply.id)}
           className="flex flex-col items-center h-min p-1.5 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors group/rvote z-10 bg-white"
         >
           <ThumbsUp className="w-4 h-4 text-slate-400 group-hover/rvote:text-indigo-600 mb-1" />
           <span className="text-xs font-bold text-slate-500 group-hover/rvote:text-indigo-700">{reply.upvotes}</span>
        </button>
        {childReplies.length > 0 && (
          <div className="w-px h-full bg-slate-200 mt-2 mb-2"></div>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-slate-800 text-sm">u/{reply.authorName}</span>
            <span className="text-xs text-slate-400 font-medium">hace unas horas</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.body}</p>
          
          <div className="mt-3 flex items-center gap-4">
            <button 
              onClick={() => onReply(reply.id)}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <ReplyIcon className="w-3.5 h-3.5" /> Responder
            </button>
          </div>
        </div>

        {/* Reply Box inline for this comment */}
        {replyingTo === reply.id && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-2">
            {user ? (
               <form onSubmit={(e) => handleReplySubmit(e, reply.id)} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 mt-1">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea 
                      autoFocus
                      required
                      rows={2}
                      placeholder="Escribí tu respuesta..."
                      value={newReplyBody}
                      onChange={e => setNewReplyBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y text-sm mb-2"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setReplyingTo(null)}
                        className="text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 text-sm">
                        <Send className="w-3.5 h-3.5" /> Responder
                      </button>
                    </div>
                  </div>
               </form>
            ) : (
                <p className="text-sm text-slate-500">Debés iniciar sesión para responder.</p>
            )}
          </div>
        )}

        {/* Child Replies */}
        {childReplies.length > 0 && (
          <div className="mt-4">
            {childReplies.map(child => (
               <ReplyNode 
                 key={child.id}
                 reply={child}
                 allReplies={allReplies}
                 onVote={onVote}
                 onReply={onReply}
                 replyingTo={replyingTo}
                 setReplyingTo={setReplyingTo}
                 user={user}
                 newReplyBody={newReplyBody}
                 setNewReplyBody={setNewReplyBody}
                 handleReplySubmit={handleReplySubmit}
                 depth={depth + 1}
               />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReplyBody, setNewReplyBody] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    const p = await dataService.getPostById(id as string);
    if (!p) {
      router.push('/foro');
      return;
    }
    setPost(p);
    setReplies(await dataService.getRepliesByPostId(id as string));
  }

  async function handleVotePost() {
    if (!post) return;
    await dataService.upvotePost(post.id);
    await loadData();
  }

  async function handleVoteReply(replyId: string) {
    await dataService.upvoteReply(replyId);
    await loadData();
  }

  async function handleReplySubmit(e: React.FormEvent, parentId?: string) {
    e.preventDefault();
    if (!user || !newReplyBody.trim() || !post) return;
    
    await dataService.createReply({
      postId: post.id,
      parentId: parentId,
      userId: user.uid,
      authorName: profile?.username || user.email?.split('@')[0] || 'Anonimo',
      body: newReplyBody,
    });
    
    setNewReplyBody('');
    setReplyingTo(null);
    await loadData();
  }

  if (!post) return <div className="p-8 text-center text-slate-500">Cargando...</div>;

  const topLevelReplies = replies.filter(r => !r.parentId);

  return (
    <div className="max-w-screen-md mx-auto w-full p-4 lg:p-0 mb-12">
      <div className="mb-6">
        <Link href="/foro" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 inline-flex transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al foro
        </Link>
      </div>

      {/* Main Post */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-6 relative">
        <div className="flex items-start gap-4 md:gap-6">
           <button 
             onClick={handleVotePost}
             className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-colors group/vote"
           >
             <ThumbsUp className="w-6 h-6 text-slate-400 group-hover/vote:text-emerald-600 mb-1" />
             <span className="text-base font-bold text-slate-700 group-hover/vote:text-emerald-700">{post.upvotes}</span>
           </button>
           <div className="flex-1">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                   {post.category || post.flair}
                 </span>
                 <span className="text-xs font-mono text-slate-400">u/{post.authorName}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">{post.title}</h1>
              <div className="text-slate-600 text-base md:text-lg whitespace-pre-wrap leading-relaxed">
                {post.body}
              </div>
           </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> 
          {replies.length} Respuestas
        </h3>

        {/* Top-Level Reply Form */}
        <div className="mb-10">
          {user ? (
            <form onSubmit={(e) => handleReplySubmit(e)} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0 mt-1">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea 
                  required
                  rows={3}
                  placeholder="Escribí un comentario..."
                  value={newReplyBody}
                  onChange={e => setNewReplyBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y mb-2 bg-slate-50/50 focus:bg-white"
                  onClick={() => setReplyingTo(null)}
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm shadow-sm hover:shadow-md">
                    <Send className="w-4 h-4" /> Comentar
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <p className="text-slate-600 text-sm font-medium">Debés iniciar sesión para participar en la conversación.</p>
            </div>
          )}
        </div>

        {/* Replies List */}
        <div className="space-y-8">
          {topLevelReplies.map(reply => (
            <ReplyNode 
               key={reply.id}
               reply={reply}
               allReplies={replies}
               onVote={handleVoteReply}
               onReply={(id) => {
                 setReplyingTo(id);
                 setNewReplyBody('');
               }}
               replyingTo={replyingTo}
               setReplyingTo={setReplyingTo}
               user={user}
               newReplyBody={newReplyBody}
               setNewReplyBody={setNewReplyBody}
               handleReplySubmit={handleReplySubmit}
            />
          ))}
          {replies.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">Aún no hay respuestas. ¡Sé el primero!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
