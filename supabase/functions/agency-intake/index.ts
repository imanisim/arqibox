// ARQWELL Agency intake endpoint for candidates, hiring managers, and training inquiries.
// Deploy with verify_jwt=false. Cloudflare Turnstile MUST be configured.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
const allowed = new Set(['https://arqwell.net', 'https://www.arqwell.net']);
const cors = (origin:string) => ({'Access-Control-Allow-Origin':allowed.has(origin)?origin:'https://arqwell.net','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Content-Type':'application/json'});
const respond=(status:number,data:unknown,origin:string)=>new Response(JSON.stringify(data),{status,headers:cors(origin)});
const str=(v:unknown,max=160)=>typeof v==='string'?v.trim().slice(0,max):'';
Deno.serve(async (req:Request) => {
  const origin=req.headers.get('origin')||'';
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=='POST') return respond(405,{error:'Method not allowed'},origin);
  if(!allowed.has(origin)) return respond(403,{error:'Origin not permitted'},origin);
  if(!turnstileSecret||!supabaseUrl||!serviceKey) return respond(503,{error:'Intake service has not been configured'},origin);
  if(Number(req.headers.get('content-length')||0)>18000) return respond(413,{error:'Request too large'},origin);
  let p:Record<string,unknown>;
  try{
    const raw=await req.text();
    if(new TextEncoder().encode(raw).length>18000) return respond(413,{error:'Request too large'},origin);
    const parsed=JSON.parse(raw);
    if(!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw new Error('Not an object');
    p=parsed;
  }catch{return respond(400,{error:'Invalid request'},origin)}
  if(str(p.website_fax)) return respond(400,{error:'Invalid submission'},origin);
  const type=str(p.type),name=str(p.full_name),email=str(p.email),role=str(p.role),location=str(p.location),discipline=str(p.discipline),availability=str(p.availability);
  if(!['candidate','employer','training'].includes(type)||name.length<2||!/^\S+@\S+\.\S+$/.test(email)||role.length<2||!location||!discipline||!availability||p.consent!==true) return respond(400,{error:'Complete the required fields'},origin);
  if(type==='employer' && (!str(p.organization)||!str(p.message))) return respond(400,{error:'Provide a company and hiring description'},origin);
  if(type==='training' && (!str(p.organization)||!str(p.message)||!str(p.training_budget)||!str(p.training_budget_basis)||!str(p.training_trainees))) return respond(400,{error:'Complete your organization, training plan and budget fields'},origin);
  // Server-side captcha validation. CORS alone is NOT a security boundary.
  const token=str(p.turnstile_token,4096);
  if(!token) return respond(400,{error:'Verification required'},origin);
  const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:turnstileSecret,response:token})}).then(r=>r.json()).catch(()=>({success:false}));
  if(!verified.success || !['arqwell.net','www.arqwell.net'].includes(String(verified.hostname||''))) return respond(400,{error:'Verification failed. Please retry.'},origin);
  const db=createClient(supabaseUrl,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  // Small per-email submission throttle (the captcha is the main spam defense).
  const since=new Date(Date.now()-15*60*1000).toISOString();
  const {count}=await db.from('agency_leads').select('*',{count:'exact',head:true}).eq('email',email.toLowerCase()).gte('created_at',since);
  if((count||0)>=2) return respond(429,{error:'Too many submissions from this email. Please try later.'},origin);
  const details={employment_type:Array.isArray(p.employment_type)?p.employment_type.slice(0,8).map(v=>str(v,50)):[],work_arrangement:Array.isArray(p.work_arrangement)?p.work_arrangement.slice(0,8).map(v=>str(v,50)):[],compensation:str(p.compensation),skills:str(p.skills,500),portfolio_url:str(p.portfolio_url,300),company_website:str(p.company_website,300),experience:str(p.experience),headcount:str(p.headcount),message:str(p.message,1800),training_interest:type==='training'||p.training_interest===true,training_budget:str(p.training_budget),training_budget_basis:str(p.training_budget_basis),training_trainees:str(p.training_trainees),training_topics:Array.isArray(p.training_topics)?p.training_topics.slice(0,12).map(v=>str(v,70)):[],training_delivery:Array.isArray(p.training_delivery)?p.training_delivery.slice(0,8).map(v=>str(v,70)):[]};
  const {data,error}=await db.from('agency_leads').insert({type,full_name:name,email:email.toLowerCase(),phone:str(p.phone),organization:str(p.organization),location,role,discipline,availability,details,consent:true,share_permission:p.share_permission===true}).select('id').single();
  if(error){console.error('Agency lead insert failed',error.code);return respond(500,{error:'Unable to save your application'},origin)}
  return respond(201,{success:true,reference:data.id.slice(0,8).toUpperCase()},origin);
});
