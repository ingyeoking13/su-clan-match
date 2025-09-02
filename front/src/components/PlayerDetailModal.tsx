'use client';

import React from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { Badge } from './ui/Badge';
import { useApi } from '@/hooks/useApi';
import { playerApi } from '@/lib/api';
import { Player } from '@/types';
import { 
  User, 
  Award, 
  Users, 
  Calendar, 
  Target, 
  Trophy, 
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';

interface PlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number | null;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  isOpen,
  onClose,
  playerId,
  onEdit,
  onDelete
}) => {
  const { data: player, loading, error } = useApi<Player>(
    playerId && isOpen ? () => playerApi.getById(playerId) : null,
    [playerId, isOpen]
  );

  const calculateWinRate = (winCount: number = 0, matchCount: number = 0) => {
    if (matchCount === 0) return 0;
    return Math.round((winCount / matchCount) * 100);
  };

  // 백엔드 API 응답과 목업 데이터 호환성을 위한 헬퍼 함수들
  const getPlayerClanName = (player: Player) => {
    return player.clan?.name || player.clanName || null;
  };

  const getPlayerStats = (player: Player) => {
    return {
      totalMatches: player.totalMatches ?? player.matchCount ?? 0,
      wins: player.wins ?? player.winCount ?? 0,
      losses: player.losses ?? player.loseCount ?? 0,
    };
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="선수 상세 정보">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message={error}
          className="mb-4"
        />
      )}

      {player && (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{player.nickname}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge status={player.status} />
                  {player.grade && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                      <Award className="h-3 w-3 inline mr-1" />
                      {player.grade.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(player)}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                수정
              </button>
              <button
                onClick={() => onDelete(player)}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </button>
            </div>
          </div>

          {/* 소속 클랜 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              소속 클랜 정보
            </h3>
            
            {getPlayerClanName(player) ? (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">{getPlayerClanName(player)}</h4>
                      <p className="text-sm text-blue-600">
                        {player.clan?.status === 'REGISTERED' ? '활성 클랜' : player.clan?.status || '상태 정보 없음'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {player.clan?.memberCount ?? 0}
                    </div>
                    <div className="text-sm text-blue-500">멤버</div>
                  </div>
                </div>
                
                {player.clan?.foundingDate && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center text-sm text-blue-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      창설일: {new Date(player.clan.foundingDate).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">소속 클랜 없음</h4>
                    <p className="text-sm text-gray-500">현재 어떤 클랜에도 소속되어 있지 않습니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 경기 통계 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              경기 통계
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = getPlayerStats(player);
                return (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalMatches}</div>
                      <div className="text-sm text-gray-500">총 경기</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                      <div className="text-sm text-gray-500">승리</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                      <div className="text-sm text-gray-500">패배</div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateWinRate(stats.wins, stats.totalMatches)}%
                      </div>
                      <div className="text-sm text-gray-500">승률</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 승률 진행바 */}
            <div className="mt-4">
              {(() => {
                const stats = getPlayerStats(player);
                const winRate = calculateWinRate(stats.wins, stats.totalMatches);
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">승률</span>
                      <span className="text-sm text-gray-500">{winRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* 등급 정보 */}
          {player.grade && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                등급 정보
              </h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-800">{player.grade.name}</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      {player.grade.description || '등급 설명이 없습니다.'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 등록 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              등록 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">등록일</span>
                  <p className="font-medium">
                    {new Date(player.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">최종 수정일</span>
                  <p className="font-medium">
                    {new Date(player.updatedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
