export interface CreateLiveRoomDto {
  name: string;
  slug: string;
  maxConcurrentViewers?: number;
}

export interface JoinLiveRoomDto {
  roleRequest?: 'viewer' | 'guest';
}

export interface SendChatMessageDto {
  message: string;
}

export interface CreatePollDto {
  question: string;
  options: string[];
  durationSeconds?: number;
}

export interface VotePollDto {
  optionId: string;
}

export interface SubmitSuggestionDto {
  suggestion: string;
}

export interface LiveRoomResponse {
  id: string;
  name: string;
  slug: string;
  creatorId: string;
  status: 'draft' | 'live' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  maxConcurrentViewers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveRoomMemberResponse {
  id: string;
  roomId: string;
  userId: string;
  role: 'creator' | 'cohost' | 'guest' | 'viewer';
  permissions: number;
  joinedAt: Date;
  leftAt?: Date;
}

export interface ChatMessageResponse {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export interface SuggestionResponse {
  id: string;
  roomId: string;
  userId: string;
  suggestion: string;
  votes: number;
  createdAt: Date;
}
