
// Inbound webhook verification: DevScope -> DUDOS.
//
// Signature scheme (must match integrations/dudos/webhooks.py on the DevScope
// side exactly):
//
//     signed = `${timestamp}.${rawBody}`
//     header = "sha256=" + hex(HMAC_SHA256(secret, signed))
//
// The signature is verified against the RAW request bytes. Re-serialising the
// parsed JSON first would change key order and whitespace and break every
// signature — and, worse, would let an attacker smuggle unsigned content
// through a parser difference.

/** Rejection window for replayed deliveries. Wide enough for DevScope's own
 *  retry backoff (up to ~10s) plus clock skew; far short of a useful replay. */
export const MAX_SKEW_SECONDS=300;

export type WebhookVerification=
 |{ok:true;timestamp:number}
 |{ok:false;reason:'not_configured'|'missing_signature'|'missing_timestamp'|'stale_timestamp'|'bad_signature'};

const secret=()=>((process.env as unknown as {DEVSCOPE_WEBHOOK_SECRET?:string}).DEVSCOPE_WEBHOOK_SECRET||'').trim();

export const isConfigured=()=>!!secret();

function hex(buffer:ArrayBuffer){
 return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/** Length-safe, value-independent comparison.
 *  crypto.subtle has no HMAC "verify against hex string", so compare here and
 *  keep the loop constant-time over the expected length. */
function timingSafeEqual(a:string,b:string){
 if(a.length!==b.length)return false;
 let diff=0;
 for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
}

export async function verify(rawBody:Uint8Array,headers:Headers,now=Date.now()):Promise<WebhookVerification>{
 const key=secret();
 if(!key)return {ok:false,reason:'not_configured'};

 const presented=(headers.get('x-devscope-signature')||'').trim();
 if(!presented)return {ok:false,reason:'missing_signature'};

 const timestampHeader=(headers.get('x-devscope-timestamp')||'').trim();
 if(!timestampHeader||!/^\d{1,15}$/.test(timestampHeader))return {ok:false,reason:'missing_timestamp'};

 const timestamp=Number(timestampHeader);
 if(Math.abs(Math.floor(now/1000)-timestamp)>MAX_SKEW_SECONDS)return {ok:false,reason:'stale_timestamp'};

 const encoder=new TextEncoder();
 const prefix=encoder.encode(timestampHeader+'.');
 const signed=new Uint8Array(prefix.length+rawBody.length);
 signed.set(prefix,0);
 signed.set(rawBody,prefix.length);

 const cryptoKey=await crypto.subtle.importKey(
  'raw',encoder.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const expected='sha256='+hex(await crypto.subtle.sign('HMAC',cryptoKey,signed as BufferSource));

 if(!timingSafeEqual(presented,expected))return {ok:false,reason:'bad_signature'};
 return {ok:true,timestamp};
}

/** Strip a delivery down to what is safe to persist.
 *  Build logs, environment detail and arbitrary upstream fields are dropped:
 *  only the fields DUDOS actually renders are kept, each length-capped. */
export function safePayload(body:Record<string,unknown>){
 const str=(v:unknown,max=500)=>typeof v==='string'?v.slice(0,max):null;
 return {
  event_type:str(body.event_type,80),
  status:str(body.status,40),
  stage:str(body.stage,40),
  raw_status:str(body.raw_status,40),
  preview_url:str(body.preview_url,500),
  production_url:str(body.production_url,500),
  repository_url:str(body.repository_url,500),
  error_summary:str(body.error_summary,500),
 };
}
