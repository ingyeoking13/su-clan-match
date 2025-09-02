'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PlayerForm } from '@/components/PlayerForm';
import { PlayerDetailModal } from '@/components/PlayerDetailModal';
import { PlayerEditForm } from '@/components/PlayerEditForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { playerApi } from '@/lib/api';
import { Player, EntityStatus } from '@/types';
import { UserCheck, Trophy, Target, Plus, Eye, EyeOff, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function PlayersPage() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Spring은 0부터 시작
  const [pageSize, setPageSize] = useState(10);
  // 정렬 상태
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  const { data: response, loading, error, refetch } = useApi(() => 
    playerApi.getAll(showDeleted, currentPage, pageSize, undefined, sortBy, sortDir), 
    [showDeleted, currentPage, pageSize, sortBy, sortDir]
  );
  const { mutate: deletePlayer, loading: deleteLoading } = useApiMutation<void>();

  // Spring Pageable 응답 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginatedData = (response as any)?.data || (response as any) || {};
  const players: Player[] = paginatedData?.content || [];
  const totalPages = paginatedData?.totalPages || 0;
  const totalElements = paginatedData?.totalElements || 0;

  // showDeleted, pageSize, 정렬이 변경되면 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(0);
  }, [showDeleted, pageSize, sortBy, sortDir]);

  // 정렬 핸들러
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // 같은 필드를 클릭하면 방향 토글
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드를 클릭하면 해당 필드로 변경하고 내림차순으로 시작
      setSortBy(field);
      setSortDir('desc');
    }
  };

  // 정렬 아이콘 반환 함수
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };


  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  
  const calculateWinRate = (winCount: number = 0, matchCount: number = 0) => {
    if (matchCount === 0) return 0;
    return Math.round((winCount / matchCount) * 100);
  };

  // 핸들러 함수들
  const handlePlayerClick = (player: Player) => {
    setSelectedPlayerId(player.id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsDetailModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlayer) return;

    try {
      await deletePlayer(() => playerApi.delete(selectedPlayer.id));
      setIsDeleteDialogOpen(false);
      setSelectedPlayer(null);
      refetch(); // 목록 새로고침
    } catch (error) {
      console.error('선수 삭제 실패:', error);
    }
  };

  const handleModalClose = () => {
    setSelectedPlayer(null);
    setSelectedPlayerId(null);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
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
          <h1 className="text-3xl font-bold text-gray-900">선수 관리</h1>
          <p className="mt-2 text-gray-600">
            등록된 선수들을 관리하고 새로운 선수를 추가할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showDeleted 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? (
              <>
                <EyeOff className="h-5 w-5 mr-2" />
                삭제된 선수 숨기기
              </>
            ) : (
              <>
                <Eye className="h-5 w-5 mr-2" />
                삭제된 선수 보기
              </>
            )}
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 선수 추가
          </button>
        </div>
      </div>

      {/* 페이지 크기 선택 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            전체 {totalElements}명
            {totalElements > 0 && (
              <span> 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}명 표시</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">페이지당</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={30}>30개</option>
          </select>
        </div>
      </div>

      {/* 선수 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>선수 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('nickname')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <span>선수명</span>
                      {getSortIcon('nickname')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">등급</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">소속 클랜</th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('totalMatches')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-900 hover:text-blue-600 transition-colors w-full"
                    >
                      <span>총 경기</span>
                      {getSortIcon('totalMatches')}
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('wins')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-900 hover:text-blue-600 transition-colors w-full"
                    >
                      <span>승리</span>
                      {getSortIcon('wins')}
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">패배</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">승률</th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <span>상태</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-900 hover:text-blue-600 transition-colors w-full"
                    >
                      <span>등록일</span>
                      {getSortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">액션</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player: Player) => {
                  const isDeleted = player.status === EntityStatus.DELETED;
                  const totalMatches = player.totalMatches ?? player.matchCount ?? 0;
                  const wins = player.wins ?? player.winCount ?? 0;
                  const losses = player.losses ?? player.loseCount ?? 0;
                  const winRate = calculateWinRate(wins, totalMatches);
                  
                  return (
                    <tr 
                      key={player.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isDeleted ? 'bg-red-50 opacity-75' : ''
                      }`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className={`font-medium ${isDeleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {player.nickname}
                            </div>
                            {isDeleted && (
                              <span className="text-xs text-red-600 font-medium">삭제됨</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {player.grade ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                            {player.grade.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {(player.clan?.name || player.clanName) ? (
                          <span className="text-blue-600 font-medium">
                            {player.clan?.name || player.clanName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{totalMatches}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Trophy className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-600">{wins}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-red-600">{losses}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-medium">{winRate}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={player.status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`text-sm ${isDeleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(player.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayerClick(player);
                            }}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            상세
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(player);
                            }}
                            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                const displayPageNum = pageNum + 1; // 사용자에게는 1부터 표시
                // 현재 페이지 주변의 페이지들만 표시
                if (
                  pageNum === 0 ||
                  pageNum === totalPages - 1 ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {displayPageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {players.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showDeleted ? '선수가 없습니다' : '등록된 선수가 없습니다'}
          </h3>
          <p className="text-gray-500 mb-4">
            {showDeleted 
              ? '삭제된 선수를 포함하여 표시할 선수가 없습니다.' 
              : '첫 번째 선수를 추가해보세요.'
            }
          </p>
          {!showDeleted && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              선수 추가하기
            </button>
          )}
        </div>
      )}

      {/* 선수 추가 모달 */}
      <PlayerForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch(); // 선수 목록 새로고침
        }}
      />

      {/* 선수 상세보기 모달 */}
      <PlayerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        playerId={selectedPlayerId}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* 선수 수정 모달 */}
      <PlayerEditForm
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        player={selectedPlayer}
        onSuccess={() => {
          refetch(); // 선수 목록 새로고침
          handleModalClose();
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title="선수 삭제 확인"
        message={`정말로 "${selectedPlayer?.nickname}" 선수를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
