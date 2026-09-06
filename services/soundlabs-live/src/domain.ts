export type LiveParticipantRole =
  | 'OWNER'
  | 'CO_ARTIST'
  | 'PRODUCER'
  | 'GUEST'
  | 'MODERATOR'
  | 'VIEWER';

export type CrowdMode = 'WATCH_ONLY' | 'GUIDED' | 'CHAOS';

export type LiveAction =
  | 'view'
  | 'chat'
  | 'vote'
  | 'suggest'
  | 'create_version'
  | 'promote_version'
  | 'open_poll'
  | 'close_poll'
  | 'moderate_chat'
  | 'manage_roles'
  | 'change_crowd_mode';
