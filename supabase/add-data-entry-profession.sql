insert into public.professions (id, slug, name, category, keywords) values
  (
    'data-entry',
    'data-entry',
    'Data Entry / Carga de Datos',
    'Administracion y Finanzas',
    array['data enter', 'data entry', 'carga de datos', 'administrativo']
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  keywords = excluded.keywords;
