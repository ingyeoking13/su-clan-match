'use client';

import React, { useState } from 'react';
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
  Award,
  Bell,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '클랜 관리', href: '/clans', icon: Users },
  { name: '선수 관리', href: '/players', icon: UserCheck },
  { name: '등급 관리', href: '/grades', icon: Award },
  { name: '경기 관리', href: '/matches', icon: Gamepad2 },
  { name: '대회 관리', href: '/contests', icon: Trophy },
  { name: '게시판', href: '/notices', icon: Bell },
  { name: '통계', href: '/stats', icon: BarChart3 },
  { name: '설정', href: '/settings', icon: Settings },
];

export const MobileHeader: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 모바일 헤더 */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between lg:hidden">
        <h1 className="text-lg font-bold">S.U Clan</h1>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-opacity-100"
            onClick={closeMenu}
          />
          
          {/* 메뉴 패널 */}
          <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">메뉴</h2>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
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
      )}
    </>
  );
};
