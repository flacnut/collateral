import React, { useEffect, useRef, useState } from 'react';
import ApexCharts, { ApexOptions } from 'apexcharts';

type Props = {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  height: number;
};

export default function Chart(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<ApexCharts | null>(null);
  const [options, setOptions] = useState<ApexOptions | null>(null);

  useEffect(() => {
    let tmp = { ...props.options };
    if (tmp.chart != null) {
      tmp.chart.height = props.height;
    }
    setOptions(tmp);
  }, [props.options, props.height]);

  useEffect(() => {
    let _chart = new ApexCharts(container.current, props.options);
    _chart.updateOptions(props.options);
    _chart.updateSeries(props.series);
    _chart.render();
    setChart(_chart);
    return () => {
      _chart.destroy();
    };
  }, []);

  useEffect(() => {
    chart?.updateOptions(options);
    chart?.updateSeries(props.series);
  }, [props.series, options]);

  return <div ref={container}></div>;
}
