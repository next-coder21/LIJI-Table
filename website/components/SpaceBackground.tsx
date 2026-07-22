import Image from "next/image";

/**
 * Full-bleed deep-space photo backdrop (planets, nebula band, orbit rings).
 * A dark-theme device: hidden in the light "observatory" theme so text stays
 * legible on the light paper. Purely decorative.
 *
 * Drop into any `relative overflow-hidden` section; content sits in a sibling
 * with `relative` above it.
 */
export default function SpaceBackground({ priority = false }: { priority?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 light:opacity-0" aria-hidden>
      <Image
        src="/space-bg.png"
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Left scrim — keeps headline/body text readable over the artwork. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--paper) 0%, color-mix(in srgb, var(--paper) 55%, transparent) 32%, transparent 60%)",
        }}
      />
      {/* Bottom scrim — blends into the next section and the divider. */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 55%, color-mix(in srgb, var(--paper) 85%, transparent) 100%)",
        }}
      />
    </div>
  );
}
