// This preference is optional UI state, never a membership or authority source.
export function preferredWorkspace():string|null{
 try{return window.localStorage.getItem('dudos.workspace')}catch{return null}
}
export function rememberWorkspace(id:string):void{
 try{window.localStorage.setItem('dudos.workspace',id)}catch{/* Embedded browsers may disable storage; keep working with current React state. */}
}
