# Suclan Dashboard

Suclan 게임 클랜 관리 시스템의 Next.js 기반 대시보드입니다.

## 주요 기능

- **대시보드**: 전체 시스템 현황 확인
- **클랜 관리**: 클랜 등록, 수정, 삭제 및 현황 관리
- **선수 관리**: 선수 등록, 등급 관리, 경기 기록 확인
- **경기 관리**: 경기 등록, 결과 입력, 통계 확인
- **대회 관리**: 대회 생성, 참가자 관리, 일정 관리

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: REST API (Spring Boot 백엔드와 연동)

## 시작하기

### 개발 환경 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 백엔드 연동

이 프론트엔드는 Spring Boot 기반의 Suclan 백엔드 API와 연동됩니다.

**개발 환경:**
- 백엔드 서버와 연동하여 실제 API를 호출합니다.

**프로덕션 환경:**
- 백엔드 서버가 `http://localhost:8080`에서 실행되고 있는지 확인하세요.

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── clans/           # 클랜 관리 페이지
│   ├── players/         # 선수 관리 페이지
│   ├── matches/         # 경기 관리 페이지
│   ├── contests/        # 대회 관리 페이지
│   └── page.tsx         # 대시보드 메인 페이지
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # UI 기본 컴포넌트
│   ├── Sidebar.tsx     # 사이드바 네비게이션
│   └── ...
├── lib/                # 유틸리티 및 API 클라이언트
│   └── api.ts          # API 클라이언트 설정
└── types/              # TypeScript 타입 정의
    └── index.ts        # 도메인 타입 정의
```

## 주요 컴포넌트

### 대시보드 (`/`)
- 시스템 전체 통계 확인
- 최근 경기 결과 확인
- 빠른 액션 버튼

### 클랜 관리 (`/clans`)
- 등록된 클랜 목록 확인
- 클랜별 멤버 수, 창설일 등 정보 표시
- 클랜 등록, 수정, 삭제 기능

### 선수 관리 (`/players`)
- 선수 목록 및 상세 정보 확인
- 등급, 소속 클랜, 경기 기록 표시
- 승률 시각화

### 경기 관리 (`/matches`)
- 경기 목록 및 결과 확인
- 경기별 상태 (대기, 진행중, 완료) 표시
- 경기 통계 대시보드

### 대회 관리 (`/contests`)
- 대회 목록 및 상태 확인
- 참가자 수, 경기 수 등 통계
- 대회 일정 관리

## 스타일링

- **Tailwind CSS**를 사용한 유틸리티 기반 스타일링
- 반응형 디자인 지원
- 다크/라이트 테마 준비 (향후 구현 예정)

## API 연동

`src/lib/api.ts`에서 백엔드 API와의 통신을 관리합니다.

각 도메인별로 CRUD 작업을 위한 API 함수들이 정의되어 있습니다:
- `clanApi`: 클랜 관련 API
- `playerApi`: 선수 관련 API
- `matchApi`: 경기 관련 API
- `contestApi`: 대회 관련 API
- `gradeApi`: 등급 관련 API

## 배포

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 개발 참고사항

- 모든 컴포넌트는 TypeScript로 작성되었습니다
- ESLint와 Prettier 설정이 포함되어 있습니다
- 각 페이지는 현재 목업 데이터를 사용하며, 실제 API 연동은 백엔드 개발 완료 후 진행됩니다

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.