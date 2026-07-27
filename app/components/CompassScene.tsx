"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * صحنه‌ی سه‌بعدی «نقشه و قطب‌نما».
 *
 * مدل از یک فایل glTF بارگذاری می‌شود و فرزندان سطح اولش به‌عنوان «قطعه»
 * در نظر گرفته می‌شوند. با اسکرول:
 *   ۱. مجموعه سرهم است و آرام می‌چرخد
 *   ۲. کمی بزرگ‌تر می‌شود و زاویه‌ی دید باز می‌شود
 *   ۳. قطعات از هم جدا می‌شوند
 *
 * اگر فایل مدل موجود نباشد، کل بخش با یک fallback ساده جایگزین می‌شود
 * تا صفحه هرگز نشکند.
 */

const MODEL_URL = "/models/compass.glb";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** میرایی مستقل از نرخ فریم */
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  lerp(cur, target, 1 - Math.exp(-lambda * Math.min(dt, 0.1)));

type Mode = "wire" | "textured";

/* ─────────── مدل ─────────── */

function Model({
  progress,
  mode,
  lineColor,
}: {
  progress: React.RefObject<number>;
  mode: Mode;
  lineColor: string;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<THREE.Group>(null);

  /* یک بار: کلون، نرمال‌سازی اندازه، و استخراج قطعات */
  const built = useMemo(() => {
    const model = scene.clone(true);

    // مرکز و مقیاس را نرمال می‌کنیم تا هر مدلی با هر ابعادی درست بنشیند
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const k = 3.6 / maxDim;
    model.scale.setScalar(k);
    model.position.sub(center.multiplyScalar(k));

    if (mode === "wire") {
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(lineColor),
        transparent: true,
        opacity: 0.85,
      });
      const fillMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0b0b0e"),
        transparent: true,
        opacity: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.material = fillMat;
        const edges = new THREE.EdgesGeometry(m.geometry, 28);
        m.add(new THREE.LineSegments(edges, lineMat));
      });
    }

    // قطعات = فرزندان سطح اول (اگر فقط یک فرزند بود، یک سطح پایین‌تر می‌رویم)
    let kids = [...model.children];
    if (kids.length === 1 && kids[0].children.length > 1) {
      kids = [...kids[0].children];
    }

    const parts = kids.map((obj, i) => {
      const b = new THREE.Box3().setFromObject(obj);
      const c = b.getCenter(new THREE.Vector3());
      return {
        obj,
        base: obj.position.clone(),
        // جهت پخش‌شدن: افقی بر اساس موقعیت فعلی، با کمی ارتفاع
        dir: new THREE.Vector3(
          c.x === 0 ? (i % 2 ? 1 : -1) : Math.sign(c.x),
          (i % 3) - 1,
          0
        ).normalize(),
        spread: 1.5 + (i % 4) * 0.5,
        delay: i * 0.05,
      };
    });

    return { model, parts };
  }, [scene, mode, lineColor]);

  /* three اشیاء را در حلقه‌ی رندر جابه‌جا می‌کند؛ نگه‌داشتن آن‌ها پشت ref
     این جهش‌ها را از فاز رندر React جدا می‌کند. */
  const sceneRef = useRef(built);
  useEffect(() => {
    sceneRef.current = built;
  }, [built]);

  /* اشیاء three.js خارج از درخت React زندگی می‌کنند و روش استاندارد
     انیمیشن‌شان جهش مستقیم position/rotation در حلقه‌ی فریم است.
     این کار هیچ state ری‌اکتی را تغییر نمی‌دهد. */
  /* eslint-disable react-hooks/immutability */
  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const { parts } = sceneRef.current;
    const p = progress.current ?? 0;

    const zoom = easeInOut(range(p, 0, 0.32));
    const open = easeInOut(range(p, 0.3, 0.95));

    // چرخش آرام دائمی + باز شدن زاویه با اسکرول
    const spin = state.clock.elapsedTime * 0.12;
    g.rotation.y = damp(g.rotation.y, spin + zoom * 0.5, 4, dt);
    g.rotation.x = damp(g.rotation.x, 0.12 + zoom * 0.1, 4, dt);

    const s = lerp(0.88, 1.06, zoom);
    g.scale.setScalar(damp(g.scale.x || s, s, 5, dt));

    // نفس کشیدن ملایم تا قاب هرگز منجمد نشود
    g.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;

    // جدا شدن قطعات با تأخیر پلکانی
    for (const part of parts) {
      const local = easeInOut(
        clamp((open - part.delay) / Math.max(0.001, 1 - part.delay))
      );
      const tx = part.base.x + part.dir.x * part.spread * local;
      const ty = part.base.y + part.dir.y * part.spread * local * 0.45;
      part.obj.position.x = damp(part.obj.position.x, tx, 7, dt);
      part.obj.position.y = damp(part.obj.position.y, ty, 7, dt);
    }
  });
  /* eslint-enable react-hooks/immutability */

  return <primitive ref={root} object={built.model} />;
}

/* ─────────── صحنه ─────────── */

function Scene({ progress, mode, lineColor }: {
  progress: React.RefObject<number>;
  mode: Mode;
  lineColor: string;
}) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 7.2);
  }, [camera]);

  return (
    <>
      {mode === "textured" && (
        <>
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 5]} intensity={1.5} />
          <directionalLight position={[-5, -2, -3]} intensity={0.5} />
        </>
      )}
      <Suspense fallback={null}>
        <Model progress={progress} mode={mode} lineColor={lineColor} />
      </Suspense>
    </>
  );
}

/* ─────────── بخش کامل ─────────── */

const STEPS = [
  { t: "مقصد", d: "کدام شغل‌ها با شما هم‌خوانی دارند" },
  { t: "مسیر", d: "از کجا شروع کنید و بعد چه" },
  { t: "توشه", d: "چه مهارتی لازم دارید" },
  { t: "افق", d: "این مسیر شما را کجا می‌برد" },
];

export default function CompassScene({ mode = "wire" }: { mode?: Mode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [reveal, setReveal] = useState(0);
  const [ok, setOk] = useState(true);
  const [lineColor, setLineColor] = useState("#ededef");

  /* رنگ خطوط را از تم فعلی می‌گیریم تا با روشن/تیره هماهنگ بماند */
  useEffect(() => {
    const read = () => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();
      if (c) setLineColor(c);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  /* اگر فایل مدل نبود، بخش را پنهان می‌کنیم تا صفحه نشکند */
  useEffect(() => {
    let alive = true;
    fetch(MODEL_URL, { method: "HEAD" })
      .then((r) => alive && setOk(r.ok))
      .catch(() => alive && setOk(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const startAt = vh * 0.6;
      const dist = Math.max(1, Math.min(r.height * 0.8, vh * 0.9));
      progress.current = clamp((startAt - r.top) / dist);
      setReveal(progress.current);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!ok) return null;

  return (
    <div ref={wrapRef} className="k2-cmp">
      <div className="k2-cmp-head">
        <span className="k2-cmp-eyebrow">
          <span className="k2-cmp-tri" />
          مسیریابی
        </span>
        <h2 className="k2-cmp-title">هر مسیری با یک نقشه شروع می‌شود</h2>
        <p className="k2-cmp-sub">
          کسی که راه را می‌داند، سریع‌تر نمی‌رود — درست‌تر می‌رود.
          Karex پیش از آنکه قدم بردارید، نقشه‌ی مسیرتان را روشن می‌کند.
        </p>
      </div>

      <div className="k2-cmp-stage">
        <Canvas
          dpr={[1, 1.8]}
          camera={{ fov: 34, position: [0, 0, 7.2] }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene progress={progress} mode={mode} lineColor={lineColor} />
        </Canvas>
      </div>

      <div className="k2-cmp-legend">
        {STEPS.map((s, i) => (
          <div
            key={s.t}
            className={`k2-cmp-item ${reveal > 0.15 + i * 0.12 ? "on" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="k2-cmp-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="k2-cmp-name">{s.t}</div>
              <div className="k2-cmp-hint">{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="k2-cmp-credit">
        مدل سه‌بعدی:{" "}
        <a href="https://sketchfab.com/3d-models/old-water-treasure-44fd8735cc6e4a6f8806f7a6a4130ed7" target="_blank" rel="noopener noreferrer">
          Old Water Treasure
        </a>{" "}
        اثر yonimantz — مجوز CC BY 4.0
      </p>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
