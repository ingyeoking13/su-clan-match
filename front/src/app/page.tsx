'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, User, ChevronRight, Shield, Settings } from 'lucide-react';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentMatches } from '@/components/RecentMatches';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { mainApi, contestApi, noticeApi } from '@/lib/api';
import { MainSummary, Contest, Notice, NoticeType, EntityStatus, PaginatedResponse } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  
  // API 데이터 페칭
  const { data: mainData, loading: mainLoading, error: mainError, refetch: refetchMain } = useApi<MainSummary>(mainApi.getSummary);
  const { data: contests, loading: contestsLoading, error: contestsError, refetch: refetchContests } = useApi<Contest[]>(contestApi.getAll);
  const { data: noticesResponse, loading: noticesLoading, error: noticesError, refetch: refetchNotices } = useApi<PaginatedResponse<Notice>>(() => noticeApi.getAll(0, 5));

  // 로딩 상태 확인
  const isLoading = mainLoading || contestsLoading || noticesLoading;
  const hasError = mainError || contestsError || noticesError;

  // 통계 데이터 계산
  const notices = noticesResponse?.content || [];
  const stats = {
    totalClans: mainData?.clanCount || 0,
    totalPlayers: mainData?.memberCount || 0,
    totalMatches: mainData?.matchCount || 0,
    totalContests: contests?.length || 0,
    activeContests: (contests || []).filter(c => c.status === EntityStatus.RUNNING).length,
    recentMatches: mainData?.matches || [],
  };

  // 공지 타입별 아이콘과 색상 가져오기
  const getNoticeTypeInfo = (type: NoticeType) => {
    switch (type) {
      case NoticeType.ADMIN:
        return {
          icon: Shield,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case NoticeType.SYSTEM:
        return {
          icon: Settings,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      default:
        return {
          icon: Bell,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  const handleRetry = () => {
    refetchMain();
    refetchContests();
    refetchNotices();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorMessage
        message={mainError || contestsError || noticesError || '데이터를 불러오는데 실패했습니다.'}
        onRetry={handleRetry}
        className="min-h-96"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          [S.U] clan 게임 클랜 대시보드
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMatches matches={stats.recentMatches} />
        
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                공지사항
              </h3>
              <button
                onClick={() => router.push('/notices')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                더보기
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {notices.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 5).map((notice) => {
                  const typeInfo = getNoticeTypeInfo(notice.noticeType);
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <div
                      key={notice.id}
                      onClick={() => router.push(`/notices/${notice.id}`)}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                            <TypeIcon className="h-2.5 w-2.5 mr-1" />
                            {notice.noticeType === NoticeType.ADMIN ? '관리자' : '시스템'}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notice.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {notice.writer}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            })} {new Date(notice.createdAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}