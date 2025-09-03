'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { useApiMutation } from '@/hooks/useApi';
import { gradeApi } from '@/lib/api';
import { Grade } from '@/types';
import { Award, FileText } from 'lucide-react';

interface GradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grade?: Grade | null; // 수정 모드일 때 사용
}

export const GradeForm: React.FC<GradeFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  grade
}) => {
  const isEditMode = !!grade;
  const [formData, setFormData] = useState({
    name: grade?.name || '',
    description: grade?.description || ''
  });

  const { mutate, loading, error } = useApiMutation<Grade>();

  // 폼 데이터를 등급 정보로 초기화
  React.useEffect(() => {
    if (grade) {
      setFormData({
        name: grade.name,
        description: grade.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [grade, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      if (isEditMode) {
        await mutate(() => gradeApi.update(grade.id, submitData));
      } else {
        await mutate(() => gradeApi.create(submitData));
      }
      
      onSuccess();
      onClose();
      
      // 폼 초기화 (추가 모드일 때만)
      if (!isEditMode) {
        setFormData({
          name: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('등급 저장 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    if (isEditMode && grade) {
      setFormData({
        name: grade.name,
        description: grade.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={isEditMode ? '등급 정보 수정' : '새 등급 추가'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
          />
        )}

        {/* 현재 등급 정보 표시 (수정 모드) */}
        {isEditMode && grade && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{grade.name}</h3>
                <p className="text-sm text-gray-500">
                  {grade.description || '설명 없음'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 등급 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="h-4 w-4 inline mr-2" />
            등급 이름 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="예: 1학년, 2학년, ..., 조교"
            required
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            선수들에게 부여할 등급의 이름을 입력하세요.
          </p>
        </div>

        {/* 등급 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-2" />
            등급 설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="이 등급에 대한 설명을 입력하세요..."
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            등급의 의미나 획득 조건 등을 설명해주세요. (선택사항)
          </p>
        </div>

        {/* 변경사항 표시 (수정 모드) */}
        {isEditMode && grade && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">변경사항</h4>
            <div className="space-y-1 text-sm">
              {formData.name !== grade.name && (
                <div className="flex justify-between">
                  <span className="text-blue-700">등급 이름:</span>
                  <span className="text-blue-900">
                    {grade.name} → {formData.name}
                  </span>
                </div>
              )}
              {formData.description !== (grade.description || '') && (
                <div className="flex justify-between">
                  <span className="text-blue-700">설명:</span>
                  <span className="text-blue-900">
                    {(grade.description || '없음').slice(0, 20)}... → {(formData.description || '없음').slice(0, 20)}...
                  </span>
                </div>
              )}
              {formData.name === grade.name && formData.description === (grade.description || '') && (
                <div className="text-blue-600">변경사항이 없습니다.</div>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-3 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditMode ? '수정 중...' : '추가 중...'}
              </div>
            ) : (
              isEditMode ? '수정' : '추가'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
