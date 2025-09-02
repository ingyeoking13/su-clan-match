'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Database, 
  Shield, 
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="mt-2 text-gray-600">
          시스템 설정 및 환경 구성을 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              보안 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h4 className="font-medium">관리자 비밀번호</h4>
                <p className="text-sm text-gray-500">마지막 변경: 2024-01-15</p>
              </div>
              <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                변경
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h4 className="font-medium">API 키 관리</h4>
                <p className="text-sm text-gray-500">외부 연동용 API 키</p>
              </div>
              <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
                관리
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h4 className="font-medium">세션 만료 시간</h4>
                <p className="text-sm text-gray-500">24시간</p>
              </div>
              <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
                설정
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 데이터베이스 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              데이터베이스 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h4 className="font-medium">백업 설정</h4>
                <p className="text-sm text-gray-500">자동 백업: 매일 새벽 2시</p>
              </div>
              <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
                설정
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h4 className="font-medium">데이터 정리</h4>
                <p className="text-sm text-gray-500">삭제된 데이터 정리 주기</p>
              </div>
              <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
                설정
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h4 className="font-medium">연결 상태</h4>
                <p className="text-sm text-green-600">정상 연결됨</p>
              </div>
              <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                <RefreshCw className="h-4 w-4 mr-1 inline" />
                테스트
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          취소
        </button>
        <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          설정 저장
        </button>
      </div>
    </div>
  );
}
