'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { GradeForm } from '@/components/GradeForm';
import { GradeDetailModal } from '@/components/GradeDetailModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { gradeApi } from '@/lib/api';
import { Grade, EntityStatus } from '@/types';
import { Award, Plus, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GradesPage() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Spring은 0부터 시작
  const [pageSize, setPageSize] = useState(10);
  
  const { data: response, loading, error, refetch } = useApi(() => 
    gradeApi.getAll(showDeleted, currentPage, pageSize), 
    [showDeleted, currentPage, pageSize]
  );
  const { mutate: deleteGrade, loading: deleteLoading } = useApiMutation<void>();

  // Spring Pageable 응답 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginatedData = (response as any)?.data || (response as any) || {};
  const grades: Grade[] = paginatedData?.content || [];
  const totalPages = paginatedData?.totalPages || 0;
  const totalElements = paginatedData?.totalElements || 0;

  // showDeleted나 pageSize가 변경되면 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(0);
  }, [showDeleted, pageSize]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);

  // 핸들러 함수들
  const handleGradeClick = (grade: Grade) => {
    setSelectedGradeId(grade.id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsDetailModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGrade) return;

    try {
      await deleteGrade(() => gradeApi.delete(selectedGrade.id));
      setIsDeleteDialogOpen(false);
      setSelectedGrade(null);
      refetch(); // 목록 새로고침
    } catch (error) {
      console.error('등급 삭제 실패:', error);
    }
  };

  const handleModalClose = () => {
    setSelectedGrade(null);
    setSelectedGradeId(null);
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
          <h1 className="text-3xl font-bold text-gray-900">등급 관리</h1>
          <p className="mt-2 text-gray-600">
            선수들의 등급을 관리하고 새로운 등급을 추가할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showDeleted 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? (
              <>
                <EyeOff className="h-5 w-5 mr-2" />
                삭제된 등급 숨기기
              </>
            ) : (
              <>
                <Eye className="h-5 w-5 mr-2" />
                삭제된 등급 보기
              </>
            )}
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 등급 추가
          </button>
        </div>
      </div>

      {/* 페이지 크기 선택 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            전체 {totalElements}개
            {totalElements > 0 && (
              <span> 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">페이지당</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={30}>30개</option>
          </select>
        </div>
      </div>

      {/* 등급 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>등급 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">등급명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">설명</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">생성일</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">액션</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade: Grade) => {
                  const isDeleted = grade.status === EntityStatus.DELETED;
                  
                  return (
                    <tr 
                      key={grade.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isDeleted ? 'bg-red-50 opacity-75' : ''
                      }`}
                      onClick={() => handleGradeClick(grade)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <div className={`font-medium ${isDeleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {grade.name}
                            </div>
                            {isDeleted && (
                              <span className="text-xs text-red-600 font-medium">삭제됨</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isDeleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {grade.description || '설명이 없습니다.'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={grade.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isDeleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(grade.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGradeClick(grade);
                            }}
                            className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                          >
                            상세
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(grade);
                            }}
                            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                const displayPageNum = pageNum + 1; // 사용자에게는 1부터 표시
                // 현재 페이지 주변의 페이지들만 표시
                if (
                  pageNum === 0 ||
                  pageNum === totalPages - 1 ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-yellow-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {displayPageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {grades.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showDeleted ? '등급이 없습니다' : '등록된 등급이 없습니다'}
          </h3>
          <p className="text-gray-500 mb-4">
            {showDeleted 
              ? '삭제된 등급을 포함하여 표시할 등급이 없습니다.' 
              : '첫 번째 등급을 추가해보세요.'
            }
          </p>
          {!showDeleted && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              등급 추가하기
            </button>
          )}
        </div>
      )}

      {/* 등급 추가/수정 모달 */}
      <GradeForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch(); // 등급 목록 새로고침
        }}
      />

      <GradeForm
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        grade={selectedGrade}
        onSuccess={() => {
          refetch(); // 등급 목록 새로고침
          handleModalClose();
        }}
      />

      {/* 등급 상세보기 모달 */}
      <GradeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        gradeId={selectedGradeId}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title="등급 삭제 확인"
        message={`정말로 "${selectedGrade?.name}" 등급을 삭제하시겠습니까? 이 등급을 사용하는 선수들에게 영향을 줄 수 있습니다.`}
        confirmText="삭제"
        cancelText="취소"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
