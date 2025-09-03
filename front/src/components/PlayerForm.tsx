'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { playerApi, clanApi, gradeApi } from '@/lib/api';
import { Player, Clan, Grade, PaginatedResponse } from '@/types';
import { User, Award, Users } from 'lucide-react';

interface PlayerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  player?: Player | null; // 수정 모드일 때 사용
}

export const PlayerForm: React.FC<PlayerFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  player
}) => {
  const isEditMode = !!player;
  const [formData, setFormData] = useState({
    nickname: player?.nickname || '',
    race: player?.race || '',
    gradeId: player?.grade?.id || '',
    clanName: player?.clan?.name || player?.clanName || ''
  });

  // 클랜과 등급 목록 가져오기 (모달이 열려있을 때만)
  const { data: clans, loading: clansLoading } = useApi<Clan[]>(
    isOpen ? () => clanApi.getAll(false) : null,
    [isOpen]
  );
  const { data: gradesResponse, loading: gradesLoading } = useApi<PaginatedResponse<Grade>>(
    isOpen ? () => gradeApi.getAll() : null,
    [isOpen]
  );
  const grades = gradesResponse?.content || [];
  
  const { mutate, loading, error } = useApiMutation<Player>();

  // 폼 데이터를 선수 정보로 초기화
  React.useEffect(() => {
    if (player) {
      setFormData({
        nickname: player.nickname,
        race: player.race || '',
        gradeId: player.grade?.id || '',
        clanName: player.clan?.name || player.clanName || ''
      });
    } else {
      setFormData({
        nickname: '',
        race: '',
        gradeId: '',
        clanName: ''
      });
    }
  }, [player, isOpen]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nickname.trim()) {
      return;
    }

    try {
      const submitData = {
        nickname: formData.nickname.trim(),
        race: formData.race.trim() || undefined,
        gradeId: formData.gradeId ? parseInt(formData.gradeId as string) : undefined,
        clanName: formData.clanName || undefined
      };

      if (isEditMode) {
        await mutate(() => playerApi.update(player.id, submitData));
      } else {
        await mutate(() => playerApi.create(submitData));
      }
      
      onSuccess();
      onClose();
      
      // 폼 초기화
      setFormData({
        nickname: '',
        race: '',
        gradeId: '',
        clanName: ''
      });
    } catch (error) {
      console.error('선수 저장 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? '선수 정보 수정' : '새 선수 추가'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
          />
        )}

        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            닉네임 *
          </label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="선수 닉네임을 입력하세요"
            required
            disabled={loading}
          />
        </div>

        {/* 종족 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            종족
          </label>
          <select
            value={formData.race}
            onChange={(e) => handleInputChange('race', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">종족 선택 (선택사항)</option>
            <option value="TERRAN">TERRAN</option>
            <option value="PROTOSS">PROTOSS</option>
            <option value="ZERG">ZERG</option>
          </select>
        </div>

        {/* 등급 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="h-4 w-4 inline mr-2" />
            등급
          </label>
          {gradesLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <select
              value={formData.gradeId}
              onChange={(e) => handleInputChange('gradeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">등급 선택 (선택사항)</option>
              {(grades || []).map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 클랜 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-2" />
            소속 클랜
          </label>
          {clansLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <select
              value={formData.clanName}
              onChange={(e) => handleInputChange('clanName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">클랜 선택 (선택사항)</option>
              {(clans || []).map((clan) => (
                <option key={clan.id} value={clan.name}>
                  {clan.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !formData.nickname.trim()}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditMode ? '수정 중...' : '추가 중...'}
              </div>
            ) : (
              isEditMode ? '수정' : '추가'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
