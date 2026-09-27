import type {DevscopeStatus} from './types';

// DevScope pipeline state -> the customer-facing status DUDOS displays.
//
// DUDOS re-derives this from `raw_status` rather than trusting the `status`
// DevScope sends, so the customer-facing vocabulary stays under DUDOS's control
// and a DevScope-side wording change cannot alter what a customer is told.
const MAP:Record<string,DevscopeStatus>={
 pending:'submitted',
 queued:'submitted',
 preparing:'planning',
 planning:'planning',
 building:'building',
 running:'building',
 fixing:'building',
 validating:'reviewing',
 deploying:'deploying',
 verifying:'deploying',
 testing:'testing',
 publishing:'deployment_ready',
 success:'deployed',
 failed:'failed',
 cancelled:'cancelled',
 stopped:'cancelled',
};

/** Unknown states map to `building`: the build is demonstrably running, and a
 *  conservative claim is safer than inventing a more specific one. */
export function mapStatus(raw:string|null|undefined):DevscopeStatus{
 return MAP[String(raw||'').trim().toLowerCase()]||'building';
}

export const TERMINAL:ReadonlySet<DevscopeStatus>=new Set<DevscopeStatus>(['deployed','failed','cancelled']);
export const isTerminal=(s:DevscopeStatus)=>TERMINAL.has(s);

/** Ordered customer-facing milestones for the project status page.
 *  Stage-based, never a fabricated percentage: DevScope reports a stage, not
 *  measurable progress, and a made-up number would be a false claim. */
export const MILESTONES:{key:string;label:string;reached:DevscopeStatus[]}[]=[
 {key:'requirements',label:'Requirements',reached:['submitted','planning','building','testing','reviewing','deployment_ready','deploying','deployed']},
 {key:'planning',label:'Architecture & planning',reached:['planning','building','testing','reviewing','deployment_ready','deploying','deployed']},
 {key:'development',label:'Development',reached:['building','testing','reviewing','deployment_ready','deploying','deployed']},
 {key:'testing',label:'Testing & review',reached:['testing','reviewing','deployment_ready','deploying','deployed']},
 {key:'deployment',label:'Deployment',reached:['deploying','deployed']},
];

export type MilestoneState='waiting'|'in_progress'|'completed'|'blocked';

export function milestones(status:DevscopeStatus):{key:string;label:string;state:MilestoneState}[]{
 return MILESTONES.map((m,i)=>{
  if(status==='failed'||status==='cancelled'){
   // Everything already passed stays completed; the stage that was live when
   // the build stopped is shown as blocked, not silently "waiting".
   const next=MILESTONES[i+1];
   const passed=next?next.reached.includes(status):false;
   return {key:m.key,label:m.label,state:(passed?'completed':m.reached.includes('building')&&i===0?'completed':'blocked') as MilestoneState};
  }
  if(!m.reached.includes(status))return {key:m.key,label:m.label,state:'waiting' as MilestoneState};
  const next=MILESTONES[i+1];
  const movedPast=next?next.reached.includes(status):status==='deployed';
  return {key:m.key,label:m.label,state:(movedPast?'completed':'in_progress') as MilestoneState};
 });
}

/** Plain-language line shown to a customer. Never mentions AI-DLC, Kiro, Claude,
 *  agents or executors — §7 keeps engineering vocabulary off customer surfaces. */
export function customerLabel(status:DevscopeStatus):string{
 return {
  draft:'Draft — not yet submitted',
  requirements_ready:'Requirements ready for approval',
  submitted:'Submitted — queued for development',
  planning:'Architecture and planning in progress',
  approval_required:'Waiting for your approval',
  building:'Development in progress',
  testing:'Automated testing in progress',
  reviewing:'Quality review in progress',
  deployment_ready:'Ready for deployment',
  deploying:'Deployment in progress',
  deployed:'Deployed',
  failed:'Needs attention — our team has been notified',
  cancelled:'Cancelled',
 }[status];
}
