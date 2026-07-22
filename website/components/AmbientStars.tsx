const DOTS = [
  { x: "6%", y: "20%", dur: "4.2s", delay: "0.2s" },
  { x: "18%", y: "70%", dur: "3.6s", delay: "1.4s" },
  { x: "34%", y: "35%", dur: "5s", delay: "0.6s" },
  { x: "52%", y: "80%", dur: "3.9s", delay: "2.1s" },
  { x: "68%", y: "22%", dur: "4.6s", delay: "0.9s" },
  { x: "83%", y: "60%", dur: "3.4s", delay: "1.7s" },
  { x: "94%", y: "30%", dur: "4.9s", delay: "0.4s" },
];

/**
 * Very sparse, low-opacity twinkling dots for section backgrounds outside
 * the hero — keeps the space motif present site-wide without competing with
 * content. Purely decorative.
 */
export default function AmbientStars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="star absolute h-[3px] w-[3px] rounded-full bg-ink"
          style={
            {
              left: d.x,
              top: d.y,
              "--twinkle-duration": d.dur,
              "--twinkle-delay": d.delay,
              "--twinkle-min": 0.08,
              "--twinkle-max": 0.5,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
