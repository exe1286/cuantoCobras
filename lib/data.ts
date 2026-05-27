import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import { FALLBACK_PROFESSIONS } from './professions';

export interface Profile {
  id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
}

export interface Profession {
  id: string;
  slug: string;
  name: string;
  category: string;
  keywords?: string[];
}

export interface SalaryReport {
  id: string;
  professionId: string;
  amountMonthly: number;
  modality: 'en_blanco' | 'en_negro' | 'monotributo' | 'autonomo';
  workload?: 'full_time' | 'part_time' | 'por_horas';
  seniority: 'junior' | 'semi' | 'senior' | 'no_aplica';
  province: string;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  body: string;
  flair: string;
  category: string;
  upvotes: number;
  commentsCount: number;
  createdAt: number;
}

export interface Reply {
  id: string;
  postId: string;
  parentId?: string;
  userId: string;
  authorName: string;
  body: string;
  upvotes: number;
  createdAt: number;
}

const FALLBACK_POSTS: Post[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    authorName: 'Pesos_Voladores_4821',
    title: 'Gano $600k en negro, nunca aporte al ANSES. Que hago a los 35?',
    body: 'Trabajo como plomero. Toda mi vida cobre en negro. Me conviene empezar un monotributo para tener aportes al menos?',
    flair: 'consulta',
    category: 'Impuestos y AFIP',
    upvotes: 142,
    commentsCount: 0,
    createdAt: Date.now() - 200000,
  },
];

class SupabaseDataService {
  private fallbackProfiles: Profile[] = [];
  private fallbackSalaryReports: SalaryReport[] = [];
  private fallbackPosts: Post[] = [...FALLBACK_POSTS];
  private fallbackReplies: Reply[] = [];

  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('La conexion con Supabase tardo demasiado. Revisa tu conexion e intenta nuevamente.'));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private mergeWithFallbackProfessions(professions: Profession[]) {
    const byId = new Map<string, Profession>();

    FALLBACK_PROFESSIONS.forEach(profession => {
      byId.set(profession.id, profession);
    });

    professions.forEach(profession => {
      byId.set(profession.id, profession);
    });

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private mapProfile(row: any): Profile {
    return {
      id: row.id,
      uid: row.uid,
      name: row.name,
      email: row.email,
      photoURL: row.photo_url || undefined,
      role: row.role || 'user',
    };
  }

  private mapProfession(row: any): Profession {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      keywords: row.keywords || undefined,
    };
  }

  private mapSalary(row: any): SalaryReport {
    return {
      id: row.id,
      professionId: row.profession_id,
      amountMonthly: row.amount_monthly,
      modality: row.modality,
      workload: row.workload || undefined,
      seniority: row.seniority,
      province: row.province,
      createdAt: new Date(row.created_at).getTime(),
    };
  }

  private mapPost(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      authorName: row.author_name,
      title: row.title,
      body: row.body,
      flair: row.flair,
      category: row.category,
      upvotes: row.upvotes,
      commentsCount: row.comments_count,
      createdAt: new Date(row.created_at).getTime(),
    };
  }

  private mapReply(row: any): Reply {
    return {
      id: row.id,
      postId: row.post_id,
      parentId: row.parent_id || undefined,
      userId: row.user_id,
      authorName: row.author_name,
      body: row.body,
      upvotes: row.upvotes,
      createdAt: new Date(row.created_at).getTime(),
    };
  }

  async getProfileByUid(uid: string) {
    if (!supabase) return this.fallbackProfiles.find(profile => profile.uid === uid);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile', error);
      return undefined;
    }

    return data ? this.mapProfile(data) : undefined;
  }

  async createProfile(profile: Omit<Profile, 'id'>) {
    if (!supabase) {
      const newProfile = { ...profile, id: uuidv4() };
      this.fallbackProfiles.push(newProfile);
      return newProfile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        photo_url: profile.photoURL || null,
        role: profile.role,
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapProfile(data);
  }

  async getProfessions() {
    if (!supabase) return [...FALLBACK_PROFESSIONS];

    try {
      const { data, error } = await supabase
        .from('professions')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading professions', error);
        return [...FALLBACK_PROFESSIONS];
      }

      return this.mergeWithFallbackProfessions(data.map(row => this.mapProfession(row)));
    } catch (error) {
      console.error('Unexpected error loading professions', error);
      return [...FALLBACK_PROFESSIONS];
    }
  }

  async getProfessionBySlug(slug: string) {
    const professions = await this.getProfessions();
    return professions.find(profession => profession.slug === slug);
  }

  async getSalariesByProfessionId(professionId: string) {
    if (!supabase) {
      return this.fallbackSalaryReports
        .filter(report => report.professionId === professionId)
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    const { data, error } = await supabase
      .from('salary_reports')
      .select('*')
      .eq('profession_id', professionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading salary reports', error);
      return [];
    }

    return data.map(row => this.mapSalary(row));
  }

  async getTopProfessions() {
    const professions = await this.getProfessions();

    if (!supabase) {
      const counts = this.fallbackSalaryReports.reduce((acc, report) => {
        acc.set(report.professionId, (acc.get(report.professionId) || 0) + 1);
        return acc;
      }, new Map<string, number>());

      return [...professions]
        .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0) || a.name.localeCompare(b.name))
        .slice(0, 5);
    }

    const { data, error } = await supabase
      .from('salary_reports')
      .select('profession_id');

    if (error) {
      console.error('Error loading top professions', error);
      return professions.slice(0, 5);
    }

    const counts = data.reduce((acc, report) => {
      acc.set(report.profession_id, (acc.get(report.profession_id) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    return [...professions]
      .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0) || a.name.localeCompare(b.name))
      .slice(0, 5);
  }

  async getRecentSalaries() {
    if (!supabase) {
      return this.fallbackSalaryReports
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(report => ({
          ...report,
          profession: FALLBACK_PROFESSIONS.find(profession => profession.id === report.professionId),
        }));
    }

    const { data, error } = await supabase
      .from('salary_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error loading recent salaries', error);
      return [];
    }

    const professions = await this.getProfessions();
    return data.map(row => {
      const salary = this.mapSalary(row);
      return {
        ...salary,
        profession: professions.find(profession => profession.id === salary.professionId),
      };
    });
  }

  async createSalaryReport(report: Omit<SalaryReport, 'id' | 'createdAt'>) {
    if (!supabase) {
      const newReport: SalaryReport = {
        ...report,
        id: uuidv4(),
        createdAt: Date.now(),
      };
      this.fallbackSalaryReports.push(newReport);
      return newReport;
    }

    const { data, error } = await this.withTimeout(
      Promise.resolve(
        supabase
          .from('salary_reports')
          .insert({
            profession_id: report.professionId,
            amount_monthly: report.amountMonthly,
            modality: report.modality,
            workload: report.workload || null,
            seniority: report.seniority,
            province: report.province,
          })
          .select('*')
          .single()
      )
    );

    if (error) throw error;
    return this.mapSalary(data);
  }

  async getTopPosts() {
    const posts = await this.getPosts();
    return posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  }

  async getTrendingPosts() {
    const posts = await this.getPosts();
    return posts.sort((a, b) => (b.upvotes + b.commentsCount * 2) - (a.upvotes + a.commentsCount * 2)).slice(0, 5);
  }

  async getPosts(category?: string) {
    if (!supabase) {
      let result = [...this.fallbackPosts];
      if (category) result = result.filter(post => post.category === category);
      return result.sort((a, b) => b.createdAt - a.createdAt);
    }

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error) {
      console.error('Error loading posts', error);
      return [];
    }

    return data.map(row => this.mapPost(row));
  }

  async getPostById(id: string) {
    if (!supabase) return this.fallbackPosts.find(post => post.id === id);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading post', error);
      return undefined;
    }

    return data ? this.mapPost(data) : undefined;
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'upvotes' | 'commentsCount'>) {
    if (!supabase) {
      const newPost: Post = {
        ...post,
        id: uuidv4(),
        upvotes: 0,
        commentsCount: 0,
        createdAt: Date.now(),
      };
      this.fallbackPosts.push(newPost);
      return newPost;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.userId,
        author_name: post.authorName,
        title: post.title,
        body: post.body,
        flair: post.flair,
        category: post.category,
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapPost(data);
  }

  async upvotePost(id: string) {
    if (!supabase) {
      const post = this.fallbackPosts.find(item => item.id === id);
      if (post) post.upvotes += 1;
      return post;
    }

    const post = await this.getPostById(id);
    if (!post) return undefined;

    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapPost(data);
  }

  async getRepliesByPostId(postId: string) {
    if (!supabase) {
      return this.fallbackReplies
        .filter(reply => reply.postId === postId)
        .sort((a, b) => a.createdAt - b.createdAt);
    }

    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading replies', error);
      return [];
    }

    return data.map(row => this.mapReply(row));
  }

  async createReply(reply: Omit<Reply, 'id' | 'createdAt' | 'upvotes'>) {
    if (!supabase) {
      const newReply: Reply = {
        ...reply,
        id: uuidv4(),
        upvotes: 0,
        createdAt: Date.now(),
      };
      this.fallbackReplies.push(newReply);
      const post = this.fallbackPosts.find(item => item.id === reply.postId);
      if (post) post.commentsCount += 1;
      return newReply;
    }

    const { data, error } = await supabase
      .from('replies')
      .insert({
        post_id: reply.postId,
        parent_id: reply.parentId || null,
        user_id: reply.userId,
        author_name: reply.authorName,
        body: reply.body,
      })
      .select('*')
      .single();

    if (error) throw error;

    const post = await this.getPostById(reply.postId);
    if (post) {
      await supabase
        .from('posts')
        .update({ comments_count: post.commentsCount + 1 })
        .eq('id', reply.postId);
    }

    return this.mapReply(data);
  }

  async upvoteReply(id: string) {
    if (!supabase) {
      const reply = this.fallbackReplies.find(item => item.id === id);
      if (reply) reply.upvotes += 1;
      return reply;
    }

    const { data: current, error: loadError } = await supabase
      .from('replies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (loadError || !current) {
      if (loadError) console.error('Error loading reply', loadError);
      return undefined;
    }

    const { data, error } = await supabase
      .from('replies')
      .update({ upvotes: current.upvotes + 1 })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapReply(data);
  }

  async getAllProfiles() {
    if (!supabase) return [...this.fallbackProfiles];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading profiles', error);
      return [];
    }

    return data.map(row => this.mapProfile(row));
  }

  async getAllPostsAdmin() {
    return this.getPosts();
  }

  async getAllSalaryReports() {
    if (!supabase) return [...this.fallbackSalaryReports];

    const { data, error } = await supabase
      .from('salary_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading all salary reports', error);
      return [];
    }

    return data.map(row => this.mapSalary(row));
  }

  async deletePost(id: string) {
    if (!supabase) {
      this.fallbackPosts = this.fallbackPosts.filter(post => post.id !== id);
      return true;
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async deleteSalaryReport(id: string) {
    if (!supabase) {
      this.fallbackSalaryReports = this.fallbackSalaryReports.filter(report => report.id !== id);
      return true;
    }

    const { error } = await supabase.from('salary_reports').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const dataService = new SupabaseDataService();
