'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { playerApi, contestApi, matchApi } from '@/lib/api';
import { Match, Player, Contest } from '@/types';
import { Users, Trophy, MapPin, FileText, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface MatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  match?: Match | null; // 수정 모드일 때 사용
}

interface MatchFormData {
  playerOneNickname: string; // 콤보박스용 (선택하거나 직접 입력)
  playerTwoNickname: string; // 콤보박스용 (선택하거나 직접 입력)
  playerOneId: number | ''; // 선택된 플레이어 ID (내부적으로 사용)
  playerTwoId: number | ''; // 선택된 플레이어 ID (내부적으로 사용)
  winnerId: number | '';
  mapName: string;
  description: string;
  contestId: number | '';
}

export function MatchForm({ isOpen, onClose, onSuccess, match }: MatchFormProps) {
  const [formData, setFormData] = useState<MatchFormData>({
    playerOneNickname: '',
    playerTwoNickname: '',
    playerOneId: '',
    playerTwoId: '',
    winnerId: '',
    mapName: '',
    description: '',
    contestId: '',
  });

  // 콤보박스 드롭다운 표시 상태
  const [showPlayerOneDropdown, setShowPlayerOneDropdown] = useState(false);
  const [showPlayerTwoDropdown, setShowPlayerTwoDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 검색어 상태
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  // 정렬 상태
  const [sortBy, setSortBy] = useState('createdAt'); // nickname, createdAt, clan 등
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // API 호출들 - 검색어나 정렬이 변경될 때마다 호출
  const { data: players, loading: playersLoading } = useApi(
    isOpen ? () => {
      console.log('Calling playerApi.getAll with search:', playerSearchTerm, 'sort:', sortBy, sortDir);
      // 검색어와 정렬 옵션을 함께 전달
      return playerApi.getAll(false, 0, 100, playerSearchTerm, sortBy, sortDir);
    } : null,
    [isOpen, playerSearchTerm, sortBy, sortDir]
  );
  const { data: contests, loading: contestsLoading } = useApi(
    isOpen ? () => contestApi.getAll() : null,
    [isOpen]
  );
  const { mutate: createMatch, loading: createLoading } = useApiMutation<Match>();
  const { mutate: updateMatch, loading: updateLoading } = useApiMutation<Match>();

  const isEditing = !!match;
  const loading = createLoading || updateLoading;

  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    if (isOpen && match) {
      setFormData({
        playerOneNickname: match.playerOne.nickname,
        playerTwoNickname: match.playerTwo.nickname,
        playerOneId: match.playerOne.id,
        playerTwoId: match.playerTwo.id,
        winnerId: match.winner?.id || '',
        mapName: match.mapName || '',
        description: match.description || '',
        contestId: '', // 백엔드에서 contestId를 제공하지 않으면 빈 값으로 설정
      });
    } else if (isOpen && !match) {
      // 새로 생성할 때는 초기값으로 설정
      setFormData({
        playerOneNickname: '',
        playerTwoNickname: '',
        playerOneId: '',
        playerTwoId: '',
        winnerId: '',
        mapName: '',
        description: '',
        contestId: '',
      });
    }
    setErrors({});
    setShowPlayerOneDropdown(false);
    setShowPlayerTwoDropdown(false);
  }, [isOpen, match]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.playerOneNickname.trim()) {
      newErrors.playerOneNickname = '플레이어 1 닉네임을 입력해주세요.';
    }
    if (!formData.playerTwoNickname.trim()) {
      newErrors.playerTwoNickname = '플레이어 2 닉네임을 입력해주세요.';
    }

    // 플레이어 중복 검증
    if (formData.playerOneNickname.trim() === formData.playerTwoNickname.trim() && 
        formData.playerOneNickname.trim() !== '') {
      newErrors.playerTwoNickname = '플레이어 1과 다른 닉네임을 입력해주세요.';
    }

    if (!formData.mapName.trim()) {
      newErrors.mapName = '맵 이름을 입력해주세요.';
    }

    // 승자 검증 (선택된 플레이어만 가능)
    if (formData.winnerId && formData.winnerId !== formData.playerOneId && formData.winnerId !== formData.playerTwoId) {
      newErrors.winnerId = '승자는 참가한 플레이어 중에서 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const matchData = {
        playerOneId: formData.playerOneId || undefined,
        playerTwoId: formData.playerTwoId || undefined,
        playerOneNickname: formData.playerOneNickname,
        playerTwoNickname: formData.playerTwoNickname,
        winnerId: formData.winnerId || undefined,
        mapName: formData.mapName,
        description: formData.description,
        contestId: formData.contestId || undefined,
      };

      if (isEditing && match) {
        await updateMatch(() => matchApi.update(match.id, matchData));
      } else {
        await createMatch(() => matchApi.create(matchData));
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('경기 저장 실패:', error);
    }
  };

  const handleInputChange = (field: keyof MatchFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  // 플레이어 선택 핸들러
  const handlePlayerSelect = (playerNumber: 1 | 2, player: Player) => {
    if (playerNumber === 1) {
      setFormData(prev => ({
        ...prev,
        playerOneNickname: player.nickname,
        playerOneId: player.id
      }));
      setShowPlayerOneDropdown(false);
    } else {
      setFormData(prev => ({
        ...prev,
        playerTwoNickname: player.nickname,
        playerTwoId: player.id
      }));
      setShowPlayerTwoDropdown(false);
    }
  };

  // 검색어 디바운싱을 위한 useEffect
  useEffect(() => {
    const searchTerm = formData.playerOneNickname || formData.playerTwoNickname;
    const timer = setTimeout(() => {
      setPlayerSearchTerm(searchTerm);
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timer);
  }, [formData.playerOneNickname, formData.playerTwoNickname]);

  // 플레이어 닉네임 입력 핸들러
  const handlePlayerNicknameChange = (playerNumber: 1 | 2, nickname: string) => {
    if (playerNumber === 1) {
      setFormData(prev => ({
        ...prev,
        playerOneNickname: nickname,
        playerOneId: '' // 직접 입력 시 ID 초기화
      }));
      // 입력이 있거나 포커스 상태일 때 드롭다운 표시
      setShowPlayerOneDropdown(true);
    } else {
      setFormData(prev => ({
        ...prev,
        playerTwoNickname: nickname,
        playerTwoId: '' // 직접 입력 시 ID 초기화
      }));
      // 입력이 있거나 포커스 상태일 때 드롭다운 표시
      setShowPlayerTwoDropdown(true);
    }
  };

  const getAvailablePlayers = (): Player[] => {
    if (!players) return [];
    // PaginatedResponse에서 content 추출
    const playerList = (players as any)?.data?.content || (players as any)?.content || players;
    return Array.isArray(playerList) ? playerList : [];
  };

  const getAvailableContests = (): Contest[] => {
    if (!contests) return [];
    // PaginatedResponse에서 content 추출
    const contestList = (contests as any)?.data?.content || (contests as any)?.content || contests;
    return Array.isArray(contestList) ? contestList : [];
  };

  const availablePlayers = getAvailablePlayers();
  const availableContests = getAvailableContests();
  // 서버에서 이미 필터링된 결과를 사용
  const filteredPlayersOne = availablePlayers;
  const filteredPlayersTwo = availablePlayers;

  // 플레이어 데이터 확인용 로그
  React.useEffect(() => {
    if (isOpen) {
      console.log('MatchForm - Player Data Check:', {
        playersLoading,
        playersRawData: players,
        availablePlayersCount: availablePlayers.length,
        availablePlayers: availablePlayers,
        showPlayerOneDropdown,
        filteredPlayersOneCount: filteredPlayersOne.length,
        formDataPlayerOne: formData.playerOneNickname
      });
    }
  }, [isOpen, players, playersLoading, availablePlayers.length, showPlayerOneDropdown, filteredPlayersOne.length, formData.playerOneNickname]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '경기 수정' : '새 경기 등록'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 플레이어 선택 - 콤보박스 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 플레이어 1 콤보박스 */}
          <div className="relative">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 mr-1" />
              플레이어 1 *
            </label>
            <input
              type="text"
              value={formData.playerOneNickname}
              onChange={(e) => handlePlayerNicknameChange(1, e.target.value)}
              onFocus={() => setShowPlayerOneDropdown(true)}
              onBlur={() => setTimeout(() => setShowPlayerOneDropdown(false), 200)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.playerOneNickname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="플레이어 1 닉네임을 입력하거나 선택하세요"
            />
            
            {/* 드롭다운 목록 */}
            {showPlayerOneDropdown && !playersLoading && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                {/* 정렬 헤더 */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>플레이어 목록</span>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleSort('nickname')}
                        className={`flex items-center px-2 py-1 rounded hover:bg-gray-200 ${
                          sortBy === 'nickname' ? 'bg-blue-100 text-blue-700' : ''
                        }`}
                        title="닉네임순 정렬"
                      >
                        이름
                        {sortBy === 'nickname' && (
                          sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSort('createdAt')}
                        className={`flex items-center px-2 py-1 rounded hover:bg-gray-200 ${
                          sortBy === 'createdAt' ? 'bg-blue-100 text-blue-700' : ''
                        }`}
                        title="등록일순 정렬"
                      >
                        등록일
                        {sortBy === 'createdAt' && (
                          sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 플레이어 목록 */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredPlayersOne.length > 0 ? (
                    filteredPlayersOne.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onMouseDown={() => handlePlayerSelect(1, player)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{player.nickname}</div>
                        {player.clan?.name && (
                          <div className="text-sm text-gray-500">({player.clan.name})</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      일치하는 플레이어가 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {errors.playerOneNickname && (
              <p className="mt-1 text-sm text-red-600">{errors.playerOneNickname}</p>
            )}
          </div>

          {/* 플레이어 2 콤보박스 */}
          <div className="relative">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 mr-1" />
              플레이어 2 *
            </label>
            <input
              type="text"
              value={formData.playerTwoNickname}
              onChange={(e) => handlePlayerNicknameChange(2, e.target.value)}
              onFocus={() => setShowPlayerTwoDropdown(true)}
              onBlur={() => setTimeout(() => setShowPlayerTwoDropdown(false), 200)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.playerTwoNickname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="플레이어 2 닉네임을 입력하거나 선택하세요"
            />
            
            {/* 드롭다운 목록 */}
            {showPlayerTwoDropdown && !playersLoading && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredPlayersTwo.length > 0 ? (
                  filteredPlayersTwo.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onMouseDown={() => handlePlayerSelect(2, player)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{player.nickname}</div>
                      {player.clan?.name && (
                        <div className="text-sm text-gray-500">({player.clan.name})</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    일치하는 플레이어가 없습니다
                  </div>
                )}
              </div>
            )}
            
            {errors.playerTwoNickname && (
              <p className="mt-1 text-sm text-red-600">{errors.playerTwoNickname}</p>
            )}
          </div>
        </div>

        {/* 승자 선택 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Trophy className="h-4 w-4 mr-1" />
            승자 (선택사항)
          </label>
          <select
            value={formData.winnerId}
            onChange={(e) => handleInputChange('winnerId', Number(e.target.value) || '')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.winnerId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">승자를 선택하세요 (미정)</option>
            {/* 플레이어 1이 등록된 플레이어일 때만 옵션 표시 */}
            {formData.playerOneId && (
              <option value={formData.playerOneId}>
                {formData.playerOneNickname} (플레이어 1)
              </option>
            )}
            {/* 플레이어 2가 등록된 플레이어일 때만 옵션 표시 */}
            {formData.playerTwoId && (
              <option value={formData.playerTwoId}>
                {formData.playerTwoNickname} (플레이어 2)
              </option>
            )}
          </select>
          {errors.winnerId && (
            <p className="mt-1 text-sm text-red-600">{errors.winnerId}</p>
          )}
          
          {/* 직접 입력된 플레이어가 있을 때 안내 메시지 */}
          {(!formData.playerOneId || !formData.playerTwoId) && (
            <p className="mt-1 text-sm text-gray-500">
              💡 직접 입력된 플레이어는 승자 선택에서 제외됩니다. 경기 후 결과를 수정해주세요.
            </p>
          )}
        </div>

        {/* 맵 이름 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            맵 이름 *
          </label>
          <input
            type="text"
            value={formData.mapName}
            onChange={(e) => handleInputChange('mapName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.mapName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="예: 투혼, 폴리포이드, 라데온"
            required
          />
          {errors.mapName && (
            <p className="mt-1 text-sm text-red-600">{errors.mapName}</p>
          )}
        </div>

        {/* 대회 선택 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            소속 대회 (선택사항)
          </label>
          {contestsLoading ? (
            <div className="flex items-center justify-center py-2">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <select
              value={formData.contestId}
              onChange={(e) => handleInputChange('contestId', Number(e.target.value) || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">대회를 선택하세요 (없음)</option>
              {availableContests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 설명 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 mr-1" />
            경기 설명 (선택사항)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="경기에 대한 추가 정보나 특이사항을 입력하세요..."
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading || playersLoading || contestsLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {isEditing ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
