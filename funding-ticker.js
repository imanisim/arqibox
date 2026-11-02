"use strict";
// Exactly three visible funding/resource rows. These are SOURCE LINKS, not verified live awards.
// To populate with vetted opportunities, replace the entries below (or later use Supabase).
// Abbreviated URLs such as "grants.gov" are accepted and normalized to https://.
window.ARQWELL_FUNDING_ITEMS = [
  {category:"FEDERAL GRANTS",title:"Explore grants for research and workforce programs",source:"Grants.gov",url:"grants.gov"},
  {category:"PUBLIC CONTRACTS",title:"Find current AEC procurement opportunities",source:"SAM.gov",url:"sam.gov"},
  {category:"RESEARCH FUNDING",title:"Explore NSF research funding programs",source:"NSF",url:"nsf.gov/funding"}
];
(function(){
  const list=document.getElementById("funding-ticker-rows");
  if(!list)return;
  function safeLink(value){
    const s=String(value||"").trim();
    if(!s)return null;
    try {
      const url=new URL(/^https?:\/\//i.test(s)?s:"https://"+s);
      return ["https:","http:"].includes(url.protocol)&&url.hostname.includes(".")&&!url.username&&!url.password?url.href:null;
    }catch{return null;}
  }
  const items=Array.isArray(window.ARQWELL_FUNDING_ITEMS)?window.ARQWELL_FUNDING_ITEMS.slice(0,3):[];
  items.forEach((entry,i)=>{
    const a=document.createElement("a");
    const url=safeLink(entry.url);
    a.className="funding-row";
    if(url){a.href=url;a.target="_blank";a.rel="noopener noreferrer";}
    else a.setAttribute("aria-disabled","true");
    const number=document.createElement("span");number.className="funding-num";number.textContent=String(i+1).padStart(2,"0");
    const cat=document.createElement("span");cat.className="funding-cat";cat.textContent=String(entry.category||"RESOURCE");
    const title=document.createElement("span");title.className="funding-title";title.textContent=String(entry.title||"Explore AEC opportunities");
    const source=document.createElement("span");source.className="funding-source";source.textContent=String(entry.source||"Source")+" ↗";
    a.append(number,cat,title,source);list.appendChild(a);
  });
})();