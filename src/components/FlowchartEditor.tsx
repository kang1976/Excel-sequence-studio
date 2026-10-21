import React from 'react';
import { StepSequenceItem } from '../types/sequence';
import { blockRegistry } from '../core/blockRegistry';

interface FlowchartEditorProps {
  items: StepSequenceItem[];
  currentStep: number | string;
  onSelectStep: (no: number | string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
  onAddNewStep: (blockType?: string) => void;
  simCurrentTime: number;
}

export const FlowchartEditor: React.FC<FlowchartEditorProps> = ({
  items,
  currentStep,
  onSelectStep,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddNewStep,
  simCurrentTime
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs" style={{ backgroundColor: 'var(--bg-main)' }}>
      {items.map((step, index) => {
        const isActive = step.no === currentStep;
        const progressPct = isActive && step.timeSec > 0
          ? Math.min(100, (simCurrentTime / step.timeSec) * 100).toFixed(0)
          : 0;

        const openValves = Object.entries(step.valves || {})
          .filter(([_, v]) => v === 'O')
          .map(([k]) => k)
          .join(', ');

        return (
          <React.Fragment key={`step-${step.no}-${index}`}>
            <div
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('button')) {
                  onSelectStep(step.no);
                }
              }}
              className={`p-3 rounded-lg border transition cursor-pointer relative overflow-hidden ${
                isActive ? 'step-active-flow shadow-md' : 'hover:shadow-xs'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--flow-active-bg)' : 'var(--bg-surface)',
                borderColor: isActive ? 'var(--flow-active-border)' : 'var(--border-color)'
              }}
            >
              {/* 활성 스텝 하단 프로그레스 바 게이지 */}
              {isActive && step.advance !== '확인' && (
                <div
                  className="absolute left-0 bottom-0 h-1 bg-emerald-500 timer-progress-bar"
                  style={{ width: `${progressPct}%` }}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span
                    className="font-bold text-xs"
                    style={{ color: isActive ? '#34d399' : 'var(--text-main)' }}
                  >
                    Step {step.no}: {step.title}
                  </span>
                </div>

                {/* 편집 조작 버튼군 (▲, ▼, ✕) */}
                <div className="flex items-center space-x-0.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono border mr-1 font-bold ${
                      isActive ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : ''
                    }`}
                    style={
                      !isActive
                        ? {
                            backgroundColor: 'var(--bg-accent)',
                            color: 'var(--text-sub)',
                            borderColor: 'var(--border-color)'
                          }
                        : {}
                    }
                  >
                    {isActive && step.advance !== '확인'
                      ? `⏳ ${simCurrentTime.toFixed(1)}s / ${step.timeSec}s`
                      : step.advance === '확인'
                      ? '수동(ACK)'
                      : `${step.timeSec}s`}
                  </span>
                  <button
                    onClick={() => onMoveUp(index)}
                    className="w-4 h-4 rounded flex items-center justify-center text-[10px] border"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                    title="위로 이동"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onMoveDown(index)}
                    className="w-4 h-4 rounded flex items-center justify-center text-[10px] border"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                    title="아래로 이동"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="w-4 h-4 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 flex items-center justify-center text-[10px] border border-rose-800 ml-0.5"
                    title="스텝 삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="text-[11px] mt-1.5 truncate" style={{ color: 'var(--text-sub)' }}>
                열림 밸브: <span className="text-emerald-400 font-bold">{openValves || '전 밸브 CLOSE'}</span>
              </div>
              <div className="text-[10px] text-cyan-400 mt-0.5 font-mono">
                감시 조건: {step.alarmMon || '-'} {step.op || ''} {step.targetVal || ''}
              </div>
            </div>

            {/* 화살표 연결선 */}
            {index < items.length - 1 && (
              <div
                className="flex justify-center text-xs py-0.5 select-none font-mono"
                style={{ color: 'var(--text-muted)' }}
              >
                ↓ [Next Step {items[index + 1].no}]
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
