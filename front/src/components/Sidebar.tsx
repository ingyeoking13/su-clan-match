'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  UserCheck,
  Trophy,
  Gamepad2,
  Settings,
  BarChart3,
  Award
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '클랜 관리', href: '/clans', icon: Users },
  { name: '선수 관리', href: '/players', icon: UserCheck },
  { name: '등급 관리', href: '/grades', icon: Award },
  { name: '경기 관리', href: '/matches', icon: Gamepad2 },
  { name: '대회 관리', href: '/contests', icon: Trophy },
  { name: '통계', href: '/stats', icon: BarChart3 },
  { name: '설정', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <h1 className="text-xl font-bold text-white">Suclan Dashboard</h1>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-900">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
