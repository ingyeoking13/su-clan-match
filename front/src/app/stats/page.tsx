'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { clanApi, playerApi, matchApi, contestApi, PaginatedResponse } from '@/lib/api';
import { Clan, Player, Match, Contest, EntityStatus } from '@/types';
import { BarChart3, TrendingUp, Users, Trophy, Target, Calendar } from 'lucide-react';

export default function StatsPage() {
  // API 데이터 페칭
  const { data: clans, loading: clansLoading, error: clansError, refetch: refetchClans } = useApi<Clan[]>(clanApi.getAll);
  const { data: players, loading: playersLoading, error: playersError, refetch: refetchPlayers } = useApi<PaginatedResponse<Player>>(() => playerApi.getAll());
  const { data: matches, loading: matchesLoading, error: matchesError, refetch: refetchMatches } = useApi<Match[]>(matchApi.getAll);
  const { data: contests, loading: contestsLoading, error: contestsError, refetch: refetchContests } = useApi<Contest[]>(contestApi.getAll);

  // 로딩 상태 확인
  const isLoading = clansLoading || playersLoading || matchesLoading || contestsLoading;
  const hasError = clansError || playersError || matchesError || contestsError;

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

  // 통계 계산
  const totalMatches = matches?.length || 0;
  const completedMatches = (matches || []).filter(m => m.status === EntityStatus.REGISTERED).length;
  const runningMatches = (matches || []).filter(m => m.status === EntityStatus.RUNNING).length;
  const pendingMatches = (matches || []).filter(m => m.status === EntityStatus.PENDING).length;

  const totalContests = contests?.length || 0;
  const runningContests = (contests || []).filter(c => c.status === EntityStatus.RUNNING).length;
  const completedContests = (contests || []).filter(c => c.status === EntityStatus.REGISTERED).length;

  const totalPlayers = players?.content?.length || 0;
  const activePlayers = (players?.content || []).filter(p => p.status === EntityStatus.REGISTERED).length;

  const totalClans = clans?.length || 0;
  const activeClans = (clans || []).filter(c => c.status === EntityStatus.REGISTERED).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">통계</h1>
        <p className="mt-2 text-gray-600">
          시스템 전체 통계 및 분석 데이터를 확인할 수 있습니다.
        </p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 클랜 수
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalClans}
                  </dd>
                  <dd className="text-sm text-green-600">
                    활성 클랜: {activeClans}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 선수 수
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalPlayers}
                  </dd>
                  <dd className="text-sm text-green-600">
                    활성 선수: {activePlayers}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 경기 수
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalMatches}
                  </dd>
                  <dd className="text-sm text-green-600">
                    완료: {completedMatches}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 대회 수
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalContests}
                  </dd>
                  <dd className="text-sm text-blue-600">
                    진행중: {runningContests}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 경기 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              경기 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">완료된 경기</span>
                <span className="text-sm font-medium">{completedMatches}경기</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">진행중인 경기</span>
                <span className="text-sm font-medium">{runningMatches}경기</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalMatches > 0 ? (runningMatches / totalMatches) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">예정된 경기</span>
                <span className="text-sm font-medium">{pendingMatches}경기</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${totalMatches > 0 ? (pendingMatches / totalMatches) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 대회 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              대회 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">완료된 대회</span>
                <span className="text-sm font-medium">{completedContests}개</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalContests > 0 ? (completedContests / totalContests) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">진행중인 대회</span>
                <span className="text-sm font-medium">{runningContests}개</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalContests > 0 ? (runningContests / totalContests) * 100 : 0}%` }}
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {contests?.reduce((sum, c) => sum + (c.playerCount || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-gray-500">총 대회 참가자 수</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 월별 활동 통계 (향후 구현 예정) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            활동 동향
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">월별 통계 차트</h3>
            <p className="text-gray-500">향후 업데이트에서 제공될 예정입니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
