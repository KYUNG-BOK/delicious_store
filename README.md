# COCO Eats (맛집 MAP)

![스크린샷](https://velog.velcdn.com/images/yoonddubi/post/db642273-1b67-46e4-bad6-4657053969e7/image.png)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-%5E5-646CFF?logo=vite&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](#)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-%5E4-5A0EF8?logo=daisyui&logoColor=white)](#)
[![FramerMotion](https://img.shields.io/badge/Framer%20Motion-%5E11-FF0050?logo=framer&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](#)

> **DaisyUI**로 다크 테마 디자인을 빠르게 구성하고, **Framer Motion**으로  
> 카드/히어로/모달에 부드러운 인터랙션을 더한 맛집 큐레이션 웹앱입니다.  
> BE(포트 3000)에서 기본 맛집 데이터를 제공하고, FE는 목록/검색/필터/모달 상세를 제공합니다.

------------------------------------------------------------------------

## ✨ 주요 기능

-   **검색/필터**: 키워드, 카테고리, 정렬(추천/평점/거리), 영업중 필터
-   **카드 리스트**: DaisyUI 카드 구성 + **Framer Motion** 애니메이션
-   **자세히 모달**: 상세 설명/태그/이미지/좌표 노출, **구글 지도 링크**
-   **반응형 레이아웃**: 상단 고정 네비, 모바일 하단 탭, 사이드 패널
-   **다크 테마 고정**: `data-theme="dark"` 적용
-   **서버 연동 준비**: `GET /places`로 목록 로드 (추후
    `POST/DELETE /users/places`로 찜 동기화 예정)

------------------------------------------------------------------------

## 🧱 기술 스택

-   **React + Vite + TypeScript**
-   **Tailwind CSS + DaisyUI** (UI 키트)
-   **Framer Motion** (애니메이션)
-   **Express (별도 레포: eatingMark-BE)** -- `/places`, `/users/places`
    API 제공

------------------------------------------------------------------------

## 📁 프로젝트 구조(요약)

> 참고: 현재 `src/components/`는 `.gitignore`에 추가되어 **커밋 제외** 중

    src/
    ├─ pages/
    │  └─ RestaurantMainPage.tsx     # 페이지 컨테이너(상태/페칭/배치)
    ├─ components/
    │  ├─ Hero.tsx                   # 히어로 + 검색/필터 UI
    │  ├─ RestaurantCard.tsx         # 카드 UI
    │  ├─ DetailModal.tsx            # 자세히 보기 모달
    │  ├─ RatingStars.tsx            # 별점 표시
    │  ├─ Navbar.tsx (선택)
    │  └─ Footer.tsx  (선택)
    ├─ lib/
    │  ├─ animations.ts              # framer-motion 프리셋 (fadeIn, spring)
    │  ├─ adapters.ts                # BE → FE 데이터 맵핑 (adaptPlace 등)
    │  └─ api.ts                     # API/이미지 베이스 경로 상수
    ├─ types.ts                      # BEPlace/Restaurant/CATEGORIES 타입
    └─ App.tsx                       # 라우팅 전용 (React Router)

------------------------------------------------------------------------

## 🚀 빠른 시작

### 1) 백엔드(별도 레포) 실행

``` bash
git clone https://github.com/KYUNG-BOK/eatingMark-BE.git
cd eatingMark-BE
npm i
node app.js
# 서버: http://localhost:3000
# 정적 이미지: http://localhost:3000/<파일명>.jpg
```

> 샘플 확인:

``` bash
curl -s http://localhost:3000/places | jq .
```

### 2) 프론트엔드 실행

``` bash
npm i
npm run dev
# http://localhost:5173 (기본)
```

> **환경 변수(선택)**\
> `VITE_API_BASE`를 쓰면 API 베이스를 지정할 수 있어요. 없으면
> 상대경로(`/places`)를 사용합니다.

`.env`

    VITE_API_BASE=http://localhost:3000

------------------------------------------------------------------------

## 🔌 현재 API

-   `GET /places`
-   `GET /users/places` → 찜 목록 (추가 예정)
-   `POST /users/places` → 찜 추가/업데이트
-   `DELETE /users/places/:id` → 찜 제거

------------------------------------------------------------------------

## 🖼️ UI 하이라이트

-   **DaisyUI + 다크 테마 고정**
-   **Framer Motion**
    -   히어로 타이틀: 초기 진입 애니메이션
    -   카드: 레이아웃/호버 스프링
    -   모달 이미지: 페이드+스케일 인

------------------------------------------------------------------------

## 🗺️ 지도(모달 내)

-   현재: **구글 지도 링크**로 외부 열기
-   선택사항: **embed iframe**
-   고도화: Google Maps JS / Kakao Map / Naver Map 중 택1

------------------------------------------------------------------------

## 🛣️ 로드맵

-   [ ] 찜하기(내일): UI → 로컬 상태 → **서버 동기화**(`/users/places`)
-   [ ] 모달 내 지도 embed / 마커 표시
-   [ ] 카카오/네이버/구글 장소 API 도입
-   [ ] 테스트 & CI
