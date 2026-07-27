/**
 * هندسه‌ی مجموعه‌ی مکانیکی «شش قطعه روی یک محور».
 *
 * سه اصل طراحی:
 *   ۱. همه‌ی قطعات روی یک شفت مشترک‌اند و با هم می‌چرخند.
 *   ۲. قطعات واقعاً در هم چفت می‌شوند: هر قطعه یک زائده‌ی نر (spigot) روی
 *      وجه راست و یک نشیمنگاه ماده (recess) روی وجه چپ دارد؛ در حالت سرهم
 *      زائده داخل نشیمنگاه می‌نشیند. مهره و درپوش هم دندانه‌های چنگکی
 *      دارند که در هم فرو می‌روند.
 *   ۳. رندر جامد با حذف سطوح پنهان — نه سیم‌مدل. خطوط فقط سیلوئت و
 *      لبه‌های چین‌دار هستند، مثل نقشه‌ی فنی.
 *
 * توپولوژی یک‌بار ساخته می‌شود؛ در هر فریم فقط رأس‌ها حول محور X می‌چرخند.
 */

export const VIEW_W = 900;
export const VIEW_H = 372;
export const CX = 450;
export const CY = 172;

const RY = 0.5; // چرخش افقی دوربین
const RX = 0.2; // نگاه از کمی بالا

const cRY = Math.cos(RY), sRY = Math.sin(RY);
const cRX = Math.cos(RX), sRX = Math.sin(RX);

const W0: [number, number] = [cRY, -(sRY * sRX)];
const U0: [number, number] = [0, -cRX];
const V0: [number, number] = [sRY, cRY * sRX];

/* رول دوربین تا محور شفت دقیقاً افقی بیفتد */
const ROLL = -Math.atan2(W0[1], W0[0]);
const cR = Math.cos(ROLL), sR = Math.sin(ROLL);
const rollV = (v: [number, number]): [number, number] => [
  v[0] * cR - v[1] * sR,
  v[0] * sR + v[1] * cR,
];
const W = rollV(W0);
const U = rollV(U0);
const V = rollV(V0);

/** جهت نگاه دوربین. عمق = dot(p, DIR) */
const DIR: [number, number, number] = [-sRY * cRX, sRX, cRY * cRX];

/** نیم‌ارتفاع تصویرشده‌ی یک دایره به شعاع ۱ در صفحه‌ی قطعه */
const RVY = Math.hypot(U[1], V[1]);

const unit = (l: [number, number, number]): [number, number, number] => {
  const m = Math.hypot(l[0], l[1], l[2]) || 1;
  return [l[0] / m, l[1] / m, l[2] / m];
};

/* نور نسبت به دوربین تعریف می‌شود، نه نسبت به جهان: کمی بالای شانه‌ی
   بیننده. اگر مطلق تعریف شود، وجه‌های رو به دوربین تاریک می‌افتند. */
const LIGHT = unit([-DIR[0] * 0.9, -DIR[1] * 0.9 + 0.8, -DIR[2] * 0.9]);
/** نور کمکی از پایین‌عقب تا سایه‌ها کاملاً سیاه نشوند */
const FILL = unit([DIR[0] * 0.6 + 0.55, DIR[1] * 0.6 - 0.55, DIR[2] * 0.6]);

type P3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* مش                                                                  */
/* ------------------------------------------------------------------ */

type Mesh = {
  vx: Float32Array;
  /** ایندکس رأس‌های هر وجه، مسطح‌شده */
  fi: Int32Array;
  /** آفست شروع هر وجه در fi */
  fo: Int32Array;
  /** نرمال هر وجه */
  fn: Float32Array;
  /** یال‌ها: v0, v1, faceA, faceB (faceB = -1 یعنی یال مرزی) */
  ev: Int32Array;
  /** آیا یال چین تیز است */
  ecrease: Uint8Array;
  /** ایندکس یال‌های هر وجه، هم‌اندازه با fi */
  fe: Int32Array;
  faceCount: number;
  edgeCount: number;
};

class MeshBuilder {
  private verts: number[] = [];
  private index = new Map<string, number>();
  private faces: number[][] = [];
  private normals: P3[] = [];

  vertex(x: number, y: number, z: number): number {
    const k = `${Math.round(x * 100)},${Math.round(y * 100)},${Math.round(z * 100)}`;
    const hit = this.index.get(k);
    if (hit !== undefined) return hit;
    const i = this.verts.length / 3;
    this.verts.push(x, y, z);
    this.index.set(k, i);
    return i;
  }

  face(ids: number[], n: P3) {
    const clean: number[] = [];
    for (const id of ids) if (clean[clean.length - 1] !== id) clean.push(id);
    if (clean.length > 1 && clean[0] === clean[clean.length - 1]) clean.pop();
    if (clean.length < 3) return;
    this.faces.push(clean);
    this.normals.push(n);
  }

  build(): Mesh {
    const faceCount = this.faces.length;
    const fo = new Int32Array(faceCount + 1);
    let total = 0;
    for (let i = 0; i < faceCount; i++) {
      fo[i] = total;
      total += this.faces[i].length;
    }
    fo[faceCount] = total;

    const fi = new Int32Array(total);
    let c = 0;
    for (const f of this.faces) for (const v of f) fi[c++] = v;

    const fn = new Float32Array(faceCount * 3);
    for (let i = 0; i < faceCount; i++) {
      fn[i * 3] = this.normals[i][0];
      fn[i * 3 + 1] = this.normals[i][1];
      fn[i * 3 + 2] = this.normals[i][2];
    }

    const em = new Map<number, [number, number, number, number]>();
    for (let f = 0; f < faceCount; f++) {
      const face = this.faces[f];
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const key = Math.min(a, b) * 100000 + Math.max(a, b);
        const hit = em.get(key);
        if (hit) hit[3] = f;
        else em.set(key, [Math.min(a, b), Math.max(a, b), f, -1]);
      }
    }

    const edgeCount = em.size;
    const ev = new Int32Array(edgeCount * 4);
    const ecrease = new Uint8Array(edgeCount);
    const eIndex = new Map<number, number>();
    let e = 0;
    for (const [key, v] of em) {
      eIndex.set(key, e);
      ev[e * 4] = v[0];
      ev[e * 4 + 1] = v[1];
      ev[e * 4 + 2] = v[2];
      ev[e * 4 + 3] = v[3];
      if (v[3] >= 0) {
        const a = this.normals[v[2]];
        const b = this.normals[v[3]];
        const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        ecrease[e] = d < 0.72 ? 1 : 0; // زاویه‌ی بیش از ~۴۴ درجه
      } else {
        ecrease[e] = 1;
      }
      e++;
    }

    const fe = new Int32Array(total);
    c = 0;
    for (const face of this.faces) {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        fe[c++] = eIndex.get(Math.min(a, b) * 100000 + Math.max(a, b))!;
      }
    }

    return { vx: new Float32Array(this.verts), fi, fo, fn, ev, ecrease, fe, faceCount, edgeCount };
  }
}

/**
 * جسم دورانی از پروفیل (x, r).
 * قرارداد: سطح بیرونی در جهت +x پیموده می‌شود، پس نرمال = (-dr, dx).
 */
function lathe(mb: MeshBuilder, profile: [number, number][], seg: number, closed = true) {
  const m = profile.length;
  const last = closed ? m : m - 1;
  const cosA: number[] = [];
  const sinA: number[] = [];
  for (let j = 0; j < seg; j++) {
    const a = (j / seg) * Math.PI * 2;
    cosA.push(Math.cos(a));
    sinA.push(Math.sin(a));
  }
  const vid = (x: number, r: number, j: number) =>
    r < 0.002 ? mb.vertex(x, 0, 0) : mb.vertex(x, r * cosA[j], r * sinA[j]);

  for (let i = 0; i < last; i++) {
    const [x0, r0] = profile[i];
    const [x1, r1] = profile[(i + 1) % m];
    const dx = x1 - x0, dr = r1 - r0;
    const len = Math.hypot(dx, dr);
    if (len < 0.002) continue;
    const nx = -dr / len, nr = dx / len;
    for (let j = 0; j < seg; j++) {
      const j2 = (j + 1) % seg;
      const am = ((j + 0.5) / seg) * Math.PI * 2;
      mb.face(
        [vid(x0, r0, j), vid(x1, r1, j), vid(x1, r1, j2), vid(x0, r0, j2)],
        [nx, nr * Math.cos(am), nr * Math.sin(am)]
      );
    }
  }
}

/** منشور: مقطع پادساعتگرد در صفحه‌ی (y, z)، کشیده در راستای x */
function prism(mb: MeshBuilder, section: [number, number][], x0: number, x1: number) {
  const n = section.length;
  const A = section.map((s) => mb.vertex(x0, s[0], s[1]));
  const B = section.map((s) => mb.vertex(x1, s[0], s[1]));
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dy = section[j][0] - section[i][0];
    const dz = section[j][1] - section[i][1];
    const l = Math.hypot(dy, dz) || 1;
    mb.face([A[i], B[i], B[j], A[j]], [0, dz / l, -dy / l]);
  }
  mb.face([...B], [1, 0, 0]);
  mb.face([...A].reverse(), [-1, 0, 0]);
}

/** قطاع حلقوی (مثل دندانه‌ی چنگکی) بین دو شعاع و دو زاویه */
function arcSection(
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  steps = 4
): [number, number][] {
  const s: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    s.push([r0 * Math.cos(a), r0 * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / steps;
    s.push([r1 * Math.cos(a), r1 * Math.sin(a)]);
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* قطعات                                                               */
/* ------------------------------------------------------------------ */

const BORE = 15;
const SEG = 44;

/* مشخصات اتصال نر/ماده — همه‌ی قطعات از یک استاندارد پیروی می‌کنند */
const SPIG_R = 25; // شعاع زائده‌ی نر
const SPIG_L = 11; // طول زائده
const REC_R = 26.6; // شعاع نشیمنگاه ماده
const REC_L = 12; // عمق نشیمنگاه
/** همپوشانی محوری در حالت سرهم — زائده تا ته داخل نشیمنگاه می‌رود */
const MESH_DEPTH = SPIG_L - 1;

/**
 * پروفیل کامل یک قطعه‌ی چفت‌شونده.
 * `outer` باید از x = -h شروع و به x = +h ختم شود و شعاعش همه‌جا از
 * REC_R بزرگ‌تر باشد.
 */
function mate(h: number, outer: [number, number][]): [number, number][] {
  return [
    [-h + REC_L, BORE],
    [-h + REC_L, REC_R],
    [-h, REC_R],
    ...outer,
    [h, SPIG_R],
    [h + SPIG_L, SPIG_R],
    [h + SPIG_L, BORE],
  ];
}

type PartDef = {
  /** نیم‌ضخامت بدنه (بدون زائده) */
  h: number;
  /** بزرگ‌ترین شعاع — برای جای‌گذاری خط راهنما */
  rMax: number;
  build: (mb: MeshBuilder) => void;
};

/** ۱ — پولی شیاردار */
const drum: PartDef = {
  h: 28,
  rMax: 90,
  build: (mb) =>
    lathe(
      mb,
      mate(28, [
        [-28, 90], [-20, 90], [-20, 72], [20, 72], [20, 90], [28, 90],
      ]),
      SEG
    ),
};

/** ۲ — چرخ‌دنده */
const gear: PartDef = {
  h: 14,
  rMax: 84,
  build: (mb) => {
    const rRoot = 66, rTip = 84, teeth = 22;
    lathe(mb, mate(14, [[-14, 32], [-6, 32], [-6, rRoot], [6, rRoot], [6, 32], [14, 32]]), SEG);
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const w0 = step * 0.3, w1 = step * 0.19;
      prism(
        mb,
        [
          [(rRoot - 1) * Math.cos(a - w0), (rRoot - 1) * Math.sin(a - w0)],
          [rTip * Math.cos(a - w1), rTip * Math.sin(a - w1)],
          [rTip * Math.cos(a + w1), rTip * Math.sin(a + w1)],
          [(rRoot - 1) * Math.cos(a + w0), (rRoot - 1) * Math.sin(a + w0)],
        ],
        -14,
        14
      );
    }
  },
};

/** ۳ — واشر پخ‌دار */
const spacer: PartDef = {
  h: 10,
  rMax: 40,
  build: (mb) => lathe(mb, mate(10, [[-10, 32], [-4, 40], [4, 40], [10, 32]]), SEG),
};

/** ۴ — فلنج با بوس‌های پیچ */
const flange: PartDef = {
  h: 13,
  rMax: 64,
  build: (mb) => {
    lathe(mb, mate(13, [[-13, 32], [-5, 32], [-5, 64], [5, 64], [5, 32], [13, 32]]), SEG);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const cy = 47 * Math.cos(a), cz = 47 * Math.sin(a);
      prism(
        mb,
        Array.from({ length: 6 }, (_, j) => {
          const t = a + (j / 6) * Math.PI * 2;
          return [cy + 11 * Math.cos(t), cz + 11 * Math.sin(t)] as [number, number];
        }),
        4,
        13
      );
    }
  },
};

/** ۵ — کلاچ چنگکی: بدنه + شش دندانه که به درپوش قفل می‌شوند */
const DOG_TEETH = 6;
const DOG_R0 = 30;
const DOG_R1 = 46;
const collar: PartDef = {
  h: 15,
  rMax: 50,
  build: (mb) => {
    lathe(mb, mate(15, [[-15, 34], [-8, 34], [-8, 50], [8, 50], [8, 34], [15, 34]]), SEG);
    const step = (Math.PI * 2) / DOG_TEETH;
    for (let i = 0; i < DOG_TEETH; i++) {
      const a = i * step;
      prism(mb, arcSection(DOG_R0, DOG_R1, a - step * 0.22, a + step * 0.22), 8, 15 + MESH_DEPTH - 1);
    }
  },
};

/** ۶ — درپوش کاسه‌ای با شش پد که بین دندانه‌های کلاچ می‌نشیند */
const endcap: PartDef = {
  h: 15,
  rMax: 62,
  build: (mb) => {
    lathe(mb, mate(15, [[-15, 62], [-8, 62], [-8, 54], [9, 34], [15, 34]]), SEG);
    const step = (Math.PI * 2) / DOG_TEETH;
    for (let i = 0; i < DOG_TEETH; i++) {
      // نیم‌گام آفست تا لای دندانه‌های کلاچ بنشیند
      const a = i * step + step * 0.5;
      prism(
        mb,
        arcSection(DOG_R0, DOG_R1, a - step * 0.22, a + step * 0.22),
        -15 - MESH_DEPTH + 1,
        -15
      );
    }
  },
};

const PART_DEFS = [drum, gear, spacer, flange, collar, endcap];
export const PART_COUNT = PART_DEFS.length;

/** فاصله‌ی مرکز تا مرکز در حالت سرهم = مجموع نیم‌ضخامت‌ها منهای همپوشانی */
const TIGHT: number[] = PART_DEFS.slice(0, -1).map(
  (p, i) => p.h + PART_DEFS[i + 1].h - MESH_DEPTH
);
const OPEN_GAP = 132;

export function axialPositions(open: number): number[] {
  const steps = TIGHT.map((t) => t + OPEN_GAP * open);
  const total = steps.reduce((a, b) => a + b, 0);
  let cursor = -total / 2;
  const out = [cursor];
  for (const s of steps) {
    cursor += s;
    out.push(cursor);
  }
  return out;
}

const shaftHalf = (open: number) => {
  const xs = axialPositions(open);
  return xs[xs.length - 1] + PART_DEFS[PART_DEFS.length - 1].h + SPIG_L + 26;
};

/** مرکز افقی و پایین‌ترین نقطه‌ی هر قطعه روی صفحه — برای خطوط راهنما */
export function partAnchors(open: number, scale: number) {
  const xs = axialPositions(open);
  return xs.map((ax, i) => ({
    x: CX + W[0] * ax * scale,
    y: CY + W[1] * ax * scale + PART_DEFS[i].rMax * RVY * scale,
  }));
}

const PART_MESHES: Mesh[] = PART_DEFS.map((p) => {
  const mb = new MeshBuilder();
  p.build(mb);
  return mb.build();
});

const SHAFT_MESH: Mesh = (() => {
  const mb = new MeshBuilder();
  lathe(mb, [[-1, 0], [-1, 10.5], [1, 10.5], [1, 0]], 24);
  return mb.build();
})();

/* ------------------------------------------------------------------ */
/* رنگ                                                                 */
/* ------------------------------------------------------------------ */

/** طیف رنگی هم‌خانواده با لهجه‌ی سایت (ایندیگو → بنفش) */
const HUES = [220, 231, 243, 255, 268, 283];

export type Palette = {
  /** اشباع و روشناییِ سایه و نور برای قطعات رنگی */
  baseSat: number;
  baseLum: number;
  litSat: number;
  litLum: number;
  /** شفت خنثی می‌ماند تا رنگ‌ها با هم رقابت نکنند */
  shaftBase: [number, number, number];
  shaftLit: [number, number, number];
  line: string;
  leader: string;
};

function hsl(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

let cachedKey = "";
let cachedBase: [number, number, number][] = [];
let cachedLit: [number, number, number][] = [];

function tints(pal: Palette) {
  const key = `${pal.baseSat},${pal.baseLum},${pal.litSat},${pal.litLum}`;
  if (key === cachedKey) return;
  cachedKey = key;
  cachedBase = HUES.map((h) => hsl(h, pal.baseSat, pal.baseLum));
  cachedLit = HUES.map((h) => hsl(h, pal.litSat, pal.litLum));
}

/* ------------------------------------------------------------------ */
/* رندر                                                                */
/* ------------------------------------------------------------------ */

let bufSize = 0;
let px = new Float32Array(0);
let py = new Float32Array(0);
let pz = new Float32Array(0);

const ensure = (n: number) => {
  if (n <= bufSize) return;
  bufSize = n * 2;
  px = new Float32Array(bufSize);
  py = new Float32Array(bufSize);
  pz = new Float32Array(bufSize);
};

type Item = {
  mesh: Mesh;
  vOff: number;
  off: number;
  sx: number;
  /** ایندکس قطعه، یا -1 برای شفت */
  part: number;
  facing: Uint8Array;
  shade: Float32Array;
  z: number;
};

const items: Item[] = [];
const facingPool: Uint8Array[] = [];
const shadePool: Float32Array[] = [];
const faceRefs: { f: number; z: number }[] = [];

/**
 * صحنه را روی canvas می‌کشد.
 * @param spin زاویه‌ی چرخش شفت (رادیان)
 * @param open میزان بازشدن (۰ سرهم، ۱ کاملاً جدا)
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  spin: number,
  open: number,
  scale: number,
  pal: Palette
) {
  tints(pal);
  const cs = Math.cos(spin), sn = Math.sin(spin);
  const xs = axialPositions(open);
  const half = shaftHalf(open);

  items.length = 0;
  let totalV = 0;
  const add = (mesh: Mesh, off: number, sx: number, part: number) => {
    const vOff = totalV;
    totalV += mesh.vx.length / 3;
    const n = items.length;
    let facing = facingPool[n];
    let shade = shadePool[n];
    if (!facing || facing.length < mesh.faceCount) {
      facing = new Uint8Array(mesh.faceCount);
      shade = new Float32Array(mesh.faceCount);
      facingPool[n] = facing;
      shadePool[n] = shade;
    }
    items.push({ mesh, vOff, off, sx, part, facing, shade: shade!, z: 0 });
  };

  /* شفت فقط در فاصله‌ی بین قطعات (و دو سر) کشیده می‌شود؛ داخل قطعات
     پنهان است، پس هیچ‌وقت روی قطعه نمی‌افتد. */
  const spans: [number, number][] = [];
  let prev = -half;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - PART_DEFS[i].h - (i > 0 ? 0 : 0);
    if (a - prev > 1) spans.push([prev, a]);
    prev = xs[i] + PART_DEFS[i].h + SPIG_L;
  }
  if (half - prev > 1) spans.push([prev, half]);
  for (const [a, b] of spans) add(SHAFT_MESH, (a + b) / 2, (b - a) / 2, -1);
  for (let i = 0; i < PART_MESHES.length; i++) add(PART_MESHES[i], xs[i], 1, i);
  ensure(totalV);

  /* تبدیل رأس‌ها */
  for (let i = 0; i < items.length; i++) {
    const { mesh, vOff, off, sx } = items[i];
    const v = mesh.vx;
    const n = v.length / 3;
    for (let k = 0; k < n; k++) {
      const x = v[k * 3] * sx + off;
      const y0 = v[k * 3 + 1], z0 = v[k * 3 + 2];
      const y = y0 * cs - z0 * sn;
      const z = y0 * sn + z0 * cs;
      const j = vOff + k;
      px[j] = CX + (W[0] * x + U[0] * y + V[0] * z) * scale;
      py[j] = CY + (W[1] * x + U[1] * y + V[1] * z) * scale;
      pz[j] = x * DIR[0] + y * DIR[1] + z * DIR[2];
    }
    items[i].z = off * DIR[0];
  }

  const order = items.map((_, i) => i).sort((a, b) => items[b].z - items[a].z);

  ctx.lineJoin = "round";

  for (const i of order) {
    const it = items[i];
    const { mesh, vOff, facing, shade, part } = it;
    const { fn, fo, fi, ev, ecrease, fe, faceCount } = mesh;

    const [br, bg, bb] = part < 0 ? pal.shaftBase : cachedBase[part];
    const [lr, lg, lb] = part < 0 ? pal.shaftLit : cachedLit[part];

    faceRefs.length = 0;
    for (let f = 0; f < faceCount; f++) {
      const nx = fn[f * 3];
      const ny0 = fn[f * 3 + 1], nz0 = fn[f * 3 + 2];
      const ny = ny0 * cs - nz0 * sn;
      const nz = ny0 * sn + nz0 * cs;
      const front = nx * DIR[0] + ny * DIR[1] + nz * DIR[2] < 0;
      facing[f] = front ? 1 : 0;
      if (!front) continue;
      const key = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const fillL = Math.max(0, nx * FILL[0] + ny * FILL[1] + nz * FILL[2]);
      /* لبه‌ی درخشان: سطوحی که تقریباً موازی دیدند کمی روشن می‌شوند،
         مثل بازتاب فلز پولیش‌شده. */
      const graze = 1 - Math.abs(nx * DIR[0] + ny * DIR[1] + nz * DIR[2]);
      shade[f] = Math.min(
        1,
        0.08 + 0.72 * Math.pow(key, 0.7) + 0.2 * fillL + 0.14 * Math.pow(graze, 3)
      );
      let zs = 0;
      const a = fo[f], b = fo[f + 1];
      for (let k = a; k < b; k++) zs += pz[vOff + fi[k]];
      faceRefs.push({ f, z: zs / (b - a) });
    }
    faceRefs.sort((a, b) => b.z - a.z);

    /* سطح و خطوطِ همان وجه با هم رسم می‌شوند. اگر خطوط را جدا و بعد از
       همه‌ی سطوح می‌کشیدیم، لبه‌های پشتی از داخل قطعه دیده می‌شد. */
    for (let r = 0; r < faceRefs.length; r++) {
      const f = faceRefs[r].f;
      const a = fo[f], b = fo[f + 1];

      ctx.beginPath();
      const v0 = vOff + fi[a];
      ctx.moveTo(px[v0], py[v0]);
      for (let k = a + 1; k < b; k++) {
        const v = vOff + fi[k];
        ctx.lineTo(px[v], py[v]);
      }
      ctx.closePath();
      const t = shade[f];
      const col = `rgb(${Math.round(br + (lr - br) * t)},${Math.round(
        bg + (lg - bg) * t
      )},${Math.round(bb + (lb - bb) * t)})`;
      ctx.fillStyle = col;
      ctx.fill();
      // خط هم‌رنگ فقط برای پوشاندن درز ضدپله‌ای بین وجه‌های همسایه
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      let started = false;
      for (let k = a; k < b; k++) {
        const e = fe[k];
        const fA = ev[e * 4 + 2], fB = ev[e * 4 + 3];
        const silhouette = fB < 0 || facing[fA] !== facing[fB];
        if (!silhouette && !ecrease[e]) continue;
        if (!started) {
          ctx.beginPath();
          started = true;
        }
        const a0 = vOff + ev[e * 4], a1 = vOff + ev[e * 4 + 1];
        ctx.moveTo(px[a0], py[a0]);
        ctx.lineTo(px[a1], py[a1]);
      }
      if (started) {
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

/**
 * خطوط راهنما از هر قطعه تا ستون توضیح زیر آن.
 * @param reveal ۰ تا ۱ — با باز شدن مجموعه ظاهر می‌شوند
 */
export function renderLeaders(
  ctx: CanvasRenderingContext2D,
  open: number,
  scale: number,
  reveal: number,
  color: string
) {
  if (reveal <= 0.001) return;
  const anchors = partAnchors(open, scale);
  const baseY = VIEW_H - 2;
  const railY = VIEW_H - 26;

  ctx.save();
  ctx.globalAlpha = Math.min(1, reveal);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const colX = ((i + 0.5) / anchors.length) * VIEW_W;
    const dropY = a.y + 14;
    const t = Math.max(0, Math.min(1, reveal * 1.25 - i * 0.05));
    if (t <= 0) continue;

    // مسیر: پایین از قطعه → مورب تا ستون → پایین تا لبه
    const seg1 = Math.min(1, t / 0.4);
    const seg2 = Math.max(0, Math.min(1, (t - 0.35) / 0.4));
    const seg3 = Math.max(0, Math.min(1, (t - 0.7) / 0.3));

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x, a.y + (dropY - a.y) * seg1);
    if (seg2 > 0) {
      ctx.lineTo(a.x + (colX - a.x) * seg2, dropY + (railY - dropY) * seg2);
    }
    if (seg3 > 0) {
      ctx.lineTo(colX, railY + (baseY - railY) * seg3);
    }
    ctx.stroke();

    // نقطه‌ی اتصال روی قطعه
    ctx.beginPath();
    ctx.arc(a.x, a.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
