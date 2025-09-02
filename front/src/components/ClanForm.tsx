'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApiMutation } from '@/hooks/useApi';
import { clanApi } from '@/lib/api';
import { Clan } from '@/types';

interface ClanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClanForm: React.FC<ClanFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    foundingDate: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로
  });

  const { mutate, loading, error } = useApiMutation<Clan>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await mutate(() => clanApi.create(formData));
      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        name: '',
        description: '',
        foundingDate: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (error) {
      // 에러는 useApiMutation에서 처리됨
      console.error('클랜 생성 실패:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        foundingDate: new Date().toISOString().split('T')[0],
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 클랜 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 클랜 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            클랜 이름 *
          </label>
          <input
            type="text"
            id="name"
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            클랜 설명
          </label>
          <textarea
            id="description"
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
          <label htmlFor="foundingDate" className="block text-sm font-medium text-gray-700 mb-1">
            창설일
          </label>
          <input
            type="date"
            id="foundingDate"
            value={formData.foundingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, foundingDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
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
            {loading ? '생성 중...' : '클랜 생성'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
