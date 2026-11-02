-- ARQWELL Network: private employer PDF storage
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('agency-role-briefs','agency-role-briefs',false,5242880,array['application/pdf'])
on conflict (id) do nothing;
-- Never add anonymous read or write policies on this bucket.
