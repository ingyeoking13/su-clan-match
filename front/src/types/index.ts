export enum EntityStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  REGISTERED = 'REGISTERED',
  MERGED = 'MERGED',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED'
}

export interface BaseEntity {
  id: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Clan extends BaseEntity {
  name: string;
  description: string;
  foundingDate: string;
  closingDate?: string;
  memberCount?: number;
}

export interface Grade extends BaseEntity {
  name: string;
  description: string;
}

export interface Player extends BaseEntity {
  nickname: string;
  grade?: Grade;
  clan?: {
    id: number | null;
    name: string;
    status: string | null;
    foundingDate: string | null;
    memberCount: number;
  } | null;
  clanName?: string; // 백워드 호환성을 위해 유지
  totalMatches?: number;
  wins?: number;
  losses?: number;
  // 기존 필드명도 호환성을 위해 유지
  matchCount?: number;
  winCount?: number;
  loseCount?: number;
}

export interface Match extends BaseEntity {
  playerOne: Player;
  playerTwo: Player;
  winner?: Player;
  loser?: Player;
  mapName: string;
  description: string;
  contestName?: string;
}

export interface Contest extends BaseEntity {
  name: string;
  description: string;
  startedAt: string;
  endedAt?: string;
  playerCount?: number;
  matchCount?: number;
}

export interface DashboardStats {
  totalClans: number;
  totalPlayers: number;
  totalMatches: number;
  totalContests: number;
  activeContests: number;
  recentMatches: Match[];
}
