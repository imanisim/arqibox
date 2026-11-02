/** ARQWELL Agency Services — static UI only. No data is sent or stored. */
'use strict';
const catalog = {
  employer: {
    tag:'FOR FIRMS & PROJECT TEAMS',
    title:'Build the team behind the work.',
    description:'Find skilled professionals and practical talent solutions that fit your pipeline, schedule, and project needs.',
    footnote:'Not sure which model fits? Tell us about your hiring challenge and we’ll explore the options.',
    cta:'Discuss your workforce needs',
    cards:[
      {icon:'↗', title:'Direct-hire recruiting', description:'Identify and introduce qualified candidates for permanent roles across design and technical teams.', tags:['Permanent roles','Candidate sourcing']},
      {icon:'⌘', title:'Contract + project staffing',description:'Explore temporary support for deadlines, workload peaks, documentation, and project delivery.',tags:['Flexible support','Project-based']},
      {icon:'◎',title:'Skills verification',description:'Evaluate relevant software, project experience, work samples, and capabilities before a hiring decision.',tags:['Work-sample review','Technical fit']},
      {icon:'▤',title:'Custom workforce training',description:'Develop targeted onboarding and upskilling pathways aligned with your team’s tools and standards.',tags:['Firm-aligned','Learning tracks']},
      {icon:'✳',title:'Team-building support',description:'Plan repeat hiring needs, multi-role hiring efforts, and specialized production teams.',tags:['Workforce planning','Specialist teams']},
      {icon:'◈',title:'Talent partnerships',description:'Build a longer-term relationship for new project pursuits and recurring hiring requirements.',tags:['Ongoing support','AEC network']}
    ]
  },
  candidate: {
    tag:'FOR DESIGN & TECHNICAL PROFESSIONALS',
    title:'Grow the career you want to build.',
    description:'Put your experience in context, find relevant introductions, and explore development that supports your next role.',
    footnote:'You do not need a perfect résumé to begin. Tell us where you are now and where you want to go.',
    cta:'Join the talent network',
    cards:[
      {icon:'↗',title:'Career introductions',description:'Express interest in direct-hire and project-based roles aligned with your experience and goals.',tags:['AEC opportunities','Connections']},
      {icon:'◎',title:'Skills + portfolio profile',description:'Showcase projects, tools, deliverables, and practical strengths beyond a conventional résumé.',tags:['Portfolio','Skills evidence']},
      {icon:'▤',title:'Technical skill reviews',description:'Identify strengths and skill gaps through relevant work samples and practical evaluation.',tags:['Skill discovery','Role fit']},
      {icon:'✳',title:'Targeted learning',description:'Explore planned training pathways shaped by the software and workflows firms actually use.',tags:['Upskilling','Career growth']},
      {icon:'⌘',title:'Contract career pathways',description:'Build experience through project-oriented opportunities and flexible professional engagements.',tags:['Flexible work','AEC projects']},
      {icon:'◈',title:'Professional networking',description:'Meet peers, mentors, studios, and collaborators from related built-environment disciplines.',tags:['Community','Mentorship']}
    ]
  },
  partner: {
    tag:'FOR EDUCATORS, FIRMS & COMMUNITY LEADERS',
    title:'Build a stronger talent ecosystem.',
    description:'Work together to connect the next generation of practitioners with practical skills, networks, and professional pathways.',
    footnote:'Partnership opportunities are developed collaboratively and subject to mutually agreed terms.',
    cta:'Propose a partnership',
    cards:[
      {icon:'⌘',title:'Employer training partnerships',description:'Co-develop training based on the skills and workflows needed by your firm.',tags:['Custom cohorts','Company standards']},
      {icon:'✳',title:'Guest practitioners',description:'Share real project experience through workshops, discussions, and technical instruction.',tags:['Instructors','Practice knowledge']},
      {icon:'◎',title:'Skill assessment design',description:'Help shape fair, role-relevant portfolio reviews and technical assessments.',tags:['Assessment design','Work samples']},
      {icon:'↗',title:'Career + community events',description:'Organize networking sessions, portfolio conversations, and industry introductions.',tags:['Networking','Community']},
      {icon:'▤',title:'Workforce pathways',description:'Connect education and employers around entry-level and career-transition skills.',tags:['Early career','Workforce development']},
      {icon:'◈',title:'Project collaboration',description:'Meet aligned teams and specialists for research, training, and technical initiatives.',tags:['Collaboration','AEC innovation']}
    ]
  }
};
const panel = document.getElementById('service-panel');
const cardsEl = document.getElementById('service-cards');
const cta = document.getElementById('audience-cta');
function renderAudience(audience){
  const data=catalog[audience]; if(!data)return;
  document.querySelectorAll('[data-audience]').forEach(btn=>{const active=btn.dataset.audience===audience;btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;});
  panel.setAttribute('aria-labelledby',`tab-${audience}`);
  panel.querySelector('.panel-mini').textContent=data.tag;
  document.getElementById('panel-title').textContent=data.title;
  document.getElementById('panel-description').textContent=data.description;
  document.getElementById('panel-footnote').textContent=data.footnote;
  cardsEl.replaceChildren(...data.cards.map((item,i)=>{
    const article=document.createElement('article');article.className='service-card';
    const header=document.createElement('div');header.className='service-card-head';
    const icon=document.createElement('span');icon.className='service-icon';icon.setAttribute('aria-hidden','true');icon.textContent=item.icon;
    const id=document.createElement('span');id.className='service-id';id.textContent=`SERVICE ${String(i+1).padStart(2,'0')}`;
    header.append(icon,id);
    const title=document.createElement('h4');title.textContent=item.title;
    const desc=document.createElement('p');desc.textContent=item.description;
    const tags=document.createElement('div');tags.className='service-tags';tags.replaceChildren(...item.tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));
    article.append(header,title,desc,tags);return article;
  }));
  cta.firstChild.textContent=data.cta+' ';
  cta.dataset.intake=audience;
}
document.querySelectorAll('[data-audience]').forEach(btn=>{
  btn.addEventListener('click',()=>renderAudience(btn.dataset.audience));
  btn.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const tabs=[...document.querySelectorAll('[data-audience]')];const current=tabs.indexOf(btn);
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].focus();renderAudience(tabs[next].dataset.audience);
  });
});
renderAudience('employer');
const mobileToggle=document.querySelector('.mobile-menu-toggle');const mobileMenu=document.getElementById('mobile-menu');
mobileToggle.addEventListener('click',()=>{const expanded=mobileToggle.getAttribute('aria-expanded')==='true';mobileToggle.setAttribute('aria-expanded',String(!expanded));mobileToggle.setAttribute('aria-label',expanded?'Open navigation':'Close navigation');mobileMenu.hidden=expanded;});
mobileMenu.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>{mobileMenu.hidden=true;mobileToggle.setAttribute('aria-expanded','false');mobileToggle.setAttribute('aria-label','Open navigation');}));
const dialog=document.getElementById('intake-dialog'),leadType=document.getElementById('lead-type'),form=document.getElementById('intake-form');
function syncForm(){const type=leadType.value;const descriptions={employer:['Tell us what you need.','Share a little about your next hire or project need.','Tell us about the role or project'],candidate:['Make your next connection.','Tell us about your experience and career goals.','Tell us about your experience and interests'],partner:['Create a partnership.','Tell us about a potential collaboration or training initiative.','Tell us about your partnership idea']};document.getElementById('intake-heading').textContent=descriptions[type][0];document.getElementById('intake-lede').textContent=descriptions[type][1];document.getElementById('message-label-text').textContent=descriptions[type][2];document.getElementById('timeline-label').firstChild.textContent=type==='candidate'?'When would you like to start?':type==='partner'?'When would you like to collaborate?':'When do you need support?';}
leadType.addEventListener('change',syncForm);
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-intake]');if(trigger && trigger.dataset.intake==='candidate'){window.location.href='./apply/';return;}if(trigger && trigger.dataset.intake==='employer'){window.location.href='./hire/';return;}if(trigger){leadType.value=trigger.dataset.intake;syncForm();document.getElementById('intake-form-wrap').hidden=false;document.getElementById('intake-success').hidden=true;form.reset();leadType.value=trigger.dataset.intake;syncForm();if(!dialog.open)dialog.showModal();}});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.querySelector('.done-button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const type=String(data.get('lead_type'));const discipline=String(data.get('discipline'));const time=String(data.get('timeline'));document.getElementById('preview-summary').textContent=`Inquiry category: ${type.charAt(0).toUpperCase()+type.slice(1)}\nDiscipline: ${discipline}\nTimeline: ${time}\nStatus: Demo only — not submitted`;
  document.getElementById('intake-form-wrap').hidden=true;document.getElementById('intake-success').hidden=false;dialog.querySelector('.done-button').focus();});
document.getElementById('year').textContent=new Date().getFullYear();
