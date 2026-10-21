export type AdvanceMode = '자동' | '확인' | '수동' | 'ACK';

export interface StepSequenceItem {
  no: number | string;                // S/No. (예: 1, 2, "7A")
  mainStep?: number | string;         // Main Step 대분류
  subStep?: number | string;          // Sub Step 소분류
  title: string;                      // Operations 공정명
  advance: AdvanceMode;               // 진행방식 (자동 / 확인)
  nextStep: number | string;          // Next Step (조건 참일 때 또는 다음 스텝)
  ackGoto?: number | string;          // Ack Goto (확인 터치 시 이동)
  timeSec: number;                    // Time (Sec)
  accTimeSec?: number;                // Acc,Time (Sec)
  cycle?: string;                     // Cycle (메모 또는 CAPTURE:<태그>)
  valves: Record<string, string>;     // 밸브 상태 (O, C, -, O+2, C+2 등)
  alarmMon?: string;                  // Alarm Monitoring (VPT, LPT_{side}, 진행횟수, Option 등)
  op?: string;                        // 비교연산자 (<=, >=, ==, ON, OFF, ZERO 등)
  targetVal?: string;                 // 설정명(비교대상ID)
  earlyPass?: string;                 // 조기통과 (Y / N)
  alarmSeq?: number | string;         // Alarm Seq (1:초기화, 2:일시정지, 3:셧다운)
  alarmGoto?: number | string;        // Alarm Goto (조건 불만족 시 이동 스텝)
  alarmMessage?: string;              // Alarm Message
  remarks?: string;                   // Remarks 비고
  blockType?: string;                 // 8대 스마트 블록 식별자
}

export type BlockCategory =
  | 'VALVE'           // 1. 밸브 제어 블록
  | 'TIMER_EARLYPASS' // 2. 대기 & 조기통과 블록
  | 'MANUAL_ACK'      // 3. 작업자 확인 블록
  | 'CONDITION'       // 4. 센서 조건 판정 블록
  | 'SPECIAL_ACTION'  // 5. 특수 계측 / 보정 (CAPTURE, ZERO, CAPOFFSET)
  | 'LOOP_CYCLE'      // 6. N회 반복 루프
  | 'OPTION_BRANCH'   // 7. 장비 옵션 분기
  | 'ALARM_SHUTDOWN'; // 8. 알람 대응 & 비상정지

export interface BlockDefinition {
  type: string;
  category: BlockCategory;
  name: string;
  description: string;
  icon: string;
  defaultItem: Partial<StepSequenceItem>;
}
