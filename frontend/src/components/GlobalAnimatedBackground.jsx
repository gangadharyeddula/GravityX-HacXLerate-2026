import { useEffect, useMemo, useState } from 'react';

const blobPalette = [
  { color: 'rgba(45, 212, 191, 0.13)', size: 260, offsetX: 0, offsetY: 0, speed: 0.06 },
  { color: 'rgba(56, 189, 248, 0.09)', size: 310, offsetX: 80, offsetY: -60, speed: 0.055 },
  { color: 'rgba(94, 234, 212, 0.07)', size: 360, offsetX: -120, offsetY: 90, speed: 0.065 },
  { color: 'rgba(34, 211, 238, 0.06)', size: 300, offsetX: 160, offsetY: 80, speed: 0.07 },
  { color: 'rgba(59, 130, 246, 0.05)', size: 280, offsetX: -180, offsetY: -100, speed: 0.06 },
];

const lerp = (start, end, amount) => start + (end - start) * amount;

export default function GlobalAnimatedBackground() {
  const [mouse, setMouse] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const [isTouch, setIsTouch] = useState(false);
  const [positions, setPositions] = useState(() => blobPalette.map((blob) => ({
    x: mouse.x + blob.offsetX,
    y: mouse.y + blob.offsetY,
  })));

  useEffect(() => {
    const supportsPointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouch(!supportsPointer || reducedMotion);

    if (!supportsPointer || reducedMotion) {
      return undefined;
    }

    let rafId;
    const setFromPointer = (event) => {
      setMouse({ x: event.clientX, y: event.clientY });
    };

    const resetOnLeave = () => {
      setMouse({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };

    const animate = () => {
      setPositions((current) =>
        blobPalette.map((blob, index) => {
          const targetX = mouse.x + blob.offsetX + (Math.sin((Date.now() / 900) + index) * 40);
          const targetY = mouse.y + blob.offsetY + (Math.cos((Date.now() / 1000) + index * 1.7) * 32);
          const currentX = current[index]?.x ?? targetX;
          const currentY = current[index]?.y ?? targetY;

          return {
            x: lerp(currentX, targetX, blob.speed),
            y: lerp(currentY, targetY, blob.speed),
          };
        })
      );

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', setFromPointer, { passive: true });
    window.addEventListener('pointerleave', resetOnLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', setFromPointer);
      window.removeEventListener('pointerleave', resetOnLeave);
      cancelAnimationFrame(rafId);
    };
  }, [mouse]);

  const mutedBlobs = useMemo(() => blobPalette.map((blob, index) => ({
    ...blob,
    x: positions[index]?.x ?? mouse.x,
    y: positions[index]?.y ?? mouse.y,
  })), [mouse.x, mouse.y, positions]);

  if (isTouch) {
    return (
      <div className="global-bg global-bg--mobile" aria-hidden="true">
        <div className="global-bg__blob global-bg__blob--teal" />
        <div className="global-bg__blob global-bg__blob--blue" />
        <div className="global-bg__blob global-bg__blob--purple" />
      </div>
    );
  }

  return (
    <div className="global-bg" aria-hidden="true">
      {mutedBlobs.map((blob, index) => (
        <div
          key={`blob-${index}`}
          className="global-bg__blob"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            transform: `translate3d(${blob.x - blob.size / 2}px, ${blob.y - blob.size / 2}px, 0)`,
            opacity: blobIndexOpacity(index),
          }}
        />
      ))}
    </div>
  );
}

function blobIndexOpacity(index) {
  return [0.72, 0.64, 0.58, 0.52, 0.48][index] ?? 0.52;
}
