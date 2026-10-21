import React, { useState, useRef } from 'react';

interface ScreenRecorderProps {
  targetElementId?: string;
  onRecordingChange?: (isRecording: boolean) => void;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  targetElementId = 'masterPidSvg',
  onRecordingChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const svgEl = document.getElementById(targetElementId);
      if (!svgEl) {
        alert('배관도 요소를 찾을 수 없습니다.');
        return;
      }

      // 캔버스 생성 후 SVG 렌더링 스트림 캡처
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const stream = canvas.captureStream(60); // 60 FPS
      recordedChunksRef.current = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PID_Piping_Recording_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // 60FPS 프레임 드로잉 루프
      let isDrawing = true;
      const drawFrame = () => {
        if (!isDrawing) return;
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          requestAnimationFrame(drawFrame);
        };
        img.src = url;
      };

      recorder.start(100);
      drawFrame();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      onRecordingChange?.(true);
    } catch (err) {
      console.error('녹화 시작 오류:', err);
      alert('화면 녹화 기능 초기화에 실패하였습니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingChange?.(false);
      alert('배관도 단독 동영상 녹화본이 성공적으로 생성되어 다운로드되었습니다!');
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition shadow-xs ${
        isRecording
          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
          : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800'
      }`}
      title="배관도 영역 1:1 단독 녹화"
    >
      <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-500'}`} />
      <span>{isRecording ? '⏹ 녹화 중지 (저장)' : '🎥 배관도 단독 녹화'}</span>
    </button>
  );
};
