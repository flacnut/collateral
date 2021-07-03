import PieChart from "./pieChart";

export { PieChart };

export type SeriesData = {
  name: string;
  color?: string;
  onSelect?: () => void;
  amountCents: number;
  transactionCount?: number;
  date?: Date;
};
