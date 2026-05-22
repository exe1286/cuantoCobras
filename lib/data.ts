import { v4 as uuidv4 } from 'uuid';

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

class MockDataService {
  profiles: Profile[] = [];
  professions: Profession[] = [];
  salaryReports: SalaryReport[] = [];
  posts: Post[] = [];
  replies: Reply[] = [];

  constructor() {
    this.initMockData();
  }

  initMockData() {
    this.profiles = [
      { id: 'admin1', uid: 'mock-admin', name: 'Admin', email: 'admin@test.com', role: 'admin' },
    ];

    this.professions = [
      // Tecnología
      { id: '1', slug: 'programador-web', name: 'Programador Web', category: 'Tecnología', keywords: ['desarrollador', 'developer', 'sistemas', 'programación'] },
      { id: 'tech-2', slug: 'desarrollador-backend', name: 'Desarrollador Backend', category: 'Tecnología', keywords: ['programador', 'developer', 'sistemas', 'programación', 'back'] },
      { id: 'tech-3', slug: 'desarrollador-frontend', name: 'Desarrollador Frontend', category: 'Tecnología', keywords: ['programador', 'developer', 'sistemas', 'programación', 'front'] },
      { id: 'tech-4', slug: 'desarrollador-mobile', name: 'Desarrollador Mobile', category: 'Tecnología', keywords: ['programador', 'developer', 'sistemas', 'programación', 'app', 'android', 'ios'] },
      { id: 'tech-5', slug: 'analista-de-datos', name: 'Analista de Datos', category: 'Tecnología', keywords: ['data', 'analytics', 'programación', 'sistemas'] },
      { id: 'tech-6', slug: 'cientifico-de-datos', name: 'Científico de Datos', category: 'Tecnología', keywords: ['data', 'science', 'programación', 'sistemas'] },
      { id: 'tech-7', slug: 'ingeniero-devops', name: 'Ingeniero DevOps', category: 'Tecnología', keywords: ['programador', 'sistemas', 'infraestructura'] },
      { id: 'tech-8', slug: 'arquitecto-de-software', name: 'Arquitecto de Software', category: 'Tecnología', keywords: ['programador', 'developer', 'sistemas', 'programación'] },
      { id: 'tech-9', slug: 'qa-tester', name: 'QA Tester', category: 'Tecnología', keywords: ['programador', 'sistemas', 'testing', 'calidad'] },
      { id: 'tech-10', slug: 'disenador-ux-ui', name: 'Diseñador UX/UI', category: 'Tecnología', keywords: ['design', 'web', 'interfaces'] },
      { id: 'tech-11', slug: 'scrum-master', name: 'Scrum Master', category: 'Tecnología', keywords: ['agile', 'sistemas', 'proyectos'] },
      { id: 'tech-12', slug: 'soporte-tecnico', name: 'Soporte Técnico', category: 'Tecnología', keywords: ['sistemas', 'helpdesk', 'it'] },
      { id: 'tech-13', slug: 'administrador-redes', name: 'Administrador de Redes', category: 'Tecnología', keywords: ['sistemas', 'redes', 'it'] },
      { id: 'tech-14', slug: 'seguridad-informatica', name: 'Especialista en Seguridad Informática', category: 'Tecnología', keywords: ['sistemas', 'ciberseguridad', 'it'] },
      
      // Salud
      { id: '3', slug: 'medico-clinico', name: 'Médico Clínico', category: 'Salud' },
      { id: 'sal-2', slug: 'medico-pediatra', name: 'Médico Pediatra', category: 'Salud' },
      { id: 'sal-3', slug: 'medico-cardiologo', name: 'Médico Cardiólogo', category: 'Salud' },
      { id: 'sal-4', slug: 'medico-cirujano', name: 'Médico Cirujano', category: 'Salud' },
      { id: 'sal-5', slug: 'medico-anestesista', name: 'Médico Anestesiólogo', category: 'Salud' },
      { id: 'sal-6', slug: 'medico-ginecologo', name: 'Médico Ginecólogo', category: 'Salud' },
      { id: 'sal-7', slug: 'medico-psiquiatra', name: 'Médico Psiquiatra', category: 'Salud' },
      { id: 'sal-8', slug: 'medico-traumatologo', name: 'Médico Traumatólogo', category: 'Salud' },
      { id: 'sal-8b', slug: 'medico-oftalmologo', name: 'Médico Oftalmólogo', category: 'Salud' },
      { id: 'sal-8c', slug: 'medico-dermatologo', name: 'Médico Dermatólogo', category: 'Salud' },
      { id: 'sal-8d', slug: 'medico-neurologo', name: 'Médico Neurólogo', category: 'Salud' },
      { id: 'sal-8e', slug: 'medico-endocrinologo', name: 'Médico Endocrinólogo', category: 'Salud' },
      { id: 'sal-8f', slug: 'medico-gastroenterologo', name: 'Médico Gastroenterólogo', category: 'Salud' },
      { id: 'sal-9', slug: 'enfermero', name: 'Enfermero/a', category: 'Salud' },
      { id: 'sal-10', slug: 'odontologo', name: 'Odontólogo/a', category: 'Salud' },
      { id: 'sal-11', slug: 'psicologo', name: 'Psicólogo/a', category: 'Salud' },
      { id: 'sal-12', slug: 'kinesiologo', name: 'Kinesiólogo/a', category: 'Salud' },
      { id: 'sal-13', slug: 'nutricionista', name: 'Nutricionista', category: 'Salud' },
      { id: 'sal-14', slug: 'farmaceutico', name: 'Farmacéutico/a', category: 'Salud' },
      { id: 'sal-15', slug: 'fonoaudiologo', name: 'Fonoaudiólogo/a', category: 'Salud' },
      { id: 'sal-16', slug: 'bioquimico', name: 'Bioquímico/a', category: 'Salud' },
      { id: 'sal-17', slug: 'acompanante-terapeutico', name: 'Acompañante Terapéutico', category: 'Salud' },
      { id: 'sal-18', slug: 'radiologo', name: 'Técnico/a Radiólogo/a', category: 'Salud' },
      
      // Educación
      { id: '4', slug: 'docente-primaria', name: 'Docente Nivel Primario', category: 'Educación' },
      { id: 'edu-2', slug: 'docente-secundaria', name: 'Docente Nivel Secundario', category: 'Educación' },
      { id: 'edu-3', slug: 'docente-universitario', name: 'Docente Universitario', category: 'Educación' },
      { id: 'edu-4', slug: 'docente-nivel-inicial', name: 'Docente Nivel Inicial', category: 'Educación' },
      { id: 'edu-5', slug: 'preceptor', name: 'Preceptor/a', category: 'Educación' },
      { id: 'edu-6', slug: 'director-escuela', name: 'Director/a de Escuela', category: 'Educación' },
      { id: 'edu-7', slug: 'profesor-educacion-fisica', name: 'Profesor/a de Educación Física', category: 'Educación' },
      { id: 'edu-8', slug: 'profesor-ingles', name: 'Profesor/a de Inglés', category: 'Educación' },
      { id: 'edu-9', slug: 'psicopedagogo', name: 'Psicopedagogo/a', category: 'Educación' },
      
      // Construcción y Oficios
      { id: '2', slug: 'plomero', name: 'Plomero', category: 'Oficios y Construcción' },
      { id: 'ofi-2', slug: 'electricista', name: 'Electricista', category: 'Oficios y Construcción' },
      { id: 'ofi-3', slug: 'gasista', name: 'Gasista Matriculado', category: 'Oficios y Construcción' },
      { id: 'ofi-4', slug: 'albanil', name: 'Albañil', category: 'Oficios y Construcción' },
      { id: 'ofi-5', slug: 'maestro-mayor-de-obras', name: 'Maestro Mayor de Obras', category: 'Oficios y Construcción' },
      { id: 'ofi-6', slug: 'carpintero', name: 'Carpintero/a', category: 'Oficios y Construcción' },
      { id: 'ofi-7', slug: 'herrero', name: 'Herrero', category: 'Oficios y Construcción' },
      { id: 'ofi-8', slug: 'pintor', name: 'Pintor/a', category: 'Oficios y Construcción' },
      { id: 'ofi-9', slug: 'mecanico', name: 'Mecánico/a Automotor', category: 'Oficios y Construcción' },
      { id: 'ofi-10', slug: 'peluquero', name: 'Peluquero/a / Barber/a', category: 'Oficios y Construcción' },
      { id: 'ofi-11', slug: 'esteticista', name: 'Esteticista / Cosmetólogo/a', category: 'Oficios y Construcción' },
      
      // Comercio y Ventas
      { id: '5', slug: 'vendedor-local', name: 'Vendedor/a de Local', category: 'Comercio y Ventas' },
      { id: 'com-2', slug: 'cajero', name: 'Cajero/a', category: 'Comercio y Ventas' },
      { id: 'com-3', slug: 'encargado-local', name: 'Encargado/a de Local', category: 'Comercio y Ventas' },
      { id: 'com-4', slug: 'ejecutivo-de-cuentas', name: 'Ejecutivo/a de Cuentas', category: 'Comercio y Ventas' },
      { id: 'com-5', slug: 'representante-comercial', name: 'Representante Comercial', category: 'Comercio y Ventas' },
      { id: 'com-6', slug: 'repositor', name: 'Repositor/a', category: 'Comercio y Ventas' },
      { id: 'com-7', slug: 'corredor-inmobiliario', name: 'Corredor/a Inmobiliario/a', category: 'Comercio y Ventas' },
      { id: 'com-8', slug: 'promotor', name: 'Promotor/a', category: 'Comercio y Ventas' },
      
      // Gastronomía
      { id: 'gas-1', slug: 'cocinero', name: 'Cocinero/a', category: 'Gastronomía' },
      { id: 'gas-2', slug: 'chef', name: 'Chef', category: 'Gastronomía' },
      { id: 'gas-3', slug: 'camarero', name: 'Camarero/a / Mozo', category: 'Gastronomía' },
      { id: 'gas-4', slug: 'barista', name: 'Barista', category: 'Gastronomía' },
      { id: 'gas-5', slug: 'bartender', name: 'Bartender', category: 'Gastronomía' },
      { id: 'gas-6', slug: 'ayudante-cocina', name: 'Ayudante de Cocina', category: 'Gastronomía' },
      { id: 'gas-7', slug: 'pastelero', name: 'Pastelero/a', category: 'Gastronomía' },
      { id: 'gas-8', slug: 'panadero', name: 'Panadero/a', category: 'Gastronomía' },
      { id: 'gas-9', slug: 'bachero', name: 'Bachero/a', category: 'Gastronomía' },
      
      // Administración y Finanzas
      { id: 'adm-1', slug: 'contador-publico', name: 'Contador/a Público/a', category: 'Administración y Finanzas' },
      { id: 'adm-2', slug: 'analista-financiero', name: 'Analista Financiero', category: 'Administración y Finanzas' },
      { id: 'adm-3', slug: 'analista-contable', name: 'Analista Contable', category: 'Administración y Finanzas' },
      { id: 'adm-4', slug: 'asistente-administrativo', name: 'Asistente Administrativo', category: 'Administración y Finanzas' },
      { id: 'adm-5', slug: 'liquidador-sueldos', name: 'Liquidador de Sueldos', category: 'Administración y Finanzas' },
      { id: 'adm-6', slug: 'auditor', name: 'Auditor/a', category: 'Administración y Finanzas' },
      { id: 'adm-7', slug: 'recepcionista', name: 'Recepcionista', category: 'Administración y Finanzas' },
      { id: 'adm-8', slug: 'gerente-rrhh', name: 'Gerente / Analista de RRHH', category: 'Administración y Finanzas' },
      { id: 'adm-9', slug: 'selector-personal', name: 'Selector/a de Personal (Recruiter)', category: 'Administración y Finanzas' },
      { id: 'adm-10', slug: 'economista', name: 'Economista', category: 'Administración y Finanzas' },
      
      // Ingeniería
      { id: 'ing-1', slug: 'ingeniero-civil', name: 'Ingeniero/a Civil', category: 'Ingeniería' },
      { id: 'ing-2', slug: 'ingeniero-industrial', name: 'Ingeniero/a Industrial', category: 'Ingeniería' },
      { id: 'ing-3', slug: 'ingeniero-mecanico', name: 'Ingeniero/a Mecánico/a', category: 'Ingeniería' },
      { id: 'ing-4', slug: 'ingeniero-electronico', name: 'Ingeniero/a Electrónico/a', category: 'Ingeniería' },
      { id: 'ing-5', slug: 'ingeniero-agronomo', name: 'Ingeniero/a Agrónomo/a', category: 'Ingeniería' },
      { id: 'ing-6', slug: 'ingeniero-quimico', name: 'Ingeniero/a Químico/a', category: 'Ingeniería' },
      { id: 'ing-7', slug: 'ingeniero-sistemas', name: 'Ingeniero/a en Sistemas', category: 'Ingeniería' },
      { id: 'ing-8', slug: 'ingeniero-petroleo', name: 'Ingeniero/a en Petróleo', category: 'Ingeniería' },
      { id: 'ing-9', slug: 'arquitecto', name: 'Arquitecto/a', category: 'Ingeniería y Construcción' },
      { id: 'ing-10', slug: 'agrimensor', name: 'Agrimensor/a', category: 'Ingeniería y Construcción' },
      
      // Legales
      { id: 'leg-1', slug: 'abogado', name: 'Abogado/a General', category: 'Legales' },
      { id: 'leg-2', slug: 'abogado-laboralista', name: 'Abogado/a Laboralista', category: 'Legales' },
      { id: 'leg-3', slug: 'abogado-penalista', name: 'Abogado/a Penalista', category: 'Legales' },
      { id: 'leg-4', slug: 'abogado-civil', name: 'Abogado/a Civil', category: 'Legales' },
      { id: 'leg-5', slug: 'abogado-comercial', name: 'Abogado/a Comercial / Corporativo', category: 'Legales' },
      { id: 'leg-6', slug: 'escribano', name: 'Escribano/a', category: 'Legales' },
      { id: 'leg-7', slug: 'paralegal', name: 'Paralegal / Asistente Legal', category: 'Legales' },
      
      // Diseño y Comunicación
      { id: 'dis-1', slug: 'disenador-grafico', name: 'Diseñador/a Gráfico/a', category: 'Diseño y Comunicación' },
      { id: 'dis-2', slug: 'disenador-industrial', name: 'Diseñador/a Industrial', category: 'Diseño y Comunicación' },
      { id: 'dis-3', slug: 'disenador-indumentaria', name: 'Diseñador/a de Indumentaria', category: 'Diseño y Comunicación' },
      { id: 'dis-4', slug: 'community-manager', name: 'Community Manager', category: 'Diseño y Comunicación' },
      { id: 'dis-5', slug: 'redactor-copywriter', name: 'Redactor/a / Copywriter', category: 'Diseño y Comunicación' },
      { id: 'dis-6', slug: 'periodista', name: 'Periodista', category: 'Diseño y Comunicación' },
      { id: 'dis-7', slug: 'fotografo', name: 'Fotógrafo/a', category: 'Diseño y Comunicación' },
      { id: 'dis-8', slug: 'editor-video', name: 'Editor/a de Video', category: 'Diseño y Comunicación' },
      { id: 'dis-9', slug: 'productor-audiovisual', name: 'Productor/a Audiovisual', category: 'Diseño y Comunicación' },
      { id: 'dis-10', slug: 'relaciones-publicas', name: 'Relaciones Públicas (RRPP)', category: 'Diseño y Comunicación' },
      
      // Logística y Transporte
      { id: 'log-1', slug: 'chofer-camion', name: 'Chofer de Camión', category: 'Logística y Transporte' },
      { id: 'log-2', slug: 'chofer-colectivo', name: 'Chofer de Colectivo', category: 'Logística y Transporte' },
      { id: 'log-3', slug: 'taxista-remisero', name: 'Taxista / Remisero / Uber / Cabify', category: 'Logística y Transporte' },
      { id: 'log-4', slug: 'repartidor', name: 'Repartidor/a (Moto/Bici/Auto)', category: 'Logística y Transporte' },
      { id: 'log-5', slug: 'operario-deposito', name: 'Operario/a de Depósito', category: 'Logística y Transporte' },
      { id: 'log-6', slug: 'analista-logistica', name: 'Analista de Logística', category: 'Logística y Transporte' },
      { id: 'log-7', slug: 'despachante-aduana', name: 'Despachante de Aduana', category: 'Logística y Transporte' },
      { id: 'log-8', slug: 'maquinista', name: 'Maquinista de Tren', category: 'Logística y Transporte' },
      
      // Seguridad y Fuerzas Armadas
      { id: 'seg-1', slug: 'policia', name: 'Policía', category: 'Seguridad' },
      { id: 'seg-2', slug: 'vigilador-privado', name: 'Vigilador/a Privado/a', category: 'Seguridad' },
      { id: 'seg-3', slug: 'bombero', name: 'Bombero/a', category: 'Seguridad' },
      { id: 'seg-4', slug: 'militar', name: 'Militar (Ejército/Armada/Fuerza Aérea)', category: 'Seguridad' },
      { id: 'seg-5', slug: 'gendarme', name: 'Gendarme / Prefecto', category: 'Seguridad' },
      
      // Otros Profesionales y Creadores
      { id: 'otr-1', slug: 'creador-contenido', name: 'Creador de Contenido / Streamer', category: 'Otros' },
      { id: 'otr-2', slug: 'deportista-profesional', name: 'Deportista Profesional', category: 'Otros' },
      { id: 'otr-3', slug: 'entrenador-personal', name: 'Entrenador/a Personal (Personal Trainer)', category: 'Otros' },
      { id: 'otr-4', slug: 'guia-turismo', name: 'Guía de Turismo', category: 'Otros' },
      { id: 'otr-5', slug: 'traductor', name: 'Traductor/a / Intérprete', category: 'Otros' },
      { id: 'otr-6', slug: 'veterinario', name: 'Médico/a Veterinario/a', category: 'Otros' },
      { id: 'otr-7', slug: 'paseador-perros', name: 'Paseador/a de Perros', category: 'Otros' },
      { id: 'otr-8', slug: 'empleada-domestica', name: 'Personal de Casas Particulares (Limpieza/Cuidado)', category: 'Otros' },
      { id: 'otr-9', slug: 'gestor', name: 'Gestor/a', category: 'Otros' },
      { id: 'otr-10', slug: 'musico-artista', name: 'Músico/a / Artista', category: 'Otros' }
    ];

    // TODO: Eliminar estos datos simulados en producción
    // Se generan datos simulados para todas las categorías
    this.salaryReports = [];
    const modalities: ('en_blanco' | 'en_negro' | 'monotributo' | 'autonomo')[] = ['en_blanco', 'en_negro', 'monotributo', 'autonomo'];
    const workloads: ('full_time' | 'part_time' | 'por_horas')[] = ['full_time', 'full_time', 'part_time', 'por_horas'];
    const seniorities: ('junior' | 'semi' | 'senior' | 'no_aplica')[] = ['junior', 'semi', 'senior', 'no_aplica'];
    const provinces = ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Neuquén', 'Tucumán'];
    
    this.professions.forEach((prof) => {
      const reportsCount = Math.floor(Math.random() * 3) + 3; // 3 a 5 reportes
      for (let j = 0; j < reportsCount; j++) {
        // Sueldo base random dependiendo para tener variabilidad
        const baseSalary = 300000 + Math.floor(Math.random() * 1500000);
        
        this.salaryReports.push({
          id: `sim-${prof.id}-${j}`,
          professionId: prof.id,
          amountMonthly: baseSalary,
          modality: modalities[Math.floor(Math.random() * modalities.length)],
          workload: workloads[Math.floor(Math.random() * workloads.length)],
          seniority: seniorities[Math.floor(Math.random() * seniorities.length)],
          province: provinces[Math.floor(Math.random() * provinces.length)],
          createdAt: Date.now() - Math.floor(Math.random() * 10000000)
        });
      }
    });

    // Posts iniciales del foro
    this.posts = [
      { id: '1', userId: 'anon1', authorName: 'Pesos_Voladores_4821', title: 'Gano $600k en negro, nunca aporté al ANSES. ¿Qué hago a los 35?', body: 'Trabajo como plomero. Toda mi vida cobré en negro. Tengo algo ahorrado en billete pero no llego a comprar una casa. ¿Me conviene empezar un monotributo para tener aportes al menos? Siento que se me pasa el tiempo laboral fuerte.', flair: 'consulta', category: 'Impuestos y AFIP', upvotes: 142, commentsCount: 2, createdAt: Date.now() - 200000 },
      { id: '2', userId: 'anon2', authorName: 'Ahorro_Cronico_0392', title: 'Pagué mi deuda de tarjeta de $800k. Cómo lo logré en 8 meses', body: 'Quería compartir este logro. Estuve pagando el mínimo por meses y la bola de nieve era gigante. Armé un presupuesto estricto, corté salidas al 100% y licué una parte vendiendo la moto usada.', flair: 'logro', category: 'Ahorro y Presupuesto', upvotes: 89, commentsCount: 1, createdAt: Date.now() - 300000 },
      { id: '3', userId: 'anon3', authorName: 'Trader_Mate_99', title: '¿Vale la pena el plazo fijo hoy o me paso a MEP?', body: 'Con la inflación mostrando estos números, ¿ustedes siguen apostando a instrumentos en pesos a corto plazo o directamente se pasaron todo a MEP?', flair: 'inversion', category: 'Inversiones', upvotes: 56, commentsCount: 1, createdAt: Date.now() - 400000 },
    ];

    this.replies = [
      { id: 'r1', postId: '1', userId: 'anon4', authorName: 'ContadorFeliz', body: 'Sí, metete en el monotributo ya. La categoría más baja te da aportes y obra social por chirolas. Es mejor empezar a sumar años.', upvotes: 45, createdAt: Date.now() - 150000 },
      { id: 'r1-1', parentId: 'r1', postId: '1', userId: 'anon1', authorName: 'Pesos_Voladores_4821', body: '¡Gracias genio! ¿Qué categoría me recomendas para empezar?', upvotes: 12, createdAt: Date.now() - 140000 },
      { id: 'r1-1-1', parentId: 'r1-1', postId: '1', userId: 'anon4', authorName: 'ContadorFeliz', body: 'La categoría A o B están perfectas para arrancar sin problema.', upvotes: 4, createdAt: Date.now() - 130000 },
      { id: 'r2', postId: '1', userId: 'anon5', authorName: 'ElPunta', body: 'Depende, si vas a comprar USD crocante y guardarlos bajo colchón, no sirve. Pero el monotributo para blanquear algo y poder justificar compras grandes (como un autito) sirve mucho.', upvotes: 30, createdAt: Date.now() - 100000 },
      { id: 'r3', postId: '2', userId: 'anon6', authorName: 'Motoquero', body: 'Qué dolor lo de la moto, pero la libertad financiera lo vale. ¡Felicitaciones crack!', upvotes: 15, createdAt: Date.now() - 250000 },
      { id: 'r4', postId: '3', userId: 'anon7', authorName: 'InversorPRO', body: 'MEP sin dudarlo. El plazo fijo a 30 días te deja muy expuesto si hay salto cambiario. Hacé tasa en USD y dormí tranquilo.', upvotes: 22, createdAt: Date.now() - 350000 }
    ];
  }

  // Métodos de Auth (simulado provisionalmente)
  async getProfileByUid(uid: string) { return this.profiles.find(p => p.uid === uid); }
  async createProfile(profile: Omit<Profile, 'id'>) {
    const newProfile = { ...profile, id: uuidv4() };
    this.profiles.push(newProfile);
    return newProfile;
  }

  // Métodos para el Buscador Salarial
  async getProfessions() { return [...this.professions]; }
  async getProfessionBySlug(slug: string) {
    return this.professions.find(p => p.slug === slug);
  }

  async getSalariesByProfessionId(professionId: string) {
    return this.salaryReports
      .filter(s => s.professionId === professionId)
      .sort((a,b) => b.createdAt - a.createdAt);
  }

  async getTopProfessions() { return this.professions.slice(0, 5); }
  
  async getRecentSalaries() { 
    return this.salaryReports
      .sort((a,b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(s => ({
        ...s, 
        profession: this.professions.find(p => p.id === s.professionId)
      }));
  }

  async createSalaryReport(report: Omit<SalaryReport, 'id' | 'createdAt'>) {
    const newReport: SalaryReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    this.salaryReports.push(newReport);
    return newReport;
  }

  // Métodos para el Foro Financiero
  async getTopPosts() { return [...this.posts].sort((a,b) => b.upvotes - a.upvotes).slice(0, 5); }
  async getTrendingPosts() {
    // Trending = score basado en upvotes y comentarios recientes (acá simpelmente ordenamos por upvotes + comments)
    return [...this.posts].sort((a, b) => (b.upvotes + b.commentsCount * 2) - (a.upvotes + a.commentsCount * 2)).slice(0, 5);
  }
  async getPosts(category?: string) {
    let result = [...this.posts];
    if (category) {
      result = result.filter(p => p.category === category);
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }
  async getPostById(id: string) {
    return this.posts.find(p => p.id === id);
  }
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'upvotes' | 'commentsCount'>) {
    const newPost: Post = {
      ...post,
      id: uuidv4(),
      upvotes: 0,
      commentsCount: 0,
      createdAt: Date.now()
    };
    this.posts.push(newPost);
    return newPost;
  }
  async upvotePost(id: string) {
    const post = this.posts.find(p => p.id === id);
    if (post) post.upvotes += 1;
    return post;
  }
  
  async getRepliesByPostId(postId: string) {
    return this.replies.filter(r => r.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  }
  async createReply(reply: Omit<Reply, 'id' | 'createdAt' | 'upvotes'>) {
    const newReply: Reply = {
      ...reply,
      id: uuidv4(),
      upvotes: 0,
      createdAt: Date.now()
    };
    this.replies.push(newReply);
    const post = this.posts.find(p => p.id === reply.postId);
    if (post) post.commentsCount += 1;
    return newReply;
  }
  async upvoteReply(id: string) {
    const reply = this.replies.find(r => r.id === id);
    if (reply) reply.upvotes += 1;
    return reply;
  }

  // Métodos de Admin
  async getAllProfiles() { return [...this.profiles]; }
  async getAllPostsAdmin() { return [...this.posts]; }
  async getAllSalaryReports() { return [...this.salaryReports]; }
  
  async deletePost(id: string) {
    this.posts = this.posts.filter(p => p.id !== id);
    return true;
  }
  
  async deleteSalaryReport(id: string) {
    this.salaryReports = this.salaryReports.filter(s => s.id !== id);
    return true;
  }
}

export const dataService = new MockDataService();
