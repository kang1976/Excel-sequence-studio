import * as XLSX from 'xlsx';
import { StepSequenceItem } from '../types/sequence';

export class DynamicExcelEngine {
  // 1. JSON ➔ 표준 4행 헤더 엑셀 워크북 생성
  public static exportToWorkbook(items: StepSequenceItem[], sheetName = 'AfterPlusL_v1'): XLSX.WorkBook {
    const wb = XLSX.utils.book_new();

    // 밸브 컬럼 목록 추출
    const valveKeySet = new Set<string>();
    items.forEach(item => {
      Object.keys(item.valves || {}).forEach(k => valveKeySet.add(k));
    });
    const valveColumns = Array.from(valveKeySet);
    if (valveColumns.length === 0) {
      valveColumns.push('PNV', 'GNV', 'PMV_A', 'LPI_A', 'HPI_A', 'HPV_A', 'ESO_A1');
    }

    // 4행 헤더 매트릭스 구성
    const rows: any[][] = [];

    // 1행: 대제목 (단일 병합 행)
    const titleRow = [`GMS Standard Sequence Sheet : ${sheetName}`];
    rows.push(titleRow);

    // 2행: 그룹 헤더
    const groupRow = [
      'STEP', '', '', '', '',
      'TIMING / CONDITION', '', '',
      ...valveColumns.map(() => 'VALVE (O=Open, C=Close, 공백=이전 상태 유지)'),
      'ALARM / REMARKS', '', '', '', '', '', ''
    ];
    rows.push(groupRow);

    // 3행: 단위 힌트 행
    const unitRow = [
      '', '', '', '', '',
      'Sec', 'Sec', '',
      ...valveColumns.map(() => ''),
      '', '', '', '', '', '', ''
    ];
    rows.push(unitRow);

    // 4행: 실제 열 이름 (동적 파싱 기준 키)
    const headerRow = [
      'S/No.', 'Main Step', 'Sub Step', 'Next Step', 'Operations',
      'Time (Sec)', 'Acc,Time (Sec)', '진행방식',
      ...valveColumns,
      'Cycle', 'Alarm Monitoring', '비교연산자', '설정명(비교대상ID)', '조기통과', 'Alarm Seq.', 'Alarm Goto', 'Remarks'
    ];
    rows.push(headerRow);

    // 5행부터: 실제 데이터 행
    let accTime = 0;
    items.forEach(item => {
      accTime += (item.timeSec || 0);
      const dataRow = [
        item.no,
        item.mainStep || '',
        item.subStep || '',
        item.nextStep,
        item.title,
        item.timeSec,
        accTime,
        item.advance,
        ...valveColumns.map(v => item.valves[v] || ''),
        item.cycle || '',
        item.alarmMon || '',
        item.op || '',
        item.targetVal || '',
        item.earlyPass || '',
        item.alarmSeq || '',
        item.alarmGoto || '',
        item.remarks || ''
      ];
      rows.push(dataRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return wb;
  }

  // 2. 표준 엑셀 파일 다운로드
  public static downloadExcel(items: StepSequenceItem[], filename = 'Sequence_Standard_Template.xlsx') {
    const wb = this.exportToWorkbook(items);
    XLSX.writeFile(wb, filename);
  }

  // 3. 엑셀 ArrayBuffer ➔ StepSequenceItem[] 파싱
  public static parseExcelBuffer(data: ArrayBuffer): { sheetName: string; items: StepSequenceItem[] } {
    const wb = XLSX.read(data, { type: 'array' });
    const sheetName = wb.SheetNames[0] || 'Sheet1';
    const ws = wb.Sheets[sheetName];
    const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rawRows.length < 4) {
      throw new Error('올바른 표준 4행 헤더 엑셀 파일이 아닙니다.');
    }

    // 4행(인덱스 3)에서 열 이름 매핑 탐색
    const headerRow = rawRows[3].map(h => String(h || '').trim());
    const colMap: Record<string, number> = {};
    headerRow.forEach((colName, idx) => {
      if (colName) colMap[colName] = idx;
    });

    const items: StepSequenceItem[] = [];

    for (let r = 4; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const noVal = row[colMap['S/No.']];
      if (noVal === undefined || noVal === null || String(noVal).trim() === '') continue;

      // 밸브 열들 감지 (고정 열 제외한 나머지 열)
      const fixedKeys = new Set([
        'S/No.', 'Main Step', 'Sub Step', 'Next Step', 'Operations',
        'Time (Sec)', 'Acc,Time (Sec)', '진행방식', 'Cycle', 'Alarm Monitoring',
        '비교연산자', '설정명(비교대상ID)', '조기통과', 'Alarm Seq.', 'Alarm Goto', 'Remarks'
      ]);

      const valves: Record<string, string> = {};
      Object.entries(colMap).forEach(([k, idx]) => {
        if (!fixedKeys.has(k)) {
          const v = String(row[idx] || '').trim();
          if (v) valves[k] = v;
        }
      });

      items.push({
        no: noVal,
        mainStep: row[colMap['Main Step']] || '',
        subStep: row[colMap['Sub Step']] || '',
        nextStep: row[colMap['Next Step']] || '',
        title: String(row[colMap['Operations']] || `Step ${noVal}`),
        timeSec: Number(row[colMap['Time (Sec)']]) || 0,
        advance: (String(row[colMap['진행방식']] || '자동').trim() as any),
        valves,
        cycle: String(row[colMap['Cycle']] || ''),
        alarmMon: String(row[colMap['Alarm Monitoring']] || ''),
        op: String(row[colMap['비교연산자']] || ''),
        targetVal: String(row[colMap['설정명(비교대상ID)']] || ''),
        earlyPass: String(row[colMap['조기통과']] || ''),
        alarmSeq: row[colMap['Alarm Seq.']] || '',
        alarmGoto: row[colMap['Alarm Goto']] || '',
        remarks: String(row[colMap['Remarks']] || '')
      });
    }

    return { sheetName, items };
  }
}
