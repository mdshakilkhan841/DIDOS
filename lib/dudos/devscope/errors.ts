export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Normalised failure modes for the DevScope integration.
 *
 *  Every message here is customer-safe: it states what happened and what the
 *  customer's work is doing now, and never leaks a URL, token, header or
 *  upstream stack trace. The `code` is for DUDOS's own logs and the admin view.
 */
export type DevscopeErrorCode=
 |'not_configured'|'unauthorized'|'timeout'|'unavailable'
 |'invalid_request'|'duplicate'|'conflict'|'not_found'|'upstream_error';

export class DevscopeError extends HttpError{
 constructor(public code:DevscopeErrorCode,status:number,message:string){super(status,message)}
}

const MESSAGES:Record<DevscopeErrorCode,string>={
 not_configured:'Custom software delivery is not configured yet. Your project has been saved.',
 unauthorized:'The delivery service rejected this request. Your project has been saved; an administrator has been notified.',
 timeout:'The delivery service did not respond in time. Your project has been saved — try submitting again.',
 unavailable:'The delivery service is unavailable right now. Your project has been saved — try submitting again shortly.',
 invalid_request:'These requirements could not be accepted. Review the project details and try again.',
 duplicate:'This requirement revision has already been submitted.',
 conflict:'This submission is already being processed. Refresh the page to see its status.',
 not_found:'That build could not be found.',
 upstream_error:'The delivery service could not complete this request. Your project has been saved.',
};

const STATUS:Record<DevscopeErrorCode,number>={
 not_configured:503,unauthorized:502,timeout:504,unavailable:503,
 invalid_request:400,duplicate:200,conflict:409,not_found:404,upstream_error:502,
};

export const devscopeError=(code:DevscopeErrorCode)=>
 new DevscopeError(code,STATUS[code],MESSAGES[code]);

/** Map an upstream HTTP status onto a normalised code.
 *  DevScope's own `detail` text is never forwarded to a customer — it can name
 *  internal paths and configuration. */
export function fromStatus(status:number):DevscopeErrorCode{
 if(status===401||status===403)return 'unauthorized';
 if(status===404)return 'not_found';
 if(status===409)return 'conflict';
 if(status===400||status===422)return 'invalid_request';
 if(status===429||status===503)return 'unavailable';
 return 'upstream_error';
}
