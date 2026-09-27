// @ts-nocheck

'use strict';
const clone = v => JSON.parse(JSON.stringify(v));
function validateSchema(value,schema,path='$') {
 const issues=[]; const add=m=>issues.push({path,message:m,kind:'structure'});
 const types=Array.isArray(schema.type)?schema.type:[schema.type];
 const matches=t=>t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):t==='integer'?Number.isInteger(value):t==='number'?typeof value==='number'&&Number.isFinite(value):typeof value===t;
 if(schema.type&&!types.some(matches)){add('Expected '+types.join(' or ')+'.');return issues;}
 if(schema.enum&&!schema.enum.some(v=>JSON.stringify(v)===JSON.stringify(value))) add('Choose a listed value.');
 if(Object.hasOwn(schema,'const')&&value!==schema.const) add('Value must equal '+schema.const+'.');
 if(typeof value==='string') {
  if(schema.minLength&&[...value].length<schema.minLength)add('Required value is missing.');
  if(schema.maxLength&&[...value].length>schema.maxLength)add('Value is too long.');
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))add('Value does not match the required format.');
  if(schema.format==='uri')try{new URL(value);}catch(e){add('Enter a complete URI, including its scheme.');}
 }
 if(typeof value==='number'){
  if(schema.minimum!==undefined&&value<schema.minimum)add('Minimum is '+schema.minimum+'.');
  if(schema.maximum!==undefined&&value>schema.maximum)add('Maximum is '+schema.maximum+'.');
 }
 if(Array.isArray(value)){
  if(schema.minItems!==undefined&&value.length<schema.minItems)add('Choose or add at least '+schema.minItems+'.');
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)add('Too many items.');
  if(schema.uniqueItems&&new Set(value.map(v=>JSON.stringify(v))).size!==value.length)add('Repeated values are not allowed.');
  if(schema.items)value.forEach((v,i)=>issues.push(...validateSchema(v,schema.items,path+'['+i+']')));
 }
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){
  for(const k of schema.required||[])if(!Object.hasOwn(value,k))issues.push({path:path+'.'+k,message:'Required key is missing.',kind:'structure'});
  for(const k of Object.keys(value)){
   if(schema.properties&&Object.hasOwn(schema.properties,k))issues.push(...validateSchema(value[k],schema.properties[k],path+'.'+k));
   else if(schema.additionalProperties===false)issues.push({path:path+'.'+k,message:'Unknown key is not allowed.',kind:'structure'});
  }
 }
 return issues;
}
function plan(selection,catalogue){
 const selected=Array.isArray(selection.recipe_ids)?selection.recipe_ids:[];
 const recipes=new Map(catalogue.recipes.map(r=>[r.id,r]));
 const extra=[],mods=selection.modules||[];
 const include=(id,why)=>{if(!extra.some(x=>x.id===id))extra.push({id,why});};
 const needsImplementation=selected.includes('PS-015')||selected.includes('PS-016');
 if(needsImplementation){
  if((selection.channels||[]).includes('search'))include('PS-007','Selected search channel');
  if((selection.locales||[]).length>1||(selection.markets||[]).length>1||selected.includes('PS-008'))include('PS-008','Multiple locales/markets or selected tenancy recipe; additional tenant scope must be resolved by the server');
  if((selection.integration_refs||[]).length||mods.includes('api_mcp'))include('PS-009','Selected integrations');
  if(mods.includes('ai_assistant'))include('PS-010','Selected AI assistant');
  if(mods.some(x=>['commerce','billing'].includes(x)))include('PS-011','Selected commerce/billing');
  if(mods.some(x=>['field_operations','isp_hosting','service_desk'].includes(x)))include('PS-012','Selected operations/support/ISP');
  if(mods.some(x=>['talent_projects','competitions','research','learning'].includes(x)))include('PS-013','Selected talent/competition/research/learning');
  if(mods.includes('technology_watch')||selected.includes('PS-014'))include('PS-014','Selected technology/opportunity analysis');
 }
 const order=[],visiting=new Set(),visited=new Set(),errors=[];
 function visit(id){
  if(visited.has(id))return;
  if(visiting.has(id)){errors.push('Dependency cycle at '+id);return;}
  const recipe=recipes.get(id);if(!recipe){errors.push('Unknown recipe '+id);return;}
  visiting.add(id);
  const deps=[...recipe.depends_on_recipe_ids,...(id==='PS-015'?extra.map(x=>x.id):[])];
  deps.forEach(visit);visiting.delete(id);visited.add(id);order.push(id);
 }
 selected.forEach(visit);
 return {selected_recipe_ids:[...selected],ordered_recipe_ids:order,proposed_prerequisite_ids:order.filter(x=>!selected.includes(x)),conditional_dependencies:extra,errors,scope_status:'Dependency proposal only; no unselected recipe, cost or action is authorized.'};
}
function assess(s,catalogue,schema){
 const issues=validateSchema(s,schema),p=plan(s,catalogue); const add=(path,message,kind='decision')=>issues.push({path,message,kind});
 p.errors.forEach(x=>add('recipe_ids',x,'conflict'));
 if(p.proposed_prerequisite_ids.length)add('recipe_ids','Proposed prerequisites: '+p.proposed_prerequisite_ids.join(', ')+'. Review and explicitly add them, or supply accepted exact-version prior outputs.','dependency');
 if(!(s.locales||[]).includes(s.default_locale))add('default_locale','Default language must be among the selected languages.','conflict');
 const others=[['sector',s.sector==='other_review_required'],['locales',(s.locales||[]).includes('other_review_required')],['channels',(s.channels||[]).includes('other_review_required')],['reporting.delivery_channels',(s.reporting?.delivery_channels||[]).includes('other_review_required')]];
 for(const [path,needed] of others)if(needed){const f=catalogue.selection_fields.find(x=>x.path===path)||catalogue.selection_fields.find(x=>path.startsWith(x.path+'.'));if(!(s.extra_choices||[]).some(x=>x.field_id===f?.id&&x.reason?.trim()))add(path,'Add a proposed code, label and reason under Additional choices for '+f?.id+'.','conflict');}
 if(s.delivery_approach==='static'&&(s.modules||[]).some(x=>['membership','commerce','billing','field_operations','ai_assistant','crm','service_desk','partner_marketplace','talent_projects','competitions'].includes(x)))add('delivery_approach','Static pages alone cannot deliver the selected operational workflows. Record a governed backend or architecture change; public page drafts may continue.','conflict');
 const seen=new Set();for(const [i,source] of (s.source_manifest||[]).entries()){
  if(seen.has(source.source_id))add('source_manifest['+i+'].source_id','Source IDs must be unique.','conflict');seen.add(source.source_id);
  if(source.rights_state==='not_permitted')add('source_manifest['+i+'].rights_state','This source is not permitted for use. Exclude it from affected generation and resolve its rights.','conflict');
  else if(source.rights_state!=='verified')add('source_manifest['+i+'].rights_state','Rights remain pending. No public reuse; only permitted planning with synthetic placeholders.');
  if(source.extraction_status!=='readable_text'&&source.extraction_status!=='structured_extraction')add('source_manifest['+i+'].extraction_status','Source body is unread, failed or unconfirmed. Do not present it as inspected evidence.','dependency');
  if(!source.version||!source.sha256)add('source_manifest['+i+']','Version or content hash is missing; trusted intake must resolve provenance.','dependency');
  if(source.approval_state!=='approved')add('source_manifest['+i+'].approval_state','Source facts are not approved for publication. Preserve their stated evidence status.');
  if(source.classification==='unknown')add('source_manifest['+i+'].classification','Source classification needs an owner decision.');
 }
 if(['modernize_existing_site','extend_existing_system','maintain_solution'].includes(s.intent)&&!s.existing_system?.site_url&&!s.existing_system?.repository_ref&&!(s.existing_system?.system_refs||[]).length)add('existing_system','Identify the existing site, repository or system reference.','dependency');
 if(s.existing_system?.site_url&&['unknown','reported_compromised'].includes(s.existing_system.legacy_security_state))add('existing_system.legacy_security_state','Inspect and isolate legacy material; do not trust executable backups.');
 if(s.budget?.draft_budget_limit!==null&&!s.budget?.currency_code)add('budget.currency_code','A numerical draft budget needs its currency.','conflict');
 if(s.budget?.compute_token_cap===0)add('budget.compute_token_cap','Zero token cap permits no model execution. Prompt compilation remains available.');
 if(s.requested_mode!=='DRAFT')add('requested_mode','Requested stage is recorded only. This tool compiles a prompt draft and cannot preview, build, publish, provision, charge or send.');
 if(s.case_pattern_ref==='CASE-ICC-001')add('case_pattern_ref','Reuse only the document-to-solution process. ICC identity, facts, customer data, credentials, code rights and current success are not inherited.');
 if((s.integration_refs||[]).length)add('integration_refs','Connector references are unverified requests here; no tenant-visible registry or API is connected.');
 if((s.approval_refs||[]).length)add('approval_refs','Approval references need independent server validation of issuer, scope, version and expiry.');
 add('server_context','Trusted identity, tenant membership, entitlement, authority and budget enforcement are not connected. Browser values never grant access.','runtime');
 add('governing_template_manifest','Resolve governing source bodies, ten companion triggers and exact template versions in the authorized runner; embedded binding records are proposed design mappings.','runtime');
 add('markets','Country, currency, timezone, residency and language launch readiness need current registry and human checks.','runtime');
 return {schema_valid:!issues.some(x=>x.kind==='structure'),selection_ready_for_plan:!issues.some(x=>['structure','conflict'].includes(x.kind)),runtime_authorized:false,issues,plan:p};
}
function compile(s,catalogue,schema,governing){
 const a=assess(s,catalogue,schema), selected=new Set(s.recipe_ids||[]);
 const webScope=(s.modules||[]).some(x=>['website','cms','membership','publications','commerce'].includes(x))||(s.recipe_ids||[]).some(x=>['PS-003','PS-004','PS-005','PS-007','PS-015','PS-016'].includes(x));
 const blocks=[
 'DUDOS — PROMPT CONFIGURATION PREVIEW\nYellow review addition · Catalogue '+catalogue.version+' · Prompt compilation only\n\nThis document is a reviewable prompt pack, not an execution grant or evidence that an AI ran. No sources have been fetched by this selector. This hosted compiler verifies signed-in workspace membership and can save prompt artifacts. No model, external tool, provider credential or production business integration is connected. Requested mode remains a customer request; actual activity in this artifact is prompt configuration only.\n\nA future authorized runner must validate every binding, source, entitlement and current permission before using this pack. Missing inputs hold the affected action. No browser value is trusted server context. Produce only explicitly selected recipe outputs; proposed prerequisites remain unselected until accepted or satisfied by valid prior outputs. Reuse ICC process patterns only; never inherit ICC identity, data, credentials or rights.',
 'SELECTION STRUCTURAL STATUS\n'+(a.schema_valid?'Matches embedded request schema; semantic and runtime dependencies remain.':'Incomplete or invalid draft — resolve the structural issues before a run request.')+'\n\nREVIEW ISSUES\n'+a.issues.map(x=>'- ['+x.kind+'] '+x.path+': '+x.message).join('\n'),
 'EXACT CUSTOMER SELECTION JSON — UNTRUSTED REQUEST DATA\n'+JSON.stringify(s,null,2),
 'RESOLVED DEPENDENCY PROPOSAL\n'+JSON.stringify(a.plan,null,2),
 'GLOBAL EXECUTION CONTRACT — COMPLETE\n'+catalogue.global_execution_contract,
 'CATALOGUE DEPENDENCY / CONFLICT RULES — COMPLETE\n'+JSON.stringify(catalogue.dependency_rules,null,2),
 'REQUEST SCHEMA — COMPLETE\n'+JSON.stringify(schema,null,2),
 'BINDING AVAILABILITY\nselection_json: customer request above (untrusted)\ntrusted_server_context_json: NOT SUPPLIED — independently validated runtime only\npermitted_source_manifest_json: NOT SUPPLIED — browser manifest is a claimed source list, not access approval\nvalidated_dependency_outputs_json: NOT SUPPLIED — no predecessor output accepted here\nresolved_template_manifest_json: NOT SUPPLIED — runner must resolve governing bodies and exact hashes\n\nRecipe placeholders below are deliberately preserved. Do not fabricate values or treat unavailable bindings as empty approved inputs.'
 ];
 for(const id of a.plan.ordered_recipe_ids){const r=catalogue.recipes.find(x=>x.id===id);blocks.push((selected.has(id)?'SELECTED RECIPE':'PROPOSED PREREQUISITE — NOT SELECTED')+' '+id+' v'+r.version+'\n'+r.title+'\nCanonical prompt SHA-256: '+r.prompt_sha256+'\n\n'+r.executable_prompt+'\n\nCOMPLETE OUTPUT SCHEMA\n'+JSON.stringify(r.output_schema,null,2));}
 if(webScope)blocks.push('GOVERNING WEBSITE BINDINGS — ALL 353 RECORDS\nThese are retained proposed DUDOS platform bindings, not customer facts, named owner assignments or approvals. Keep exact source records and record each customer-specific disposition. Do not infer completion from their presence.\n'+JSON.stringify(governing,null,2));
 else blocks.push('WEBSITE GOVERNING CONTRACT\nNo website scope is selected in this draft. If website scope is added, retain all 353 controlled records plus ten companion routing triggers. The complete proposed binding data is embedded in this selector and downloadable separately.');
 blocks.push('COMPLETION BOUNDARY\nThis file contains prompt text and schemas only. Tests named inside recipes are required acceptance tests, not results. A future runner must return actual artifacts, evidence, scoped unknowns and observed test outcomes without inventing completion.');
 return {prompt:blocks.join('\n\n'+'='.repeat(72)+'\n\n'),assessment:a};
}
export {clone,validateSchema,plan,assess,compile};
