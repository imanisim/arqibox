// ARQWELL Agency public intake: candidates, employers, and focused training.
// Employer role briefs are PDF-only and stored in a private Supabase Storage bucket.
// A verified Turnstile challenge is required. Deploy with verify_jwt=false.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY") || "";
const origins = new Set(["https://arqwell.net", "https://www.arqwell.net"]);
const MAX_PDF = 5 * 1024 * 1024;
const MAX_BODY = MAX_PDF + 200000;
const str = (v:unknown,max=160) => typeof v === "string" ? v.trim().slice(0,max) : "";
const cors = (o:string) => ({
  "Access-Control-Allow-Origin":origins.has(o)?o:"https://arqwell.net",
  "Access-Control-Allow-Headers":"content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Vary":"Origin", "Content-Type":"application/json"
});
const reply=(status:number,payload:unknown,origin:string)=>new Response(JSON.stringify(payload),{status,headers:cors(origin)});
function safeUrl(v:unknown) {
  const raw=str(v,500);
  if(!raw)return "";
  const full=/^https?:\/\//i.test(raw)?raw:"https://"+raw;
  try {
    const url=new URL(full);
    if(!["http:","https:"].includes(url.protocol)||!url.hostname.includes(".")||
       url.username||url.password||/\s/.test(full)) return null;
    return url.href.slice(0,500);
  } catch{return null;}
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin")||"";
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=="POST")return reply(405,{error:"Method not allowed"},origin);
  if(!origins.has(origin))return reply(403,{error:"Origin not permitted"},origin);
  if(!supabaseUrl||!serviceKey||!turnstileSecret)return reply(503,{error:"Intake verification is not configured"},origin);
  if(Number(req.headers.get("content-length")||0)>MAX_BODY)return reply(413,{error:"Upload exceeds the 5 MB PDF limit"},origin);

  let p:Record<string,unknown>;
  let pdf:File|null=null;
  try {
    const ct=req.headers.get("content-type")||"";
    if(ct.startsWith("multipart/form-data")) {
      const form=await req.formData();
      const json=form.get("payload");
      if(typeof json!=="string"||json.length>18000)throw new Error("Invalid payload");
      p=JSON.parse(json);
      const incoming=form.get("role_pdf");
      if(incoming instanceof File && incoming.size>0) pdf=incoming;
    } else if(ct.includes("application/json")) {
      const raw=await req.text();
      if(raw.length>18000)throw new Error("Request too large");
      p=JSON.parse(raw);
    } else return reply(415,{error:"Unsupported submission format"},origin);
    if(!p||typeof p!=="object"||Array.isArray(p))throw new Error("Invalid payload");
  } catch{return reply(400,{error:"Invalid application data"},origin)}

  if(str(p.website_fax))return reply(400,{error:"Invalid submission"},origin);
  const type=str(p.type), name=str(p.full_name),email=str(p.email).toLowerCase(),
    role=str(p.role), location=str(p.location), discipline=str(p.discipline), availability=str(p.availability);
  if(!["candidate","employer","training"].includes(type)||name.length<2||
    !/^\S+@\S+\.\S+$/.test(email)||role.length<2||!location||!discipline||
    !availability||p.consent!==true)
    return reply(400,{error:"Please complete the required fields"},origin);
  if(type!=="employer" && pdf)return reply(400,{error:"PDF attachments are for employer hiring inquiries only"},origin);
  if(type==="employer"&&!str(p.organization))return reply(400,{error:"Company name is required"},origin);
  if(type==="training"&&(!str(p.organization)||!str(p.message)||
      !str(p.training_budget)||!str(p.training_budget_basis)||!str(p.training_trainees)))
    return reply(400,{error:"Complete your training description and budget"},origin);

  const roleLink=safeUrl(p.job_post_url), portfolio=safeUrl(p.portfolio_url),company=safeUrl(p.company_website);
  if(roleLink===null||portfolio===null||company===null)
    return reply(400,{error:"Enter a valid website link, such as www.example.com"},origin);
  if(type==="employer"&&!str(p.message,1800)&&!roleLink&&!pdf)
    return reply(400,{error:"Provide role details, a job link, or a PDF"},origin);

  if(pdf) {
    if(pdf.size>MAX_PDF||!pdf.name.toLowerCase().endsWith(".pdf")||
       pdf.type!=="application/pdf")
      return reply(400,{error:"Upload one PDF file up to 5 MB"},origin);
    const signature=new Uint8Array(await pdf.slice(0,5).arrayBuffer());
    if(new TextDecoder().decode(signature)!=="%PDF-")
      return reply(400,{error:"The uploaded file is not a valid PDF"},origin);
  }

  const token=str(p.turnstile_token,4096);
  if(!token)return reply(400,{error:"Complete the verification challenge"},origin);
  const check=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST", body:new URLSearchParams({secret:turnstileSecret,response:token})
  }).then(r=>r.json()).catch(()=>({success:false}));
  if(!check.success||!["arqwell.net","www.arqwell.net"].includes(String(check.hostname||"")))
    return reply(400,{error:"Verification failed. Please retry."},origin);

  const db=createClient(supabaseUrl,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const since=new Date(Date.now()-15*60*1000).toISOString();
  const {count,error:countError}=await db.from("agency_leads").select("*",{count:"exact",head:true})
    .eq("email",email).gte("created_at",since);
  if(countError)return reply(503,{error:"Submission service temporarily unavailable"},origin);
  if((count||0)>=2)return reply(429,{error:"Too many recent submissions from this email"},origin);

  let filePath="";
  if(pdf) {
    filePath="employer/"+crypto.randomUUID()+".pdf";
    const {error:uploadError}=await db.storage.from("agency-role-briefs")
      .upload(filePath,pdf,{contentType:"application/pdf",upsert:false,cacheControl:"0"});
    if(uploadError){console.error("Role PDF upload error",uploadError.message);
      return reply(500,{error:"Couldn't save the PDF. Please retry or use a job posting link."},origin);}
  }

  const arr=(v:unknown,maxItems:number,maxLen:number)=>Array.isArray(v)?v.slice(0,maxItems).map(x=>str(x,maxLen)):[];
  const details={
    employment_type:arr(p.employment_type,8,50),work_arrangement:arr(p.work_arrangement,8,50),
    compensation:str(p.compensation), skills:str(p.skills,500),
    portfolio_url:portfolio||"",company_website:company||"",
    job_post_url:roleLink||"",role_pdf_path:filePath,role_pdf_name:pdf?str(pdf.name,160):"",
    payment_preference:["contract_invoice","stripe_after_agreement"].includes(str(p.payment_preference))
      ?str(p.payment_preference):"contract_invoice",
    experience:str(p.experience),headcount:str(p.headcount),message:str(p.message,1800),
    training_interest:type==="training"||p.training_interest===true,
    training_budget:str(p.training_budget),training_budget_basis:str(p.training_budget_basis),
    training_trainees:str(p.training_trainees),
    training_topics:arr(p.training_topics,12,70),training_delivery:arr(p.training_delivery,8,70)
  };
  const {data,error}=await db.from("agency_leads").insert({
    type,full_name:name,email,phone:str(p.phone),organization:str(p.organization),location,
    role,discipline,availability,details,consent:true,share_permission:p.share_permission===true
  }).select("id").single();
  if(error) {
    if(filePath)await db.storage.from("agency-role-briefs").remove([filePath]);
    console.error("Agency lead insert failed",error.code);
    return reply(500,{error:"Unable to save your application"},origin);
  }
  return reply(201,{success:true,reference:data.id.slice(0,8).toUpperCase()},origin);
});
