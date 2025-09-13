'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MatchForm } from '@/components/MatchForm';
import { useApi } from '@/hooks/useApi';
import { matchApi } from '@/lib/api';
import { Match, PaginatedResponse, EntityStatus } from '@/types';
import { Gamepad2, MapPin, Trophy, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Search, X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // 정렬 상태
  const [sorts, setSorts] = useState<Array<{ field: string; direction: 'asc' | 'desc' }>>([
    { field: 'matchTime', direction: 'desc' }
  ]);
  
  // 검색 상태
  const [searchCondition, setSearchCondition] = useState({
    playerOneNickname: '',
    playerTwoNickname: ''
  });
  const [appliedSearchCondition, setAppliedSearchCondition] = useState({
    playerOneNickname: '',
    playerTwoNickname: ''
  });
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const { data: matchesResponse, loading, error, refetch } = useApi<PaginatedResponse<Match>>(
    () => matchApi.getAll(appliedSearchCondition, showDeleted, currentPage, pageSize, sorts),
    [appliedSearchCondition.playerOneNickname, appliedSearchCondition.playerTwoNickname, showDeleted, currentPage, pageSize, sorts]
  );
  
  const matches = matchesResponse?.content || [];
  const totalPages = matchesResponse?.totalPages || 0;
  const totalElements = matchesResponse?.totalElements || 0;

  
  // pageSize, showDeleted 변경 시 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(0);
  }, [pageSize, showDeleted]);

  // 검색 핸들러 함수들
  const handleSearch = () => {
    const hasSearchCondition = !!(searchCondition.playerOneNickname.trim() || searchCondition.playerTwoNickname.trim());
    setIsSearchMode(hasSearchCondition);
    setAppliedSearchCondition(searchCondition); // 검색 조건 적용
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
  };

  const handleClearSearch = () => {
    setSearchCondition({ playerOneNickname: '', playerTwoNickname: '' });
    setAppliedSearchCondition({ playerOneNickname: '', playerTwoNickname: '' }); // 적용된 검색 조건도 클리어
    setIsSearchMode(false);
    setCurrentPage(0);
  };

  const handleSearchInputChange = (field: 'playerOneNickname' | 'playerTwoNickname', value: string) => {
    setSearchCondition(prev => ({ ...prev, [field]: value }));
  };

  // 정렬 핸들러
  const handleSort = (field: string) => {
    // 정렬 변경 시 첫 페이지로 이동
    setCurrentPage(0);
    setSorts(prevSorts => {
      const existingIndex = prevSorts.findIndex(sort => sort.field === field);
      if (existingIndex >= 0) {
        const currentDirection = prevSorts[existingIndex].direction;
        if (currentDirection === 'desc') {
          const newSorts = [...prevSorts];
          newSorts[existingIndex] = { field, direction: 'asc' };
          return newSorts;
        } else {
          return prevSorts.filter(sort => sort.field !== field);
        }
      } else {
        return [...prevSorts, { field, direction: 'desc' }];
      }
    });
  };

  // 정렬 아이콘 표시
  const getSortIcon = (field: string) => {
    const sortIndex = sorts.findIndex(sort => sort.field === field);
    
    if (sortIndex === -1) {
      // 정렬이 적용되지 않은 경우 기본 아이콘 표시
      return (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      );
    }
    
    const sort = sorts[sortIndex];
    const isMultiSort = sorts.length > 1;
    
    return (
      <span className="ml-1 inline-flex items-center text-blue-600">
        {sort.direction === 'desc' ? '↓' : '↑'}
        {isMultiSort && (
          <span className="ml-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            {sortIndex + 1}
          </span>
        )}
      </span>
    );
  };


  const handleCreateSuccess = () => {
    // 새 경기 생성 후 첫 페이지로 이동
    setCurrentPage(0);
    refetch();
    setIsCreateModalOpen(false);
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
          <h1 className="text-3xl font-bold text-gray-900">경기 관리</h1>
          <p className="mt-2 text-gray-600">
            진행된 경기들을 확인하고 새로운 경기를 등록할 수 있습니다.
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
                삭제된 경기 숨기기
              </>
            ) : (
              <>
                <Eye className="h-5 w-5 mr-2" />
                삭제된 경기 보기
              </>
            )}
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 경기 등록
          </button>
        </div>
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
                    case 'playerOneNickname': return '플레이어 1';
                    case 'playerOneRace': return '플레이어 1 종족';
                    case 'playerTwoNickname': return '플레이어 2';
                    case 'playerTwoRace': return '플레이어 2 종족';
                    case 'mapName': return '맵';
                    case 'contestName': return '대회';
                    case 'matchTime': return '경기일시';
                    case 'createdAt': return '등록일';
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

      {/* 검색 상태 표시 */}
      {isSearchMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm text-green-700">
            <span className="font-medium">검색 적용 중:</span>
            <div className="ml-2 flex flex-wrap gap-2">
              {appliedSearchCondition.playerOneNickname && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  플레이어1: &ldquo;{appliedSearchCondition.playerOneNickname}&rdquo;
                      </span>
              )}
              {appliedSearchCondition.playerTwoNickname && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  플레이어2: &ldquo;{appliedSearchCondition.playerTwoNickname}&rdquo;
                      </span>
              )}
            </div>
            <button
              onClick={handleClearSearch}
              className="ml-auto text-green-600 hover:text-green-800 text-xs underline"
            >
              검색 초기화
            </button>
          </div>
                    </div>
                  )}

      {/* 페이지 크기 선택 및 페이지 정보 */}
      <div className="flex items-center justify-between mb-4">
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

         {/* 검색 영역 */}
         <div className="flex items-center gap-2">
           <input
             type="text"
             value={searchCondition.playerOneNickname}
             onChange={(e) => handleSearchInputChange('playerOneNickname', e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="플레이어1 검색"
             className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           />
           <input
             type="text"
             value={searchCondition.playerTwoNickname}
             onChange={(e) => handleSearchInputChange('playerTwoNickname', e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="플레이어2 검색"
             className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Search className="h-3 w-3 mr-1" />
            검색
          </button>
          {isSearchMode && (
            <button
              onClick={handleClearSearch}
              className="flex items-center px-2 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <X className="h-3 w-3 mr-1" />
              초기화
            </button>
          )}
                    </div>
        
        {totalElements > 0 && (
          <div className="text-sm text-gray-700">
            총 <span className="font-medium text-blue-600">{totalElements}</span>개
            <span> 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시</span>
                      </div>
                    )}
                  </div>

      {/* 경기 테이블 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                      경기 정보
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerOneNickname')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      플레이어 1
                      {getSortIcon('playerOneNickname')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerOneRace')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      종족
                      {getSortIcon('playerOneRace')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">vs</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerTwoNickname')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      플레이어 2
                      {getSortIcon('playerTwoNickname')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('playerTwoRace')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      종족
                      {getSortIcon('playerTwoRace')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">승자</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('mapName')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      맵
                      {getSortIcon('mapName')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('contestName')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      대회
                      {getSortIcon('contestName')}
                    </button>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('matchTime')}
                      className="flex items-center justify-center hover:text-blue-600 transition-colors w-full"
                      title="클릭하여 정렬 추가/변경/제거"
                    >
                      경기 일시
                      {getSortIcon('matchTime')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches && matches.length > 0 ? (
                  matches.map((match) => {
                    const isDeleted = match.status === EntityStatus.DELETED;
                    return (
                    <tr 
                      key={match.id} 
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        isDeleted 
                          ? 'bg-gray-50 hover:bg-gray-100 opacity-75' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => router.push(`/matches/${match.id}`)}
                    >
                      {/* 경기 정보 */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Gamepad2 className={`h-4 w-4 ${isDeleted ? 'text-gray-400' : 'text-blue-500'}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${isDeleted ? 'line-through text-gray-500' : ''}`}>#{match.id}</span>
                              {isDeleted && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                  삭제됨
                                </span>
                              )}
                            </div>
                  {match.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate" title={match.description}>
                                {match.description}
                              </div>
                  )}
                </div>
                        </div>
                      </td>

                      {/* 플레이어 1 */}
                      <td className="py-4 px-4 text-center">
                        <div className={`font-medium ${isDeleted ? 'line-through text-gray-500' : 'text-blue-600'}`}>
                          {match.playerOne.nickname}
                        </div>
                        {match.playerOne.clan?.name && (
                          <div className="text-xs text-gray-500">({match.playerOne.clan.name})</div>
                        )}
                      </td>

                      {/* 플레이어 1 종족 */}
                      <td className="py-4 px-4 text-center">
                        {match.playerOneRace ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.playerOneRace === 'TERRAN' ? 'bg-blue-100 text-blue-800' :
                            match.playerOneRace === 'ZERG' ? 'bg-purple-100 text-purple-800' :
                            match.playerOneRace === 'PROTOSS' ? 'bg-teal-100 text-teal-800' :
                            match.playerOneRace === 'RANDOM' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.playerOneRace}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* VS */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-400 font-bold">VS</span>
                      </td>

                      {/* 플레이어 2 */}
                      <td className="py-4 px-4 text-center">
                        <div className={`font-medium ${isDeleted ? 'line-through text-gray-500' : 'text-red-600'}`}>
                          {match.playerTwo.nickname}
                        </div>
                        {match.playerTwo.clan?.name && (
                          <div className="text-xs text-gray-500">({match.playerTwo.clan.name})</div>
                        )}
                      </td>

                      {/* 플레이어 2 종족 */}
                      <td className="py-4 px-4 text-center">
                        {match.playerTwoRace ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            match.playerTwoRace === 'TERRAN' ? 'bg-blue-100 text-blue-800' :
                            match.playerTwoRace === 'ZERG' ? 'bg-purple-100 text-purple-800' :
                            match.playerTwoRace === 'PROTOSS' ? 'bg-teal-100 text-teal-800' :
                            match.playerTwoRace === 'RANDOM' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.playerTwoRace}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 승자 */}
                      <td className="py-4 px-4 text-center">
                        {match.winner ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="text-green-600 font-medium text-sm">
                              {match.winner.nickname}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 맵 */}
                      <td className="py-4 px-4 text-center">
                        {match.mapName ? (
                          <div className="flex items-center justify-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{match.mapName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 대회 */}
                      <td className="py-4 px-4 text-center">
                        {match.contestName ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {match.contestName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 일시 */}
                      <td className="py-4 px-4 text-center">
                        {match.matchTime ? (
                          <div className="text-sm">
                            <div>{new Date(match.matchTime).toLocaleDateString('ko-KR')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(match.matchTime).toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                </div>
              </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
          <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {showDeleted ? '경기가 없습니다' : '등록된 경기가 없습니다'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {showDeleted 
                          ? '삭제된 경기가 없거나 검색 조건에 맞는 경기가 없습니다.' 
                          : '첫 번째 경기를 등록해보세요.'
                        }
                      </p>
                      {!showDeleted && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            경기 등록하기
          </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
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

      {/* 경기 등록 모달 */}
      <MatchForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

    </div>
  );
}
