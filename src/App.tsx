import React, { useState, useEffect, useRef } from 'react';
import { StepSequenceItem } from './types/sequence';
import { blockRegistry } from './core/blockRegistry';
import { DynamicExcelEngine } from './core/dynamicExcelEngine';
import { PipingViewer } from './components/PipingViewer';
import { FlowchartEditor } from './components/FlowchartEditor';
import { ExcelSheetView } from './components/ExcelSheetView';
import { ScreenRecorder } from './components/ScreenRecorder';

// 초기 표준 시퀀스 데이터 세트
const INITIAL_SEQUENCE: StepSequenceItem[] = [
  {
    no: 1,
    title: '배관 초기 진공 배기',
    advance: '자동',
    nextStep: 2,
    ackGoto: '-',
    timeSec: 20,
    valves: { PNV: 'O', GNV: 'C', PMV_A: 'O', LPI_A: 'O', HPI_A: 'C', HPV_A: 'C', ESO_A1: 'C' },
    alarmMon: 'VPT',
    op: '<=',
    targetVal: '-80.0',
    earlyPass: 'Y',
    alarmSeq: 1,
    alarmGoto: 99,
    remarks: '배관 라인 잔류 가스 배기 및 진공 도달 확인'
  },
  {
    no: 2,
    title: 'N2 1차 가압 Purge',
    advance: '자동',
    nextStep: 3,
    ackGoto: '-',
    timeSec: 30,
    valves: { PNV: 'C', GNV: 'O', PMV_A: 'C', LPI_A: 'O', HPI_A: 'O', HPV_A: 'C', ESO_A1: 'C' },
    alarmMon: 'LPT_A',
    op: '>=',
    targetVal: '0.05',
    earlyPass: 'N',
    alarmSeq: 1,
    alarmGoto: 99,
    remarks: '고순도 질소 가스 주입 배관 세정'
  },
  {
    no: 3,
    title: '고압 가압 누설 시험 (+L)',
    advance: '자동',
    nextStep: 4,
    ackGoto: '-',
    timeSec: 45,
    valves: { PNV: 'C', GNV: 'C', PMV_A: 'C', LPI_A: 'C', HPI_A: 'C', HPV_A: 'C', ESO_A1: 'C' },
    alarmMon: 'LPT_A:CAPOFFSET',
    op: '<',
    targetVal: '0.02',
    earlyPass: 'N',
    alarmSeq: 1,
    alarmGoto: 99,
    remarks: '모든 밸브 차단 후 45초간 압력 변동폭 감시 (누설 시험)'
  },
  {
    no: 4,
    title: '작업자 실린더 체결 확인',
    advance: '확인',
    nextStep: 5,
    ackGoto: 5,
    timeSec: 0,
    valves: { PNV: 'C', GNV: 'C', PMV_A: 'C', LPI_A: 'C', HPI_A: 'C', HPV_A: 'C', ESO_A1: 'C' },
    alarmMon: '-',
    op: '-',
    targetVal: '-',
    earlyPass: '-',
    alarmSeq: '-',
    alarmGoto: '-',
    remarks: '현장 작업자 용기 밸브 체결 후 화면 확인 버튼 터치'
  },
  {
    no: 5,
    title: '공정 라인 정상 공급 개시',
    advance: '자동',
    nextStep: '완료',
    ackGoto: '-',
    timeSec: 15,
    valves: { PNV: 'C', GNV: 'C', PMV_A: 'C', LPI_A: 'C', HPI_A: 'O', HPV_A: 'C', ESO_A1: 'O' },
    alarmMon: 'HPT_A',
    op: '>=',
    targetVal: '0.10',
    earlyPass: 'Y',
    alarmSeq: 3,
    alarmGoto: 99,
    remarks: 'ESO_A1 개방 및 챔버 가스 공급 개시'
  }
];

export const App: React.FC = () => {
  // 테마 상태 (기본 다크 모드)
  const [isDark, setIsDark] = useState(true);

  // 시퀀스 데이터 및 활성 스텝
  const [sequenceData, setSequenceData] = useState<StepSequenceItem[]>(INITIAL_SEQUENCE);
  const [currentStep, setCurrentStep] = useState<number | string>(1);
  const [activeSheetName, setActiveSheetName] = useState('AfterPlusL_v1');

  // 패널 접기 상태
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // 시뮬레이션 상태
  const [isSimulating, setIsSimulating] = useState(false);
  const [simCurrentTime, setSimCurrentTime] = useState(0.0);
  const [isRecording, setIsRecording] = useState(false);
  const simTimerRef = useRef<number | null>(null);

  // 파일 업로드 Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 테마 동적 토글 (다크 ↔ 라이트)
  const toggleTheme = () => {
    const nextState = !isDark;
    setIsDark(nextState);
    if (nextState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // 현재 활성 스텝 객체
  const activeStepItem = sequenceData.find(s => s.no === currentStep) || sequenceData[0];

  // 밸브 클릭 토글
  const handleToggleValve = (tag: string) => {
    setSequenceData(prev =>
      prev.map(step => {
        if (step.no === currentStep) {
          const currentVal = step.valves[tag] || 'C';
          return {
            ...step,
            valves: {
              ...step.valves,
              [tag]: currentVal === 'O' ? 'C' : 'O'
            }
          };
        }
        return step;
      })
    );
  };

  // 플로우차트 순서 이동 (위로)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSequenceData(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return reindex(next);
    });
  };

  // 플로우차트 순서 이동 (아래로)
  const handleMoveDown = (index: number) => {
    if (index >= sequenceData.length - 1) return;
    setSequenceData(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return reindex(next);
    });
  };

  // 플로우차트 스텝 삭제
  const handleDeleteStep = (index: number) => {
    if (sequenceData.length <= 1) {
      alert('최소 1개 이상의 공정 스텝이 있어야 합니다.');
      return;
    }
    const target = sequenceData[index];
    if (!confirm(`'Step ${target.no}: ${target.title}' 공정을 삭제하시겠습니까?`)) return;

    setSequenceData(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      return reindex(next);
    });
    if (Number(currentStep) > sequenceData.length - 1) {
      setCurrentStep(sequenceData.length - 1);
    }
  };

  // 신규 스텝 추가 (8대 블록 선택 또는 기본 추가)
  const handleAddNewStep = () => {
    const title = prompt('새로 추가할 공정명을 입력하세요:', 'N2 2차 Purge 공정');
    if (!title) return;

    const newNo = sequenceData.length + 1;
    const newStep: StepSequenceItem = {
      no: newNo,
      title,
      advance: '자동',
      nextStep: newNo + 1,
      ackGoto: '-',
      timeSec: 25,
      valves: { PNV: 'C', GNV: 'O', PMV_A: 'O', LPI_A: 'C', HPI_A: 'O', HPV_A: 'C', ESO_A1: 'C' },
      alarmMon: 'LPT_A',
      op: '>=',
      targetVal: '0.04',
      earlyPass: 'Y',
      alarmSeq: 1,
      alarmGoto: 99,
      remarks: '추가 공정 실행'
    };

    setSequenceData(prev => reindex([...prev, newStep]));
    setCurrentStep(newNo);
  };

  // 스텝 번호 재인덱싱
  const reindex = (list: StepSequenceItem[]) => {
    return list.map((item, idx) => ({
      ...item,
      no: idx + 1,
      nextStep: idx + 2 <= list.length ? idx + 2 : '완료'
    }));
  };

  // 시뮬레이션 제어 (0.5배속 실시간 타이머)
  const toggleSimulation = () => {
    if (isSimulating) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    if (simTimerRef.current) clearInterval(simTimerRef.current);

    simTimerRef.current = window.setInterval(() => {
      setSimCurrentTime(prevTime => {
        const step = sequenceData.find(s => s.no === currentStep);
        if (!step) return prevTime;

        if (step.advance === '확인') {
          return prevTime; // 작업자 확인 모드는 대기
        }

        const newTime = prevTime + 0.2; // 0.2초씩 증가
        if (newTime >= step.timeSec) {
          // 다음 스텝으로 자동 이동
          setTimeout(() => {
            const nextIdx = sequenceData.findIndex(s => s.no === currentStep) + 1;
            if (nextIdx < sequenceData.length) {
              setCurrentStep(sequenceData[nextIdx].no);
              setSimCurrentTime(0.0);
            } else {
              alert('전체 시퀀스 공정 시뮬레이션이 성공적으로 완료되었습니다!');
              resetSimulation();
            }
          }, 0);
          return 0.0;
        }
        return newTime;
      });
    }, 400); // 0.5배속 체감 주기
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
    if (simTimerRef.current) clearInterval(simTimerRef.current);
  };

  const resetSimulation = () => {
    pauseSimulation();
    setCurrentStep(1);
    setSimCurrentTime(0.0);
  };

  const stepForward = () => {
    pauseSimulation();
    setSimCurrentTime(0.0);
    const currIdx = sequenceData.findIndex(s => s.no === currentStep);
    if (currIdx < sequenceData.length - 1) {
      setCurrentStep(sequenceData[currIdx + 1].no);
    } else {
      setCurrentStep(1);
    }
  };

  // 엑셀 내보내기
  const handleExportExcel = () => {
    DynamicExcelEngine.downloadExcel(sequenceData, `${activeSheetName}.xlsx`);
  };

  // 엑셀 불러오기
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const { sheetName, items } = DynamicExcelEngine.parseExcelBuffer(buffer);
        if (items.length > 0) {
          setActiveSheetName(sheetName);
          setSequenceData(items);
          setCurrentStep(items[0].no);
          alert(`엑셀 파일(${file.name})에서 총 ${items.length}개 공정 스텝을 성공적으로 불러왔습니다!`);
        }
      } catch (err: any) {
        alert(`엑셀 불러오기 실패: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // 전체화면 토글
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const activeTotalTime = activeStepItem?.timeSec || 20;
  const progressPct = activeTotalTime > 0 ? Math.min(100, (simCurrentTime / activeTotalTime) * 100).toFixed(0) : '0';

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* 엑셀 파일 인풋 숨김 */}
      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden" />

      {/* ========================================================================= */}
      {/* 1. [상단 영역] 제어 툴바 (대형 실시간 타이머 & 조작 버튼) */}
      {/* ========================================================================= */}
      <header
        className="transition-panel border-b flex flex-col shrink-0 z-30"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {!isTopCollapsed && (
          <div className="h-13 px-4 flex items-center justify-between overflow-hidden">
            {/* 로고 & 엑셀 파일명 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                <h1 className="text-base font-extrabold tracking-tight">Excel Sequence Studio</h1>
                <span
                  className="text-xs px-2 py-0.5 rounded-md font-mono font-bold border"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
                >
                  {isDark ? '다크 모드' : '라이트 모드'}
                </span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
              <div
                className="flex items-center space-x-2 text-xs font-mono px-3 py-1 rounded-md border"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>활성 엑셀:</span>
                <span className="text-amber-400 font-bold">{activeSheetName}.xlsx</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ backgroundColor: 'var(--bg-surface)', color: '#10b981', border: '1px solid var(--border-color)' }}
                >
                  양방향 실시간 동기화
                </span>
              </div>
            </div>

            {/* 실시간 대형 타이머 & 시뮬레이션 제어 */}
            <div className="flex items-center space-x-2.5">
              {/* 대형 타이머 배지 (사람이 눈으로 실시간 확인 가능) */}
              <div
                className="flex items-center px-3 py-1 rounded-lg border space-x-2 shadow-inner"
                style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
              >
                <span className="text-xs font-bold text-slate-400">⏱️ 스텝 경과:</span>
                <span className="text-sm font-extrabold font-mono text-cyan-400 min-w-16 text-right">
                  {simCurrentTime.toFixed(1)}s / {activeTotalTime.toFixed(1)}s
                </span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div className="h-full bg-cyan-400 timer-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-[10px] bg-slate-800 text-amber-400 px-1 rounded font-mono font-bold">0.5배속</span>
              </div>

              <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* 시뮬레이션 제어 버튼군 */}
              <div
                className="flex items-center rounded-lg p-1 border space-x-1 shadow-inner"
                style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
              >
                <button
                  onClick={toggleSimulation}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-white text-xs font-bold transition shadow-xs ${
                    isSimulating ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <span>{isSimulating ? '⏸' : '▶'}</span>
                  <span>{isSimulating ? '일시정지' : '시뮬레이션 시작'}</span>
                </button>
                <button
                  onClick={stepForward}
                  className="px-2.5 py-1.5 rounded-md text-xs font-semibold border transition"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                  title="1스텝 수동 전진"
                >
                  ⏭ 1스텝
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium transition"
                  style={{ color: 'var(--text-muted)' }}
                  title="처음으로 리셋"
                >
                  ↺ 리셋
                </button>
              </div>

              <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* 테마 원클릭 전환 버튼 */}
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1.5 rounded-md text-xs font-bold border flex items-center space-x-1.5 transition shadow-xs"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
                title="다크 모드 / 밝은 모드 전환"
              >
                <span>{isDark ? '☀️' : '🌙'}</span>
                <span>{isDark ? '밝은 모드' : '다크 모드'}</span>
              </button>

              <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* 배관도 단독 녹화 컴포넌트 */}
              <ScreenRecorder targetElementId="masterPidSvg" onRecordingChange={setIsRecording} />

              <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* 엑셀 I/O */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center space-x-1 shadow-xs transition"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <span>📂</span> <span>엑셀 불러오기</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition"
              >
                <span>💾</span> <span>엑셀 내보내기</span>
              </button>

              <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* 전체화면 버튼 */}
              <button
                onClick={toggleFullScreen}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center space-x-1 transition"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
                title="전체화면 (F11)"
              >
                <span>⛶</span> <span>전체화면</span>
              </button>
            </div>
          </div>
        )}

        {/* 상단 접기/펼치기 탭 */}
        <div
          onClick={() => setIsTopCollapsed(!isTopCollapsed)}
          className="h-3.5 border-t flex items-center justify-center cursor-pointer transition"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
          title="상단 제어 메뉴바 접기/펼치기"
        >
          <span className="text-[10px] font-bold leading-none select-none" style={{ color: 'var(--text-muted)' }}>
            {isTopCollapsed ? '▼ 상단 메뉴 펼치기' : '▲ 상단 메뉴 접기'}
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. [중앙 영역] 좌측 플로우차트 & 중앙 메인 배관도 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 좌측 패널 (플로우차트 & 인스펙터) */}
        {!isLeftCollapsed && (
          <aside
            className="transition-panel w-84 border-r flex flex-col shrink-0 z-20 shadow-xs"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <div
              className="h-10 border-b px-3 flex items-center justify-between shrink-0"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs flex items-center space-x-1">
                  <span className="text-blue-500 font-black">❖</span>
                  <span>공정 플로우차트 에디터</span>
                </span>
                <span
                  className="text-[11px] px-1.5 py-0.2 rounded font-mono font-semibold"
                  style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-sub)' }}
                >
                  총 {sequenceData.length}개 스텝
                </span>
              </div>
              <button
                onClick={handleAddNewStep}
                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs transition"
              >
                <span>+</span> <span>스텝 추가</span>
              </button>
            </div>

            {/* 플로우차트 에디터 리스트 */}
            <FlowchartEditor
              items={sequenceData}
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={handleDeleteStep}
              onAddNewStep={handleAddNewStep}
              simCurrentTime={simCurrentTime}
            />

            {/* 좌측 하단 인스펙터 */}
            <div
              className="border-t p-3 shrink-0 text-xs shadow-inner"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center space-x-1">
                  <span className="text-emerald-500">⚙</span>
                  <span>스텝 속성 & 센서 감시</span>
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Step {activeStepItem.no} 선택됨
                </span>
              </div>

              <div
                className="rounded-lg p-2.5 border space-y-2"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-sub)' }}>진행 대기시간:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={activeStepItem.timeSec}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setSequenceData(prev =>
                          prev.map(s => (s.no === currentStep ? { ...s, timeSec: val } : s))
                        );
                      }}
                      className="w-16 border rounded px-2 py-0.5 text-right font-bold shadow-inner"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>초</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-sub)' }}>감시 목표 압력:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={activeStepItem.targetVal || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSequenceData(prev =>
                          prev.map(s => (s.no === currentStep ? { ...s, targetVal: val } : s))
                        );
                      }}
                      className="w-16 border rounded px-2 py-0.5 text-right font-bold text-cyan-400 shadow-inner font-mono"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Torr</span>
                  </div>
                </div>

                <div className="pt-2 border-t text-[11px] space-y-1" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="font-bold flex items-center justify-between">
                    <span>🔴 시뮬레이션 라이브 센서</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {isSimulating ? '● 구동 진행 중 (0.5배속)' : '정상 대기'}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono" style={{ color: 'var(--text-sub)' }}>
                    <span>VPT 측정값:</span>
                    <span className="text-cyan-400 font-bold">-84.2 Torr</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 좌측 패널 접기 토글 바 */}
        <div
          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
          className="w-3.5 border-r cursor-pointer flex items-center justify-center transition shrink-0 z-20"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
          title="좌측 패널 접기/펼치기"
        >
          <span className="text-[10px] font-bold leading-none select-none" style={{ color: 'var(--text-muted)' }}>
            {isLeftCollapsed ? '▶' : '◀'}
          </span>
        </div>

        {/* 메인 관제: P&ID 배관도 화면 */}
        <main className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
          <div
            className="h-8 border-b px-3 flex items-center justify-between text-xs shrink-0"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-sub)' }}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold flex items-center space-x-1.5" style={{ color: 'var(--text-main)' }}>
                <span className="text-cyan-400">🎯</span>
                <span>메인 관제: 산업용 P&ID 배관도 (SK_M15_GC_PID 정밀 규격)</span>
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                | 밸브를 클릭하면 개폐(O/C)가 토글되며 엑셀에 즉시 반영됩니다
              </span>
            </div>

            {isRecording && (
              <div className="flex items-center space-x-2 bg-rose-950/80 text-rose-300 px-3 py-0.5 rounded-full border border-rose-700 text-xs font-mono font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 rec-pulse" />
                <span>● REC 배관도 단독 녹화 중 (MP4 Canvas 60FPS)</span>
              </div>
            )}
          </div>

          {/* 실제 배관도 SVG 렌더러 컴포넌트 */}
          <PipingViewer
            valves={activeStepItem?.valves || {}}
            onToggleValve={handleToggleValve}
            isSimulating={isSimulating}
          />
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. [하단 영역] 고정 4행 헤더 표준 엑셀 시트 */}
      {/* ========================================================================= */}
      <section
        className="transition-panel border-t flex flex-col shrink-0 z-30 shadow-md"
        style={{
          height: isBottomCollapsed ? '28px' : '16rem',
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div
          className="h-7 border-b px-3 flex items-center justify-between text-xs select-none"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center space-x-3">
            <div
              onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
              className="cursor-pointer hover:text-blue-500 flex items-center space-x-1 font-bold"
              title="하단 엑셀 시트 접기/펼치기"
            >
              <span>{isBottomCollapsed ? '▲' : '▼'}</span>
              <span>표준 엑셀 템플릿 (4행 헤더 규격)</span>
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              | 현재 활성 스텝 행에서 시간(Time)과 누적 시간이 실시간으로 카운트업됩니다
            </span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <div className="flex items-center space-x-1">
              <span style={{ color: 'var(--text-muted)' }}>현재 구동 스텝:</span>
              <span
                className="px-2 py-0.5 rounded font-bold border"
                style={{
                  backgroundColor: 'var(--row-active)',
                  color: 'var(--row-active-text)',
                  borderColor: 'var(--row-active-border)'
                }}
              >
                Step {currentStep} 실행 중
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span style={{ color: 'var(--text-muted)' }}>스텝 타이머:</span>
              <span className="text-cyan-400 font-bold">
                {simCurrentTime.toFixed(1)}s / {activeTotalTime.toFixed(1)}s ({progressPct}%)
              </span>
            </div>
          </div>
        </div>

        {!isBottomCollapsed && (
          <ExcelSheetView
            items={sequenceData}
            currentStep={currentStep}
            onSelectStep={setCurrentStep}
            simCurrentTime={simCurrentTime}
            isSimulating={isSimulating}
            activeSheetName={activeSheetName}
          />
        )}
      </section>
    </div>
  );
};
