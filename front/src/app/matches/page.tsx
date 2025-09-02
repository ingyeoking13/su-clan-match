'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MatchForm } from '@/components/MatchForm';
import { useApi } from '@/hooks/useApi';
import { matchApi } from '@/lib/api';
import { Match, EntityStatus } from '@/types';
import { Gamepad2, MapPin, Calendar, Trophy, Plus, Filter } from 'lucide-react';

export default function MatchesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: matches, loading, error, refetch } = useApi<Match[]>(matchApi.getAll);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">경기 관리</h1>
          <p className="mt-2 text-gray-600">
            진행된 경기들을 확인하고 새로운 경기를 등록할 수 있습니다.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            필터
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 경기 등록
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {matches?.map((match) => (
          <Card key={match.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Gamepad2 className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-lg">
                        {match.playerOne.nickname} vs {match.playerTwo.nickname}
                      </span>
                    </div>
                    <Badge status={match.status} />
                  </div>

                  {match.winner && match.loser && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-green-600 font-medium">
                        승자: {match.winner.nickname}
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className="text-red-600">
                        패자: {match.loser.nickname}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      맵: {match.mapName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(match.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {match.contestName && (
                      <div className="text-blue-600">
                        대회: {match.contestName}
                      </div>
                    )}
                  </div>

                  {match.description && (
                    <p className="mt-2 text-gray-600 text-sm">{match.description}</p>
                  )}
                </div>

                <div className="ml-4 flex space-x-2">
                  <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                    상세보기
                  </button>
                  <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                    수정
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!matches || matches.length === 0) && (
        <div className="text-center py-12">
          <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
          <p className="text-gray-500 mb-4">첫 번째 경기를 등록해보세요.</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            경기 등록하기
          </button>
        </div>
      )}

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{matches?.length || 0}</div>
            <div className="text-sm text-gray-500">총 경기 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(matches || []).filter(m => m.status === EntityStatus.REGISTERED).length}
            </div>
            <div className="text-sm text-gray-500">완료된 경기</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(matches || []).filter(m => m.status === EntityStatus.RUNNING).length}
            </div>
            <div className="text-sm text-gray-500">진행중인 경기</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(matches || []).filter(m => m.status === EntityStatus.PENDING).length}
            </div>
            <div className="text-sm text-gray-500">예정된 경기</div>
          </CardContent>
        </Card>
      </div>

      {/* 경기 등록 모달 */}
      <MatchForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch(); // 경기 목록 새로고침
        }}
      />
    </div>
  );
}
