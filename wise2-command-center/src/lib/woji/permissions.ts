import type { WojiAuthority } from "./index";

export type WojiRole = "viewer"|"creator"|"builder"|"operator"|"owner";
const grants:Record<WojiRole,readonly WojiAuthority[]> = {
 viewer:["read"], creator:["read","plan","write"], builder:["read","plan","write","execute"],
 operator:["read","plan","write","execute"], owner:["read","plan","write","execute","deploy","complete"]
};
export function isAuthorized(role:WojiRole,authority:WojiAuthority):boolean {
 return grants[role].includes(authority);
}
export function requiresHumanGate(authority:WojiAuthority):boolean {
 return authority === "deploy" || authority === "complete";
}
