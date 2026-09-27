'use client';
import {useCallback,useEffect,useState} from 'react';
import {api} from '@/lib/dudos/client';
import Link from './dudos-link';
import {Rocket,RefreshCw,ExternalLink,Check,Clock,AlertTriangle,Loader2,LayoutTemplate,Boxes} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';

// Customer-facing surface for custom software delivery.
//
// Deliberately free of engineering vocabulary: a customer sees stages and
// links, never a build queue, executor, agent or provider name. Administrators
// get the technical reference through the same component, gated on `admin`.

export const DEVSCOPE_KIND='software_project';

/** Mode chooser (section 27). Presented before a project is created so the two
 *  paths never blur: Quick Website stays entirely inside DUDOS. */
export function BuildModeChooser({lang,onChoose}:{lang:string;onChoose:(mode:'quick_site'|'custom_software')=>void}){
 const bn=lang==='bn';
 const options=[
  {
   mode:'quick_site' as const,
   icon:<LayoutTemplate size={22}/>,
   title:bn?'কুইক ওয়েবসাইট':'Quick Website',
   lead:bn?'টেমপ্লেট-ভিত্তিক ওয়েবসাইট চালু করুন':'Launch a template-based website',
   detail:bn
    ?'ল্যান্ডিং পেজ, পোর্টফোলিও এবং সাধারণ ব্যবসায়িক ওয়েবসাইটের জন্য উপযুক্ত। DUDOS টেমপ্লেট ব্যবহার করে।'
    :'Best for landing pages, portfolios and standard business websites. Uses the DUDOS Template Library — fast, predictable, and you download the source.',
  },
  {
   mode:'custom_software' as const,
   icon:<Boxes size={22}/>,
   title:bn?'কাস্টম সফটওয়্যার':'Custom Software',
   lead:bn?'DevScope AI দিয়ে কাস্টমাইজড অ্যাপ্লিকেশন তৈরি করুন':'Build a customized application',
   detail:bn
    ?'পোর্টাল, ERP, CRM, SaaS, ই-কমার্স, AI সমাধান এবং কাস্টম ওয়ার্কফ্লোর জন্য উপযুক্ত।'
    :'Best for portals, ERP, CRM, SaaS, e-commerce, AI solutions and custom workflows. Requirements are reviewed and approved before development starts.',
  },
 ];
 return (
  <section className="ds-modes">
   <h2>{bn?'আপনি কী তৈরি করছেন?':'What are you building?'}</h2>
   <div className="ds-mode-grid">
    {options.map(o=>(
     <button key={o.mode} type="button" className="ds-mode-card" onClick={()=>onChoose(o.mode)}>
      <span className="ds-mode-icon">{o.icon}</span>
      <strong>{o.title}</strong>
      <span className="ds-mode-lead">{o.lead}</span>
      <p>{o.detail}</p>
     </button>
    ))}
   </div>
  </section>
 );
}

const MILESTONE_ICON={
 completed:<Check size={15}/>,
 in_progress:<Loader2 size={15} className="ds-spin"/>,
 waiting:<Clock size={15}/>,
 blocked:<AlertTriangle size={15}/>,
} as const;

const MILESTONE_WORD={completed:'Completed',in_progress:'In progress',waiting:'Waiting',blocked:'Needs attention'} as const;

/** Submit-and-track panel for one custom software project. */
export function DevscopeProject({record,workspace,lang}:{
 record:any;workspace:string;lang:string;
}){
 const bn=lang==='bn';
 const [state,setState]=useState<any>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [confirm,setConfirm]=useState(false);
 const [approved,setApproved]=useState(false);
 const [changes,setChanges]=useState('');

 const refresh=useCallback(async()=>{
  try{
   setState(await api(`/api/devscope?workspace=${encodeURIComponent(workspace)}&record_id=${encodeURIComponent(record.id)}`));
   setError('');
  }catch(e){setError((e as Error).message)}
  finally{setLoading(false)}
 },[workspace,record.id]);

 useEffect(()=>{setLoading(true);refresh()},[refresh]);

 if(record.kind!==DEVSCOPE_KIND)return null;
 if(loading)return <p className="ds-muted">{bn?'লোড হচ্ছে…':'Loading delivery status…'}</p>;

 // Submission is disabled, with an explanation, rather than hidden: a customer
 // who filled in a whole specification deserves to know why the button is gone.
 if(state&&!state.submitted){
  const available=state.available!==false;
  return (
   <section className="ds-panel">
    <h3>{bn?'ডেভেলপমেন্টের জন্য জমা দিন':'Submit for development'}</h3>
    <p className="ds-muted">
     {bn
      ?'জমা দেওয়ার আগে আপনার সংরক্ষিত রিকোয়ারমেন্ট রিভিশন পর্যালোচনা করুন। জমা দেওয়ার পর পরিবর্তন করতে নতুন রিভিশন লাগবে।'
      :`You are submitting saved revision ${record.version}. After submission, changes require a new revision and an explicit resubmit — a running build is never silently altered.`}
    </p>
    {!available&&<p className="ds-warn">{bn?'কাস্টম সফটওয়্যার ডেলিভারি এখনও কনফিগার করা হয়নি।':'Custom software delivery is not configured yet. Your project is saved; an administrator must connect the delivery service.'}</p>}
    {error&&<p className="ds-warn">{error}</p>}
    <Button size="sm" disabled={!available||busy} onClick={()=>setConfirm(true)}>
     <Rocket size={15}/>{bn?'রিভিউ করে জমা দিন':'Review and submit'}
    </Button>

    <Dialog open={confirm} onOpenChange={o=>{setConfirm(o);if(!o)setApproved(false)}}>
     <DialogContent className="record-dialog">
      <DialogHeader>
       <DialogTitle>{bn?'জমা দেওয়ার আগে অনুমোদন করুন':'Approve these requirements'}</DialogTitle>
       <DialogDescription>{record.title} · {bn?'রিভিশন':'revision'} {record.version}</DialogDescription>
      </DialogHeader>
      <div className="review-summary">
       {Object.entries(record.data||{}).filter(([,v])=>String(v||'').trim()).map(([k,v])=>(
        <div key={k}><span>{k.replace(/_/g,' ')}</span><p>{String(v)}</p></div>
       ))}
      </div>
      <label className="consent-row">
       <Checkbox checked={approved} onCheckedChange={v=>setApproved(v===true)}/>
       <span>{bn
        ?'আমি নিশ্চিত করছি যে এই রিকোয়ারমেন্টগুলো ডেভেলপমেন্টের জন্য অনুমোদিত।'
        :'I approve exactly these requirements for development.'}</span>
      </label>
      <Button
       // Disabled while in flight — the server is idempotent regardless, but a
       // dead button is clearer than a second request that quietly returns the
       // same build.
       disabled={!approved||busy}
       onClick={async()=>{
        setBusy(true);
        try{
         await api('/api/devscope','POST',{workspace,record_id:record.id,version:record.version,approved:true});
         setConfirm(false);await refresh();
        }catch(e){setError((e as Error).message)}
        finally{setBusy(false)}
       }}>
       {busy?<Loader2 size={15} className="ds-spin"/>:<Rocket size={15}/>}
       {bn?'জমা দিন':'Submit for development'}
      </Button>
     </DialogContent>
    </Dialog>
   </section>
  );
 }

 const s=state||{};
 // The server omits these fields for non-administrators, so their presence in
 // the response is the authorization signal. The client never decides this.
 const admin='raw_status' in s;
 const failed=s.status==='failed';
 return (
  <section className="ds-panel">
   <header className="ds-head">
    <div>
     <h3>{bn?'ডেভেলপমেন্ট স্ট্যাটাস':'Development'}</h3>
     <p className={failed?'ds-warn':'ds-status'}>{s.status_label}</p>
    </div>
    <Button size="sm" variant="outline" disabled={busy||s.terminal} onClick={async()=>{
     setBusy(true);
     try{setState(await api('/api/devscope','PATCH',{workspace,record_id:record.id,action:'sync'}))}
     catch(e){setError((e as Error).message)}
     finally{setBusy(false)}
    }}>
     <RefreshCw size={15} className={busy?'ds-spin':undefined}/>{bn?'রিফ্রেশ':'Refresh'}
    </Button>
   </header>

   {/* Stage-based, never a percentage: the delivery service reports a stage,
       not measurable progress, so a bar would be a fabricated number. */}
   <ol className="ds-milestones">
    {(s.milestones||[]).map((m:any)=>(
     <li key={m.key} className={'ds-m-'+m.state}>
      <span className="ds-m-icon">{MILESTONE_ICON[m.state as keyof typeof MILESTONE_ICON]}</span>
      <strong>{m.label}</strong>
      <span className="ds-m-state">{MILESTONE_WORD[m.state as keyof typeof MILESTONE_WORD]}</span>
     </li>
    ))}
   </ol>

   {s.status==='approval_required'&&(
    <div className="ds-approval">
     <p>{bn?'আপনার অনুমোদন প্রয়োজন।':'Your approval is needed before development continues.'}</p>
     <Textarea rows={3} value={changes} onChange={e=>setChanges(e.target.value)}
      placeholder={bn?'পরিবর্তন চাইলে এখানে লিখুন':'Describe any changes you need (required to request changes)'}/>
     <div className="ds-approval-actions">
      <Button size="sm" disabled={busy} onClick={async()=>{
       setBusy(true);
       try{await api('/api/devscope','PATCH',{workspace,record_id:record.id,action:'approve',decision:'approved'});await refresh()}
       catch(e){setError((e as Error).message)}finally{setBusy(false)}
      }}>{bn?'অনুমোদন':'Approve'}</Button>
      <Button size="sm" variant="outline" disabled={busy||!changes.trim()} onClick={async()=>{
       setBusy(true);
       try{await api('/api/devscope','PATCH',{workspace,record_id:record.id,action:'approve',decision:'changes_requested',comment:changes});setChanges('');await refresh()}
       catch(e){setError((e as Error).message)}finally{setBusy(false)}
      }}>{bn?'পরিবর্তন চাই':'Request changes'}</Button>
     </div>
    </div>
   )}

   <dl className="ds-delivery">
    <div><dt>{bn?'অনুমোদিত রিভিশন':'Approved revision'}</dt><dd>{s.requirement_revision}</dd></div>
    <div><dt>{bn?'রেফারেন্স':'Build reference'}</dt><dd>{s.build_reference||'—'}</dd></div>
    <div><dt>{bn?'প্রিভিউ':'Preview'}</dt><dd>
     {s.preview_url?<a href={s.preview_url} target="_blank" rel="noreferrer noopener">{bn?'খুলুন':'Open'} <ExternalLink size={13}/></a>:'—'}
    </dd></div>
    <div><dt>{bn?'লাইভ ঠিকানা':'Production URL'}</dt><dd>
     {s.production_url?<a href={s.production_url} target="_blank" rel="noreferrer noopener">{s.production_url} <ExternalLink size={13}/></a>:'—'}
    </dd></div>
    {/* Repository is shown only where the role permits it (section 27). */}
    {admin&&<div><dt>Repository</dt><dd>
     {s.repository_url?<a href={s.repository_url} target="_blank" rel="noreferrer noopener">{s.repository_url} <ExternalLink size={13}/></a>:'—'}
    </dd></div>}
    <div><dt>{bn?'সর্বশেষ আপডেট':'Last update'}</dt><dd>{s.last_synced_at?new Date(s.last_synced_at).toLocaleString():'—'}</dd></div>
   </dl>

   {error&&<p className="ds-warn">{error}</p>}

   {admin&&(
    <details className="ds-admin">
     <summary>{bn?'প্রশাসনিক বিবরণ':'Administrator detail'}</summary>
     <dl className="ds-delivery">
      <div><dt>Technical project</dt><dd>{s.devscope_project_id||'—'}</dd></div>
      <div><dt>Raw status</dt><dd>{s.raw_status||'—'}</dd></div>
      <div><dt>Stage</dt><dd>{s.stage||'—'}</dd></div>
      <div><dt>Error summary</dt><dd>{s.error_summary||'—'}</dd></div>
     </dl>
     {!!(s.events||[]).length&&(
      <table className="ds-events">
       <thead><tr><th>Event</th><th>Status</th><th>Received</th></tr></thead>
       <tbody>{s.events.map((e:any)=>(
        <tr key={e.event_id}><td>{e.event_type}</td><td>{e.status}</td><td>{new Date(e.received_at).toLocaleString()}</td></tr>
       ))}</tbody>
      </table>
     )}
    </details>
   )}

   <p className="ds-muted">
    {bn
     ?'রিকোয়ারমেন্ট পরিবর্তন করলে নতুন রিভিশন তৈরি হবে এবং আলাদাভাবে জমা দিতে হবে।'
     :'Editing the requirements creates a new revision. A running build is never changed silently — resubmit the new revision when you are ready.'}
   </p>
   <Link className="text-link" href={`/${lang}/app/notifications`}>{bn?'নোটিফিকেশন দেখুন':'View notifications'}</Link>
  </section>
 );
}
