import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ChartProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  onEvents?: Record<string, (param: any) => void>;
}

export const Chart: React.FC<ChartProps> = ({ 
  option, 
  style = { height: '300px', width: '100%' }, 
  className,
  onEvents
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
      if (onEvents) {
        Object.entries(onEvents).forEach(([eventName, handler]) => {
          chartInstance.current?.on(eventName, handler);
        });
      }
    }

    chartInstance.current.setOption(option, true);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={style} className={className} />;
};

