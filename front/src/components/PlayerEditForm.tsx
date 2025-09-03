'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { playerApi, clanApi, gradeApi } from '@/lib/api';
import { Player, Clan, Grade, PaginatedResponse } from '@/types';
import { User, Award, Users } from 'lucide-react';

interface PlayerEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  player: Player | null;
}

export const PlayerEditForm: React.FC<PlayerEditFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  player
}) => {
  const [formData, setFormData] = useState({
    nickname: player?.nickname || '',
    race: player?.race || '',
    gradeId: player?.grade?.id?.toString() || '',
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
        gradeId: player.grade?.id?.toString() || '',
        clanName: player.clan?.name || player.clanName || ''
      });
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player || !formData.nickname.trim()) {
      return;
    }

    try {
      const submitData = {
        nickname: formData.nickname.trim(),
        race: formData.race.trim() || undefined,
        gradeId: formData.gradeId ? parseInt(formData.gradeId) : undefined,
        clanName: formData.clanName || undefined
      };

      await mutate(() => playerApi.update(player.id, submitData));
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('선수 수정 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    if (player) {
      setFormData({
        nickname: player.nickname,
        race: player.race || '',
        gradeId: player.grade?.id?.toString() || '',
        clanName: player.clanName || ''
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="선수 정보 수정">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
          />
        )}

        {/* 현재 선수 정보 표시 */}
        {player && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{player.nickname}</h3>
                <p className="text-sm text-gray-500">
                  {player.grade?.name || '등급 없음'} • {player.clanName || '소속 클랜 없음'}
                </p>
              </div>
            </div>
          </div>
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

        {/* 변경사항 표시 */}
        {player && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">변경사항</h4>
            <div className="space-y-1 text-sm">
              {formData.nickname !== player.nickname && (
                <div className="flex justify-between">
                  <span className="text-blue-700">닉네임:</span>
                  <span className="text-blue-900">
                    {player.nickname} → {formData.nickname}
                  </span>
                </div>
              )}
              {formData.race !== (player.race || '') && (
                <div className="flex justify-between">
                  <span className="text-blue-700">종족:</span>
                  <span className="text-blue-900">
                    {player.race || '없음'} → {formData.race || '없음'}
                  </span>
                </div>
              )}
              {formData.gradeId !== (player.grade?.id?.toString() || '') && (
                <div className="flex justify-between">
                  <span className="text-blue-700">등급:</span>
                  <span className="text-blue-900">
                    {player.grade?.name || '없음'} → {
                      grades?.find(g => g.id.toString() === formData.gradeId)?.name || '없음'
                    }
                  </span>
                </div>
              )}
              {formData.clanName !== (player.clanName || '') && (
                <div className="flex justify-between">
                  <span className="text-blue-700">클랜:</span>
                  <span className="text-blue-900">
                    {player.clanName || '없음'} → {formData.clanName || '없음'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-3 pt-6">
          <button
            type="button"
            onClick={handleCancel}
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
                수정 중...
              </div>
            ) : (
              '수정'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
