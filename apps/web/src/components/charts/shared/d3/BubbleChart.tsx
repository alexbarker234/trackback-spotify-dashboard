"use client";

import * as d3 from "d3";
import React, { useCallback, useRef } from "react";
import BubbleNode, { BubbleNodeData } from "./BubbleNode";

export interface BubbleChartProps {
  data: BubbleNodeData[];
  width?: number;
  height?: number;
  onNodeClick?: (node: BubbleNodeData) => void;
  onNodeHover?: (node: BubbleNodeData | null) => void;
  animate?: boolean;
}

export default function BubbleChart({
  data,
  width = 600,
  height = 400,
  onNodeClick,
  onNodeHover,
  animate = true
}: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const fontSizeScale = d3
    .scaleSqrt()
    .domain([d3.min(data, (d) => d.value) || 0, d3.max(data, (d) => d.value) || 1])
    .range([6, 14]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const handleNodeMouseOver = useCallback(
    (event: React.MouseEvent, node: BubbleNodeData) => {
      onNodeHover?.(node);
    },
    [onNodeHover]
  );

  const handleNodeMouseOut = useCallback(() => {
    onNodeHover?.(null);
  }, [onNodeHover]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: BubbleNodeData) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div className="relative" style={{ width, height }}>
      {!animate &&
        data.map((node) =>
          node.imageUrl && node.x !== undefined && node.y !== undefined ? (
            <img
              key={`photo-${node.id}`}
              src={node.imageUrl}
              alt=""
              draggable={false}
              className="pointer-events-none absolute rounded-full object-cover"
              style={{
                left: node.x - node.radius,
                top: node.y - node.radius,
                width: node.radius * 2,
                height: node.radius * 2
              }}
            />
          ) : null
        )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={`h-auto max-w-full font-sans text-xs ${!animate ? "relative z-10" : ""}`}
      >
        <g>
          {data.map((node) => (
            <BubbleNode
              key={node.id}
              node={node}
              onMouseOver={handleNodeMouseOver}
              onMouseOut={handleNodeMouseOut}
              onClick={handleNodeClick}
              fontSizeScale={fontSizeScale}
              colorScale={colorScale}
              animate={animate}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
