export interface Participant {
  handleId: number;
  phoneNumber: string;
  maskedNumber: string;
  displayName: string;
}

export interface GroupChat {
  chatId: number;
  displayName: string;
  participantCount: number;
  messageCount: number;
}

export interface ReactionStats {
  reactorHandleId: number;
  targetHandleId: number;
  reactionType: number;
  count: number;
}

export interface PersonStats {
  handleId: number;
  displayName: string;
  maskedNumber: string;
  color: string;
  messagesSent: number;
  laughsGiven: number;
  laughsReceived: number;
  heartsGiven: number;
  heartsReceived: number;
  thumbsUpGiven: number;
  thumbsUpReceived: number;
  thumbsDownGiven: number;
  thumbsDownReceived: number;
  emphasizedGiven: number;
  emphasizedReceived: number;
  questionedGiven: number;
  questionedReceived: number;
  allReactionsGiven: number;
  allReactionsReceived: number;
  laughRatio: number;
  laughRate: number;
}

export interface LaughConnection {
  reactorHandleId: number;
  targetHandleId: number;
  count: number;
}

export interface WrappedData {
  chatName: string;
  participants: Participant[];
  personStats: PersonStats[];
  laughConnections: LaughConnection[];
  totalMessages: number;
  totalLaughs: number;
  totalReactions: number;
}

export const REACTION_TYPES = {
  LOVED: 2000,
  LIKED: 2001,
  DISLIKED: 2002,
  LAUGHED: 2003,
  EMPHASIZED: 2004,
  QUESTIONED: 2005,
} as const;

export const PARTICIPANT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#87CEEB",
  "#A8E6CF",
  "#DDA0DD",
  "#FFB347",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F1948A",
];
