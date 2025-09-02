'use client';

import React from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { Badge } from './ui/Badge';
import { useApi } from '@/hooks/useApi';
import { gradeApi } from '@/lib/api';
import { Grade } from '@/types';
import { 
  Award, 
  Calendar, 
  FileText,
  Edit,
  Trash2,
  Users
} from 'lucide-react';

interface GradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeId: number | null;
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
}

export const GradeDetailModal: React.FC<GradeDetailModalProps> = ({
  isOpen,
  onClose,
  gradeId,
  onEdit,
  onDelete
}) => {
  const { data: grade, loading, error } = useApi<Grade>(
    gradeId && isOpen ? () => gradeApi.getById(gradeId) : null,
    [gradeId, isOpen]
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="등급 상세 정보">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message={error}
          className="mb-4"
        />
      )}

      {grade && (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{grade.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge status={grade.status} />
                  <span className="text-sm text-gray-500">ID: {grade.id}</span>
                </div>
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(grade)}
                className="px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                수정
              </button>
              <button
                onClick={() => onDelete(grade)}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </button>
            </div>
          </div>

          {/* 등급 설명 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              등급 설명
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {grade.description || '이 등급에 대한 설명이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 등급 통계 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              등급 통계
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">-</div>
                <div className="text-sm text-gray-500">이 등급의 선수 수</div>
                <div className="text-xs text-gray-400 mt-1">
                  (구현 예정)
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {grade.name.length > 5 ? '긴 이름' : '짧은 이름'}
                </div>
                <div className="text-sm text-gray-500">등급 이름 길이</div>
                <div className="text-xs text-gray-400 mt-1">
                  {grade.name.length}자
                </div>
              </div>
            </div>
          </div>

          {/* 등록 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              등록 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">생성일</span>
                  <p className="font-medium">
                    {new Date(grade.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">최종 수정일</span>
                  <p className="font-medium">
                    {new Date(grade.updatedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 등급 사용 예시 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              등급 활용 가이드
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-blue-800">
                    이 등급은 선수 등록 시 선택할 수 있습니다.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-blue-800">
                    선수의 실력이나 경험을 나타내는 지표로 사용됩니다.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-blue-800">
                    대회 참가 자격이나 매칭에 활용할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

