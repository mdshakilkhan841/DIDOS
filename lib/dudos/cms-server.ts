import {cmsCollections,mergeContent,seededRows,contentKey} from './cms-model';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

// Static public baseline content from public-content.json
export async function getPublicContent(){
  return mergeContent([]);
}
export async function getEditorContent(collection:string){
  if(!(cmsCollections as readonly string[]).includes(collection))throw new HttpError(400,'Unknown content collection.');
  return seededRows(collection);
}
const localized=(v:any)=>!!v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.en==='string'&&(v.bn===undefined||typeof v.bn==='string');
function invalid(message:string):never{throw new HttpError(400,message)}
export function validateContent(collection:string,key:unknown,value:any,publish=false){
 if(!(cmsCollections as readonly string[]).includes(collection)||typeof key!=='string'||!key||key.length>180)invalid('Select a valid collection and content ID.');
 const singleton=['brand','home','navigation'].includes(collection);
 if(singleton&&key!==collection)invalid('Use the existing core settings entry.');
 if(!value||typeof value!=='object'||(collection!=='navigation'&&Array.isArray(value)))invalid('Content must be an object.');
 if(JSON.stringify(value).length>100000)throw new HttpError(413,'This content entry exceeds 100 KB.');
 function walk(v:any,k='',depth=0){
  if(depth>12)invalid('Content is nested too deeply.');
  if(typeof v==='string'){
   if(v.length>30000)invalid('Text field exceeds 30,000 characters.');
   if(['route','cta_route','href'].includes(k)&&v&&(!/^\/(?!\/)[a-zA-Z0-9_/?=&.%#-]*$/.test(v)||/^\/(?:api|app\/api|signin|signout|login|logout|callback|en|bn)(?:\/|\?|#|$)/.test(v)))invalid('Choose a locale-neutral site page or supported workspace route.');
   if((['route','cta_route','href','url','evidence_url'].includes(k)||k.endsWith('_url'))&&v){
    if(/[\\\r\n]/.test(v)||/%(?:2f|5c|2e)|\.\./i.test(v))invalid('Invalid link.');
    if(!v.startsWith('/')){try{const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password)invalid('External links require HTTPS without credentials.')}catch{invalid('External links require HTTPS.')}}
   }
  }else if(Array.isArray(v)){if(v.length>300)invalid('Too many entries.');v.forEach(x=>walk(x,k,depth+1))}
  else if(v&&typeof v==='object')for(const [a,b] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(a))invalid('Reserved content field.');walk(b,a,depth+1)}
 }
 walk(value);
 if(collection==='navigation'){
  if(!Array.isArray(value)||value.some((v:any)=>!v||!localized(v.label)||!v.label.en.trim()||typeof v.route!=='string'||!v.route.startsWith('/')))invalid('Navigation needs labelled route entries.');
  if(new Set(value.map((v:any)=>v.route)).size!==value.length)invalid('Navigation routes must be unique.');return value;
 }
 if(value.id!==undefined&&(typeof value.id!=='string'||value.id!==key))invalid('Keep the stable content ID unchanged.');
 if(!['pages','brand','home','faq'].includes(collection)&&typeof value.id!=='string')invalid('A stable content ID is required.');
 for(const k of ['title','description','body','audience','price_label','eligibility','rights_terms','support_terms','tagline','positioning','hero','hero_support','headline','question','answer'])if(value[k]!==undefined&&value[k]!==null&&!localized(value[k]))invalid(k+' needs English/Bangla text fields.');
 for(const k of ['route','cta_route','state','category','application_status','availability','status','currency','layout','name'])if(value[k]!==undefined&&typeof value[k]!=='string')invalid(k+' must be text.');
 for(const k of ['features','modules','pricing_variables','source_refs'])if(value[k]!==undefined&&(!Array.isArray(value[k])||value[k].some((x:any)=>typeof x!=='string')))invalid(k+' must be a list of text.');
 if(value.route&&!['pages','home_outcomes'].includes(collection)&&!value.route.slice(1).includes('/'))invalid('Catalogue entries need a unique detail route below a public page.');
 if(value.route!==undefined&&(!value.route.startsWith('/')||/[?#]/.test(value.route)))invalid('A page route must be a path without query parameters.');
 if(value.route&&/^\/(?:app|join|login|about|pricing|privacy|terms|home|ecosystem|billing|settings|opportunities|prompt-studio|career|internet|coverage|cloud-hosting|domain|web-hosting|vps|colocation|data-center)(?:\/|$)/.test(value.route)&&!seededRows(collection).some(r=>r.item_key===key&&r.body.route===value.route))invalid('This route is reserved. Choose a different public page route.');
 if(value.primary_cta!==undefined&&(!value.primary_cta||!localized(value.primary_cta.label)||typeof value.primary_cta.route!=='string'))invalid('Primary call to action needs a label and route.');
 if(value.cta!==undefined&&!localized(value.cta)&&(!value.cta||!localized(value.cta.label)||typeof value.cta.route!=='string'))invalid('Call to action needs localized text or a label and route.');
 if(value.seo!==undefined&&(!value.seo||!localized(value.seo.title)||!localized(value.seo.description)))invalid('SEO needs localized title and description.');
 if(collection==='brand'&&(typeof value.name!=='string'||!value.name.trim()))invalid('Brand name is required.');
 if(collection==='home'&&value.search_indexing!==undefined&&typeof value.search_indexing!=='boolean')invalid('Search indexing must be true or false.');
 if(collection==='home'&&(!localized(value.headline)||!localized(value.description)))invalid('Home needs English/Bangla headline and description.');
 if(!['brand','home','faq'].includes(collection)&&(!localized(value.title)||!localized(value.description)))invalid('Title and description need English/Bangla fields.');
 if(collection==='pages'){
  if(value.route!==key||!Array.isArray(value.sections))invalid('Pages need their stable route and a sections array.');
  if(value.sections.some((x:any)=>!x||!localized(x.heading)||!localized(x.body)))invalid('Page sections need localized headings and bodies.');
  if(value.layout!==undefined&&!['default','editorial'].includes(value.layout))invalid('Choose default or editorial page layout.');
 }
 if(collection==='faq'&&(!localized(value.question)||!localized(value.answer)))invalid('FAQ question and answer must be localized text.');
 if(collection==='capability_bundles'&&!Array.isArray(value.pricing_variables))invalid('Packages require a pricing_variables list.');
 if(collection==='integrations'&&(!value.category||!['proposed','adapter_required','under_review','unavailable'].includes(value.state)))invalid('Choose a proposed integration category and pre-connection state.');
 if(value.connected===true)invalid('Provider connection cannot be activated from website content.');
 for(const k of ['deadline','checked_at'])if(value[k]!==undefined&&value[k]!==null&&(typeof value[k]!=='string'||!Number.isFinite(Date.parse(value[k]))))invalid(k+' must be a valid date.');
 if(collection==='opportunities'&&!['planned','open','closed'].includes(value.application_status))invalid('Select planned, open or closed applications.');
 if(collection==='service_status'&&!['unknown','operational','degraded','outage','maintenance','resolved'].includes(value.state))invalid('Select a valid service status.');
 if(publish){
  const heading=collection==='faq'?value.question:singleton?'configured':value.title;if(!heading||(typeof heading==='object'&&!heading.en.trim()))invalid('Add an English title before publication.');
  if(value.price_amount!==undefined&&value.price_amount!==null&&(!Number.isFinite(value.price_amount)||value.price_amount<0||!value.currency))invalid('A price needs a non-negative amount and currency.');
  if(collection==='opportunities'&&value.application_status==='open'&&(!value.eligibility?.en?.trim()||!value.rights_terms?.en?.trim()||!value.source_refs?.length))invalid('An open call needs eligibility, participation/IP terms and approval/source references.');
  if(collection==='marketplace_listings'&&(!value.rights_terms?.en?.trim()||!value.support_terms?.en?.trim()||!value.source_refs?.length))invalid('A public listing needs rights, support terms and source/approval references.');
  if(collection==='service_status'&&value.state!=='unknown'&&(!value.checked_at||!value.source_refs?.length))invalid('A service status claim needs an observation date and evidence references.');
 }
 return value;
}
export async function assertRouteAvailable(collection:string,key:string,value:any){if(!value.route||['navigation','home','brand','home_outcomes'].includes(collection))return;const all=await getPublicContent();for(const c of cmsCollections){if(!Array.isArray(all[c])||c==='navigation')continue;for(const [i,row] of all[c].entries())if(row.route===value.route&&!(c===collection&&contentKey(c,row,i)===key))invalid('That route is already used by another published entry. Choose a unique route.') }}
