import { useEffect, useRef, useState } from "react";
import {
  Code2,
  Binary,
  Braces,
  GitBranch,
  Terminal,
  Database,
  Cpu,
  Workflow,
  FileCode,
  Blocks,
  Boxes,
  Network,
} from "lucide-react";

// Coding related icons for floating animation
const codingIcons = [
  Code2,
  Binary,
  Braces,
  GitBranch,
  Terminal,
  Database,
  Cpu,
  Workflow,
  FileCode,
  Blocks,
  Boxes,
  Network,
];

// DSA related terms for infinite scrolling
const dsaTerms = [
  "Arrays",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Trees",
  "Graphs",
  "Sorting",
  "Searching",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Hash Tables",
  "Heaps",
  "Tries",
  "Binary Search",
  "DFS",
  "BFS",
  "Two Pointers",
  "Sliding Window",
  "Recursion",
];

interface FloatingIcon {
  id: number;
  Icon: typeof Code2;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
}

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize floating icons
  useEffect(() => {
    const icons: FloatingIcon[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      Icon: codingIcons[Math.floor(Math.random() * codingIcons.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      size: 24 + Math.random() * 24,
      opacity: 0.1 + Math.random() * 0.15,
    }));
    setFloatingIcons(icons);
  }, []);

  // Animate floating icons
  useEffect(() => {
    const animate = () => {
      setFloatingIcons((prevIcons) =>
        prevIcons.map((icon) => {
          let newX = icon.x + icon.dx;
          let newY = icon.y + icon.dy;
          let newDx = icon.dx;
          let newDy = icon.dy;

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth) {
            newDx = -icon.dx;
            newX = Math.max(0, Math.min(window.innerWidth, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            newDy = -icon.dy;
            newY = Math.max(0, Math.min(window.innerHeight, newY));
          }

          return {
            ...icon,
            x: newX,
            y: newY,
            dx: newDx,
            dy: newDy,
            rotation: icon.rotation + icon.rotationSpeed,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Track mouse position for cursor follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Cursor follow gradient effect */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(255,107,53,0.4) 0%, rgba(247,127,0,0.2) 50%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Secondary cursor follow - smaller */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-30 blur-2xl transition-all duration-500 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(247,127,0,0.5) 0%, transparent 70%)",
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      />

      {/* Floating coding icons */}
      {floatingIcons.map((icon) => {
        const Icon = icon.Icon;
        return (
          <div
            key={icon.id}
            className="absolute transition-opacity duration-300"
            style={{
              left: `${icon.x}px`,
              top: `${icon.y}px`,
              transform: `rotate(${icon.rotation}deg)`,
              opacity: icon.opacity,
            }}
          >
            <Icon
              size={icon.size}
              className="text-[#ff6b35] dark:text-[#ff8555]"
              strokeWidth={1.5}
            />
          </div>
        );
      })}

      {/* Infinite scrolling text - Row 1 (Left to Right) */}
      <div className="absolute top-1/4 left-0 w-full overflow-hidden opacity-5 dark:opacity-10">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...dsaTerms, ...dsaTerms].map((term, i) => (
            <span
              key={i}
              className="text-6xl md:text-8xl font-bold text-[#ff6b35] mx-8"
            >
              {term}
            </span>
          ))}
        </div>
      </div>

      {/* Infinite scrolling text - Row 2 (Right to Left) */}
      <div className="absolute top-1/2 left-0 w-full overflow-hidden opacity-5 dark:opacity-10">
        <div className="flex animate-scroll-right whitespace-nowrap">
          {[...dsaTerms.slice(10), ...dsaTerms.slice(10)].map((term, i) => (
            <span
              key={i}
              className="text-6xl md:text-8xl font-bold text-[#f77f00] mx-8"
            >
              {term}
            </span>
          ))}
        </div>
      </div>

      {/* Infinite scrolling text - Row 3 (Left to Right) */}
      <div className="absolute top-3/4 left-0 w-full overflow-hidden opacity-5 dark:opacity-10">
        <div className="flex animate-scroll-left-slow whitespace-nowrap">
          {[...dsaTerms.slice(5), ...dsaTerms.slice(5)].map((term, i) => (
            <span
              key={i}
              className="text-5xl md:text-7xl font-bold text-[#ff6b35] mx-8"
            >
              {term}
            </span>
          ))}
        </div>
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-[#ff6b35]/10 to-[#f77f00]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-[#f77f00]/10 to-[#ff6b35]/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-[#ff8555]/10 to-[#ff9520]/10 rounded-full blur-3xl animate-float-slow" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 53, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
