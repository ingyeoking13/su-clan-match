'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ClanForm } from '@/components/ClanForm';
import { ClanDetailModal } from '@/components/ClanDetailModal';
import { ClanEditForm } from '@/components/ClanEditForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { clanApi } from '@/lib/api';
import { Clan, EntityStatus } from '@/types';
import { Users, Calendar, Plus, Eye, EyeOff } from 'lucide-react';

export default function ClansPage() {
  const [showDeleted, setShowDeleted] = useState(false);
  const { data: clans, loading, error, refetch } = useApi<Clan[]>(
    () => clanApi.getAll(showDeleted),
    [showDeleted]
  );
  const { mutate: deleteClan, loading: deleteLoading } = useApiMutation<void>();

  // 디버깅용 로그
  console.log('showDeleted:', showDeleted);
  console.log('clans:', clans);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);

  // 핸들러 함수들
  const handleClanClick = (clan: Clan) => {
    setSelectedClanId(clan.id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (clan: Clan) => {
    setSelectedClan(clan);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (clan: Clan) => {
    setSelectedClan(clan);
    setIsDetailModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClan) return;

    try {
      await deleteClan(() => clanApi.delete(selectedClan.id));
      setIsDeleteDialogOpen(false);
      setSelectedClan(null);
      refetch(); // 목록 새로고침
    } catch (error) {
      console.error('클랜 삭제 실패:', error);
    }
  };

  const handleModalClose = () => {
    setSelectedClan(null);
    setSelectedClanId(null);
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
          <h1 className="text-3xl font-bold text-gray-900">클랜 관리</h1>
          <p className="mt-2 text-gray-600">
            등록된 클랜들을 관리하고 새로운 클랜을 추가할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* 삭제된 클랜 보기 토글 */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showDeleted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                삭제된 클랜 숨기기
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                삭제된 클랜 보기
              </>
            )}
          </button>
          
          {/* 새 클랜 추가 버튼 */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 클랜 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clans?.filter((clan) => (!showDeleted || (showDeleted && clan.status !== EntityStatus.DELETED))).map((clan) => {
          const isDeleted = clan.status === EntityStatus.DELETED;
          return (
            <Card 
              key={clan.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                isDeleted ? 'opacity-60 border-red-200 bg-red-50' : ''
              }`} 
              onClick={() => handleClanClick(clan)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-xl ${isDeleted ? 'text-red-700 line-through' : ''}`}>
                    {clan.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge status={clan.status} />
                    {isDeleted && (
                      <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                        삭제됨
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`mb-4 ${isDeleted ? 'text-red-600' : 'text-gray-600'}`}>
                  {clan.description}
                </p>
                
                <div className="space-y-2">
                  <div className={`flex items-center text-sm ${isDeleted ? 'text-red-500' : 'text-gray-500'}`}>
                    <Users className="h-4 w-4 mr-2" />
                    멤버 수: {clan.memberCount || 0}명
                  </div>
                  <div className={`flex items-center text-sm ${isDeleted ? 'text-red-500' : 'text-gray-500'}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    창설일: {new Date(clan.foundingDate).toLocaleDateString('ko-KR')}
                  </div>
                  {isDeleted && clan.closingDate && (
                    <div className="flex items-center text-sm text-red-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      폐쇄일: {new Date(clan.closingDate).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClanClick(clan);
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                        isDeleted
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      상세보기
                    </button>
                    {!isDeleted && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(clan);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                      >
                        수정
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!clans || clans.length === 0) && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showDeleted ? '삭제된 클랜이 없습니다' : '등록된 클랜이 없습니다'}
          </h3>
          <p className="text-gray-500 mb-4">
            {showDeleted 
              ? '삭제된 클랜이 없습니다. 활성 클랜을 보려면 토글을 해제하세요.' 
              : '첫 번째 클랜을 추가해보세요.'
            }
          </p>
          {!showDeleted && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              클랜 추가하기
            </button>
          )}
        </div>
      )}

      {/* 클랜 추가 모달 */}
      <ClanForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch(); // 클랜 목록 새로고침
        }}
      />

      {/* 클랜 상세보기 모달 */}
      <ClanDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        clanId={selectedClanId}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* 클랜 수정 모달 */}
      <ClanEditForm
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        clan={selectedClan}
        onSuccess={() => {
          refetch(); // 클랜 목록 새로고침
          handleModalClose();
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title="클랜 삭제 확인"
        message={`정말로 "${selectedClan?.name}" 클랜을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
