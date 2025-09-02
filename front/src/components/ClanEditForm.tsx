'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApiMutation } from '@/hooks/useApi';
import { clanApi } from '@/lib/api';
import { Clan } from '@/types';

interface ClanEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clan: Clan | null;
}

export const ClanEditForm: React.FC<ClanEditFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  clan 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    foundingDate: '',
    closingDate: '',
  });

  const { mutate, loading, error } = useApiMutation<Clan>();

  // 클랜 정보가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (clan) {
      setFormData({
        name: clan.name || '',
        description: clan.description || '',
        foundingDate: clan.foundingDate || '',
        closingDate: clan.closingDate || '',
      });
    }
  }, [clan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clan) return;

    try {
      const updateData = {
        ...formData,
        closingDate: formData.closingDate || undefined, // 빈 문자열을 undefined로 변환
      };

      await mutate(() => clanApi.update(clan.id, updateData));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('클랜 수정 실패:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!clan) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="클랜 정보 수정">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 클랜 이름 */}
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
            클랜 이름 *
          </label>
          <input
            type="text"
            id="edit-name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="클랜 이름을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* 클랜 설명 */}
        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            클랜 설명
          </label>
          <textarea
            id="edit-description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="클랜에 대한 설명을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* 창설일 */}
        <div>
          <label htmlFor="edit-foundingDate" className="block text-sm font-medium text-gray-700 mb-1">
            창설일
          </label>
          <input
            type="date"
            id="edit-foundingDate"
            value={formData.foundingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, foundingDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        {/* 해체일 */}
        <div>
          <label htmlFor="edit-closingDate" className="block text-sm font-medium text-gray-700 mb-1">
            해체일 (선택사항)
          </label>
          <input
            type="date"
            id="edit-closingDate"
            value={formData.closingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, closingDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            해체일을 설정하지 않으면 활성 상태로 유지됩니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {loading ? '수정 중...' : '클랜 수정'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
