'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { noticeApi } from '@/lib/api';
import { Notice, PaginatedResponse, NoticeType } from '@/types';
import { Bell, Calendar, User, ChevronLeft, ChevronRight, Plus, Settings, Shield, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NoticesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedType, setSelectedType] = useState<NoticeType | undefined>(undefined);

  const { data: noticesResponse, loading, error, refetch } = useApi<PaginatedResponse<Notice>>(
    () => noticeApi.getAll(currentPage, pageSize, selectedType),
    [currentPage, pageSize, selectedType]
  );

  const notices = noticesResponse?.content || [];
  const totalPages = noticesResponse?.totalPages || 0;
  const totalElements = noticesResponse?.totalElements || 0;

  // pageSize, selectedType 변경 시 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(0);
  }, [pageSize, selectedType]);

  // 공지 타입별 아이콘과 색상 가져오기
  const getNoticeTypeInfo = (type: NoticeType) => {
    switch (type) {
      case NoticeType.ADMIN:
        return {
          icon: Shield,
          text: '관리자 공지',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case NoticeType.SYSTEM:
        return {
          icon: Settings,
          text: '시스템 공지',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      default:
        return {
          icon: Bell,
          text: '일반 공지',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="h-8 w-8 mr-3 text-blue-600" />
            게시판
          </h1>
          <p className="mt-2 text-gray-600">
            클랜의 공지사항과 소식을 확인할 수 있습니다.
          </p>
        </div>
        <button 
          onClick={() => router.push('/notices/create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          새 공지 작성
        </button>
      </div>

      {/* 필터링 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">필터:</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedType(undefined)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedType === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedType(NoticeType.ADMIN)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${
              selectedType === NoticeType.ADMIN
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Shield className="h-3 w-3 mr-1" />
            관리자 공지
          </button>
          <button
            onClick={() => setSelectedType(NoticeType.SYSTEM)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${
              selectedType === NoticeType.SYSTEM
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-3 w-3 mr-1" />
            시스템 공지
          </button>
        </div>
      </div>

      {/* 페이지 정보 */}
      {totalElements > 0 && (
        <div className="text-sm text-gray-700">
          총 <span className="font-medium text-blue-600">{totalElements}</span>개의 공지사항
        </div>
      )}

      {/* 공지사항 목록 */}
      <Card>
        <CardContent className="p-0">
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 공지사항이 없습니다</h3>
              <p className="text-gray-500 mb-4">첫 번째 공지사항을 작성해보세요.</p>
              <button 
                onClick={() => router.push('/notices/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                공지사항 작성하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notices.map((notice) => {
                const typeInfo = getNoticeTypeInfo(notice.noticeType);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div
                    key={notice.id}
                    onClick={() => router.push(`/notices/${notice.id}`)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* 타입 배지 */}
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {notice.noticeType === NoticeType.ADMIN ? '관리자' : '시스템'}
                        </span>
                        
                        {/* 제목 */}
                        <h3 className="text-base font-medium text-gray-900 truncate flex-1">
                          {notice.title}
                        </h3>
                      </div>
                      
                      {/* 작성자와 시간 */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 flex-shrink-0 ml-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {notice.writer}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} {new Date(notice.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
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
                          ? 'bg-blue-600 text-white'
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
    </div>
  );
}
