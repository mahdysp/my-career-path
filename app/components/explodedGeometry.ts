/**
 * هندسه‌ی مجموعه‌ی مکانیکی «شش قطعه روی یک محور».
 *
 * ایده: تمام قطعات روی یک شفت افقی (محور X) سوار هستند. صفحه‌ی هر قطعه
 * عمود بر محور است (در صفحه‌ی YZ)، بنابراین وقتی شفت می‌چرخد همه‌ی قطعات
 * با یک سرعت و یک جهت حول همان محور می‌گردند — دقیقاً مثل یک مجموعه‌ی واقعی.
 *
 * دوربین: چرخش yaw حول Y و pitch کوچک حول X، تصویر متعامد (بدون پرسپکتیو)
 * تا خطوط مستقیم بمانند. نتیجه: دایره‌ها به بیضی‌های باریکِ ایستاده تبدیل
 * می‌شوند و ردیف قطعات کمی به سمت عمق می‌رود.
 *
 * خروجی سه رشته‌ی path است (دور / میانی / نزدیک) تا با اپاسیتی متفاوت
 * رسم شوند و حس عمق و خطوط پنهان بدهند.
 */

export const VIEW_W = 900;
export const VIEW_H = 420;
export const CX = 450;
export const CY = 212;

const RY = 0.5; // چرخش افقی دوربین — پهنای بیضی‌ها
const RX = 0.2; // نگاه از کمی بالا

const cRY = Math.cos(RY), sRY = Math.sin(RY);
const cRX = Math.cos(RX), sRX = Math.sin(RX);

/* بردارهای پایه‌ی خام در فضای صفحه (y به سمت پایین) */
const W0: [number, number] = [cRY, -(sRY * sRX)]; // جهت محور شفت
const U0: [number, number] = [0, -cRX]; // محور Y جهان (بالا)
const V0: [number, number] = [sRY, cRY * sRX]; // محور Z جهان (عمق)

/* رول دوربین: محور شفت را دقیقاً افقی می‌کند تا ردیف قطعات کج ننشیند.
   این فقط چرخش خود دوربین حول محور دیدش است، پس هندسه دست‌نخورده می‌ماند. */
const ROLL = -Math.atan2(W0[1], W0[0]);
const cR = Math.cos(ROLL), sR = Math.sin(ROLL);
const roll = (v: [number, number]): [number, number] => [
  v[0] * cR - v[1] * sR,
  v[0] * sR + v[1] * cR,
];

const W = roll(W0);
const U = roll(U0);
const V = roll(V0);

/** عمق نقطه؛ عدد بزرگ‌تر یعنی دورتر از دوربین */
const depthOf = (ax: number, r: number, a: number) =>
  r * Math.cos(a) * sRX + (-ax * sRY + r * Math.sin(a) * cRY) * cRX;

export type Pt = [number, number];

/** نقطه‌ای روی قطعه: ax = فاصله در راستای محور، r و a = مختصات قطبی در صفحه‌ی قطعه */
const pt = (ax: number, r: number, a: number): Pt => [
  CX + W[0] * ax + U[0] * r * Math.cos(a) + V[0] * r * Math.sin(a),
  CY + W[1] * ax + U[1] * r * Math.cos(a) + V[1] * r * Math.sin(a),
];

const f = (n: number) => (Math.round(n * 10) / 10).toString();

type Buckets = { far: string[]; mid: string[]; near: string[] };

const emptyBuckets = (): Buckets => ({ far: [], mid: [], near: [] });

const line = (b: Buckets, k: keyof Buckets, a: Pt, c: Pt) => {
  b[k].push(`M${f(a[0])} ${f(a[1])}L${f(c[0])} ${f(c[1])}`);
};

const loop = (b: Buckets, k: keyof Buckets, p: Pt[]) => {
  b[k].push(`M${p.map((q) => `${f(q[0])} ${f(q[1])}`).join("L")}Z`);
};

/** حلقه‌ی دایره‌ای در صفحه‌ی قطعه */
const ring = (ax: number, r: number, spin: number, n = 64): Pt[] =>
  Array.from({ length: n }, (_, i) => pt(ax, r, spin + (i / n) * Math.PI * 2));

/** حلقه‌ی چندضلعی */
const ngon = (ax: number, r: number, spin: number, sides: number): Pt[] =>
  Array.from({ length: sides }, (_, i) => pt(ax, r, spin + (i / sides) * Math.PI * 2));

/** پروفیل دنده‌دار (چرخ‌دنده) */
function toothProfile(ax: number, rTip: number, rRoot: number, teeth: number, spin: number): Pt[] {
  const out: Pt[] = [];
  const step = (Math.PI * 2) / teeth;
  const tw = step * 0.5;
  for (let i = 0; i < teeth; i++) {
    const a = spin + i * step;
    out.push(pt(ax, rRoot, a - tw * 0.5));
    out.push(pt(ax, rTip, a - tw * 0.26));
    out.push(pt(ax, rTip, a + tw * 0.26));
    out.push(pt(ax, rRoot, a + tw * 0.5));
  }
  return out;
}

export type PartKind = "gear" | "flange" | "spacer" | "drum" | "collar" | "endcap";

export type PartSpec = {
  kind: PartKind;
  /** شعاع بیرونی */
  r: number;
  /** ضخامت در راستای محور */
  d: number;
};

/** ترتیب قطعات روی محور — ریتم اندازه‌ها عمدی است */
export const PARTS: PartSpec[] = [
  { kind: "drum", r: 92, d: 54 },
  { kind: "gear", r: 84, d: 26 },
  { kind: "spacer", r: 40, d: 14 },
  { kind: "flange", r: 68, d: 22 },
  { kind: "collar", r: 50, d: 26 },
  { kind: "endcap", r: 78, d: 24 },
];

export const BORE = 15;
export const SHAFT_R = 11;

/** طول کل مجموعه در حالت سرهم */
const ASSEMBLED_LEN = PARTS.reduce((a, p) => a + p.d, 0);
const GAP = 118;
const EXPLODED_LEN = ASSEMBLED_LEN + GAP * (PARTS.length - 1);

/** مرکز محوری هر قطعه در حالت سرهم و باز */
export function axialPositions(open: number): number[] {
  const gap = GAP * open;
  const total = ASSEMBLED_LEN + gap * (PARTS.length - 1);
  let cursor = -total / 2;
  return PARTS.map((p, i) => {
    const c = cursor + p.d / 2;
    cursor += p.d + (i < PARTS.length - 1 ? gap : 0);
    return c;
  });
}

export const shaftHalfLength = (open: number) =>
  (ASSEMBLED_LEN + GAP * (PARTS.length - 1) * open) / 2 + 46;

export const EXPLODED_SCREEN_W = EXPLODED_LEN * W[0];

/* ------------------------------------------------------------------ */

function buildPart(b: Buckets, spec: PartSpec, cx: number, spin: number) {
  const { r, d } = spec;
  const zf = -d / 2; // یک وجه
  const zb = d / 2; // وجه دیگر
  // کدام وجه به دوربین نزدیک‌تر است؟
  const nearIsFront = depthOf(cx + zf, 0, 0) < depthOf(cx + zb, 0, 0);
  const A = nearIsFront ? cx + zf : cx + zb; // وجه نزدیک
  const B = nearIsFront ? cx + zb : cx + zf; // وجه دور

  /** خط محیطی: نیمه‌ی دور کم‌رنگ‌تر */
  const rim = (ax: number, radius: number, key: keyof Buckets, n = 64) => {
    loop(b, key, ring(ax, radius, spin, n));
  };

  /** خطوط موازی محور بین دو وجه، در زاویه‌های مشخص */
  const axials = (radius: number, count: number, phase = 0) => {
    for (let i = 0; i < count; i++) {
      const a = spin + phase + (i / count) * Math.PI * 2;
      const near = depthOf(cx, radius, a) < depthOf(cx, 0, 0);
      line(b, near ? "near" : "far", pt(A, radius, a), pt(B, radius, a));
    }
  };

  /** پره‌های شعاعی روی یک وجه */
  const spokes = (ax: number, r0: number, r1: number, count: number, key: keyof Buckets) => {
    for (let i = 0; i < count; i++) {
      const a = spin + (i / count) * Math.PI * 2;
      line(b, key, pt(ax, r0, a), pt(ax, r1, a));
    }
  };

  if (spec.kind === "drum") {
    rim(A, r, "near");
    rim(B, r, "far");
    rim(A, r * 0.62, "mid");
    rim(B, r * 0.62, "far");
    axials(r, 40);
    axials(r * 0.62, 20);
    spokes(A, r * 0.62, r, 40, "mid");
  } else if (spec.kind === "gear") {
    const rRoot = r * 0.84;
    loop(b, "near", toothProfile(A, r, rRoot, 26, spin));
    loop(b, "far", toothProfile(B, r, rRoot, 26, spin));
    // یال‌های نوک دندانه‌ها
    const step = (Math.PI * 2) / 26;
    for (let i = 0; i < 26; i++) {
      const a = spin + i * step;
      const near = depthOf(cx, r, a) < depthOf(cx, 0, 0);
      const k: keyof Buckets = near ? "near" : "far";
      line(b, k, pt(A, r, a - step * 0.13), pt(B, r, a - step * 0.13));
      line(b, k, pt(A, r, a + step * 0.13), pt(B, r, a + step * 0.13));
    }
    rim(A, r * 0.5, "mid");
    rim(B, r * 0.5, "far");
    spokes(A, r * 0.5, rRoot, 6, "mid");
  } else if (spec.kind === "spacer") {
    rim(A, r, "near");
    rim(B, r, "far");
    axials(r, 16);
  } else if (spec.kind === "flange") {
    rim(A, r, "near");
    rim(B, r, "far");
    axials(r, 24);
    // سوراخ‌های پیچ روی وجه نزدیک
    for (let i = 0; i < 6; i++) {
      const a = spin + (i / 6) * Math.PI * 2;
      const hc = pt(A, r * 0.66, a);
      const hr = r * 0.13;
      const holeA = Array.from({ length: 16 }, (_, j) => {
        const t = (j / 16) * Math.PI * 2;
        return [hc[0] + U[0] * hr * Math.cos(t) + V[0] * hr * Math.sin(t),
                hc[1] + U[1] * hr * Math.cos(t) + V[1] * hr * Math.sin(t)] as Pt;
      });
      loop(b, depthOf(cx, r * 0.66, a) < depthOf(cx, 0, 0) ? "mid" : "far", holeA);
    }
    rim(A, r * 0.4, "mid");
  } else if (spec.kind === "collar") {
    const sides = 9;
    loop(b, "near", ngon(A, r, spin, sides));
    loop(b, "far", ngon(B, r, spin, sides));
    for (let i = 0; i < sides; i++) {
      const a = spin + (i / sides) * Math.PI * 2;
      const near = depthOf(cx, r, a) < depthOf(cx, 0, 0);
      line(b, near ? "near" : "far", pt(A, r, a), pt(B, r, a));
    }
    rim(A, r * 0.55, "mid");
    rim(B, r * 0.55, "far");
  } else {
    // درپوش: بدنه‌ی مخروطی + بوس‌های شش‌گوش
    rim(A, r, "near");
    rim(B, r * 0.8, "far");
    for (let i = 0; i < 28; i++) {
      const a = spin + (i / 28) * Math.PI * 2;
      const near = depthOf(cx, r, a) < depthOf(cx, 0, 0);
      line(b, near ? "near" : "far", pt(A, r, a), pt(B, r * 0.8, a));
    }
    for (let i = 0; i < 6; i++) {
      const a = spin + (i / 6) * Math.PI * 2;
      const bossR = r * 0.62;
      const hr = r * 0.17;
      const c1 = pt(A, bossR, a);
      const c2 = pt(A - (nearIsFront ? 12 : -12), bossR, a);
      const hex = (c: Pt) =>
        Array.from({ length: 6 }, (_, j) => {
          const t = spin + (j / 6) * Math.PI * 2;
          return [c[0] + U[0] * hr * Math.cos(t) + V[0] * hr * Math.sin(t),
                  c[1] + U[1] * hr * Math.cos(t) + V[1] * hr * Math.sin(t)] as Pt;
        });
      const k: keyof Buckets = depthOf(cx, bossR, a) < depthOf(cx, 0, 0) ? "mid" : "far";
      loop(b, k, hex(c2));
      loop(b, k, hex(c1));
      const h1 = hex(c1), h2 = hex(c2);
      for (let j = 0; j < 6; j += 2) line(b, k, h1[j], h2[j]);
    }
  }

  // سوراخ محور (بور) روی هر دو وجه — نشان می‌دهد قطعه روی شفت سوار است
  rim(A, BORE, "mid", 24);
  rim(B, BORE, "far", 24);
}

/** شفت مرکزی که همه‌ی قطعات روی آن سوارند */
function buildShaft(b: Buckets, half: number, spin: number) {
  const a0 = -half, a1 = half;
  loop(b, "mid", ring(a0, SHAFT_R, spin, 24));
  loop(b, "mid", ring(a1, SHAFT_R, spin, 24));
  for (let i = 0; i < 10; i++) {
    const a = spin + (i / 10) * Math.PI * 2;
    const near = depthOf(0, SHAFT_R, a) < depthOf(0, 0, 0);
    line(b, near ? "mid" : "far", pt(a0, SHAFT_R, a), pt(a1, SHAFT_R, a));
  }
  // خط مرکز
  line(b, "far", pt(a0 - 34, 0, 0), pt(a1 + 34, 0, 0));
}

/**
 * ساخت کل صحنه.
 * @param spin زاویه‌ی چرخش شفت (رادیان)
 * @param open میزان بازشدن ۰ تا ۱
 */
export function buildScene(spin: number, open: number): { far: string; mid: string; near: string } {
  const b = emptyBuckets();
  buildShaft(b, shaftHalfLength(open), spin);

  const xs = axialPositions(open);
  // از دور به نزدیک رسم شود
  const order = xs
    .map((cx, i) => ({ cx, i, z: depthOf(cx, 0, 0) }))
    .sort((p, q) => q.z - p.z);
  for (const o of order) buildPart(b, PARTS[o.i], o.cx, spin);

  return {
    far: b.far.join(""),
    mid: b.mid.join(""),
    near: b.near.join(""),
  };
}
