import { BlockDefinition } from '../types/sequence';

export const STANDARD_BLOCKS: BlockDefinition[] = [
  {
    type: 'VALVE_CONTROL',
    category: 'VALVE',
    name: '밸브 개폐 제어',
    description: '지정 밸브를 열거나 닫으며 배관 흐름을 제어합니다 (A/B측 {side} 지원)',
    icon: '🚰',
    defaultItem: {
      title: '밸브 개폐 조작',
      advance: '자동',
      timeSec: 5,
      valves: { PNV: 'O', GNV: 'C', PMV_A: 'O' }
    }
  },
  {
    type: 'TIMER_EARLYPASS',
    category: 'TIMER_EARLYPASS',
    name: '대기 및 조기통과',
    description: '일정 시간 대기하며, 조건 만족 시 조기 통과(earlyPass: Y)합니다',
    icon: '⏱️',
    defaultItem: {
      title: '배관 안정화 대기',
      advance: '자동',
      timeSec: 20,
      earlyPass: 'Y'
    }
  },
  {
    type: 'MANUAL_ACK',
    category: 'MANUAL_ACK',
    name: '작업자 수동 확인',
    description: '현장 작업자가 화면의 확인(ACK) 버튼을 누를 때까지 안전 대기합니다',
    icon: '👤',
    defaultItem: {
      title: '작업자 실린더 체결 확인',
      advance: '확인',
      timeSec: 0,
      ackGoto: '-'
    }
  },
  {
    type: 'CONDITION_CHECK',
    category: 'CONDITION',
    name: '센서 조건 판정',
    description: '진공(VPT) 또는 압력(LPT) 센서값이 기준치를 만족하는지 검사합니다',
    icon: '🔍',
    defaultItem: {
      title: '진공 도달 감시',
      advance: '자동',
      timeSec: 15,
      alarmMon: 'VPT',
      op: '<=',
      targetVal: '-80.0'
    }
  },
  {
    type: 'SPECIAL_ACTION',
    category: 'SPECIAL_ACTION',
    name: '특수 계측 & 보정',
    description: '초기값 캡처(CAPTURE), 0점 보정(ZERO), 누출시험(CAPOFFSET)을 실행합니다',
    icon: '⚙️',
    defaultItem: {
      title: '초기 압력 캡처 및 누출 시험',
      advance: '자동',
      timeSec: 60,
      cycle: 'CAPTURE:HPT_{side}',
      alarmMon: 'HPT_{side}:CAPOFFSET',
      op: '<',
      targetVal: '0.05'
    }
  },
  {
    type: 'LOOP_CYCLE',
    category: 'LOOP_CYCLE',
    name: 'N회 반복 루프',
    description: 'N2 퍼지 등 동일 구간을 지정 횟수(Cycle)만큼 반복 후 다음으로 진행합니다',
    icon: '🔁',
    defaultItem: {
      title: 'N2 Purge 3회 반복',
      advance: '자동',
      timeSec: 5,
      alarmMon: '진행횟수',
      op: '>=',
      targetVal: '설정횟수'
    }
  },
  {
    type: 'OPTION_BRANCH',
    category: 'OPTION_BRANCH',
    name: '장비 옵션 분기',
    description: 'Bypass사용 또는 고압HELeakCheck 옵션 ON/OFF 상태에 따라 분기합니다',
    icon: '🔀',
    defaultItem: {
      title: 'Bypass 옵션 분기',
      advance: '자동',
      timeSec: 0,
      alarmMon: 'Bypass사용',
      op: 'OFF'
    }
  },
  {
    type: 'ALARM_SHUTDOWN',
    category: 'ALARM_SHUTDOWN',
    name: '알람 비상정지',
    description: '이상 감지 시 전 밸브 차단 및 비상 안전 정지(Alarm Seq. 1/2/3)를 수행합니다',
    icon: '🚨',
    defaultItem: {
      title: '비상 안전 차단 정지',
      advance: '자동',
      timeSec: 0,
      alarmSeq: 3,
      alarmGoto: 99,
      alarmMessage: '이상 감지 비상 전 밸브 차단'
    }
  }
];

// 플러그인 확장 레지스트리 (새 블록을 동적으로 등록 가능)
class BlockRegistry {
  private blocks: Map<string, BlockDefinition> = new Map();

  constructor() {
    STANDARD_BLOCKS.forEach(b => this.blocks.set(b.type, b));
  }

  public register(block: BlockDefinition) {
    this.blocks.set(block.type, block);
  }

  public getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  public get(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }
}

export const blockRegistry = new BlockRegistry();
