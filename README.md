# Excel Sequence Studio (GMS 시퀀스 스튜디오)

> **GMS 모니터링 시스템 연동형 4행 표준 엑셀 ↔ 대화형 플로우차트 ↔ 완전체 P&ID 배관도 3방향 실시간 동기화 에디터**

---

## 🌟 프로젝트 개요
`Excel-sequence-studio`는 반도체/산업용 가스 공급 장치(GMS, Gas Monitoring System)의 공정 시퀀스 데이터를 직관적으로 작성, 검증, 시뮬레이션할 수 있는 독립 웹 스튜디오 애플리케이션입니다.

- **표준 4행 헤더 엑셀 연동**: 1행(대분류) / 2행(파라미터명) / 3행(PLC 태그) / 4행(단위/기본값)의 현장 표준 엑셀 규격을 100% 완벽히 지원하며 양방향(양방향 실시간 반영 및 .xlsx Import/Export)으로 동작합니다.
- **스마트 8대 블록 플로우차트**: 공정 순서 이동(▲▼), 파라미터 수정, 인터록 조건 설정이 가능한 비주얼 노드 에디터.
- **100% 완전체 P&ID 배관도**: 공식 검증 마스터 배관도의 175개 라인 및 체크밸브, 필터, 레귤레이터, GC01 밸브 23개 실좌표계를 1:1로 장착하여 단 1곳의 끊김도 없는 완벽한 배관망을 제공합니다.
- **다크/라이트 테마 원클릭 전환**: 현장 클린룸 조명 환경 및 실내 관제 환경에 맞춰 즉각적인 고대비 테마 전환을 지원합니다.
- **배관도 단독 Canvas MP4 60FPS 녹화**: 전체 브라우저가 아닌 오직 배관도 도면 영역만 타겟팅하여 고화질 영상으로 녹화 및 검증 이력을 보관할 수 있습니다.

---

## 🏗️ 3대 핵심 구조
1. **Excel Sheet View (Sticky Freeze 4-Row)**
   - 4개 헤더 행 및 좌측 4개 열(No, Title, Branch, Time)이 스크롤 시에도 완벽히 고정되는 Freeze Pane 지원.
   - 시뮬레이션 가동 시 현재 공정 행이 즉시 하이라이트되며 실시간 카운트다운 게이지가 셀 내에 표시됩니다.
2. **Interactive Flowchart Editor**
   - Step 순서 변경, 조건 분기(ACK 대기, 알람 인터록), 밸브 출력 매핑을 직관적 카드로 조작.
3. **Master Piping SVG Viewer**
   - 밸브 클릭 시 O/C 상태 토글 및 배관 활성화(Flow 점등).
   - 압력/유량 센서(VPT, LPT_A, HPT_A, FPT) 실시간 연동.

---

## 🚀 빠른 시작 (Quick Start)

### 1. 개발 서버 실행
```bash
npm install
npm run dev
```
브라우저에서 `http://localhost:5174/` 로 접속합니다.

### 2. 프로덕션 빌드
```bash
npm run build
```

### 3. 오프라인 원클릭 실행 (Windows)
프로젝트 루트의 `run_studio.bat` 파일을 더블클릭하면 오프라인 로컬 환경에서 즉시 브라우저가 열리며 가동됩니다.

---

## 📁 주요 디렉터리 구성
```text
Excel-sequence-studio/
├── public/
├── src/
│   ├── components/
│   │   ├── ExcelSheetView.tsx      # 4행 고정 헤더 엑셀 시트 뷰어
│   │   ├── FlowchartEditor.tsx     # 스마트 8대 블록 플로우차트
│   │   ├── PipingViewer.tsx        # 175패스 완전체 P&ID 배관도
│   │   └── ScreenRecorder.tsx      # 배관도 Canvas MP4 60FPS 녹화기
│   ├── core/
│   │   ├── blockRegistry.ts        # 8대 스마트 블록 정의 및 플러그인 레지스트리
│   │   └── dynamicExcelEngine.ts   # 4행 헤더 엑셀 양방향 파서 & SheetJS 엔진
│   ├── types/
│   │   └── sequence.ts             # 4행 엑셀 모델 & 블록 인터페이스
│   ├── App.tsx                     # 4분할 레이아웃 & 시뮬레이터 오케스트레이터
│   └── index.css                   # 다크/라이트 테마 CSS 변수
├── ARCHITECTURE.md                 # 영구 메모리 뱅크 아키텍처 문서
├── run_studio.bat                  # 원클릭 로컬 기동 배치 파일
└── package.json
```
