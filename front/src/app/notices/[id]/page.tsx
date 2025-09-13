'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { noticeApi } from '@/lib/api';
import { Notice, NoticeType } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, User, Calendar, Bell, Shield, Settings } from 'lucide-react';

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  const { 
    data: notice, 
    loading, 
    error 
  } = useApi(() => noticeApi.getById(Number(noticeId)), [noticeId]);

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
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="공지사항을 불러오는 중 오류가 발생했습니다." />;
  }

  if (!notice) {
    return <ErrorMessage message="공지사항을 찾을 수 없습니다." />;
  }

  const typeInfo = getNoticeTypeInfo(notice.noticeType);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        목록으로 돌아가기
      </button>

      {/* 공지사항 내용 */}
      <Card className="mb-8">
        <div className="p-8">
          {/* 헤더 */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                <TypeIcon className="h-4 w-4 mr-2" />
                {typeInfo.text}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {notice.title}
            </h1>
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{notice.writer}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            {notice.text ? (
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {notice.text}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                내용이 없습니다.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 하단 네비게이션 */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push('/notices')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          목록으로 이동
        </button>
      </div>
    </div>
  );
}
