'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { contestApi } from '@/lib/api';
import { ArrowLeft, Trophy, Save, Calendar } from 'lucide-react';

export default function CreateContestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startedAt) {
      alert('대회명과 시작일시를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const contestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startedAt: new Date(formData.startedAt).toISOString()
      };

      await contestApi.create(contestData);
      alert('대회가 성공적으로 등록되었습니다.');
      router.push('/contests');
    } catch (error) {
      console.error('대회 등록 실패:', error);
      alert('대회 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      router.push('/contests');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        뒤로가기
      </button>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">새 대회 등록</h1>
        </div>
        <p className="text-gray-600">
          새로운 대회를 등록하여 클랜원들과 함께 경쟁해보세요.
        </p>
      </div>

      {/* 등록 폼 */}
      <Card>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              대회명 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="대회명을 입력해주세요"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              대회 설명
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="대회에 대한 설명을 입력해주세요 (선택사항)"
            />
          </div>

          <div>
            <label htmlFor="startedAt" className="block text-sm font-medium text-gray-700 mb-2">
              시작일시 *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="startedAt"
                value={formData.startedAt}
                onChange={handleChange('startedAt')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              대회가 시작될 날짜와 시간을 선택해주세요.
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">등록 중...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  대회 등록
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
