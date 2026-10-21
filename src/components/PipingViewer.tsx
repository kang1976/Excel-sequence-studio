import React from 'react';

interface PipingViewerProps {
  valves: Record<string, string>;
  onToggleValve: (tag: string) => void;
  sensorValues?: {
    vpt?: string;
    lpta?: string;
    hpta?: string;
    fpt?: string;
  };
  isSimulating?: boolean;
}

// GC01.json 기반 정확한 밸브 좌표 데이터
const MASTER_VALVES = [
  { tag: 'VN2', x: 80, y: 99.4, dir: 'v' },
  { tag: 'VN1', x: 78.9, y: 165, dir: 'v' },
  { tag: 'PNV', x: 150, y: 119, dir: 'v' },
  { tag: 'GNV', x: 221, y: 119, dir: 'v' },
  { tag: 'HPIV', x: 836, y: 119, dir: 'v' },
  { tag: 'PNBV', x: 916, y: 119, dir: 'v' },
  { tag: 'PIV', x: 916, y: 256, dir: 'v' },
  { tag: 'PMV_A', x: 367, y: 256, dir: 'v' },
  { tag: 'LPI_A', x: 367, y: 337, dir: 'v' },
  { tag: 'LPV_A', x: 325, y: 365, dir: 'h' },
  { tag: 'HPI_A', x: 367, y: 527, dir: 'v' },
  { tag: 'HPV_A', x: 324.7, y: 564.7, dir: 'h' },
  { tag: 'PGII_A', x: 428.4, y: 653.4, dir: 'v' },
  { tag: 'PGI_A', x: 367.5, y: 709.6, dir: 'v' },
  { tag: 'ESO_A1', x: 283.5, y: 644.7, dir: 'h' },
  { tag: 'PMV_B', x: 700, y: 253, dir: 'v' },
  { tag: 'LPI_B', x: 700, y: 337, dir: 'v' },
  { tag: 'LPV_B', x: 655.1, y: 364.9, dir: 'h' },
  { tag: 'HPI_B', x: 700, y: 527, dir: 'v' },
  { tag: 'HPV_B', x: 655.1, y: 564.6, dir: 'h' },
  { tag: 'PGII_B', x: 760.4, y: 654.5, dir: 'v' },
  { tag: 'PGI_B', x: 700.8, y: 709.5, dir: 'v' },
  { tag: 'ESO_B1', x: 612.8, y: 646.6, dir: 'h' }
];

export const PipingViewer: React.FC<PipingViewerProps> = ({
  valves,
  onToggleValve,
  sensorValues = { vpt: '-84.2', lpta: '-18.2', hpta: '0.02', fpt: '48.9' },
  isSimulating = false
}) => {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center p-3 select-none overflow-hidden"
      style={{ backgroundColor: 'var(--canvas-bg)' }}
    >
      {/* 
        실제 현장 HMI 마스터 배관도 100% 완전체 SVG
        어느 한 군데도 끊어짐 없는 공식 검증 도면
      */}
      <svg
        id="masterPidSvg"
        viewBox="36.2188 22 914.7813 817.2626"
        className="w-full h-full max-h-[660px] drop-shadow-md"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>{`
            .pipe {
              stroke: var(--pipe-base);
              stroke-width: 4.5;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: miter;
              transition: stroke 0.25s ease;
            }
            .pipe-thin {
              stroke: var(--pipe-base);
              stroke-width: 2.5;
              fill: none;
              stroke-linecap: round;
            }
            .text-label {
              font-size: 13px;
              font-family: Arial, sans-serif;
              font-weight: bold;
              fill: var(--text-main);
              text-anchor: middle;
            }
            .text-left-side { text-anchor: end; }
            .text-right-side { text-anchor: start; }
            .filter-sym {
              fill: var(--bg-surface);
              stroke: var(--pipe-base);
              stroke-width: 2.5;
            }
            .regulator-sym {
              fill: var(--bg-subtle);
              stroke: var(--pipe-base);
              stroke-width: 2.5;
            }
            .valve-bowtie {
              cursor: pointer;
              transition: transform 0.15s ease, filter 0.2s ease;
            }
            .valve-bowtie:hover {
              transform: scale(1.15);
            }
          `}</style>
        </defs>

        {/* ========================================================================= */}
        {/* 1. 완전체 메인 배관선망 (단 한 군데도 끊어지지 않은 원본 파이프라인 전체) */}
        {/* ========================================================================= */}
        <g id="pipesBaseLayer">
          <path d="M 150 203.425 L 150 134.769" className="pipe" />
          <path d="M 221.226 135.681 L 221.226 562.431" className="pipe" />
          <path d="M 366.999 144 L 367 693.565" className={`pipe ${valves.PMV_A === 'O' ? 'pipe-active' : ''}`} />
          <path d="M 700.295 173 L 700.295 693.901" className={`pipe ${valves.PMV_B === 'O' ? 'pipe-active' : ''}`} />
          <path d="M 551.537 205.518 L 551.537 564.068" className="pipe" />
          <path d="M 509.828 144 L 699.411 144" className="pipe" />
          <path d="M 276.123 365 L 308.501 365" className="pipe" />
          <path d="M 221.34 365 L 257.842 365" className="pipe" />
          <path d="M 340.953 365.001 L 366.758 365.001" className="pipe" />
          <path d="M 836 136.308 L 836 293.352" className="pipe" />
          <path d="M 916 239.385 L 915.999 622" className={`pipe ${valves.GNV === 'O' ? 'pipe-active stroke-emerald-500' : ''}`} />
          <path d="M 940 95 L 975 95 L 975 155 L 940 155" className="pipe-thin" transform="matrix(1, 0, 0, 1, -24.000002, -6)" />
          
          {/* 상단 화살표 인출구들 */}
          <path d="M 74 64.002 L 80 54.002 L 86 64.002" className="pipe" />
          <path d="M 144 64.002 L 150 54.002 L 156 64.002" className="pipe" />
          <path d="M 485 64.002 L 491 54.002 L 497 64.002" className="pipe" />
          <path d="M 368.312 173 L 700.12 173" className="pipe" />
          <path d="M 699.999 143.231 L 700 58.232" className="pipe" />
          <path d="M 693.514 63.002 L 699.514 53.002 L 705.514 63.002" className="pipe" />
          
          {/* 배관 연결 세로선 및 가로선 */}
          <path d="M 80.308 83.747 L 80.308 57.002" className="pipe" />
          <path d="M 80.308 204.014 L 80.308 180.681" className="pipe" />
          <path d="M 149.846 101.616 L 149.846 57.002" className="pipe" />
          <path d="M 829.746 53.002 L 835.746 63.002 L 841.746 53.002" className="pipe" />
          <path d="M 835.746 102.918 L 835.746 58.302" className="pipe" />
          <path d="M 368.99 143.966 L 481.753 143.966" className="pipe" />
          <path d="M 910 53.002 L 916 63.002 L 922 53.002" className="pipe" />
          <path d="M 915.998 102.764 L 915.999 58.152" className="pipe" />
          <path d="M 916.002 239.033 L 916 198.689" className="pipe" />
          <path d="M 915.998 179.701 L 915.999 135.085" className="pipe" />
          <path d="M 276.124 564.699 L 308.502 564.699" className="pipe" />
          <path d="M 221.34 564.7 L 257.842 564.7" className="pipe" />
          <path d="M 341.543 564.7 L 366.759 564.7" className="pipe" />
          <path d="M 606.516 364.867 L 638.894 364.867" className="pipe" />
          <path d="M 551.729 364.868 L 591.383 364.868" className="pipe" />
          <path d="M 671.346 364.867 L 697.151 364.867" className="pipe" />
          <path d="M 606.507 564.549 L 638.884 564.548" className="pipe" />
          <path d="M 551.731 564.585 L 593.658 564.585" className="pipe" />
          <path d="M 671.346 564.561 L 697.15 564.562" className="pipe" />
          <path d="M 377.309 204.988 L 551.261 204.988" className="pipe" />
          <path d="M 80.964 204.988 L 355.601 204.988" className="pipe" />
          <path d="M 221.754 87.761 L 489.942 87.761" className="pipe" />
          <path d="M 221.226 102.205 L 221.226 87.632" className="pipe" />
          <path d="M 491.024 86.889 L 491.024 59.942" className="pipe" />
          <path d="M 775.695 295.117 L 914.875 295.116" className="pipe" />
          <path d="M 775.522 294.142 L 775.522 280.27" className="pipe" />
          <rect x="769.397" y="273.742" width="11.782" height="5.302" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="1" />
          <path d="M 836 136.308 L 836 293.352" className="pipe" />
          <path d="M 276.124 564.699 L 308.502 564.699" className="pipe" />
          <path d="M 427.396 639.097 L 427.396 625.572" className="pipe" />
          <path d="M 427.118 623.76 L 690.413 623.752" className="pipe" />
          <path d="M 427.355 623.76 L 427.355 636.441" className="pipe" />
          <path d="M 709.635 623.76 L 916.763 623.752" className="pipe" />
          <path d="M 427.354 747.233 L 427.361 670.677" className="pipe" />
          <path d="M 367.733 749.003 L 427.396 749.001" className="pipe" />
          <path d="M 760.438 637.353 L 760.437 624.417" className="pipe" />
          <path d="M 760.573 747.321 L 760.58 670.765" className="pipe" />
          <path d="M 700.466 749.003 L 760.44 749.001" className="pipe" />
          <path d="M 255.699 646.073 L 366.964 646.069" className="pipe" />
          <path d="M 254.907 656.389 L 254.908 647.057" className="pipe" />
          <path d="M 587.258 646.073 L 698.001 646.069" className="pipe" />
          <path d="M 586.466 656.389 L 586.467 647.057" className="pipe" />
          <path d="M 366.366 748.72 L 366.368 726.116" className="pipe" />
          <path d="M 690.27 623.173 C 691.846 634.552 709.98 633.676 709.98 623.172" className="pipe" />
          <path d="M 356.508 205.115 C 358.084 216.494 376.218 215.618 376.218 205.114" className="pipe" />
          <path d="M 80.42 146.641 L 80.42 116.726" className="pipe" />
        </g>

        {/* ========================================================================= */}
        {/* 2. 정적 기호 레이어 (체크밸브, 필터, 레귤레이터, 실린더 용기, 라벨) */}
        {/* ========================================================================= */}
        <g id="staticPartsLayer">
          {/* 체크밸브 CV3A */}
          <g transform="matrix(1, 0, 0, 1, 17.423658, 176.26178)">
            <polygon points="241.576 188.738 256.576 178.738 256.576 198.738" fill="var(--bg-surface)" stroke="var(--pipe-base)" strokeWidth="1.8" />
            <path d="M 241.576 181.738 L 241.576 195.738" stroke="var(--pipe-base)" strokeWidth="2" />
            <text x="267.15" y="214.738" className="text-label text-left-side" style={{ fill: '#b25900', fontSize: '13px' }}>CV3A</text>
          </g>
          {/* 체크밸브 CV2A */}
          <g transform="matrix(1, 0, 0, 1, 17.423658, 176.26178)">
            <polygon points="241.576 388.738 256.576 378.738 256.576 398.738" fill="var(--bg-surface)" stroke="var(--pipe-base)" strokeWidth="1.8" />
            <path d="M 241.576 381.738 L 241.576 395.738" stroke="var(--pipe-base)" strokeWidth="2" />
            <text x="265.15" y="414.438" className="text-label text-left-side" style={{ fill: '#b25900', fontSize: '13px' }}>CV2A</text>
          </g>
          {/* 체크밸브 CV3B */}
          <g transform="matrix(1, 0, 0, 1, 17.423658, 176.26178)">
            <polygon points="591.576 178.738 576.576 188.738 591.576 198.738" fill="var(--bg-surface)" stroke="var(--pipe-base)" strokeWidth="1.8" />
            <path d="M 575.576 181.738 L 575.576 195.738" stroke="var(--pipe-base)" strokeWidth="2" />
            <text x="599.541" y="214.605" className="text-label text-left-side" style={{ fill: '#b25900', fontSize: '13px' }}>CV3B</text>
          </g>
          {/* 체크밸브 CV2B */}
          <g transform="matrix(1, 0, 0, 1, 17.423658, 176.26178)">
            <polygon points="591.576 378.738 576.576 388.738 591.576 398.738" fill="var(--bg-surface)" stroke="var(--pipe-base)" strokeWidth="1.8" />
            <path d="M 576.576 381.739 L 576.576 395.739" stroke="var(--pipe-base)" strokeWidth="2" />
            <text x="599.541" y="414.305" className="text-label text-left-side" style={{ fill: '#b25900', fontSize: '13px' }}>CV2B</text>
          </g>
          {/* 체크밸브 CV1 */}
          <g transform="matrix(1, 0, 0, 1, -24.000002, -6)">
            <polygon points="930 188 950 188 940 203" fill="var(--bg-surface)" stroke="var(--pipe-base)" strokeWidth="1.8" />
            <path d="M 933 206 L 947 206" stroke="var(--pipe-base)" strokeWidth="2" />
            <text x="927.227" y="222" className="text-label text-left-side" style={{ fill: '#b25900', fontSize: '13px' }}>CV1</text>
          </g>

          {/* 필터 LF2 */}
          <g>
            <text x="498.178" y="128.124" className="text-label" style={{ fontSize: '11px' }}>LF2</text>
            <rect x="485" y="134" width="26" height="20" className="filter-sym" />
            <polygon points="489 136 489 153 509 144" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="1" />
          </g>

          {/* 필터 LF1A */}
          <g>
            <g transform="matrix(1, 0, 0, 1, 0, -28)">
              <rect x="209.272" y="610.23" width="26.149" height="20" className="filter-sym" transform="matrix(0, -1, 1, 0, -252.009918, 849.00177)" />
              <polygon points="368.4 615.4 377 637.6 359.9 637.6" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="0.8" />
            </g>
            <text x="398.838" y="601.361" className="text-label" style={{ fontSize: '11px' }}>LF1A</text>
          </g>

          {/* 필터 LF1B */}
          <g transform="matrix(1, 0, 0, 1, 1, 0)">
            <g transform="matrix(1, 0, 0, 1, 330.157318, -28)">
              <rect x="209.272" y="610.23" width="26.149" height="20" className="filter-sym" transform="matrix(0, -1, 1, 0, -252.009918, 849.00177)" />
              <polygon points="368.4 615.4 377 637.6 359.9 637.6" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="0.8" />
            </g>
            <text x="729.025" y="601.361" className="text-label" style={{ fontSize: '11px' }}>LF1B</text>
          </g>

          {/* 레귤레이터 REG2A, REG1A */}
          <g transform="matrix(1, 0, 0, 1, 67, 27)">
            <circle cx="300" cy="370" r="16" className="regulator-sym" />
            <circle cx="300" cy="370" r="8" fill="none" stroke="var(--pipe-base)" />
            <text x="314.693" y="392" className="text-label text-right-side">REG2A</text>
          </g>
          <g transform="matrix(1, 0, 0, 1, 67, 27)">
            <circle cx="300" cy="430" r="16" className="regulator-sym" />
            <circle cx="300" cy="430" r="8" fill="none" stroke="var(--pipe-base)" />
            <text x="314.693" y="456" className="text-label text-right-side">REG1A</text>
          </g>

          {/* 레귤레이터 REG2B, REG1B */}
          <g transform="matrix(1, 0, 0, 1, 0, -6)">
            <circle cx="700" cy="403" r="16" className="regulator-sym" />
            <circle cx="700" cy="403" r="8" fill="none" stroke="var(--pipe-base)" />
            <text x="758.002" y="425" className="text-label text-left-side">REG2B</text>
          </g>
          <g transform="matrix(1, 0, 0, 1, 0, -6)">
            <circle cx="700" cy="463" r="16" className="regulator-sym" />
            <circle cx="700" cy="463" r="8" fill="none" stroke="var(--pipe-base)" />
            <text x="758.002" y="489" className="text-label text-left-side">REG1B</text>
          </g>

          {/* 실린더 CYL-A / CYL-B 가스용기 외형 */}
          <g transform="matrix(1, 0, 0, 1, 1, 30.790619)">
            <rect x="219.895" y="636.569" width="68" height="171.903" fill="#334155" stroke="var(--pipe-base)" strokeWidth="2.5" rx="34" ry="34" />
            <rect x="246.557" y="626.585" width="14.705" height="10.504" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="1.5" />
            <text x="254" y="730" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">CYL-A</text>
          </g>
          <g transform="matrix(1, 0, 0, 1, 332.558685, 30.790619)">
            <rect x="219.895" y="636.569" width="68" height="171.903" fill="#334155" stroke="var(--pipe-base)" strokeWidth="2.5" rx="34" ry="34" />
            <rect x="246.557" y="626.585" width="14.705" height="10.504" fill="#94a3b8" stroke="var(--pipe-base)" strokeWidth="1.5" />
            <text x="254" y="730" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">CYL-B</text>
          </g>

          {/* 상단 텍스트 라벨들 */}
          <text x="80" y="34.002" className="text-label">PUMP</text>
          <text x="150" y="34.002" className="text-label">VENT</text>
          <text x="490.386" y="34.182" className="text-label">CAL VENT</text>
          <text x="699.565" y="34.182" className="text-label">PROCESS</text>
          <text x="836" y="34.002" className="text-label">L/C He</text>
          <text x="916" y="34.002" className="text-label">SN2</text>
        </g>

        {/* ========================================================================= */}
        {/* 3. 인터랙티브 밸브 레이어 (GC01.json 기반 실좌표계 및 bowtie 심볼 렌더링) */}
        {/* ========================================================================= */}
        <g id="valveLayer">
          {MASTER_VALVES.map(v => {
            const state = valves[v.tag] || 'C';
            const isOpen = state === 'O';
            const d = v.dir === 'v'
              ? 'M-8,-12 L0,0 L8,-12 Z M-8,12 L0,0 L8,12 Z'
              : 'M-12,-8 L0,0 L-12,8 Z M12,-8 L0,0 L12,8 Z';

            return (
              <g
                key={`valve-${v.tag}`}
                transform={`translate(${v.x}, ${v.y})`}
                onClick={() => onToggleValve(v.tag)}
                className="valve-bowtie"
              >
                <path
                  d={d}
                  className={isOpen ? 'valve-open' : 'valve-closed'}
                  strokeWidth="2"
                />
                <text
                  x={v.dir === 'h' ? 0 : 24}
                  y={v.dir === 'h' ? -14 : 4}
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor={v.dir === 'h' ? 'middle' : 'start'}
                >
                  {v.tag}
                </text>
              </g>
            );
          })}
        </g>

        {/* ========================================================================= */}
        {/* 4. 디지털 압력 계측기 인디케이터 (PT Layer) */}
        {/* ========================================================================= */}
        <g id="ptLayer">
          {/* VPT (진공 압력) */}
          <g transform="translate(180, 240)">
            <rect width="84" height="28" fill="var(--bg-surface)" stroke="#0284c7" strokeWidth="2" rx="4" />
            <text x="42" y="19" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{sensorValues.vpt || '-84.2'}</text>
            <text x="42" y="-6" fill="var(--text-sub)" fontSize="11" fontWeight="bold" textAnchor="middle">VPT (Torr)</text>
          </g>

          {/* LPT_A (저압 A) */}
          <g transform="translate(245, 345)">
            <rect width="84" height="28" fill="var(--bg-surface)" stroke="#0284c7" strokeWidth="2" rx="4" />
            <text x="42" y="19" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{sensorValues.lpta || '-18.2'}</text>
            <text x="42" y="-6" fill="var(--text-sub)" fontSize="11" fontWeight="bold" textAnchor="middle">LPT_A (Torr)</text>
          </g>

          {/* HPT_A (고압 A) */}
          <g transform="translate(245, 515)">
            <rect width="84" height="28" fill="var(--bg-surface)" stroke="#0284c7" strokeWidth="2" rx="4" />
            <text x="42" y="19" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{sensorValues.hpta || '0.02'}</text>
            <text x="42" y="-6" fill="var(--text-sub)" fontSize="11" fontWeight="bold" textAnchor="middle">HPT_A (MPa)</text>
          </g>

          {/* FPT (유량) */}
          <g transform="translate(450, 80)">
            <rect width="84" height="28" fill="var(--bg-surface)" stroke="#0284c7" strokeWidth="2" rx="4" />
            <text x="42" y="19" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{sensorValues.fpt || '48.9'}</text>
            <text x="42" y="-6" fill="var(--text-sub)" fontSize="11" fontWeight="bold" textAnchor="middle">FPT (sccm)</text>
          </g>
        </g>
      </svg>

      {/* 우측 하단 컨트롤러 정보 배지 */}
      <div
        className="absolute bottom-3 right-4 border rounded-lg p-2.5 shadow-md flex items-center space-x-3 text-xs"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span style={{ color: 'var(--text-main)' }} className="font-semibold">밸브 열림 (OPEN)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: 'var(--valve-close)', borderColor: 'var(--valve-stroke)' }} />
          <span style={{ color: 'var(--text-muted)' }} className="font-semibold">밸브 닫힘 (CLOSE)</span>
        </div>
        <div className="h-3.5 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
        <span className="text-blue-500 font-mono font-bold">1:1 타겟 캡처 준비됨</span>
      </div>
    </div>
  );
};
