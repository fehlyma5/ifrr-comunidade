-- Execute no SQL Editor do Supabase.
-- Antes de publicar, revise as políticas com a equipe técnica/institucional.

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  course text not null check (course in (
    'Letras','TADS','Biologia','Educação Física','Saneamento Ambiental',
    'Matemática','Gestão Hospitalar','Gestão de Turismo','Memória institucional / evento'
  )),
  caption text not null check (char_length(caption) between 1 and 500),
  memory_year integer null check (memory_year is null or memory_year between 1970 and 2026),
  contributor text null check (contributor is null or char_length(contributor) <= 100),
  image_url text not null,
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  permission_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

-- Visitantes só leem registros aprovados.
create policy "Public can view approved memories"
on public.memories for select
to anon, authenticated
using (status = 'approved');

-- O formulário pode enviar metadados; novos itens sempre entram pendentes.
create policy "Public can submit pending memories"
on public.memories for insert
to anon, authenticated
with check (
  status = 'pending'
  and permission_confirmed = true
  and char_length(caption) between 1 and 500
);

-- Crie manualmente um bucket chamado memorial-fotos em Storage.
-- Marque-o como público para exibir imagens com URL pública.
-- Limite o tamanho do arquivo para 8 MB e os tipos MIME para JPEG, PNG e WebP.
-- Política básica para permitir upload no bucket:
create policy "Public can upload memorial photos"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'memorial-fotos'
  and (storage.extension(name) = 'jpg' or storage.extension(name) = 'jpeg'
       or storage.extension(name) = 'png' or storage.extension(name) = 'webp')
);

-- IMPORTANTE:
-- A política acima é um ponto de partida, não uma proteção completa contra abuso.
-- Para produção, implemente moderação autenticada, rate limit/CAPTCHA,
-- validação de arquivos no servidor, fluxo de exclusão e política de privacidade.
-- Somente equipe autorizada deve poder alterar status para approved/rejected.
