'use client';
import {useEffect,useState} from 'react';
import Link from './dudos-link';
import {Send,RefreshCw,MessageSquare,Bell,CheckCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {api} from '@/lib/dudos/client';
import {Choose,Notice,Empty,human} from './dudos-ui';
import {useAuth} from '@/context/auth-context';
import {syncAssessmentToWorkspaceDraft} from '@/lib/dudos/assessment-sync';
export const requestKinds=['assessment','ticket','partner','application','feedback','quote','booking','research','integration','order'];
export function SendRequest({record,workspace,lang}:{record:any;workspace:string;lang:string}){
  const {user}=useAuth();
  const [open,setOpen]=useState(false),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<any>(null);
  async function send(){
    setBusy(true);
    try{
      const d=await api('/api/requests','POST',{workspace,record_id:record.id,version:record.version,share_confirmed:consent});
      setReceipt(d);
      setOpen(false);
      setError('');
      syncAssessmentToWorkspaceDraft({ ...record, status: 'submitted' }, record.data || {}, workspace, user, true);
    }catch(e){
      setError((e as Error).message);
    }finally{
      setBusy(false);
    }
  }
  if(!requestKinds.includes(record.kind))return null;
  return (
    <>
      {receipt ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Link className="text-link" href={`/${lang}/app/requests`}>
            {lang === 'bn' ? 'অনুরোধ গৃহীত হয়েছে · প্রতিক্রিয়া দেখুন' : 'Request received · View replies'}
          </Link>
          <Button asChild size="sm" className="bg-[#087f79] hover:bg-[#066560] text-white text-xs">
            <Link href={`/${lang}/app`}>
              {lang === 'bn' ? 'ওয়ার্কস্পেস পোর্টালে যান' : 'Go to Workspace Portal'}
            </Link>
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={()=>setOpen(true)}>
          <Send size={15}/>{lang==='bn'?'DUDOS-এ পাঠান':'Send to DUDOS'}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="record-dialog">
          <DialogHeader>
            <DialogTitle>{lang==='bn'?'পর্যালোচনার জন্য পাঠান':'Send this record for review'}</DialogTitle>
            <DialogDescription>{record.title} · saved version {record.version}</DialogDescription>
          </DialogHeader>
          <div className="review-summary">
            {Object.entries(record.data||{}).map(([k,v])=>(
              <div key={k}>
                <span>{human(k)}</span>
                <p>{String(v)}</p>
              </div>
            ))}
          </div>
          <label className="consent-row">
            <Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)}/>
            <span>{lang==='bn'?'আমি এই সংরক্ষিত রেকর্ড এবং আমার অ্যাকাউন্টের ইমেইল DUDOS পরিচালকের সঙ্গে শেয়ার করতে সম্মত। আপলোড করা ফাইল শেয়ার হবে না।':'Share this saved record and my account email with the DUDOS operator. Uploaded source files remain private.'}</span>
          </label>
          {error&&<Notice tone="error">{error}</Notice>}
          <Button disabled={busy||!consent} onClick={()=>void send()}>
            <Send size={16}/>{busy?'Sending…':'Send request'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function RequestsView({lang,admin=false}:{lang:string;admin?:boolean}){const [rows,setRows]=useState<any[]>([]),[total,setTotal]=useState(0),[page,setPage]=useState(0),[selected,setSelected]=useState<any>(null),[messages,setMessages]=useState<any[]>([]),[reply,setReply]=useState(''),[state,setState]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);async function load(){setBusy(true);try{const d=await api('/api/requests?view='+(admin?'admin':'mine')+'&page='+page);setRows(d.requests);setTotal(d.total);setError('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}async function open(id:string){try{const d=await api('/api/requests?id='+id);setSelected(d.request);setMessages(d.messages);setState(d.request.status);setReply('')}catch(e){setError((e as Error).message)}}async function send(){if(!selected)return;setBusy(true);try{await api('/api/requests','PATCH',{id:selected.id,version:selected.version,status:state,message:reply});await open(selected.id);await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}useEffect(()=>{void load()},[page,admin]);const states:Record<string,string[]>={received:['reviewing','waiting_customer','accepted','declined','closed'],reviewing:['waiting_customer','accepted','declined','closed'],waiting_customer:['reviewing','accepted','declined','closed'],accepted:['in_progress','waiting_customer','closed'],in_progress:['waiting_customer','resolved','closed'],resolved:['reviewing','closed'],declined:['reviewing','closed'],closed:['reviewing']};return <><div className="section-heading"><div><p className="eyebrow">{admin?'CUSTOMER SERVICE INBOX':'YOUR REQUESTS & RESPONSES'}</p><h1>{admin?(lang==='bn'?'গ্রাহকের অনুরোধ':'Customer requests'):(lang==='bn'?'আপনার অনুরোধ':'Your requests')}</h1><p>{admin?'Review the submitted scope and reply to the customer.':'Track requests you sent to DUDOS and continue the conversation.'}</p></div><Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw size={16}/>Refresh</Button></div>{error&&<Notice tone="error">{error}</Notice>}<div className="inbox-layout"><aside className="request-list">{rows.length?rows.map(r=><button key={r.id} className={selected?.id===r.id?'active':''} onClick={()=>void open(r.id)}><span>{human(r.kind)}</span><strong>{r.title}</strong><Badge variant="secondary">{human(r.status)}</Badge><small>{new Date(r.updated_at).toLocaleDateString()}</small></button>):<Empty title={busy?'Loading…':'No requests yet'}>{admin?'Customer submissions will appear here.':'Save an assessment or other request, then choose Send to DUDOS.'}</Empty>}</aside><section className="conversation">{selected?<><div className="section-heading"><div><h2>{selected.title}</h2><p>{human(selected.kind)} · v{selected.version}</p></div><Badge variant="secondary">{human(selected.status)}</Badge></div><details className="request-snapshot"><summary>Submitted details · record version {selected.record_version}</summary><div className="review-summary">{Object.entries(selected.snapshot.data).map(([k,v])=><div key={k}><span>{human(k)}</span><p>{String(v)}</p></div>)}</div></details><div className="message-list">{messages.map(m=><article className={'message '+m.author_kind} key={m.id}><span>{m.author_kind==='operator'?'DUDOS team':'Customer'} · {new Date(m.created_at).toLocaleString()}</span><p>{m.body}</p></article>)}{!messages.length&&<p className="field-help">The request has been received. No replies yet.</p>}</div><div className="form-field"><Label htmlFor="request-reply">Reply</Label><Textarea id="request-reply" rows={4} value={reply} maxLength={10000} onChange={e=>setReply(e.target.value)}/></div>{admin&&<div className="form-field"><Label>Next status</Label><Choose value={state} onChange={setState} label="Request status" options={[selected.status,...(states[selected.status]||[])]}/></div>}<Button disabled={busy||(!reply.trim()&&state===selected.status)} onClick={()=>void send()}><Send size={16}/>{admin?'Send response / update':'Send reply'}</Button><p className="field-help">Replies appear in DUDOS. No email or WhatsApp message is sent. Request acceptance does not activate payment or external services.</p></>:<Empty title="Choose a conversation"><MessageSquare size={24}/></Empty>}</section></div><div className="pagination"><span>{total} requests · Page {page+1}</span><Button variant="outline" disabled={!page} onClick={()=>setPage(page-1)}>Previous</Button><Button variant="outline" disabled={(page+1)*50>=total} onClick={()=>setPage(page+1)}>Next</Button></div></>}
export function Notifications({lang}:{lang:string}){const [rows,setRows]=useState<any[]>([]),[unread,setUnread]=useState(0),[error,setError]=useState('');async function load(){try{const d=await api('/api/notifications');setRows(d.notifications);setUnread(d.unread)}catch(e){setError((e as Error).message)}}useEffect(()=>{void load();const id=setInterval(()=>{if(document.visibilityState==='visible')void load()},30000);return ()=>clearInterval(id)},[]);async function read(id?:string){try{await api('/api/notifications','PATCH',id?{id}:{all:true});await load()}catch(e){setError((e as Error).message)}}return <><div className="section-heading"><div><p className="eyebrow">YOUR UPDATES</p><h1>{lang==='bn'?'নোটিফিকেশন':'Notifications'}</h1><p>{unread} unread · refreshes every 30 seconds while this page is visible.</p></div><Button variant="outline" onClick={()=>void read()} disabled={!unread}><CheckCheck size={16}/>Mark all read</Button></div>{error&&<Notice tone="error">{error}</Notice>}{rows.length?<div className="notification-list">{rows.map(r=><article className={r.read_at?'read':'unread'} key={r.id}><Bell size={18}/><div><h3>{r.title}</h3><p>{r.body}</p><small>{new Date(r.created_at).toLocaleString()}</small><Link className="text-link" href={r.href.replace('/en/','/'+lang+'/')} onClick={()=>void read(r.id)}>Open update</Link></div>{!r.read_at&&<Button size="sm" variant="ghost" onClick={()=>void read(r.id)}>Mark read</Button>}</article>)}</div>:<Empty title="You’re up to date">Request updates will appear here.</Empty>}</>}
