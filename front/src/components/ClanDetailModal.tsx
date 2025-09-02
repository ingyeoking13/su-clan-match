'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { clanApi } from '@/lib/api';
import { Clan, EntityStatus } from '@/types';
import { Users, Calendar, FileText, Edit, Trash2 } from 'lucide-react';

interface ClanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanId: number | null;
  onEdit: (clan: Clan) => void;
  onDelete: (clan: Clan) => void;
}

export const ClanDetailModal: React.FC<ClanDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  clanId,
  onEdit,
  onDelete
}) => {
  // clanId가 있고 모달이 열려있을 때만 API 호출
  const { data: clan, loading, error, refetch } = useApi<Clan>(
    clanId && isOpen ? () => clanApi.getById(clanId) : null,
    [clanId, isOpen] // clanId나 모달이 열릴 때마다 새로 호출
  );



  if (!isOpen || !clanId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="클랜 상세 정보" className="max-w-lg">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={refetch}
          className="py-8"
        />
      ) : clan ? (
        <div className="space-y-6">
        {/* 클랜 기본 정보 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{clan.name}</h3>
            <Badge status={clan.status} />
          </div>
        </div>

        {/* 클랜 설명 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">클랜 설명</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {clan.description || '설명이 없습니다.'}
          </p>
        </div>

        {/* 클랜 정보 */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-3" />
              <span className="font-medium text-gray-700">멤버 수</span>
            </div>
            <span className="text-gray-900 font-semibold">{clan.memberCount || 0}명</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="font-medium text-gray-700">창설일</span>
            </div>
            <span className="text-gray-900">
              {clan.foundingDate ? new Date(clan.foundingDate).toLocaleDateString('ko-KR') : '미정'}
            </span>
          </div>

          {clan.closingDate && (
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                <span className="font-medium text-gray-700">해체일</span>
              </div>
              <span className="text-gray-900">
                {new Date(clan.closingDate).toLocaleDateString('ko-KR')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="font-medium text-gray-700">생성일</span>
            </div>
            <span className="text-gray-900">
              {clan.createdAt ? new Date(clan.createdAt).toLocaleDateString('ko-KR') : '미정'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="font-medium text-gray-700">최종 수정일</span>
            </div>
            <span className="text-gray-900">
              {clan.updatedAt ? new Date(clan.updatedAt).toLocaleDateString('ko-KR') : '미정'}
            </span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {
                  clan.status !== EntityStatus.DELETED &&
                  <button
                    onClick={() => onDelete(clan)}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                    삭제
                  </button>
                }
          <button
            onClick={() => onEdit(clan)}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2 inline" />
            수정
          </button>
        </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          클랜 정보를 찾을 수 없습니다.
        </div>
      )}
    </Modal>
  );
};
