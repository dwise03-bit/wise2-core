export type Role='OWNER'|'CO_ARTIST'|'PRODUCER'|'GUEST'|'MODERATOR'|'VIEWER';
export type Action='chat'|'vote'|'suggest'|'create_version'|'promote_version'|'open_poll'|'close_poll'|'moderate_chat'|'manage_roles'|'change_crowd_mode';
const grants:Record<Role,ReadonlySet<Action>>={
 OWNER:new Set(['chat','vote','suggest','create_version','promote_version','open_poll','close_poll','moderate_chat','manage_roles','change_crowd_mode']),
 CO_ARTIST:new Set(['chat','vote','suggest','create_version','promote_version','open_poll','close_poll']),
 PRODUCER:new Set(['chat','vote','suggest','create_version','open_poll','close_poll']),
 GUEST:new Set(['chat','vote','suggest']),
 MODERATOR:new Set(['chat','vote','suggest','moderate_chat']),
 VIEWER:new Set(['chat','vote','suggest']),
};
export const can=(role:Role,action:Action)=>grants[role].has(action);
