import * as d3 from "d3";
import React, { useRef } from "react";
import { BubbleNodeData } from "./types";

interface BubbleNodeProps {
  node: BubbleNodeData;
  onMouseOver: (event: React.MouseEvent, node: BubbleNodeData) => void;
  onMouseOut: () => void;
  onClick?: (event: React.MouseEvent, node: BubbleNodeData) => void;
  fontSizeScale: d3.ScalePower<number, number, never>;
  colorScale: d3.ScaleOrdinal<string, string, never>;
}

export default function BubbleNode({
  node,
  onMouseOver,
  onMouseOut,
  onClick,
  fontSizeScale,
  colorScale
}: BubbleNodeProps) {
  const nodeRef = useRef<SVGGElement>(null);

  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  return (
    <g
      ref={nodeRef}
      transform={`translate(${node.x},${node.y})`}
      className="cursor-pointer [&>circle]:transition-[stroke-width] [&>circle]:duration-200 [&>circle]:ease-in-out hover:[&>circle]:stroke-[3px]"
      onMouseOver={(e) => onMouseOver(e, node)}
      onMouseOut={onMouseOut}
      onClick={(e) => onClick?.(e, node)}
    >
      {node.imageUrl ? (
        <>
          {/* Define clipping path for the image */}
          <defs>
            <clipPath id={`clip-${node.id}`}>
              <circle r={node.radius} cx={0} cy={0} />
            </clipPath>
          </defs>

          {/* Image with clipping path */}
          <image
            xlinkHref={node.imageUrl}
            width={node.radius * 2}
            height={node.radius * 2}
            x={-node.radius}
            y={-node.radius}
            clipPath={`url(#clip-${node.id})`}
            style={{ objectFit: "cover" }}
          />

          {/* Border circle */}
          <circle r={node.radius} stroke="gray" strokeWidth={1} fill="none" />
        </>
      ) : (
        <>
          {/* Colored circle for nodes without images */}
          <circle r={node.radius} fill={colorScale(node.name)} />

          {/* Text for nodes without images */}
          <text
            dy=".3em"
            style={{
              textAnchor: "middle",
              fill: "white",
              fontSize: `${fontSizeScale(node.value)}px`
            }}
          >
            {node.name}
          </text>
        </>
      )}
    </g>
  );
}
