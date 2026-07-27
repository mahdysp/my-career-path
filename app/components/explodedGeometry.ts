/**
 * هندسه‌ی مجموعه‌ی مکانیکی «شش قطعه روی یک محور».
 *
 * چرا این‌طور نوشته شده:
 *   ۱. نسخه‌ی اول فقط خط بود؛ در حالت سرهم خطوط پشتی از داخل قطعه‌ی جلویی
 *      دیده می‌شد و تصویر به هم می‌ریخت.
 *   ۲. نسخه‌ی دوم سطح تو‌پُر داشت ولی دور هر وجه خط می‌کشید، پس دیسک‌ها شبیه
 *      برش‌های پیتزا می‌شدند و کل چیز چندوجهی و مصنوعی به‌نظر می‌رسید.
 *   ۳. نسخه‌ی فعلی مش واقعی می‌سازد (رأس‌های مشترک + توپولوژی یال‌ها) و فقط
 *      دو نوع خط می‌کشد: سیلوئت (مرز بین وجه رو‌به‌جلو و پشت) و لبه‌ی چین
 *      (جایی که دو وجه زاویه‌ی تند دارند). همان قراردادِ نقشه‌ی فنی.
 *
 * توپولوژی ثابت است و فقط یک‌بار ساخته می‌شود؛ در هر فریم صرفاً رأس‌ها حول
 * محور X می‌چرخند. برای همین با ~۲۵۰۰ مثلث هم روان می‌ماند.
 */

export const VIEW_W = 900;
export const VIEW_H = 430;
export const CX = 450;
export const CY = 215;

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

/** جهت نگاه دوربین (از دوربین به صحنه). عمق = dot(p, DIR) */
const DIR: [number, number, number] = [-sRY * cRX, sRX, cRY * cRX];

const unit = (l: [number, number, number]): [number, number, number] => {
  const m = Math.hypot(l[0], l[1], l[2]) || 1;
  return [l[0] / m, l[1] / m, l[2] / m];
};

/* نور نسبت به دوربین تعریف می‌شود، نه نسبت به جهان: کمی بالای شانه‌ی
   چپ بیننده. اگر مطلق تعریف شود، وجه‌های رو به دوربین تاریک می‌افتند. */
const LIGHT = unit([-DIR[0] * 0.9, -DIR[1] * 0.9 + 0.8, -DIR[2] * 0.9]);
/** نور کمکی از پایین‌عقب تا سایه‌ها کاملاً سیاه نشوند */
const FILL = unit([DIR[0] * 0.6 + 0.55, DIR[1] * 0.6 - 0.55, DIR[2] * 0.6]);

type P3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* ساخت مش                                                             */
/* ------------------------------------------------------------------ */

type Mesh = {
  /** مختصات رأس‌ها، سه‌تایی پشت‌سرهم */
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
  /** ایندکس یال‌های هر وجه، مسطح‌شده (هم‌اندازه با fi) */
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
    // رأس‌های تکراری پشت‌سرهم را حذف کن
    const clean: number[] = [];
    for (const id of ids) if (clean[clean.length - 1] !== id) clean.push(id);
    if (clean[0] === clean[clean.length - 1]) clean.pop();
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

    // توپولوژی یال‌ها
    const em = new Map<number, [number, number, number, number]>();
    for (let f = 0; f < faceCount; f++) {
      const face = this.faces[f];
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const key = lo * 100000 + hi;
        const hit = em.get(key);
        if (hit) hit[3] = f;
        else em.set(key, [lo, hi, f, -1]);
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

    /* برای هر وجه، ایندکس یال‌هایش — تا هنگام رسم بتوانیم خطوط را
       همراه با همان وجه بکشیم و مرتب‌سازی عمقی روی خطوط هم اعمال شود. */
    const fe = new Int32Array(total);
    c = 0;
    for (const face of this.faces) {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        fe[c++] = eIndex.get(Math.min(a, b) * 100000 + Math.max(a, b))!;
      }
    }

    return {
      vx: new Float32Array(this.verts),
      fi,
      fo,
      fn,
      ev,
      ecrease,
      fe,
      faceCount,
      edgeCount,
    };
  }
}

/**
 * جسم دورانی از پروفیل (x, r).
 * قرارداد: سطح بیرونی در جهت +x پیموده می‌شود، پس نرمال = (-dr, dx).
 */
function lathe(
  mb: MeshBuilder,
  profile: [number, number][],
  seg: number,
  dx0: number,
  closed = true
) {
  const m = profile.length;
  const last = closed ? m : m - 1;
  const ang = Array.from({ length: seg }, (_, j) => (j / seg) * Math.PI * 2);
  const cosA = ang.map(Math.cos);
  const sinA = ang.map(Math.sin);

  const vid = (x: number, r: number, j: number) =>
    r < 0.002
      ? mb.vertex(x + dx0, 0, 0)
      : mb.vertex(x + dx0, r * cosA[j], r * sinA[j]);

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
function prism(
  mb: MeshBuilder,
  section: [number, number][],
  x0: number,
  x1: number,
  dx0: number
) {
  const n = section.length;
  const A = section.map((s) => mb.vertex(x0 + dx0, s[0], s[1]));
  const B = section.map((s) => mb.vertex(x1 + dx0, s[0], s[1]));
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

/* ------------------------------------------------------------------ */
/* قطعات                                                               */
/* ------------------------------------------------------------------ */

const BORE = 15;
const SEG = 44;

type PartDef = { d: number; build: (mb: MeshBuilder, dx: number) => void };

/** ۱ — پولی شیاردار */
const drum: PartDef = {
  d: 56,
  build: (mb, dx) =>
    lathe(
      mb,
      [
        [-28, BORE], [-28, 90], [-20, 90], [-20, 72],
        [20, 72], [20, 90], [28, 90], [28, BORE],
      ],
      SEG,
      dx
    ),
};

/** ۲ — چرخ‌دنده */
const gear: PartDef = {
  d: 28,
  build: (mb, dx) => {
    const hx = 14, rRoot = 66, rTip = 84, teeth = 22;
    lathe(
      mb,
      [
        [-hx, BORE], [-hx, 30], [-6, 30], [-6, rRoot],
        [6, rRoot], [6, 30], [hx, 30], [hx, BORE],
      ],
      SEG,
      dx
    );
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const w0 = step * 0.3, w1 = step * 0.19;
      prism(
        mb,
        [
          [rRoot * Math.cos(a - w0) - 1, rRoot * Math.sin(a - w0) - 1],
          [rTip * Math.cos(a - w1), rTip * Math.sin(a - w1)],
          [rTip * Math.cos(a + w1), rTip * Math.sin(a + w1)],
          [rRoot * Math.cos(a + w0) + 1, rRoot * Math.sin(a + w0) + 1],
        ],
        -hx,
        hx,
        dx
      );
    }
  },
};

/** ۳ — واشر پخ‌دار */
const spacer: PartDef = {
  d: 18,
  build: (mb, dx) =>
    lathe(mb, [[-9, BORE], [-9, 30], [-4, 38], [4, 38], [9, 30], [9, BORE]], SEG, dx),
};

/** ۴ — فلنج با بوس‌های پیچ */
const flange: PartDef = {
  d: 24,
  build: (mb, dx) => {
    lathe(
      mb,
      [[-12, BORE], [-12, 28], [-5, 28], [-5, 64], [5, 64], [5, 28], [12, 28], [12, BORE]],
      SEG,
      dx
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const cy = 46 * Math.cos(a), cz = 46 * Math.sin(a);
      prism(
        mb,
        Array.from({ length: 6 }, (_, j) => {
          const t = a + (j / 6) * Math.PI * 2;
          return [cy + 11 * Math.cos(t), cz + 11 * Math.sin(t)] as [number, number];
        }),
        5,
        14,
        dx
      );
    }
  },
};

/** ۵ — مهره‌ی نه‌ضلعی */
const collar: PartDef = {
  d: 28,
  build: (mb, dx) => lathe(mb, [[-14, BORE], [-14, 48], [14, 48], [14, BORE]], 9, dx),
};

/** ۶ — درپوش کاسه‌ای */
const endcap: PartDef = {
  d: 26,
  build: (mb, dx) =>
    lathe(
      mb,
      [
        [-16, BORE], [-16, 70], [-10, 78], [-10, 70],
        [8, 30], [2, 26], [14, 30], [14, BORE],
      ].reverse() as [number, number][],
      SEG,
      dx
    ),
};

const PART_DEFS = [drum, gear, spacer, flange, collar, endcap];
export const PART_COUNT = PART_DEFS.length;

/* در حالت سرهم هم کمی درز می‌ماند: قطعات یک مجموعه‌ی به‌هم‌چسبیده‌اند نه
   یک توده‌ی درهم. بدون این، لبه‌ها روی هم می‌افتند و تصویر مبهم می‌شود. */
const TIGHT_GAP = 6;
const ASSEMBLED =
  PART_DEFS.reduce((a, p) => a + p.d, 0) + TIGHT_GAP * (PART_DEFS.length - 1);
const GAP = 112;

export function axialPositions(open: number): number[] {
  const gap = TIGHT_GAP + GAP * open;
  const total =
    PART_DEFS.reduce((a, p) => a + p.d, 0) + gap * (PART_DEFS.length - 1);
  let cursor = -total / 2;
  return PART_DEFS.map((p, i) => {
    const c = cursor + p.d / 2;
    cursor += p.d + (i < PART_DEFS.length - 1 ? gap : 0);
    return c;
  });
}

const shaftHalf = (open: number) =>
  (ASSEMBLED + GAP * (PART_DEFS.length - 1) * open) / 2 + 30;

/* هر قطعه یک بار در مبدأ ساخته می‌شود؛ جابه‌جایی محوری هنگام رندر اعمال می‌شود */
const PART_MESHES: Mesh[] = PART_DEFS.map((p) => {
  const mb = new MeshBuilder();
  p.build(mb, 0);
  return mb.build();
});

/* شفت با طول واحد ساخته می‌شود و در رندر کشیده می‌شود */
const SHAFT_MESH: Mesh = (() => {
  const mb = new MeshBuilder();
  lathe(mb, [[-1, 0], [-1, 10.5], [1, 10.5], [1, 0]], 24, 0);
  return mb.build();
})();

/* ------------------------------------------------------------------ */
/* رندر                                                                */
/* ------------------------------------------------------------------ */

export type Palette = {
  base: [number, number, number];
  lit: [number, number, number];
  line: string;
  lineSoft: string;
};

/* بافرهای بازاستفاده تا در هر فریم حافظه تخصیص ندهیم */
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
  /** جابه‌جایی محوری */
  off: number;
  /** کشش در راستای محور (فقط برای شفت) */
  sx: number;
  facing: Uint8Array;
  shade: Float32Array;
  /** عمق مرکز جسم — برای مرتب‌سازی بین اجسام */
  z: number;
};

const items: Item[] = [];
const facingPool: Uint8Array[] = [];
const shadePool: Float32Array[] = [];

type FaceRef = { it: number; f: number; z: number };
const faceRefs: FaceRef[] = [];

/**
 * صحنه را روی canvas می‌کشد.
 * @param spin زاویه‌ی چرخش شفت (رادیان)
 * @param open میزان بازشدن (۰ سرهم، ۱ کاملاً جدا)
 * @param scale بزرگ‌نمایی
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  spin: number,
  open: number,
  scale: number,
  pal: Palette
) {
  const cs = Math.cos(spin), sn = Math.sin(spin);
  const xs = axialPositions(open);
  const half = shaftHalf(open);

  /* --- جمع‌آوری اجسام و شمارش رأس‌ها ---
     شفت به تکه‌های بین قطعات شکسته می‌شود تا مرتب‌سازی عمقیِ جسم‌به‌جسم
     درست کار کند: یک استوانه‌ی بلند یک مرکز عمقی دارد و یا کاملاً جلوی
     همه می‌افتد یا کاملاً پشت همه. */
  items.length = 0;
  let totalV = 0;
  const add = (mesh: Mesh, off: number, sx: number) => {
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
    items.push({ mesh, vOff, off, sx, facing, shade: shade!, z: 0 });
  };

  /* شفت فقط در فاصله‌ی بین قطعات (و دو سر) کشیده می‌شود؛ داخل قطعات
     پنهان است، پس هیچ‌وقت روی قطعه نمی‌افتد. */
  const edges: [number, number][] = [];
  let prev = -half;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - PART_DEFS[i].d / 2;
    if (a - prev > 1) edges.push([prev, a]);
    prev = xs[i] + PART_DEFS[i].d / 2;
  }
  if (half - prev > 1) edges.push([prev, half]);
  for (const [a, b] of edges) add(SHAFT_MESH, (a + b) / 2, (b - a) / 2);
  for (let i = 0; i < PART_MESHES.length; i++) add(PART_MESHES[i], xs[i], 1);
  ensure(totalV);

  /* --- تبدیل رأس‌ها --- */
  for (let i = 0; i < items.length; i++) {
    const { mesh, vOff, off, sx } = items[i];
    const v = mesh.vx;
    const n = v.length / 3;
    for (let k = 0; k < n; k++) {
      const x = v[k * 3] * sx + off;
      const y0 = v[k * 3 + 1];
      const z0 = v[k * 3 + 2];
      const y = y0 * cs - z0 * sn;
      const z = y0 * sn + z0 * cs;
      const j = vOff + k;
      px[j] = CX + (W[0] * x + U[0] * y + V[0] * z) * scale;
      py[j] = CY + (W[1] * x + U[1] * y + V[1] * z) * scale;
      pz[j] = x * DIR[0] + y * DIR[1] + z * DIR[2];
    }
    // عمق مرکز جسم
    const yc = 0, zc = 0;
    items[i].z = off * DIR[0] + yc * DIR[1] + zc * DIR[2];
  }

  /* اجسام از دور به نزدیک؛ داخل هر جسم هم وجه‌ها مرتب می‌شوند */
  const order = items.map((_, i) => i).sort((a, b) => items[b].z - items[a].z);

  /* --- رو/پشت بودن، سایه، و رسم به‌ترتیب عمق --- */
  const [br, bg, bb] = pal.base;
  const [lr, lg, lb] = pal.lit;
  ctx.lineJoin = "round";

  for (const i of order) {
    const it = items[i];
    const { mesh, vOff, facing, shade } = it;
    const { fn, fo, fi, faceCount } = mesh;

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
         مثل بازتاب فلز پولیش‌شده. بدون این، بدنه‌ها یکنواخت و مات‌اند. */
      const graze = 1 - Math.abs(nx * DIR[0] + ny * DIR[1] + nz * DIR[2]);
      shade[f] = Math.min(
        1,
        0.08 + 0.72 * Math.pow(key, 0.7) + 0.2 * fillL + 0.14 * Math.pow(graze, 3)
      );
      let zs = 0;
      const a = fo[f], b = fo[f + 1];
      for (let k = a; k < b; k++) zs += pz[vOff + fi[k]];
      faceRefs.push({ it: i, f, z: zs / (b - a) });
    }
    faceRefs.sort((a, b) => b.z - a.z);

    /* سطوح و خطوط با هم، به‌ترتیب عمق. اگر خطوط را جدا و بعد از همه‌ی
       سطوح می‌کشیدیم، لبه‌های پشتیِ همان قطعه از داخلش دیده می‌شد و
       تصویر شفاف به‌نظر می‌رسید. */
    const { ev, ecrease, fe } = mesh;
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

      // یال‌های دیدنی همین وجه
      let started = false;
      for (let k = a; k < b; k++) {
        const e = fe[k];
        const fA = ev[e * 4 + 2];
        const fB = ev[e * 4 + 3];
        const isSilhouette = fB < 0 || facing[fA] !== facing[fB];
        if (!isSilhouette && !ecrease[e]) continue;
        if (!started) {
          ctx.beginPath();
          started = true;
        }
        const a0 = vOff + ev[e * 4];
        const a1 = vOff + ev[e * 4 + 1];
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
