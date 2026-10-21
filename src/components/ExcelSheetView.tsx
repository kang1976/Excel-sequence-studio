import React, { useEffect, useRef } from 'react';
import { StepSequenceItem } from '../types/sequence';

interface ExcelSheetViewProps {
  items: StepSequenceItem[];
  currentStep: number | string;
  onSelectStep: (no: number | string) => void;
  simCurrentTime: number;
  isSimulating: boolean;
  activeSheetName?: string;
}

export const ExcelSheetView: React.FC<ExcelSheetViewProps> = ({
  items,
  currentStep,
  onSelectStep,
  simCurrentTime,
  isSimulating,
  activeSheetName = 'AfterPlusL_v1'
}) => {
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);

  // 구동 시 활성 행으로 자동 스크롤
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  // 밸브 배지 렌더러
  const renderValveBadge = (val: string) => {
    if (val === 'O') {
      return (
        <span className="bg-emerald-950/80 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-800">
          O
        </span>
      );
    }
    if (val === 'C') {
      return <span style={{ color: 'var(--text-muted)' }}>C</span>;
    }
    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  };

  let accTimeSum = 0;

  return (
    <div className="flex-1 overflow-auto font-mono text-[11px] relative" style={{ backgroundColor: 'var(--bg-main)' }}>
      <table className="w-full border-collapse text-center whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>
        <thead style={{ color: 'var(--text-main)' }}>
          {/* 1행: 대제목 (전체 열 병합) */}
          <tr className="sticky-header-1 border-b text-xs font-bold" style={{ borderColor: 'var(--border-color)' }}>
            <th colSpan={22} className="py-1 px-3 text-left border-r" style={{ borderColor: 'var(--border-color)' }}>
              📊 GMS Standard Sequence Sheet : <span className="text-cyan-400">{activeSheetName}</span> (4-Header Industrial Protocol)
            </th>
          </tr>

          {/* 2행: 그룹 헤더 (STEP / TIMING·CONDITION / VALVE / ALARM) */}
          <tr className="sticky-header-2 border-b text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--border-color)', color: 'var(--text-sub)' }}>
            <th colSpan={5} className="py-1 border-r" style={{ borderColor: 'var(--border-color)' }}>STEP CLASSIFICATION</th>
            <th colSpan={3} className="py-1 border-r" style={{ borderColor: 'var(--border-color)' }}>TIMING & ADVANCE</th>
            <th colSpan={7} className="py-1 border-r" style={{ borderColor: 'var(--border-color)' }}>VALVE STATUS (O=OPEN, C=CLOSE, -=HOLD)</th>
            <th colSpan={7} className="py-1">ALARM MONITORING & REMARKS</th>
          </tr>

          {/* 3행: 단위 및 힌트 (Sec, etc.) */}
          <tr className="sticky-header-3 border-b text-[9px] font-normal" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>No.</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Text</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Flow</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Type</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Jump</th>
            <th className="border-r font-bold text-cyan-400" style={{ borderColor: 'var(--border-color)' }}>Sec</th>
            <th className="border-r font-bold text-cyan-400" style={{ borderColor: 'var(--border-color)' }}>Acc.Sec</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Mode</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V1</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V2</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V3</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V4</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V5</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V6</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>V7</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Sensor Tag</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Op</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Target Value</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Early</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Seq</th>
            <th className="border-r" style={{ borderColor: 'var(--border-color)' }}>Goto</th>
            <th>Remarks</th>
          </tr>

          {/* 4행: 실제 엑셀 열 이름 (시스템 파싱 기준 키) */}
          <tr className="sticky-header-4 border-b-2 font-bold text-[10px]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>S/No.</th>
            <th className="py-1 px-3 border-r text-left" style={{ borderColor: 'var(--border-color)' }}>Operations</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>Next Step</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>진행방식</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>Ack Goto</th>
            <th className="py-1 px-2 border-r text-cyan-400" style={{ borderColor: 'var(--border-color)' }}>Time (Sec)</th>
            <th className="py-1 px-2 border-r text-cyan-400" style={{ borderColor: 'var(--border-color)' }}>Acc,Time (Sec)</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>Cycle</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>PNV</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>GNV</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>PMV_A</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>LPI_A</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>HPI_A</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>HPV_A</th>
            <th className="py-1 px-2 border-r text-emerald-400" style={{ borderColor: 'var(--border-color)' }}>ESO_A1</th>
            <th className="py-1 px-2 border-r text-rose-400" style={{ borderColor: 'var(--border-color)' }}>Alarm Monitoring</th>
            <th className="py-1 px-2 border-r text-rose-400" style={{ borderColor: 'var(--border-color)' }}>비교연산자</th>
            <th className="py-1 px-2 border-r text-rose-400" style={{ borderColor: 'var(--border-color)' }}>설정명(비교대상ID)</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>조기통과</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>Alarm Seq.</th>
            <th className="py-1 px-2 border-r" style={{ borderColor: 'var(--border-color)' }}>Alarm Goto</th>
            <th className="py-1 px-3 text-left">Remarks</th>
          </tr>
        </thead>

        <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {items.map((step) => {
            const isActive = step.no === currentStep;
            const priorTime = accTimeSum;
            accTimeSum += (step.timeSec || 0);
            const liveAccTime = isActive ? (priorTime + simCurrentTime).toFixed(1) : accTimeSum.toFixed(0);

            // Time (Sec) 셀 실시간 렌더링
            const timeCellDisplay = isActive && isSimulating && step.advance !== '확인' ? (
              <div className="flex items-center justify-center space-x-1 font-bold text-cyan-300">
                <span className="animate-pulse">⏳</span>
                <span>{simCurrentTime.toFixed(1)}s</span>
                <span className="text-[9px] text-slate-400">/ {step.timeSec}s</span>
              </div>
            ) : (
              <span className={isActive ? 'text-cyan-400 font-bold' : ''}>{step.timeSec}</span>
            );

            return (
              <tr
                key={`excel-row-${step.no}`}
                ref={isActive ? activeRowRef : null}
                onClick={() => onSelectStep(step.no)}
                className={`cursor-pointer transition border-b ${
                  isActive ? 'step-active-row' : 'hover:bg-slate-800/20'
                }`}
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className={`py-1.5 px-2 font-bold ${isActive ? 'text-emerald-400' : ''}`}>{step.no}</td>
                <td className="py-1.5 px-3 text-left font-semibold" style={{ color: isActive ? '#6ee7b7' : 'var(--text-main)' }}>
                  {step.title}
                </td>
                <td className="py-1.5 px-2">{step.nextStep}</td>
                <td className="py-1.5 px-2">
                  {step.advance === '확인' ? (
                    <span className="bg-amber-950/70 text-amber-300 px-1 py-0.2 rounded font-bold border border-amber-800">확인</span>
                  ) : (
                    '자동'
                  )}
                </td>
                <td className="py-1.5 px-2" style={{ color: 'var(--text-muted)' }}>{step.ackGoto || '-'}</td>
                <td className="py-1.5 px-2 bg-slate-900/30">{timeCellDisplay}</td>
                <td className="py-1.5 px-2 font-bold" style={{ color: isActive ? '#38bdf8' : 'var(--text-sub)' }}>
                  {liveAccTime}
                </td>
                <td className="py-1.5 px-2" style={{ color: 'var(--text-muted)' }}>{step.cycle || '-'}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.PNV)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.GNV)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.PMV_A)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.LPI_A)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.HPI_A)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.HPV_A)}</td>
                <td className="py-1.5 px-2">{renderValveBadge(step.valves?.ESO_A1)}</td>
                <td className="py-1.5 px-2 font-mono font-semibold text-cyan-400">{step.alarmMon || '-'}</td>
                <td className="py-1.5 px-2 font-mono">{step.op || '-'}</td>
                <td className="py-1.5 px-2 font-mono">{step.targetVal || '-'}</td>
                <td className="py-1.5 px-2">
                  {step.earlyPass === 'Y' ? <span className="text-emerald-400 font-bold">Y</span> : step.earlyPass || '-'}
                </td>
                <td className="py-1.5 px-2" style={{ color: 'var(--text-muted)' }}>{step.alarmSeq || '-'}</td>
                <td className="py-1.5 px-2 text-rose-400 font-bold">{step.alarmGoto || '-'}</td>
                <td className="py-1.5 px-3 text-left text-[10px] truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  {step.remarks || ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
