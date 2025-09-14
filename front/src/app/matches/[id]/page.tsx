'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { matchApi, playerApi } from '@/lib/api';
import { Match } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MatchForm } from '@/components/MatchForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ArrowLeft, Gamepad2, Users, Trophy, MapPin, Calendar, Globe, Clock, Edit, Trash2, User } from 'lucide-react';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  // 경기 정보
  const { 
    data: match, 
    loading: matchLoading, 
    error: matchError,
    refetch: refetchMatch
  } = useApi(() => matchApi.getById(Number(matchId)), [matchId]);

  // 편집/삭제 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteMatch, loading: deleteLoading } = useApiMutation<void>();

  // 핸들러 함수들
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!match) return;

    try {
      await deleteMatch(() => matchApi.delete(match.id));
      setIsDeleteDialogOpen(false);
      router.push('/matches'); // 경기 목록으로 이동
    } catch (error) {
      console.error('경기 삭제 실패:', error);
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleEditSuccess = () => {
    handleModalClose();
    refetchMatch(); // 경기 정보 새로고침
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

  if (matchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (matchError) {
    return <ErrorMessage message="경기 정보를 불러오는 중 오류가 발생했습니다." />;
  }

  if (!match) {
    return <ErrorMessage message="경기를 찾을 수 없습니다." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        경기 목록으로 돌아가기
      </button>

      {/* 경기 기본 정보 */}
      <Card className="mb-8">
        <div className="p-4 sm:p-6">
          {/* 데스크톱 레이아웃 */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-10 h-10 text-gray-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {match.playerOne?.nickname} vs {match.playerTwo?.nickname}
                </h1>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getRaceColor(match.playerOneRace)} border-0`}>
                      {getRaceText(match.playerOneRace)}
                    </Badge>
                    <span className="text-gray-400">vs</span>
                    <Badge className={`${getRaceColor(match.playerTwoRace)} border-0`}>
                      {getRaceText(match.playerTwoRace)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{match.mapName || '맵 미정'}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span>{match.contestName || '대회 미정'}</span>
                  </div>
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
                <div className="text-sm text-gray-500 mb-1">등록일</div>
                <div className="text-gray-900">
                  {new Date(match.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 레이아웃 */}
          <div className="lg:hidden space-y-4">
            {/* 제목과 아이콘 */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Gamepad2 className="w-6 h-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">
                  {match.playerOne?.nickname} vs {match.playerTwo?.nickname}
                </h1>
                <div className="text-sm text-gray-500">
                  {new Date(match.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>

            {/* 종족 정보 */}
            <div className="flex items-center justify-center space-x-2">
              <Badge className={`${getRaceColor(match.playerOneRace)} border-0`}>
                {getRaceText(match.playerOneRace)}
              </Badge>
              <span className="text-gray-400">vs</span>
              <Badge className={`${getRaceColor(match.playerTwoRace)} border-0`}>
                {getRaceText(match.playerTwoRace)}
              </Badge>
            </div>

            {/* 맵/대회 정보 */}
            <div className="flex flex-col space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{match.mapName || '맵 미정'}</span>
              </div>
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 mr-1" />
                <span>{match.contestName || '대회 미정'}</span>
              </div>
            </div>

            {/* 수정/삭제 버튼 - 모바일에서는 세로 배치 */}
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

          {/* 승자 표시 */}
          {match.winner && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">
                  승자: {match.winner.nickname}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 경기 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 플레이어 정보 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              플레이어 정보
            </h2>
            <div className="space-y-4">
              {/* 플레이어 1 */}
              <div 
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/players/${match.playerOne?.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{match.playerOne?.nickname}</div>
                    <div className="text-sm text-gray-500">플레이어 1</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getRaceColor(match.playerOneRace)} border-0`}>
                    {getRaceText(match.playerOneRace)}
                  </Badge>
                  {match.winner?.id === match.playerOne?.id && (
                    <div className="text-sm text-yellow-600 font-medium mt-1">승리</div>
                  )}
                </div>
              </div>

              {/* 플레이어 2 */}
              <div 
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/players/${match.playerTwo?.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">{match.playerTwo?.nickname}</div>
                    <div className="text-sm text-gray-500">플레이어 2</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getRaceColor(match.playerTwoRace)} border-0`}>
                    {getRaceText(match.playerTwoRace)}
                  </Badge>
                  {match.winner?.id === match.playerTwo?.id && (
                    <div className="text-sm text-yellow-600 font-medium mt-1">승리</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 경기 세부사항 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Gamepad2 className="w-5 h-5 mr-2" />
              경기 세부사항
            </h2>
            <div className="space-y-4">
              {/* 경기 일시 */}
              {match.matchTime && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="font-medium">경기 일시</span>
                  </div>
                  <div className="text-right">
                    <div>{new Date(match.matchTime).toLocaleDateString('ko-KR')}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(match.matchTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 스트리밍 URL */}
              {match.streamingUrl && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="font-medium">스트리밍</span>
                  </div>
                  <div>
                    <a 
                      href={match.streamingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {match.streamingUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* 설명 */}
              {match.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="font-medium">설명</span>
                  </div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">
                    {match.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 경기 수정 모달 */}
      <MatchForm
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleEditSuccess}
        match={match}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title="경기 삭제 확인"
        message={`정말로 "${match.playerOne?.nickname} vs ${match.playerTwo?.nickname}" 경기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  );
}
