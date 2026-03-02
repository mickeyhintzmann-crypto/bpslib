alter table if exists public.case_images
  add column if not exists path text;

update public.case_images
set path = regexp_replace(url, '^.*?/storage/v1/object/public/case-images/', '')
where path is null
  and url like '%/storage/v1/object/public/case-images/%';

create index if not exists case_images_path_idx on public.case_images(path);

notify pgrst, 'reload schema';
