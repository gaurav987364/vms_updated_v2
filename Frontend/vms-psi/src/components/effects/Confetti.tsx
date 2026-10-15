import { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  left: number;
  animationDelay: number;
  backgroundColor: string;
  rotation: number;
}

const Confetti = ({ trigger, onComplete }: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  const colors = [
    "#ff6b35",
    "#f77f00",
    "#ffd60a",
    "#06ffa5",
    "#00d9ff",
    "#a78bfa",
    "#f472b6",
    "#fb923c",
  ];

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const newPieces: ConfettiPiece[] = [];

      // Create 50 confetti pieces
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 0.5,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
        });
      }

      setPieces(newPieces);

      // Hide after animation completes
      const timer = setTimeout(() => {
        setShow(false);
        setPieces([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.animationDelay}s`,
            backgroundColor: piece.backgroundColor,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Confetti;
