'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { contestApi } from '@/lib/api';
import { Contest, EntityStatus } from '@/types';
import { Trophy, Users, Gamepad2, Plus, Clock } from 'lucide-react';

export default function ContestsPage() {
  const { data: contests, loading, error, refetch } = useApi<Contest[]>(contestApi.getAll);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={refetch}
        className="min-h-96"
      />
    );
  }

  const getTimeInfo = (contest: Contest) => {
    const startDate = new Date(contest.startedAt);
    const endDate = contest.endedAt ? new Date(contest.endedAt) : null;
    
    if (contest.status === EntityStatus.RUNNING) {
      return `시작: ${startDate.toLocaleDateString('ko-KR')} ${endDate ? `- 종료: ${endDate.toLocaleDateString('ko-KR')}` : ''}`;
    } else if (contest.status === EntityStatus.REGISTERED) {
      return `완료일: ${endDate?.toLocaleDateString('ko-KR') || '미정'}`;
    } else {
      return `시작 예정: ${startDate.toLocaleDateString('ko-KR')}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대회 관리</h1>
          <p className="mt-2 text-gray-600">
            진행중인 대회와 예정된 대회를 관리하고 새로운 대회를 생성할 수 있습니다.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          새 대회 생성
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contests?.map((contest) => (
          <Card key={contest.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{contest.name}</CardTitle>
                <Badge status={contest.status} />
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {getTimeInfo(contest)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">참가자</div>
                    <div className="font-semibold">{contest.playerCount}명</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Gamepad2 className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">경기 수</div>
                    <div className="font-semibold">{contest.matchCount}경기</div>
                  </div>
                </div>
              </div>

              {contest.status === EntityStatus.RUNNING && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">현재 진행중인 대회입니다</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  상세보기
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">
                  경기 관리
                </button>
                <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                  수정
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!contests || contests.length === 0) && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 대회가 없습니다</h3>
          <p className="text-gray-500 mb-4">첫 번째 대회를 생성해보세요.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            대회 생성하기
          </button>
        </div>
      )}

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{contests?.length || 0}</div>
            <div className="text-sm text-gray-500">총 대회 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(contests || []).filter(c => c.status === EntityStatus.RUNNING).length}
            </div>
            <div className="text-sm text-gray-500">진행중인 대회</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(contests || []).filter(c => c.status === EntityStatus.PENDING).length}
            </div>
            <div className="text-sm text-gray-500">예정된 대회</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {contests?.reduce((sum, c) => sum + (c.playerCount || 0), 0) || 0}
            </div>
            <div className="text-sm text-gray-500">총 참가자</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
