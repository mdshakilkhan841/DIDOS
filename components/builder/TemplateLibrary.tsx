'use client';
import React,{useMemo,useState}from'react';
import './template-library.css';
import {applyStyle,findTemplate,renderPreviewDocument}from'../../builder/site-templates';
import {templateIndustries,templateLayouts,templateProfiles,type TemplateProfile}from'../../builder/template-library';
// Renders a small abstract mock of the template's real hero shape, so cards can be told
// apart at a glance instead of all showing the same generic block regardless of layout.
function ThumbHero({shape,v}:{shape:TemplateProfile['heroShape'];v:Record<string,string>}){
 if(shape==='split')return <div className="db-thumb-split"><div className="db-thumb-split-text"><span style={{background:v.accent,width:'70%'}}/><span style={{background:v.muted,width:'90%'}}/><span style={{background:v.muted,width:'60%'}}/></div><div className="db-thumb-split-media" style={{background:v.card,borderColor:v.border}}/></div>;
 if(shape==='cover')return <div className="db-thumb-cover" style={{background:v.card,borderColor:v.border}}><span style={{background:v.accent,width:'35%'}}/><span style={{background:v.text,width:'55%'}}/></div>;
 if(shape==='mono')return <div className="db-thumb-mono"><span style={{background:v.text,width:'92%'}}/><span style={{background:v.muted,width:'55%'}}/></div>;
 if(shape==='badge')return <><div className="db-thumb-hero db-thumb-center"><span style={{background:v.accent,width:'40%'}}/><span style={{background:v.muted,width:'70%'}}/><span style={{background:v.muted,width:'55%'}}/></div><div className="db-thumb-badges"><i style={{borderColor:v.border}}/><i style={{borderColor:v.border}}/><i style={{borderColor:v.border}}/></div></>;
 return <><div className="db-thumb-hero db-thumb-center"><span style={{background:v.accent,width:'40%'}}/><span style={{background:v.muted,width:'70%'}}/><span style={{background:v.muted,width:'55%'}}/></div><div className="db-thumb-cards"><i style={{background:v.card,borderColor:v.border}}/><i style={{background:v.card,borderColor:v.border}}/><i style={{background:v.card,borderColor:v.border}}/></div></>;
}
export default function TemplateLibrary({selectedId,onSelect,project}:{selectedId:string;onSelect:(template:TemplateProfile)=>void;project:{name:string;category:string;brief:string}}){
 const[query,setQuery]=useState(''),[industry,setIndustry]=useState('All industries'),[layout,setLayout]=useState('All layouts'),[shown,setShown]=useState(18),[preview,setPreview]=useState<TemplateProfile|null>(null);
 const items=useMemo(()=>templateProfiles.filter(t=>(industry==='All industries'||t.industry===industry)&&(layout==='All layouts'||t.layout===layout)&&(`${t.name} ${t.siteTemplateName} ${t.industry} ${t.layoutLabel} ${t.styleLabel} ${t.capabilities.join(' ')}`).toLowerCase().includes(query.toLowerCase())),[query,industry,layout]);
 const choose=(t:TemplateProfile)=>{onSelect(t);setPreview(null)};
 const previewDoc=(t:TemplateProfile)=>renderPreviewDocument(applyStyle(findTemplate(t.siteTemplateId),t.style),{name:project.name||t.name,category:project.category||t.category,brief:project.brief||t.summary});
 return <section className="db-template-library" id="templates" aria-labelledby="template-library-title">
 <div className="db-template-intro"><div><p className="db-eyebrow">TEMPLATE LIBRARY</p><h2 id="template-library-title">Choose from {templateProfiles.length} configurable starter templates</h2><p>Filter by industry, layout and visual direction. Each profile applies a real page blueprint and rendered visual direction — preview any card before choosing it. Content, integrations and approval remain under your control.</p></div><div className="db-template-count"><strong>{items.length}</strong><span>matching templates</span></div></div>
 <div className="db-template-tools"><label>Search templates<input value={query} onChange={e=>{setQuery(e.target.value);setShown(18)}} placeholder="e.g. education, catalogue, teal"/></label><label>Industry<select value={industry} onChange={e=>{setIndustry(e.target.value);setShown(18)}}><option>All industries</option>{templateIndustries.map(x=><option key={x}>{x}</option>)}</select></label><label>Layout<select value={layout} onChange={e=>{setLayout(e.target.value);setShown(18)}}><option>All layouts</option>{templateLayouts.map(x=><option key={x}>{x}</option>)}</select></label></div>
 <p className="db-template-note">A starter template is a configuration profile with a real, rendered layout — not a claim that a finished public website or licensed third-party design already exists.</p>
 <div className="db-template-grid">{items.slice(0,shown).map(t=>{const v=applyStyle(findTemplate(t.siteTemplateId),t.style).vars;return <article className="db-template-card" key={t.id}>
 <div className="db-template-thumb" style={{background:v.bg}} aria-hidden="true"><div className="db-thumb-header" style={{background:v.surface,borderColor:v.border}}/><ThumbHero shape={t.heroShape} v={v}/></div>
 <div className="db-template-card-copy"><small>{t.id} · {t.layoutLabel} · {t.styleLabel}</small><span className="db-template-design-name">{t.siteTemplateName} design</span><h3>{t.name}</h3><p>{t.summary}</p><div className="db-template-tags">{t.capabilities.map(c=><span key={c}>{c}</span>)}</div><div className="db-template-actions"><button type="button" className="db-secondary" onClick={()=>setPreview(t)}>Preview</button><button type="button" aria-pressed={selectedId===t.id} onClick={()=>choose(t)}>{selectedId===t.id?'✓ Selected':'Use template'}</button></div></div>
 </article>})}</div>
 {!items.length&&<p className="db-empty">No templates match those filters. Clear a filter or try a different search.</p>}
 {shown<items.length&&<div className="db-template-more"><button type="button" className="db-secondary" onClick={()=>setShown(n=>n+18)}>Show 18 more templates</button></div>}
 {preview&&<div className="db-template-modal" role="dialog" aria-modal="true" aria-labelledby="template-preview-title"><div><button type="button" className="db-template-close" aria-label="Close preview" onClick={()=>setPreview(null)}>×</button>
 <h2 id="template-preview-title">{preview.name}</h2><p className="db-template-design-name">{preview.siteTemplateName} design</p><p className="db-muted">Live preview — this is the same markup shipped in your download, not a mock.</p>
 <iframe title={`${preview.name} preview`} srcDoc={previewDoc(preview)} className="db-template-preview-frame"/>
 <p className="db-muted">Pages: {preview.pages.join(' · ')}</p><p className="db-muted">Supported output adapters: {preview.supportedStacks.join(', ')}.</p>
 <div className="db-template-actions"><button type="button" className="db-secondary" onClick={()=>setPreview(null)}>Back to library</button><button type="button" onClick={()=>choose(preview)}>Use this template</button></div>
 </div></div>}
 </section>;
}
