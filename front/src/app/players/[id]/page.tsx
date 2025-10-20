'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { playerApi } from '@/lib/api';
import { Match, PlayerMatchSearchType } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PlayerEditForm } from '@/components/PlayerEditForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApiMutation } from '@/hooks/useApi';
import { ArrowLeft, User, Target, Calendar, MapPin, Gamepad2, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  // 선수 정보
  const { 
    data: player, 
    loading: playerLoading, 
    error: playerError 
  } = useApi(() => playerApi.getById(playerId), [playerId]);

  // 편집/삭제 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deletePlayer, loading: deleteLoading } = useApiMutation<void>();

  // 페이지네이션 상태
  const [recentMatchesPage, setRecentMatchesPage] = useState(0);
  const [headToHeadPage, setHeadToHeadPage] = useState(0);
  const pageSize = 10;

  // 선수의 최근 경기 기록 (최신순)
  const { 
    data: recentMatchesResponse, 
    loading: recentMatchesLoading, 
    error: recentMatchesError 
  } = useApi(() => playerApi.getMatches(playerId, PlayerMatchSearchType.LATEST, recentMatchesPage, pageSize), [playerId, recentMatchesPage, pageSize]);

  // 선수의 상대전적 데이터 (선수별 그룹화)
  const { 
    data: headToHeadMatchesResponse, 
    loading: headToHeadMatchesLoading, 
    error: headToHeadMatchesError 
  } = useApi(() => playerApi.getMatches(playerId, PlayerMatchSearchType.GROUPED_PER_PLAYER, headToHeadPage, pageSize), [playerId, headToHeadPage, pageSize]);

  const recentMatches = useMemo(() => recentMatchesResponse?.content || [], [recentMatchesResponse]);
  const headToHeadMatches = useMemo(() => headToHeadMatchesResponse?.content || [], [headToHeadMatchesResponse]);

  // 페이지네이션 정보
  const recentMatchesTotalPages = recentMatchesResponse?.totalPages || 0;
  const headToHeadTotalPages = headToHeadMatchesResponse?.totalPages || 0;

  // 상대전적 데이터 계산
  const [headToHeadData, setHeadToHeadData] = useState<{
    [opponentId: string]: {
      opponent: { id: number; nickname: string; race?: string };
      wins: number;
      losses: number;
      matches: Match[];
    }
  }>({});

  useEffect(() => {
    if (!player || !headToHeadMatches.length) return;

    const h2hData: typeof headToHeadData = {};

    headToHeadMatches.forEach(match => {
      // 백엔드에서 이미 집계된 데이터를 사용
      // playerOne은 항상 현재 플레이어, playerTwo는 상대방
      const opponentId = match.playerTwo.id;
      const opponentNickname = match.playerTwo.nickname;
      const opponentRace = match.playerTwoRace;
      
      // 백엔드에서 제공하는 집계 데이터 사용
      const wins = match.playerOneWins || 0;
      const losses = match.opponentWins || 0;

      const opponentKey = opponentId.toString();
      h2hData[opponentKey] = {
        opponent: { id: opponentId, nickname: opponentNickname, race: opponentRace },
        wins,
        losses,
        matches: [match] // 집계된 데이터이므로 단일 항목
      };
    });

    setHeadToHeadData(h2hData);
  }, [player, headToHeadMatches]);

  // 전체 전적 계산 - 집계된 데이터 사용
  const totalWins = headToHeadMatches.reduce((sum, match) => sum + (match.playerOneWins || 0), 0);
  const totalLosses = headToHeadMatches.reduce((sum, match) => sum + (match.opponentWins || 0), 0);
  const winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(1) : '0.0';

  // 핸들러 함수들
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!player) return;

    try {
      await deletePlayer(() => playerApi.delete(player.id));
      setIsDeleteDialogOpen(false);
      router.push('/players'); // 선수 목록으로 이동
    } catch (error) {
      console.error('선수 삭제 실패:', error);
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
  };

  // 종족별 색상
  const getRaceColor = (race?: string | null) => {
    if (!race || race.trim() === '') {
      return 'text-gray-600 bg-gray-100';
    }
    switch (race.toUpperCase()) {
      case 'TERRAN': return 'text-blue-600 bg-blue-100';
      case 'ZERG': return 'text-purple-600 bg-purple-100';
      case 'PROTOSS': return 'text-teal-600 bg-teal-100';
      case 'RANDOM': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRaceText = (race?: string | null) => {
    if (!race || race.trim() === '') {
      return '미정';
    }
    switch (race.toUpperCase()) {
      case 'TERRAN': return '테란';
      case 'ZERG': return '저그';
      case 'PROTOSS': return '프로토스';
      case 'RANDOM': return '랜덤';
      default: return '미정';
    }
  };

  if (playerLoading || recentMatchesLoading || headToHeadMatchesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (playerError || recentMatchesError || headToHeadMatchesError) {
    return <ErrorMessage message="선수 정보를 불러오는 중 오류가 발생했습니다." />;
  }

  if (!player) {
    return <ErrorMessage message="선수를 찾을 수 없습니다." />;
  }


  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-full overflow-x-hidden">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm sm:text-base">선수 목록으로 돌아가기</span>
      </button>

      {/* 선수 기본 정보 */}
      <Card className="mb-6 sm:mb-8">
        <div className="p-4 sm:p-6">
          {/* 데스크톱 레이아웃 */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{player.nickname}</h1>
                <div className="flex items-center space-x-4">
                  <Badge className={`${getRaceColor(player.race)} border-0`}>
                    {getRaceText(player.race)}
                  </Badge>
                  <span className="text-gray-600">등급: {player.grade?.name || '미정'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </button>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">가입일</div>
                <div className="text-gray-900">
                  {new Date(player.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 레이아웃 */}
          <div className="lg:hidden space-y-4">
            {/* 선수 정보 */}
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{player.nickname}</h1>
                <div className="flex flex-col space-y-1">
                  <Badge className={`${getRaceColor(player.race)} border-0 text-xs w-fit`}>
                    {getRaceText(player.race)}
                  </Badge>
                  <span className="text-sm text-gray-600">등급: {player.grade?.name || '미정'}</span>
                </div>
              </div>
            </div>

            {/* 가입일 정보 */}
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>가입일: {new Date(player.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 전체 전적 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <div className="p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalWins + totalLosses}</div>
            <div className="text-xs sm:text-sm text-gray-600">총 경기수</div>
          </div>
        </Card>
        <Card>
          <div className="p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{totalWins}</div>
            <div className="text-xs sm:text-sm text-gray-600">승리</div>
          </div>
        </Card>
        <Card>
          <div className="p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{totalLosses}</div>
            <div className="text-xs sm:text-sm text-gray-600">패배</div>
          </div>
        </Card>
        <Card>
          <div className="p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{winRate}%</div>
            <div className="text-xs sm:text-sm text-gray-600">승률</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* 상대전적 */}
        <Card>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              상대전적
            </h2>
            {Object.keys(headToHeadData).length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">경기 기록이 없습니다.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(headToHeadData)
                  .sort(([,a], [,b]) => (b.wins + b.losses) - (a.wins + a.losses))
                  .map(([opponentId, data]) => {
                    const totalGames = data.wins + data.losses;
                    const winRate = totalGames > 0 ? (data.wins / totalGames * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={opponentId} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base truncate">{data.opponent.nickname}</div>
                            <Badge className={`${getRaceColor(data.opponent.race)} border-0 text-xs w-fit`}>
                              {getRaceText(data.opponent.race)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-semibold text-sm sm:text-base">
                            <span className="text-green-600">{data.wins}</span>
                            <span className="text-gray-400 mx-1">-</span>
                            <span className="text-red-600">{data.losses}</span>
                          </div>
                          <div className="text-xs text-gray-500">승률 {winRate}%</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* 상대전적 페이지네이션 */}
            {headToHeadTotalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setHeadToHeadPage(prev => Math.max(prev - 1, 0))}
                    disabled={headToHeadPage === 0}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(headToHeadTotalPages, 5) }, (_, i) => {
                      const pageNum = i;
                      const displayPageNum = pageNum + 1;
                      
                      if (
                        pageNum === 0 ||
                        pageNum === headToHeadTotalPages - 1 ||
                        (pageNum >= headToHeadPage - 1 && pageNum <= headToHeadPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setHeadToHeadPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              headToHeadPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {displayPageNum}
                          </button>
                        );
                      } else if (
                        pageNum === headToHeadPage - 2 ||
                        pageNum === headToHeadPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setHeadToHeadPage(prev => Math.min(prev + 1, headToHeadTotalPages - 1))}
                    disabled={headToHeadPage === headToHeadTotalPages - 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 최근 경기 */}
        <Card>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              최근 경기
            </h2>
            {recentMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">경기 기록이 없습니다.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentMatches.map((match) => {
                  const isPlayerOne = match.playerOne.id === player.id;
                  const opponent = isPlayerOne 
                    ? { nickname: match.playerTwo.nickname, race: match.playerTwoRace }
                    : { nickname: match.playerOne.nickname, race: match.playerOneRace };

                  const me = isPlayerOne 
                    ? { nickname: match.playerOne.nickname, race: match.playerOneRace }
                    : { nickname: match.playerTwo.nickname, race: match.playerTwoRace };

                  const isWin = match.winner?.id === player.id;
                  
                  return (
                    <div 
                      key={match.id} 
                      className="p-2 sm:p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/matches/${match.id}`)}
                    >
                      {/* 모바일 레이아웃 */}
                      <div className="lg:hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`${isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0 text-xs`}>
                            {isWin ? '승' : '패'}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {match.matchTime 
                              ? new Date(match.matchTime).toLocaleDateString('ko-KR')
                              : new Date(match.createdAt).toLocaleDateString('ko-KR')
                            }
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getRaceColor(me.race)} border-0 text-xs`}>
                              {getRaceText(me.race)}
                            </Badge>
                            <span className="font-medium text-sm truncate text-black">{me.nickname}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">vs</span>
                            <Badge className={`${getRaceColor(opponent.race)} border-0 text-xs`}>
                              {getRaceText(opponent.race)}
                            </Badge>
                            <span className="font-medium text-sm truncate text-black">{opponent.nickname}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{match.mapName}</span>
                          </div>
                          <span className="truncate">{match.contestName}</span>
                        </div>
                      </div>

                      {/* 데스크톱 레이아웃 */}
                      <div className="hidden lg:flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                            {isWin ? '승' : '패'}
                          </Badge>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getRaceColor(me.race)} border-0 text-xs`}>
                                  {getRaceText(me.race)}
                                </Badge>
                                <span className="font-medium text-black">{me.nickname}</span>
                              </div>
                              <span className="text-gray-400">vs</span>
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getRaceColor(opponent.race)} border-0 text-xs`}>
                                  {getRaceText(opponent.race)}
                                </Badge>
                                <span className="font-medium text-black">{opponent.nickname}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{match.mapName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {match.matchTime 
                              ? new Date(match.matchTime).toLocaleDateString('ko-KR')
                              : new Date(match.createdAt).toLocaleDateString('ko-KR')
                            }
                          </div>
                          <div>{match.contestName}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 최근 경기 페이지네이션 */}
            {recentMatchesTotalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRecentMatchesPage(prev => Math.max(prev - 1, 0))}
                    disabled={recentMatchesPage === 0}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(recentMatchesTotalPages, 5) }, (_, i) => {
                      const pageNum = i;
                      const displayPageNum = pageNum + 1;
                      
                      if (
                        pageNum === 0 ||
                        pageNum === recentMatchesTotalPages - 1 ||
                        (pageNum >= recentMatchesPage - 1 && pageNum <= recentMatchesPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setRecentMatchesPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              recentMatchesPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {displayPageNum}
                          </button>
                        );
                      } else if (
                        pageNum === recentMatchesPage - 2 ||
                        pageNum === recentMatchesPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setRecentMatchesPage(prev => Math.min(prev + 1, recentMatchesTotalPages - 1))}
                    disabled={recentMatchesPage === recentMatchesTotalPages - 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 선수 수정 모달 */}
      <PlayerEditForm
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        player={player}
        onSuccess={() => {
          handleModalClose();
          window.location.reload(); // 페이지 새로고침
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title="선수 삭제 확인"
        message={`정말로 "${player?.nickname}" 선수를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  );
}
