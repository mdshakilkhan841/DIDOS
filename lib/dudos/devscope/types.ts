// Wire contracts for the DUDOS -> DevScope integration.
//
// DUDOS is the control plane: it owns the customer, the project, the
// requirements and the approvals. DevScope owns the technical execution. These
// types describe only what crosses the boundary — DUDOS never models DevScope's
// internal build state.

/** The two development paths. Absent on projects saved before this field existed,
 *  which are treated as `quick_site` so existing work keeps its old behaviour. */
export type BuildType='quick_site'|'custom_software';

/** Customer-facing status vocabulary. DUDOS owns this list; DevScope's own
 *  pipeline states are mapped onto it and kept alongside as `raw_status`. */
export type DevscopeStatus=
 |'draft'|'requirements_ready'|'submitted'|'planning'|'approval_required'
 |'building'|'testing'|'reviewing'|'deployment_ready'|'deploying'|'deployed'
 |'failed'|'cancelled';

export type DevscopeSubmission={
 source:'dudos';
 external_project_id:string;
 external_project_url?:string;
 external_revision:number;
 idempotency_key:string;
 project:{
  name:string;
  type:BuildType;
  category?:string;
  business_objective?:string;
  target_users?:string;
  requirements:string;
  srs?:string;
  pages:string[];
  features:string[];
  integrations:string[];
  acceptance?:string;
 };
 design_context:{
  template_id?:string;
  template_name?:string;
  layout?:string;
  style?:string;
  design_id?:string;
  notes?:string;
 };
 technology_preferences:{
  frontend?:string;
  backend?:string;
  database?:string;
  deployment?:string;
  platform?:string;
  framework?:string;
 };
 domain?:string;
 execution:{workflow:string;tier:string};
};

export type DevscopeSubmissionResult={
 devscope_project_id:string;
 build_id:string;
 status:string;
 stage:string;
 raw_status:string;
 aidlc_tier?:string|null;
 reused:boolean;
};

export type DevscopeBuildStatus={
 devscope_project_id:string;
 build_id:string;
 external_project_id?:string|null;
 external_revision?:number|null;
 status:string;
 stage:string;
 raw_status:string;
 preview_url?:string|null;
 production_url?:string|null;
 repository_url?:string|null;
 executor?:string|null;
 error_summary?:string|null;
 failure_category?:string|null;
};

/** A link row as shown to a customer. Deliberately omits DevScope internals —
 *  `raw_status`, executor and error detail are added only for administrators. */
export type DevscopeLinkView={
 build_id:string|null;
 status:DevscopeStatus;
 stage:string|null;
 repository_url:string|null;
 preview_url:string|null;
 production_url:string|null;
 last_build_at:string|null;
 last_deployment_at:string|null;
 last_synced_at:string|null;
 record_version:number;
};
