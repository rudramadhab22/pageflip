/**
 * Dominant atmospheric book visual for the home composition.
 * Phase 2 replaces this with the live 3D hardcover reader.
 */
export function HeroStage() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl lg:mx-0 lg:max-w-none">
      <div aria-hidden className="absolute inset-[12%] rounded-full bg-gilt/10 blur-3xl" />

      <div className="absolute inset-0 grid place-items-center [perspective:1200px]">
        <div className="hero-float relative h-[72%] w-[58%] [transform-style:preserve-3d]">
          <div className="relative h-full w-full [transform:rotateY(-28deg)_rotateX(8deg)] [transform-style:preserve-3d]">
            <div className="absolute inset-0 rounded-r-md rounded-l-sm bg-gradient-to-br from-leather-deep to-leather shadow-[20px_30px_60px_rgba(0,0,0,0.55)]" />
            <div className="absolute inset-y-[3%] right-[-3%] left-[8%] rounded-r-sm bg-gradient-to-r from-paper-dim via-paper to-paper shadow-inner" />
            <div className="absolute inset-y-[4%] right-[-1%] left-[10%] bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.05)_0_1px,transparent_1px_3px)] opacity-50" />
            <div className="absolute inset-y-0 left-0 w-[92%] overflow-hidden rounded-r-md rounded-l-sm bg-gradient-to-br from-[#6a3f28] via-leather to-leather-deep shadow-[inset_-8px_0_18px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute inset-6 rounded-sm border border-gilt/35" />
              <div className="absolute inset-x-10 top-[28%] text-center">
                <p className="font-display text-2xl text-gilt-bright sm:text-3xl">PageFlip</p>
                <p className="mt-2 text-[10px] tracking-[0.28em] text-gilt/70 uppercase">
                  Hardcover reader
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-float {
          animation: pageflip-float 7s ease-in-out infinite;
        }
        @keyframes pageflip-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-float { animation: none; }
        }
      `}</style>
    </div>
  )
}
