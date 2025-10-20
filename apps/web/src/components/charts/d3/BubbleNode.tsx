import * as d3 from "d3";
import React, { useRef } from "react";

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
      <animateTransform
        attributeName="transform"
        type="scale"
        values="0;1"
        dur="0.3s"
        begin="0s"
        fill="freeze"
        additive="sum"
      />
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
            style={{
              objectFit: "cover",
              objectPosition: "center"
            }}
            preserveAspectRatio="xMidYMid slice"
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
