import type { ReactElement } from 'react';
import type { ArtName } from '../../engine/types';

/**
 * Equipment pictograms. One consistent style: 400×300 viewBox, 4px ink
 * outline, flat fills from the plate palette. Drawn like gym wayfinding
 * signage so they read at small sizes. Hotspot coordinates in content
 * files refer to these exact drawings.
 */

const S = { stroke: 'var(--ink)', strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const shadow = (cx = 200, cy = 272, rx = 150) => <ellipse cx={cx} cy={cy} rx={rx} ry={8} fill="var(--ink)" opacity={0.1} />;

function Dumbbell() {
  return (
    <g {...S}>
      {shadow(200, 236, 130)}
      <rect x={140} y={138} width={120} height={24} rx={4} fill="var(--steel)" />
      {[168, 180, 192, 204, 216, 228].map((x) => (
        <line key={x} x1={x} y1={143} x2={x} y2={157} strokeWidth={2} />
      ))}
      <rect x={104} y={88} width={40} height={124} rx={8} fill="var(--rubber)" />
      <rect x={256} y={88} width={40} height={124} rx={8} fill="var(--rubber)" />
      <rect x={78} y={108} width={30} height={84} rx={6} fill="var(--rubber)" />
      <rect x={292} y={108} width={30} height={84} rx={6} fill="var(--rubber)" />
      <line x1={116} y1={102} x2={116} y2={150} stroke="var(--paper-hi)" strokeWidth={4} opacity={0.35} />
      <line x1={268} y1={102} x2={268} y2={150} stroke="var(--paper-hi)" strokeWidth={4} opacity={0.35} />
    </g>
  );
}

function Kettlebell() {
  return (
    <g {...S}>
      {shadow(200, 266, 90)}
      <path d="M140 150 C 120 4, 280 4, 260 150" fill="none" strokeWidth={28} />
      <path d="M140 150 C 120 4, 280 4, 260 150" fill="none" stroke="var(--rubber)" strokeWidth={18} />
      <circle cx={200} cy={180} r={84} fill="var(--rubber)" />
      <rect x={150} y={248} width={100} height={14} rx={4} fill="var(--rubber)" />
      <path d="M146 158 A 62 62 0 0 1 184 120" fill="none" stroke="var(--paper-hi)" strokeWidth={7} opacity={0.3} />
      <rect x={178} y={172} width={44} height={26} rx={4} fill="var(--signal)" />
    </g>
  );
}

function Barbell() {
  return (
    <g {...S}>
      {shadow(200, 248, 170)}
      <rect x={140} y={144} width={120} height={12} rx={3} fill="var(--steel)" />
      <rect x={30} y={139} width={110} height={22} rx={4} fill="var(--steel)" />
      <rect x={260} y={139} width={110} height={22} rx={4} fill="var(--steel)" />
      <rect x={100} y={70} width={26} height={160} rx={6} fill="var(--plate-blue)" />
      <rect x={76} y={94} width={22} height={112} rx={5} fill="var(--signal)" />
      <rect x={128} y={130} width={12} height={40} rx={3} fill="var(--rubber)" />
      <rect x={274} y={70} width={26} height={160} rx={6} fill="var(--plate-blue)" />
      <rect x={302} y={94} width={22} height={112} rx={5} fill="var(--signal)" />
      <rect x={260} y={130} width={12} height={40} rx={3} fill="var(--rubber)" />
    </g>
  );
}

function Bench() {
  return (
    <g {...S}>
      {shadow(200, 266, 150)}
      <rect x={70} y={250} width={70} height={12} rx={4} fill="var(--rubber)" />
      <rect x={270} y={250} width={70} height={12} rx={4} fill="var(--rubber)" />
      <rect x={98} y={182} width={214} height={12} rx={3} fill="var(--steel)" />
      <rect x={108} y={192} width={14} height={60} fill="var(--steel)" />
      <rect x={288} y={192} width={14} height={60} fill="var(--steel)" />
      <rect x={236} y={198} width={60} height={8} rx={2} fill="var(--steel)" />
      {[246, 262, 278].map((x) => (
        <circle key={x} cx={x} cy={202} r={2} fill="var(--ink)" strokeWidth={0} />
      ))}
      <rect x={86} y={158} width={108} height={24} rx={8} fill="var(--rubber)" />
      <rect x={198} y={150} width={134} height={24} rx={8} fill="var(--rubber)" transform="rotate(-22 198 162)" />
    </g>
  );
}

function Treadmill() {
  return (
    <g {...S}>
      {shadow(180, 266, 160)}
      <rect x={30} y={218} width={290} height={36} rx={12} fill="var(--rubber)" />
      <line x1={58} y1={224} x2={292} y2={224} stroke="var(--steel)" strokeWidth={3} />
      <circle cx={54} cy={238} r={9} fill="var(--steel)" />
      <circle cx={296} cy={238} r={9} fill="var(--steel)" />
      <polygon points="284,222 302,222 332,108 316,104" fill="var(--steel)" />
      <rect x={198} y={146} width={124} height={11} rx={5} fill="var(--steel)" />
      <rect x={280} y={60} width={92} height={46} rx={6} fill="var(--rubber)" />
      <rect x={292} y={70} width={58} height={24} rx={3} fill="var(--plate-blue)" />
      <line x1={300} y1={82} x2={324} y2={82} stroke="var(--paper-hi)" strokeWidth={3} />
      <path d="M262 86 C 250 100, 258 112, 244 122" fill="none" strokeWidth={3} />
      <rect x={234} y={120} width={18} height={10} rx={2} fill="var(--steel)" />
      <rect x={258} y={72} width={24} height={15} rx={3} fill="var(--plate-red)" />
    </g>
  );
}

function Rack() {
  const holes = Array.from({ length: 13 }, (_, i) => 52 + i * 16);
  return (
    <g {...S}>
      {shadow(210, 276, 170)}
      <rect x={60} y={266} width={310} height={12} rx={3} fill="var(--rubber)" />
      <rect x={120} y={30} width={18} height={238} fill="var(--steel)" />
      <rect x={280} y={30} width={18} height={238} fill="var(--steel)" />
      {holes.map((y) => (
        <g key={y} strokeWidth={0} fill="var(--ink)">
          <circle cx={129} cy={y} r={2.5} />
          <circle cx={289} cy={y} r={2.5} />
        </g>
      ))}
      <rect x={110} y={22} width={198} height={14} rx={3} fill="var(--steel)" />
      <rect x={56} y={28} width={70} height={11} rx={5} fill="var(--steel)" />
      <path d="M120 120 H96 V98 H106 V110 H120 Z" fill="var(--signal)" />
      <circle cx={112} cy={100} r={9} fill="var(--steel)" />
      <rect x={112} y={190} width={196} height={12} rx={4} fill="var(--signal)" />
      <rect x={298} y={232} width={64} height={8} rx={2} fill="var(--steel)" />
      <rect x={310} y={190} width={13} height={76} rx={4} fill="var(--plate-red)" />
      <rect x={325} y={196} width={13} height={64} rx={4} fill="var(--plate-blue)" />
      <rect x={340} y={206} width={11} height={46} rx={4} fill="var(--plate-green)" />
    </g>
  );
}

function Cable() {
  const holes = Array.from({ length: 11 }, (_, i) => 56 + i * 18);
  return (
    <g {...S}>
      {shadow(200, 274, 160)}
      <rect x={60} y={262} width={280} height={14} rx={3} fill="var(--rubber)" />
      <rect x={80} y={30} width={22} height={234} fill="var(--steel)" />
      <rect x={298} y={30} width={22} height={234} fill="var(--steel)" />
      {holes.map((y) => (
        <g key={y} strokeWidth={0} fill="var(--ink)">
          <circle cx={91} cy={y} r={2.5} />
          <circle cx={309} cy={y} r={2.5} />
        </g>
      ))}
      <rect x={80} y={22} width={240} height={18} rx={3} fill="var(--steel)" />
      <line x1={182} y1={44} x2={182} y2={262} strokeWidth={3} />
      <line x1={218} y1={44} x2={218} y2={262} strokeWidth={3} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={168} y={164 + i * 12} width={64} height={12} fill={i % 2 ? 'var(--rubber)' : '#454b47'} strokeWidth={2.5} />
      ))}
      <circle cx={238} cy={206} r={6} fill="var(--plate-red)" strokeWidth={3} />
      <path d="M200 164 V52 M200 52 H120 L94 140 M200 52 H280 L306 170" fill="none" strokeWidth={2.5} />
      <circle cx={200} cy={52} r={9} fill="var(--steel)" />
      <rect x={72} y={128} width={38} height={26} rx={4} fill="var(--signal)" />
      <rect x={290} y={158} width={38} height={26} rx={4} fill="var(--signal)" />
      <path d="M91 154 L116 198" strokeWidth={2.5} />
      <path d="M309 184 L284 222" strokeWidth={2.5} />
      <path d="M104 196 h26 v14 a8 8 0 0 1 -8 8 h-10 a8 8 0 0 1 -8 -8 z" fill="none" strokeWidth={5} />
      <path d="M272 220 h26 v14 a8 8 0 0 1 -8 8 h-10 a8 8 0 0 1 -8 -8 z" fill="none" strokeWidth={5} />
    </g>
  );
}

function Machine() {
  return (
    <g {...S}>
      {shadow(200, 276, 170)}
      <rect x={36} y={266} width={330} height={12} rx={3} fill="var(--rubber)" />
      <rect x={40} y={40} width={70} height={226} fill="var(--paper-hi)" />
      <line x1={62} y1={48} x2={62} y2={154} strokeWidth={3} />
      <line x1={88} y1={48} x2={88} y2={154} strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={50} y={154 + i * 12} width={50} height={12} fill={i % 2 ? 'var(--rubber)' : '#454b47'} strokeWidth={2.5} />
      ))}
      <line x1={100} y1={198} x2={114} y2={198} strokeWidth={5} />
      <circle cx={117} cy={198} r={8} fill="var(--plate-red)" />
      <rect x={106} y={52} width={92} height={10} fill="var(--steel)" />
      <path d="M196 58 L300 126" strokeWidth={16} />
      <path d="M196 58 L300 126" stroke="var(--steel)" strokeWidth={8} />
      <circle cx={196} cy={58} r={9} fill="var(--steel)" />
      <rect x={294} y={108} width={14} height={50} rx={6} fill="var(--rubber)" />
      <rect x={156} y={168} width={8} height={10} fill="var(--steel)" />
      <rect x={146} y={72} width={26} height={100} rx={9} fill="var(--rubber)" />
      <rect x={200} y={192} width={14} height={74} fill="var(--steel)" />
      <rect x={148} y={174} width={104} height={20} rx={8} fill="var(--rubber)" />
      <line x1={214} y1={230} x2={226} y2={230} strokeWidth={5} />
      <circle cx={230} cy={230} r={8} fill="var(--signal)" />
    </g>
  );
}

function FloorPlan() {
  const tape = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeDasharray: '6 5' };
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={10} y={10} width={380} height={280} rx={4} fill="var(--paper-hi)" stroke="var(--ink)" strokeWidth={4} />
      <rect x={176} y={286} width={48} height={8} fill="var(--paper-hi)" />
      {/* cardio */}
      <rect x={20} y={20} width={170} height={100} {...tape} />
      {[30, 60, 90].map((x) => (
        <g key={x} stroke="var(--ink)" strokeWidth={2.5}>
          <rect x={x} y={34} width={22} height={58} rx={4} fill="var(--rubber)" />
          <line x1={x + 11} y1={44} x2={x + 11} y2={84} stroke="var(--steel)" strokeWidth={2} />
          <rect x={x + 2} y={28} width={18} height={8} rx={2} fill="var(--plate-blue)" />
        </g>
      ))}
      {[46, 86].map((y) => (
        <g key={y} stroke="var(--ink)" strokeWidth={2.5}>
          <rect x={136} y={y - 10} width={36} height={22} rx={6} fill="var(--steel)" />
          <circle cx={164} cy={y + 1} r={6} fill="var(--rubber)" />
        </g>
      ))}
      {/* free weights */}
      <rect x={210} y={20} width={170} height={120} {...tape} />
      <rect x={220} y={28} width={150} height={16} rx={3} fill="var(--steel)" stroke="var(--ink)" strokeWidth={2.5} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} fill="var(--rubber)">
          <rect x={226 + i * 20} y={34} width={12} height={4} />
          <rect x={225 + i * 20} y={31} width={3} height={10} />
          <rect x={236 + i * 20} y={31} width={3} height={10} />
        </g>
      ))}
      <rect x={230} y={68} width={14} height={44} rx={4} fill="var(--rubber)" stroke="var(--ink)" strokeWidth={2.5} />
      <rect x={284} y={68} width={14} height={44} rx={4} fill="var(--rubber)" stroke="var(--ink)" strokeWidth={2.5} />
      <rect x={326} y={66} width={40} height={56} fill="none" stroke="var(--ink)" strokeWidth={3} />
      <line x1={320} y1={94} x2={372} y2={94} stroke="var(--ink)" strokeWidth={4} />
      {/* stretch / turf */}
      <rect x={20} y={140} width={120} height={90} {...tape} />
      <rect x={26} y={146} width={108} height={78} fill="var(--plate-green)" opacity={0.28} />
      {[160, 180, 200].map((y) => (
        <line key={y} x1={26} y1={y} x2={134} y2={y} stroke="var(--plate-green)" strokeWidth={2} opacity={0.5} />
      ))}
      <rect x={38} y={158} width={26} height={54} rx={3} fill="var(--plate-blue)" stroke="var(--ink)" strokeWidth={2.5} />
      <rect x={82} y={158} width={26} height={54} rx={3} fill="var(--plate-blue)" stroke="var(--ink)" strokeWidth={2.5} />
      {/* cables */}
      <rect x={150} y={140} width={70} height={86} {...tape} />
      <rect x={160} y={150} width={50} height={64} fill="none" stroke="var(--ink)" strokeWidth={3} />
      <circle cx={168} cy={160} r={5} fill="var(--signal)" stroke="var(--ink)" strokeWidth={2} />
      <circle cx={202} cy={160} r={5} fill="var(--signal)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={177} y={186} width={16} height={24} fill="var(--rubber)" stroke="var(--ink)" strokeWidth={2} />
      {/* machines */}
      <rect x={230} y={156} width={150} height={74} {...tape} />
      {[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => (
          <g key={`${col}-${row}`} stroke="var(--ink)" strokeWidth={2.5}>
            <rect x={240 + col * 46} y={164 + row * 32} width={36} height={24} rx={3} fill="var(--steel)" />
            <rect x={246 + col * 46} y={176 + row * 32} width={14} height={8} rx={2} fill="var(--rubber)" />
          </g>
        )),
      )}
      {/* desk + entrance */}
      <rect x={130} y={246} width={64} height={18} rx={3} fill="var(--steel)" stroke="var(--ink)" strokeWidth={2.5} />
      <text x={162} y={259} className="art-label" textAnchor="middle">DESK</text>
      <path d="M200 284 V262 M192 270 L200 262 L208 270" stroke="var(--ink)" strokeWidth={3} fill="none" />
      <text x={226} y={280} className="art-label">IN</text>
    </g>
  );
}

const ART: Record<ArtName, () => ReactElement> = {
  dumbbell: Dumbbell,
  kettlebell: Kettlebell,
  barbell: Barbell,
  bench: Bench,
  treadmill: Treadmill,
  rack: Rack,
  cable: Cable,
  machine: Machine,
  floorplan: FloorPlan,
};

/** Neutral visual descriptions that don't name the equipment (used where naming would give away an answer). */
export const ART_DESCRIPTIONS: Record<ArtName, string> = {
  dumbbell: 'A short handle with a weighted block on each end.',
  kettlebell: 'A round iron ball with a looped handle on top and a flat base.',
  barbell: 'A long bar with large round plates loaded near each end.',
  bench: 'A padded seat with a back pad that tilts up on an angle.',
  treadmill: 'A long moving belt along the floor with a screen and handrail in front.',
  rack: 'A tall steel frame with posts, hooks and a horizontal arm.',
  cable: 'A tall frame with a weight stack in the middle and pulleys with handles on both sides.',
  machine: 'A seated station with a back pad, handles, and a stack of weight plates behind it.',
  floorplan: 'A top-down floor plan of a gym.',
};

export function Art({ name, title, className }: { name: ArtName; title?: string; className?: string }) {
  const Draw = ART[name];
  return (
    <svg
      viewBox="0 0 400 300"
      className={className ?? 'art'}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <Draw />
    </svg>
  );
}
