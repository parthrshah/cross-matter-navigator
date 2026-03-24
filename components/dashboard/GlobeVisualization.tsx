"use client";

import { useEffect, useRef, useState, useId } from "react";
import { OFFICE_LOCATIONS, GLOBE_CONNECTIONS } from "@/lib/mock-data";

function latLngToXY(
  lat: number,
  lng: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number; visible: boolean } {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const x = cx + r * Math.cos(phi) * Math.sin(lambda);
  const y = cy - r * Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lambda);
  return { x, y, visible: z > -0.2 };
}

const CX = 190;
const CY = 155;
const R = 120;

export function GlobeVisualization() {
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // FIX L6: Sanitize useId() — React returns `:r1:` which has colons that break SVG url() refs
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const globeGradId = `globeGrad-${uid}`;
  const glowGradId = `glowGrad-${uid}`;
  const glowFilterId = `glow-${uid}`;

  // FIX #4: Throttle to ~30fps instead of 60fps to reduce re-renders
  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime >= 33) {
        // ~30fps
        frame++;
        setRotation(frame * 0.15);
        lastTime = time;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const rotatedLng = (lng: number) => lng + rotation;

  // Compute graticule paths directly (rotation changes every frame, useMemo has no benefit)
  const graticules: string[] = [];

  // Latitude lines
  for (let lat = -60; lat <= 60; lat += 30) {
    let currentSegment = "";
    let wasVisible = false;

    for (let lng = -180; lng <= 180; lng += 5) {
      const { x, y, visible } = latLngToXY(
        lat,
        rotatedLng(lng),
        CX,
        CY,
        R
      );
      if (visible) {
        if (!wasVisible) {
          currentSegment += `M${x},${y}`;
        } else {
          currentSegment += `L${x},${y}`;
        }
        wasVisible = true;
      } else {
        wasVisible = false;
      }
    }
    if (currentSegment) graticules.push(currentSegment);
  }

  // Longitude lines
  for (let lng = -180; lng < 180; lng += 30) {
    let currentSegment = "";
    let wasVisible = false;

    for (let lat = -90; lat <= 90; lat += 5) {
      const { x, y, visible } = latLngToXY(
        lat,
        rotatedLng(lng),
        CX,
        CY,
        R
      );
      if (visible) {
        if (!wasVisible) {
          currentSegment += `M${x},${y}`;
        } else {
          currentSegment += `L${x},${y}`;
        }
        wasVisible = true;
      } else {
        wasVisible = false;
      }
    }
    if (currentSegment) graticules.push(currentSegment);
  }

  return (
    <div className="glass-card overflow-hidden rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Global Network
        </span>
        <span className="text-[11px] text-[var(--color-accent-cyan)]">
          {GLOBE_CONNECTIONS.filter((c) => c.active).length} active connections
        </span>
      </div>

      <svg viewBox="0 0 380 310" className="w-full globe-glow">
        <defs>
          <radialGradient id={globeGradId} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a1a3e" />
            <stop offset="100%" stopColor="#07070e" />
          </radialGradient>
          <radialGradient id={glowGradId} cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id={glowFilterId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient glow */}
        <circle cx={CX} cy={CY} r={R + 40} fill={`url(#${glowGradId})`} />

        {/* Globe sphere */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill={`url(#${globeGradId})`}
          stroke="var(--color-border-primary)"
          strokeWidth="0.5"
        />

        {/* Graticule grid */}
        {graticules.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--color-border-primary)"
            strokeWidth="0.3"
            opacity="0.4"
          />
        ))}

        {/* Connection arcs */}
        {GLOBE_CONNECTIONS.map((conn, i) => {
          const from = latLngToXY(
            conn.lat1,
            rotatedLng(conn.lng1),
            CX,
            CY,
            R
          );
          const to = latLngToXY(
            conn.lat2,
            rotatedLng(conn.lng2),
            CX,
            CY,
            R
          );

          if (!from.visible || !to.visible) return null;

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 30;
          const pathD = `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`;

          return (
            <path
              key={i}
              d={pathD}
              fill="none"
              stroke={
                conn.active
                  ? "var(--color-accent-cyan)"
                  : "var(--color-text-tertiary)"
              }
              strokeWidth={conn.active ? 1.5 : 0.5}
              opacity={conn.active ? 0.7 : 0.3}
              strokeDasharray={conn.active ? "none" : "4 4"}
              filter={conn.active ? `url(#${glowFilterId})` : undefined}
            />
          );
        })}

        {/* Office dots */}
        {OFFICE_LOCATIONS.map((office) => {
          const { x, y, visible } = latLngToXY(
            office.lat,
            rotatedLng(office.lng),
            CX,
            CY,
            R
          );
          if (!visible) return null;
          const isHovered = hovered === office.city;
          const dotSize = Math.max(2, Math.min(5, office.lawyers / 100));

          return (
            <g
              key={office.city}
              onMouseEnter={() => setHovered(office.city)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={x}
                cy={y}
                r={dotSize + 4}
                fill="var(--color-accent-cyan)"
                opacity={isHovered ? 0.2 : 0.08}
              />
              <circle
                cx={x}
                cy={y}
                r={dotSize}
                fill={
                  isHovered
                    ? "var(--color-accent-cyan)"
                    : "var(--color-accent-indigo-light)"
                }
                stroke="var(--color-bg-primary)"
                strokeWidth="0.5"
              />

              {isHovered && (
                <g>
                  <rect
                    x={x - 50}
                    y={y - 38}
                    width="100"
                    height="28"
                    rx="6"
                    fill="var(--color-bg-card)"
                    stroke="var(--color-border-primary)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={x}
                    y={y - 24}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="var(--color-text-primary)"
                  >
                    {office.city}
                  </text>
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--color-text-tertiary)"
                  >
                    {office.lawyers} lawyers
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
