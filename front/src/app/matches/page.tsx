'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MatchForm } from '@/components/MatchForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { matchApi } from '@/lib/api';
import { Match, EntityStatus } from '@/types';
import { Gamepad2, MapPin, Calendar, Trophy, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function MatchesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  
  // 정렬 상태
  const [sorts, setSorts] = useState<Array<{ field: string; direction: 'asc' | 'desc' }>>([
  ]);
  
  const { data: matches, loading, error, refetch } = useApi<Match[]>(
    () => matchApi.getAll(sorts),
    [sorts]
  );
  const { mutate: deleteMatch, loading: deleteLoading } = useApiMutation<void>();

  // 정렬 핸들러
  const handleSort = (field: string) => {
    setSorts(prevSorts => {
      const existingIndex = prevSorts.findIndex(sort => sort.field === field);
      if (existingIndex >= 0) {
        const currentDirection = prevSorts[existingIndex].direction;
        if (currentDirection === 'desc') {
          const newSorts = [...prevSorts];
          newSorts[existingIndex] = { field, direction: 'asc' };
          return newSorts;
        } else {
          return prevSorts.filter(sort => sort.field !== field);
        }
      } else {
        return [...prevSorts, { field, direction: 'desc' }];
      }
    });
  };

  // 정렬 아이콘 표시
  const getSortIcon = (field: string) => {
    const sortIndex = sorts.findIndex(sort => sort.field === field);
    
    if (sortIndex === -1) {
      // 정렬이 적용되지 않은 경우 기본 아이콘 표시
      return (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      );
    }
    
    const sort = sorts[sortIndex];
    const isMultiSort = sorts.length > 1;
    
    return (
      <span className="ml-1 inline-flex items-center text-blue-600">
        {sort.direction === 'desc' ? '↓' : '↑'}
        {isMultiSort && (
          <span className="ml-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            {sortIndex + 1}
          </span>
        )}
      </span>
    );
  };

  // 핸들러 함수들
  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleDeleteMatch = (match: Match) => {
    setMatchToDelete(match);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!matchToDelete) return;

    try {
      await deleteMatch(() => matchApi.delete(matchToDelete.id));
      refetch(); // 목록 새로고침
      setIsDeleteDialogOpen(false);
      setMatchToDelete(null);
    } catch (error) {
      console.error('경기 삭제 실패:', error);
      // 에러 처리는 useApiMutation에서 자동으로 처리됨
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setMatchToDelete(null);
  };

  const handleEditSuccess = () => {
    refetch();
    setIsEditModalOpen(false);
    setSelectedMatch(null);
  };

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

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
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          새 경기 등록
        </button>
      </div>

      {/* 정렬 상태 표시 */}
      {sorts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm text-blue-700">
            <span className="font-medium">정렬 적용 중:</span>
            <div className="ml-2 flex flex-wrap gap-2">
              {sorts.map((sort, index) => {
                const getFieldName = (field: string) => {
                  switch (field) {
                    case 'playerOneNickname': return '플레이어 1';
                    case 'playerOneRace': return '플레이어 1 종족';
                    case 'playerTwoNickname': return '플레이어 2';
                    case 'playerTwoRace': return '플레이어 2 종족';
                    case 'mapName': return '맵';
                    case 'contestName': return '대회';
                    case 'matchTime': return '경기일시';
                    case 'createdAt': return '등록일';
                    default: return field;
                  }
                };
                return (
                  <span key={sort.field} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {sorts.length > 1 && `${index + 1}. `}
                    {getFieldName(sort.field)} ({sort.direction === 'asc' ? '오름차순' : '내림차순'})
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => setSorts([])}
              className="ml-auto text-blue-600 hover:text-blue-800 text-xs underline"
            >
              정렬 초기화
            </button>
          </div>
        </div>
      )}

      {/* 경기 테이블 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                      경기 정보
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerOneNickname')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      플레이어 1
                      {getSortIcon('playerOneNickname')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerOneRace')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      종족
                      {getSortIcon('playerOneRace')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">vs</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerTwoNickname')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      플레이어 2
                      {getSortIcon('playerTwoNickname')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerTwoRace')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      종족
                      {getSortIcon('playerTwoRace')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">승자</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('mapName')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      맵
                      {getSortIcon('mapName')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('contestName')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      대회
                      {getSortIcon('contestName')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('matchTime')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      일시
                      {getSortIcon('matchTime')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">액션</th>
                </tr>
              </thead>
              <tbody>
                {matches && matches.length > 0 ? (
                  matches.map((match) => (
                    <tr 
                      key={match.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditMatch(match)}
                    >
                      {/* 경기 정보 */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Gamepad2 className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">#{match.id}</div>
                            {match.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate" title={match.description}>
                                {match.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 플레이어 1 */}
                      <td className="py-4 px-4 text-center">
                        <div className="font-medium text-blue-600">{match.playerOne.nickname}</div>
                        {match.playerOne.clan?.name && (
                          <div className="text-xs text-gray-500">({match.playerOne.clan.name})</div>
                        )}
                      </td>

                      {/* 플레이어 1 종족 */}
                      <td className="py-4 px-4 text-center">
                        {match.playerOneRace ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.playerOneRace === 'TERRAN' ? 'bg-blue-100 text-blue-800' :
                            match.playerOneRace === 'ZERG' ? 'bg-purple-100 text-purple-800' :
                            match.playerOneRace === 'PROTOSS' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.playerOneRace}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* VS */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-400 font-bold">VS</span>
                      </td>

                      {/* 플레이어 2 */}
                      <td className="py-4 px-4 text-center">
                        <div className="font-medium text-red-600">{match.playerTwo.nickname}</div>
                        {match.playerTwo.clan?.name && (
                          <div className="text-xs text-gray-500">({match.playerTwo.clan.name})</div>
                        )}
                      </td>

                      {/* 플레이어 2 종족 */}
                      <td className="py-4 px-4 text-center">
                        {match.playerTwoRace ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.playerTwoRace === 'TERRAN' ? 'bg-blue-100 text-blue-800' :
                            match.playerTwoRace === 'ZERG' ? 'bg-purple-100 text-purple-800' :
                            match.playerTwoRace === 'PROTOSS' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.playerTwoRace}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 승자 */}
                      <td className="py-4 px-4 text-center">
                        {match.winner ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="text-green-600 font-medium text-sm">
                              {match.winner.nickname}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 맵 */}
                      <td className="py-4 px-4 text-center">
                        {match.mapName ? (
                          <div className="flex items-center justify-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{match.mapName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 대회 */}
                      <td className="py-4 px-4 text-center">
                        {match.contestName ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {match.contestName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 일시 */}
                      <td className="py-4 px-4 text-center">
                        {match.matchTime ? (
                          <div className="text-sm">
                            <div>{new Date(match.matchTime).toLocaleDateString('ko-KR')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(match.matchTime).toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 액션 */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMatch(match);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                          >
                            수정
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMatch(match);
                            }}
                            disabled={deleteLoading}
                            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
                          >
                            {deleteLoading ? '삭제중...' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center">
                      <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
                      <p className="text-gray-500 mb-4">첫 번째 경기를 등록해보세요.</p>
                      <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        경기 등록하기
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>



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
        onSuccess={handleCreateSuccess}
      />

      {/* 경기 수정 모달 */}
      <MatchForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMatch(null);
        }}
        onSuccess={handleEditSuccess}
        match={selectedMatch}
      />

      {/* 경기 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        title="경기 삭제"
        message={
          matchToDelete 
            ? `"${matchToDelete.playerOne.nickname} vs ${matchToDelete.playerTwo.nickname}" 경기를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
            : ''
        }
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        type="danger"
      />
    </div>
  );
}
