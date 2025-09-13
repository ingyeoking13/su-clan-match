'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { noticeApi } from '@/lib/api';
import { NoticeType } from '@/types';
import { ArrowLeft, Bell, Save, Settings, Shield } from 'lucide-react';

export default function CreateNoticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    writer: '',
    text: '',
    noticeType: NoticeType.ADMIN
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.writer.trim()) {
      alert('제목과 작성자를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await noticeApi.create(formData);
      alert('공지사항이 성공적으로 작성되었습니다.');
      router.push('/notices');
    } catch (error) {
      console.error('공지사항 작성 실패:', error);
      alert('공지사항 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

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

      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-blue-600" />
          새 공지사항 작성
        </h1>
        <p className="mt-2 text-gray-600">
          클랜원들에게 전달할 공지사항을 작성해주세요.
        </p>
      </div>

      {/* 작성 폼 */}
      <Card>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="noticeType" className="block text-sm font-medium text-gray-700 mb-2">
              공지 타입 *
            </label>
            <select
              id="noticeType"
              value={formData.noticeType}
              onChange={handleChange('noticeType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={NoticeType.ADMIN}>
                👤 관리자 공지(클랜 운영 관련 공지사항)
              </option>
              <option value={NoticeType.SYSTEM}>
                🔧 시스템 공지(시스템 업데이트, 점검 등)
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="공지사항 제목을 입력해주세요"
              required
            />
          </div>

          <div>
            <label htmlFor="writer" className="block text-sm font-medium text-gray-700 mb-2">
              작성자 *
            </label>
            <input
              type="text"
              id="writer"
              value={formData.writer}
              onChange={handleChange('writer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="작성자명을 입력해주세요"
              required
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="text"
              value={formData.text}
              onChange={handleChange('text')}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="공지사항 내용을 입력해주세요"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
