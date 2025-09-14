'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import { contestApi } from '@/lib/api';
import { Contest, EntityStatus } from '@/types';
import { Trophy, Plus, ArrowUpDown, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContestsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<Array<{ field: string; direction: 'asc' | 'desc' }>>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  
  const { data: contests, loading, error, refetch } = useApi<Contest[]>(contestApi.getAll);
  
  // 페이지 정보 계산
  const totalElements = contests?.length || 0;
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

  const getTimeInfo = (contest: Contest) => {
    const startDate = new Date(contest.startedAt);
    const endDate = contest.endedAt ? new Date(contest.endedAt) : null;
    
    if (contest.status === EntityStatus.RUNNING) {
      return endDate ? `${endDate.toLocaleDateString('ko-KR')}까지` : '진행중';
    } else if (contest.status === EntityStatus.REGISTERED) {
      return endDate ? `${endDate.toLocaleDateString('ko-KR')} 완료` : '완료';
    } else {
      return `${startDate.toLocaleDateString('ko-KR')} 시작`;
    }
  };

  // 정렬 함수
  const handleSort = (field: string) => {
    setSorts(prev => {
      const existingSort = prev.find(s => s.field === field);
      if (existingSort) {
        if (existingSort.direction === 'asc') {
          return prev.map(s => s.field === field ? { ...s, direction: 'desc' as const } : s);
        } else {
          return prev.filter(s => s.field !== field);
        }
      } else {
        return [...prev, { field, direction: 'asc' as const }];
      }
    });
  };

  const getSortIcon = (field: string) => {
    const sort = sorts.find(s => s.field === field);
    if (!sort) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sort.direction === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 text-blue-500" /> : 
      <ArrowUpDown className="h-4 w-4 text-blue-500 rotate-180" />;
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">대회 관리</h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            진행중인 대회와 예정된 대회를 관리하고 새로운 대회를 생성할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
              showDeleted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">삭제된 대회 숨기기</span>
                <span className="sm:hidden">숨기기</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">삭제된 대회 보기</span>
                <span className="sm:hidden">보기</span>
              </>
            )}
          </button>
          <button 
            onClick={() => router.push('/contests/create')}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">새 대회 생성</span>
            <span className="sm:hidden">대회 생성</span>
          </button>
        </div>
      </div>

      {/* 페이지 크기 선택 및 페이지 정보 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">페이지당</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={30}>30개</option>
          </select>
        </div>
        
        {totalElements > 0 && (
          <div className="text-sm text-gray-700">
            총 <span className="font-medium text-blue-600">{totalElements}</span>개
            <span className="hidden sm:inline"> 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시</span>
            <span className="sm:hidden"> ({currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)})</span>
          </div>
        )}
      </div>

      {/* 정렬 상태 표시 */}
      {sorts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm text-blue-700">
            <span className="font-medium">정렬 적용 중:</span>
            <div className="ml-2 flex flex-wrap gap-2">
              {sorts.map((sort, index) => {
                const getFieldName = (field: string) => {
                  switch (field) {
                    case 'name': return '대회명';
                    case 'status': return '상태';
                    case 'playerCount': return '참가자 수';
                    case 'matchCount': return '경기 수';
                    case 'startedAt': return '시작시간';
                    case 'endedAt': return '종료시간';
                    default: return field;
                  }
                };

                return (
                  <span key={sort.field} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {sorts.length > 1 && `${index + 1}. `}
                    {getFieldName(sort.field)} ({sort.direction === 'asc' ? '오름차순' : '내림차순'})
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => setSorts([])}
              className="ml-auto text-blue-600 hover:text-blue-800 text-xs underline"
            >
              정렬 초기화
            </button>
          </div>
        </div>
      )}

      {/* 대회 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>대회 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 sm:px-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-gray-900 text-sm"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      대회명
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-700 hover:text-gray-900 mx-auto text-sm"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      상태
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center">
                    <button
                      onClick={() => handleSort('playerCount')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-700 hover:text-gray-900 mx-auto text-sm"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      <span className="hidden sm:inline">참가자</span>
                      <span className="sm:hidden">참가</span>
                      {getSortIcon('playerCount')}
                    </button>
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center">
                    <button
                      onClick={() => handleSort('matchCount')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-700 hover:text-gray-900 mx-auto text-sm"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      <span className="hidden sm:inline">경기 수</span>
                      <span className="sm:hidden">경기</span>
                      {getSortIcon('matchCount')}
                    </button>
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center">
                    <button
                      onClick={() => handleSort('startedAt')}
                      className="flex items-center justify-center space-x-1 font-medium text-gray-700 hover:text-gray-900 mx-auto text-sm"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      <span className="hidden sm:inline">시작일</span>
                      <span className="sm:hidden">시작</span>
                      {getSortIcon('startedAt')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!contests || contests.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 대회가 없습니다</h3>
                      <p className="text-gray-500 mb-4">첫 번째 대회를 생성해보세요.</p>
                      <button 
                        onClick={() => router.push('/contests/create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        대회 생성하기
                      </button>
                    </td>
                  </tr>
                ) : (
                  contests.map((contest) => {
                    const isDeleted = contest.status === EntityStatus.DELETED;
                    return (
                      <tr
                        key={contest.id}
                        className={`border-b border-gray-100 transition-colors cursor-pointer ${
                          isDeleted
                            ? 'bg-gray-50 hover:bg-gray-100 opacity-75'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push(`/contests/${contest.id}`)}
                      >
                        <td className="py-4 px-2 sm:px-6">
                          <div className="flex items-center space-x-2">
                            <Trophy className={`h-4 w-4 ${isDeleted ? 'text-gray-400' : 'text-yellow-500'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium text-sm sm:text-base truncate ${isDeleted ? 'line-through text-gray-500' : ''}`}>
                                  {contest.name}
                                </span>
                                {isDeleted && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium flex-shrink-0">
                                    삭제됨
                                  </span>
                                )}
                              </div>
                              {contest.description && (
                                <p className={`text-xs sm:text-sm text-gray-500 truncate ${isDeleted ? 'line-through' : ''}`}>
                                  {contest.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-center">
                          <Badge status={contest.status} />
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-center">
                          <div className={`font-medium text-sm sm:text-base ${isDeleted ? 'line-through text-gray-500' : 'text-blue-600'}`}>
                            {contest.playerCount}명
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-center">
                          <div className={`font-medium text-sm sm:text-base ${isDeleted ? 'line-through text-gray-500' : 'text-green-600'}`}>
                            {contest.matchCount}경기
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-center">
                          <div className={`text-xs sm:text-sm ${isDeleted ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                            {getTimeInfo(contest)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
