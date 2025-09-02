import React from 'react';
import { EntityStatus } from '@/types';

interface BadgeProps {
  status: EntityStatus;
  className?: string;
}

const statusColors = {
  [EntityStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [EntityStatus.RUNNING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [EntityStatus.REGISTERED]: 'bg-green-100 text-green-800 border-green-200',
  [EntityStatus.MERGED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [EntityStatus.BANNED]: 'bg-red-100 text-red-800 border-red-200',
  [EntityStatus.DELETED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [EntityStatus.EXPIRED]: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusLabels = {
  [EntityStatus.PENDING]: '대기중',
  [EntityStatus.RUNNING]: '진행중',
  [EntityStatus.REGISTERED]: '등록됨',
  [EntityStatus.MERGED]: '병합됨',
  [EntityStatus.BANNED]: '차단됨',
  [EntityStatus.DELETED]: '삭제됨',
  [EntityStatus.EXPIRED]: '만료됨',
};

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
};
