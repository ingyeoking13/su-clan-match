'use client';

import React from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentMatches } from '@/components/RecentMatches';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { clanApi, playerApi, matchApi, contestApi } from '@/lib/api';
import { DashboardStats as DashboardStatsType, Match, Clan, Player, Contest, EntityStatus } from '@/types';

export default function Dashboard() {
  // API 데이터 페칭
  const { data: clans, loading: clansLoading, error: clansError, refetch: refetchClans } = useApi<Clan[]>(clanApi.getAll);
  const { data: players, loading: playersLoading, error: playersError, refetch: refetchPlayers } = useApi<Player[]>(playerApi.getAll);
  const { data: matches, loading: matchesLoading, error: matchesError, refetch: refetchMatches } = useApi<Match[]>(matchApi.getAll);
  const { data: contests, loading: contestsLoading, error: contestsError, refetch: refetchContests } = useApi<Contest[]>(contestApi.getAll);

  // 로딩 상태 확인
  const isLoading = clansLoading || playersLoading || matchesLoading || contestsLoading;
  const hasError = clansError || playersError || matchesError || contestsError;

  // 통계 데이터 계산
  const stats: DashboardStatsType = {
    totalClans: clans?.length || 0,
    totalPlayers: players?.length || 0,
    totalMatches: matches?.length || 0,
    totalContests: contests?.length || 0,
    activeContests: (contests || []).filter(c => c.status === EntityStatus.RUNNING).length,
    recentMatches: (matches || []).slice(0, 5),
  };

  const handleRetry = () => {
    refetchClans();
    refetchPlayers();
    refetchMatches();
    refetchContests();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorMessage
        message={clansError || playersError || matchesError || contestsError || '데이터를 불러오는데 실패했습니다.'}
        onRetry={handleRetry}
        className="min-h-96"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          [S.U] clan 게임 클랜 관리 시스템 개요
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMatches matches={stats.recentMatches} />
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              새 경기 등록
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              선수 추가
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              대회 생성
            </button>
            <button className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              클랜 관리
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}