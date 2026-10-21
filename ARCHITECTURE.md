# Excel Sequence Studio Architecture & Memory Bank

## 1. 개요 (Overview)
`Excel-sequence-studio`는 반도체/산업용 가스 모니터링 시스템(GMS)의 복잡한 엑셀 시퀀스 템플릿(4행 헤더 규격)을 
비전문가도 직관적으로 검증하고 편집할 수 있도록 분기 개발된 **독립 비주얼 노코드(Visual No-Code) 스튜디오 모듈**입니다.

---

## 2. 핵심 설계 원칙 (Core Architecture)

### 2-1. 독립 서브 모듈화 (Independent & Reusable)
- 본 프로그램(`plc-monitoring`)의 비즈니스 로직과 물리적으로 격리되어 독립 실행 가능.
- 타 프로젝트(다른 설비 모니터링, 신규 제어기 등)에서도 `projects/Excel-sequence-studio` 폴더만 가져가면 즉시 사용 가능.
- 추후 본 프로그램과의 결합 시 iframe 또는 독립 React 컴포넌트로 손쉽게 탑재 가능.

### 2-2. 엑셀 4행 헤더 규격 완벽 호환 (SheetJS Engine)
- **1행**: 대제목 (시트명 표시)
- **2행**: 그룹 헤더 (`STEP`, `TIMING / CONDITION`, `VALVE`, `ALARM / REMARKS`)
- **3행**: 단위 힌트 (`Sec`, etc.)
- **4행**: 시스템 파싱 기준 키 (`S/No.`, `Operations`, `진행방식`, `Time (Sec)`, `PNV`, `GNV` ... `Alarm Monitoring`, `비교연산자`, `설정명`)
- **동적 열 매핑 (Dynamic Column Mapping)**: 밸브 열이 추가되거나 순서가 바뀌어도 4행 헤더 텍스트 기반으로 100% 자동 인식.

### 2-3. 플러그인 확장형 8대 스마트 블록 (Extensible Block Registry)
1. **VALVE_CONTROL**: 밸브 개폐 (O, C, -, A/B측 `{side}` 치환, 지연 개폐 `O+n`)
2. **TIMER_EARLYPASS**: 대기 및 조기통과 (`Time(Sec)`, `조기통과 earlyPass: Y`)
3. **MANUAL_ACK**: 작업자 수동 확인 (`진행방식`="확인", `Ack Goto`)
4. **CONDITION_CHECK**: 센서 판정 (`Alarm Monitoring`, `비교연산자`, 다중 AND `&`, 옵션 `?`)
5. **SPECIAL_ACTION**: 특수 계측/보정 (`CAPTURE`, `ZERO`, `CAPOFFSET`)
6. **LOOP_CYCLE**: N회 반복 루프 (`진행횟수 >= 설정횟수`)
7. **OPTION_BRANCH**: 장비 옵션 분기 (`Bypass사용`, `고압HELeakCheck` ON/OFF)
8. **ALARM_SHUTDOWN**: 알람 비상대응 (`Alarm Seq. 1/2/3`, `Alarm Goto`)

### 2-4. P&ID 배관도 및 단독 타겟 녹화
- **공식 마스터 도면**: `SK_M15_GC_PID.svg` 기반 끊김 없는 완전체 배관도.
- **밸브 실시간 좌표계**: `GC01.json` 기반 30여 개 밸브/센서 점등.
- **배관도 1:1 타겟 캡처**: `MediaRecorder` + Canvas Stream 기반 MP4/WebM 60FPS 녹화.

### 2-5. 테마 및 반응형 (Responsive Auto-Scaling)
- **다크 모드 / 라이트 모드**: 원클릭 테마 토글.
- **SVG preserveAspectRatio**: 1366x768 노트북부터 4K 모니터까지 1:1 비율 자동 확대/축소.
- **0.5배속 실시간 타이머**: 사람이 눈으로 확인할 수 있는 여유 있는 시뮬레이션 속도.
