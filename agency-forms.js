"use strict";
(() => {
const form = document.getElementById('agency-form');
if (!form) return;
const type = document.body.dataset.type;
const trainingCheck = document.getElementById('training_interest');
const trainingBudgetFields = document.getElementById('training-budget-fields');
if (trainingCheck && trainingBudgetFields) {
  const toggleTraining = () => trainingBudgetFields.classList.toggle('hidden', !trainingCheck.checked);
  trainingCheck.addEventListener('change',toggleTraining);
  toggleTraining();
}
const cfg = window.ARQWELL_INTAKE_CONFIG || {};
const msg = document.getElementById('form-message');
const status = document.getElementById('status-text');
const btn = form.querySelector('[type=submit]');
let widgetId = null;
const show = (text, cls='') => { msg.hidden=false; msg.className='alert '+cls; msg.textContent=text; msg.scrollIntoView({block:'nearest',behavior:'smooth'}); };
const isLive = Boolean(cfg.endpoint && cfg.turnstileSiteKey);
if (isLive) {
  const wrap=document.getElementById('turnstile');wrap.classList.remove('hidden');
  const script=document.createElement('script');
  script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async=true;script.defer=true;
  script.onload=()=>{if(window.turnstile){widgetId=window.turnstile.render(wrap,{sitekey:cfg.turnstileSiteKey,theme:'light'});}};
  document.head.appendChild(script);
} else {
  show('Preview mode: applications can be completed here, but will not be transmitted or stored until the secure form endpoint is configured.');
  status.textContent='Preview only — no information is sent';
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if(!form.reportValidity()) return;
  const data=new FormData(form);
  const selected = field => data.getAll(field).map(String);
  const payload={
    type, full_name:String(data.get('full_name')||'').trim(),
    email:String(data.get('email')||'').trim(),
    phone:String(data.get('phone')||'').trim(),
    organization:String(data.get('organization')||'').trim(),
    location:String(data.get('location')||'').trim(),
    role:String(data.get('role')||'').trim(),
    discipline:String(data.get('discipline')||''),
    availability:String(data.get('availability')||''),
    employment_type:selected('employment_type'), work_arrangement:selected('work_arrangement'),
    compensation:String(data.get('compensation')||'').trim(),
    skills:String(data.get('skills')||'').trim(),
    portfolio_url:String(data.get('portfolio_url')||'').trim(),
    company_website:String(data.get('company_website')||'').trim(),
    experience:String(data.get('experience')||''),
    training_interest:type==='training' || data.has('training_interest'),
    training_budget:String(data.get('training_budget')||''),
    training_budget_basis:String(data.get('training_budget_basis')||''),
    training_trainees:String(data.get('training_trainees')||''),
    training_topics:selected('training_topics'),
    training_delivery:selected('training_delivery'),
    headcount:String(data.get('headcount')||'').trim(),
    message:String(data.get('message')||'').trim(),
    consent:data.has('consent'),
    share_permission:data.has('share_permission'),
    // Non-human honeypot that must remain empty.
    website_fax:String(data.get('website_fax')||''),
    turnstile_token:window.turnstile&&widgetId!==null?window.turnstile.getResponse(widgetId):''
  };
  if (!isLive) {
    show('Form validation passed. This is a preview: your information was not sent or saved. Configure the secure backend to receive applications.');
    return;
  }
  if(!payload.turnstile_token){show('Complete the verification challenge before submitting.','error');return;}
  btn.disabled=true;btn.textContent='Submitting…';status.textContent='Sending securely…';
  try{
    const response=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    let result={};try{result=await response.json();}catch{}
    if(!response.ok) throw new Error(result.error||'Submission was not accepted. Please try again.');
    form.reset();show('Application received. Your reference number is '+result.reference+'. ARQWELL may contact you if there is a suitable next step.','success');
    form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=true);status.textContent='Application received';
  }catch(err){show(err.message||'Unable to submit right now.','error');status.textContent='Not submitted — retry available';if(window.turnstile&&widgetId!==null)window.turnstile.reset(widgetId);}
  finally{if(!form.querySelector('input')?.disabled){btn.disabled=false;btn.textContent=type==='candidate'?'Join the talent network →':type==='training'?'Send training interest →':'Send hiring request →';}}
});
})();
