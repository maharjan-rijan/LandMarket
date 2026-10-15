// Faint hill contour lines for the hero background. Decorative only.
export default function ContourBackdrop() {
  return (
    <svg className="hero-contours" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M-20 420 C 150 360, 260 470, 420 410 S 700 330, 860 400 S 1100 470, 1240 380" />
        <path d="M-20 370 C 160 310, 270 420, 430 360 S 700 280, 860 350 S 1100 420, 1240 330" />
        <path d="M-20 320 C 170 260, 280 370, 440 310 S 700 230, 860 300 S 1100 370, 1240 280" />
        <path d="M-20 270 C 180 210, 290 320, 450 260 S 700 180, 860 250 S 1100 320, 1240 230" />
        <path d="M-20 220 C 190 160, 300 270, 460 210 S 700 130, 860 200 S 1100 270, 1240 180" />
        <path d="M-20 170 C 200 110, 310 220, 470 160 S 700 80, 860 150 S 1100 220, 1240 130" />
        <path d="M-20 470 C 140 410, 250 520, 410 460 S 700 380, 860 450 S 1100 520, 1240 430" />
        <path d="M-20 520 C 130 460, 240 570, 400 510 S 700 430, 860 500 S 1100 570, 1240 480" />
        <ellipse cx="900" cy="300" rx="90" ry="46" />
        <ellipse cx="900" cy="300" rx="150" ry="80" />
        <ellipse cx="900" cy="300" rx="215" ry="115" />
      </g>
    </svg>
  );
}
