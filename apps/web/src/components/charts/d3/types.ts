export interface BubbleNodeData {
  id: string;
  name: string;
  value: number;
  x: number;
  y: number;
  radius: number;
  imageUrl?: string;
  href?: string;
  subtitle?: string;
  streams?: number;
  durationMs?: number;
  [key: string]: string | number | undefined;
}

export interface BubbleChartProps {
  data: BubbleNodeData[];
  width?: number;
  height?: number;
  onNodeClick?: (node: BubbleNodeData) => void;
  onNodeHover?: (node: BubbleNodeData | null) => void;
}
