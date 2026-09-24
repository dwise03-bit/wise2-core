import { parseWojiChain, type WojiCommand, type WojiProjectState } from "./index";
import { isAuthorized, requiresHumanGate, type WojiRole } from "./permissions";

export interface WojiExecutionStep { command:WojiCommand; status:"ready"|"blocked"; reason?:string; }
export interface WojiExecutionPlan { normalized:string; steps:WojiExecutionStep[]; stop:boolean; completionRun:boolean; }

export function planWojiExecution(raw:string,role:WojiRole,state:WojiProjectState,humanApproved=false):WojiExecutionPlan {
 const parsed=parseWojiChain(raw);
 const steps:WojiExecutionStep[]=[];
 let stopped=false;
 for(const command of parsed.commands){
   let reason:string|undefined;
   if(!isAuthorized(role,command.authority)) reason="permission_denied";
   else if(requiresHumanGate(command.authority)&&!humanApproved) reason="human_gate_required";
   else if(command.name==="verified_complete"&&(state.progress!==100||state.missing.length||state.blockers.length||!state.tests.length||state.tests.some(t=>!t.passed))) reason="completion_gate_failed";
   const status=reason?"blocked":"ready";
   steps.push({command,status,reason});
   if(reason){ stopped=true; break; }
 }
 return {normalized:parsed.normalized,steps,stop:stopped,completionRun:parsed.completionRun};
}
