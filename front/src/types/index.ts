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
  race?: string;
  grade?: Grade;
  clan?: {
    id: number | null;
    name: string;
    status: string | null;
    foundingDate: string | null;
    memberCount: number;
  } | null;
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
  playerOneRace?: string;  // 추가: Match 엔티티의 playerOneRace
  playerTwoRace?: string;  // 추가: Match 엔티티의 playerTwoRace
  winner?: Player;
  loser?: Player;
  mapName: string;
  streamingUrl?: string;
  matchTime?: string; // 경기 일자
  description: string;
  contestName?: string;
  // API 응답에서 직접 제공되는 필드들 (검색/정렬용)
  playerOneNickname?: string;
  playerTwoNickname?: string;
  winnerNickname?: string;
}

export interface MatchUpDateRequest {
  playerOneRace?: string;
  playerTwoRace?: string;
  winnerId?: string;
  mapName?: string;
  description?: string;
  playerOneId?: string;
  playerTwoId?: string;
  streamingUrl?: string;
}

export interface Contest extends BaseEntity {
  name: string;
  description: string;
  startedAt: string;
  endedAt?: string;
  playerCount?: number;
  matchCount?: number;
}

export enum NoticeType {
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN'
}

export interface Notice {
  id: number;
  title: string;
  writer: string;
  text?: string;
  noticeType: NoticeType;
  createdAt: string;
}

export interface DashboardStats {
  totalClans: number;
  totalPlayers: number;
  totalMatches: number;
  totalContests: number;
  activeContests: number;
  recentMatches: Match[];
}

export interface MainSummary {
  clanCount: number;
  memberCount: number;
  matchCount: number;
  matches: Match[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  data?: PaginatedResponse<T> | T[];
  content?: T[];
}
