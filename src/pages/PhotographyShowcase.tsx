import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  animate,
  easeInOut,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- Shared motion helpers ---------- */

/** Headline whose words rise out of a mask, one after another. */
function RevealWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <span>{text}</span>;

  return (
    <motion.span
      className="ss-words"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
    >
      <span className="ss-sr">{text}</span>
      {text.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden="true">
          <span className="ss-word-mask">
            <motion.span
              className="ss-word"
              variants={{ hidden: { y: "112%" }, visible: { y: "0%" } }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </motion.span>
  );
}

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- B + C. Pinned sequence: blue editorial -> arch + statistics ---------- */

function EditorialText() {
  return (
    <div className="ss-editorial-text">
      <FadeUp>
        <p className="photo-eyebrow">PEOPLE, PLACES &amp; PURPOSEFUL MOMENTS</p>
      </FadeUp>
      <h2 id="ss-editorial-title">
        <RevealWords text="Stories worth telling," delay={0.1} />
        <br />
        <em>
          <RevealWords text="moments worth keeping." delay={0.45} />
        </em>
      </h2>
      <FadeUp className="ss-lede" delay={0.2}>
        <p>
          Style Studio photographs weddings across faiths, birthdays and family milestones, cultural
          celebrations, business events, and press assignments with care and attention to the moments
          that matter.
        </p>
      </FadeUp>
    </div>
  );
}

function ArchText() {
  return (
    <>
      <p className="ss-arch-eyebrow">MOHAMMED SALEEMUDDIN</p>
      <h2 id="ss-stats-title">Over four decades of seeing what matters.</h2>
      <p className="ss-arch-copy">
        Photographing the people and in-between moments that make each gathering yours.
      </p>
      <p className="ss-arch-signature" aria-hidden="true">Saleem</p>
    </>
  );
}

function CountUp({ to, suffix = "", play, instant = false }: { to: number; suffix?: string; play: boolean; instant?: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (instant) return;
    if (!play) {
      setValue(0);
      return;
    }
    const controls = animate(0, to, {
      duration: 2.2,
      delay: 0.4,
      ease: EASE,
      onUpdate: (latest: number) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [play, instant, to]);

  const shown = instant ? to : value;
  return (
    <span>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
      <span className="ss-sr">
        {to}
        {suffix}
      </span>
    </span>
  );
}

/** Two real figures only, placed diagonally (top-left and bottom-right); the other two corners stay empty. */
function StatCorners({ on, instant }: { on: boolean; instant: boolean }) {
  const state = on ? "visible" : "hidden";
  const initial = instant ? "visible" : "hidden";
  const make = (hidden: any, visible: any, delay: number, duration = 0.9): import("framer-motion").Variants => ({
    hidden,
    visible: { ...visible, transition: { duration: instant ? 0 : duration, delay: instant ? 0 : delay, ease: EASE } },
  });
  const statLeft = make({ opacity: 0, x: -24 }, { opacity: 1, x: 0 }, 0.2);
  const statRight = make({ opacity: 0, x: 24, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)" }, 0.55, 1.3);
  const lineLeft = make({ pathLength: 0 }, { pathLength: 1 }, 0.35, 1);
  const lineRight = make({ pathLength: 0 }, { pathLength: 1 }, 0.7, 1);
  const dotLeft = make({ opacity: 0, scale: 0 }, { opacity: 1, scale: 1 }, 1.2, 0.4);
  const dotRight = make({ opacity: 0, scale: 0 }, { opacity: 1, scale: 1 }, 1.55, 0.4);

  return (
    <>
      <motion.div className="ss-stat ss-stat-left" initial={initial} animate={state} variants={statLeft}>
        <p className="ss-stat-number">
          <CountUp to={40} suffix="+" play={on} instant={instant} />
        </p>
        <p className="ss-stat-caption">Years of photography experience</p>
      </motion.div>

      <span className="ss-conn ss-conn-left" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path d="M 0 20 L 40 20 L 100 66" initial={initial} animate={state} variants={lineLeft} />
        </svg>
        <motion.span className="ss-conn-dot" initial={initial} animate={state} variants={dotLeft} />
      </span>

      <span className="ss-conn ss-conn-right" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path d="M 100 66 L 60 66 L 0 34" initial={initial} animate={state} variants={lineRight} />
        </svg>
        <motion.span className="ss-conn-dot" initial={initial} animate={state} variants={dotRight} />
      </span>

      <motion.div className="ss-stat ss-stat-right" initial={initial} animate={state} variants={statRight}>
        <p className="ss-stat-number ss-stat-word">Countless</p>
        <p className="ss-stat-caption">Photoshoots completed over the years</p>
      </motion.div>
    </>
  );
}

const ARCH_MAX_W = 350;

/** Stage size and arch geometry; the breakpoint matches the CSS (max-width: 899px). */
function useStageGeometry(ref: RefObject<HTMLDivElement | null>) {
  const [geo, setGeo] = useState({ w: 1280, h: 800, compact: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const compact = window.matchMedia("(max-width: 899px)").matches;
      setGeo((prev) => (prev.w === w && prev.h === h && prev.compact === compact ? prev : { w, h, compact }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("orientationchange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [ref]);

  const archW = Math.round(Math.min(ARCH_MAX_W, geo.w * (geo.compact ? 0.78 : 0.3)));
  const archH = Math.round(geo.compact ? Math.min(500, geo.h * 0.62) : Math.min(560, geo.h * 0.74));
  return { ...geo, archW, archH };
}

function PinnedSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { w, h, archW, archH } = useStageGeometry(stageRef);
  const [statsOn, setStatsOn] = useState(false);

  // 0 when the stage pins to the top of the viewport, 1 when it is released.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (latest) => setStatsOn(latest > 0.5));

  const insetX = Math.max(0, (w - archW) / 2);
  const insetY = Math.max(0, (h - archH) / 2);
  const clipFrom = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";
  const clipTo = `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${archW / 2}px ${archW / 2}px 18px 18px)`;

  // One continuous move: the full-bleed blue collapses into the arch while the text hands over.
  const clipPath = useTransform(scrollYProgress, [0.18, 0.52], [clipFrom, clipTo], { ease: easeInOut });
  const editorialOpacity = useTransform(scrollYProgress, [0.14, 0.34], [1, 0]);
  const editorialY = useTransform(scrollYProgress, [0, 0.34], [0, -40]);
  const archOpacity = useTransform(scrollYProgress, [0.30, 0.48], [0, 1]);
  const archY = useTransform(scrollYProgress, [0.30, 0.48], [24, 0]);
  const ghostOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section className="ss-seq" id="experience" ref={sectionRef} aria-labelledby="ss-editorial-title">
      <div
        className="ss-seq-stage"
        ref={stageRef}
        style={{ "--arch-w": `${archW}px`, "--arch-h": `${archH}px` } as CSSProperties}
      >
        <motion.p className="ss-ghost" style={{ opacity: ghostOpacity, y: ghostY }} aria-hidden="true">
          STYLE STUDIO
        </motion.p>
        <motion.div className="ss-seq-blue" style={{ clipPath }} aria-hidden="true" />
        <motion.div className="ss-seq-editorial" style={{ opacity: editorialOpacity, y: editorialY }}>
          <EditorialText />
        </motion.div>
        <div className="ss-seq-grid">
          <motion.div className="ss-arch-content" style={{ opacity: archOpacity, y: archY }}>
            <ArchText />
          </motion.div>
          <StatCorners on={statsOn} instant={false} />
        </div>
      </div>
    </section>
  );
}

/** Reduced motion: no pinning or scroll-linked movement; the same content as two static sections. */
function StaticSequence() {
  return (
    <>
      <section className="ss-editorial-static" id="experience" aria-labelledby="ss-editorial-title">
        <EditorialText />
      </section>
      <section className="ss-seq-static" aria-labelledby="ss-stats-title">
        <p className="ss-ghost ss-ghost-static" aria-hidden="true">STYLE STUDIO</p>
        <div className="ss-seq-grid ss-seq-grid-static">
          <div className="ss-arch-content ss-arch-static">
            <ArchText />
          </div>
          <StatCorners on instant />
        </div>
      </section>
    </>
  );
}

export function PhotographySequence() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? <StaticSequence /> : <PinnedSequence />;
}

/* ---------- D. Numbered portfolio showcase ---------- */

export type ShowcaseImage = {
  src: string;
  label: string;
  storyIndex: number;
};

export type ShowcaseProject = {
  number: string;
  title: string;
  description: string;
  main: ShowcaseImage & { ratio: "portrait" | "tall" | "landscape" };
  small: ShowcaseImage;
};

function ShowcasePanel({
  image,
  className,
  from,
  onOpen,
}: {
  image: ShowcaseImage;
  className: string;
  from: "left" | "right";
  onOpen: (storyIndex: number) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["-6%", "6%"]);
  const hiddenClip = from === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";

  return (
    <motion.div
      className={`ss-panel ${className}`}
      initial={prefersReducedMotion ? false : { clipPath: hiddenClip }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 1.15, ease: EASE }}
    >
      <button
        ref={ref}
        className="ss-panel-button"
        type="button"
        onClick={() => onOpen(image.storyIndex)}
        aria-label={`View Style Studio photograph: ${image.label}`}
      >
        <span className="ss-panel-media">
          <motion.img src={image.src} alt="" loading="lazy" decoding="async" width={600} height={750} style={{ y: imageY, objectFit: "cover", width: "100%", height: "100%" }} />
        </span>
        <span className="ss-panel-label">
          {image.label} <span aria-hidden="true">↗</span>
        </span>
      </button>
    </motion.div>
  );
}

export function PhotographyShowcase({
  projects,
  onOpenStory,
}: {
  projects: readonly ShowcaseProject[];
  onOpenStory: (storyIndex: number) => void;
}) {
  return (
    <section className="ss-showcase" id="selected-work" aria-labelledby="ss-showcase-title">
      <div className="ss-showcase-head">
        <div>
          <FadeUp>
            <p className="photo-eyebrow">SELECTED WORK</p>
          </FadeUp>
          <h2 id="ss-showcase-title">
            <RevealWords text="Stories from the day," />
            <br />
            <em>
              <RevealWords text="carefully kept." delay={0.3} />
            </em>
          </h2>
        </div>
        <FadeUp delay={0.15}>
          <a className="photo-text-link" href="#stories">
            See every photograph <span aria-hidden="true">↗</span>
          </a>
        </FadeUp>
      </div>

      {projects.map((project, index) => {
        const flipped = index % 2 === 1;
        return (
          <article className={`ss-project${flipped ? " is-flipped" : ""}`} key={project.number}>
            <div className="ss-project-text">
              <FadeUp>
                <p className="ss-project-number">{project.number}.</p>
              </FadeUp>
              <h3 className="ss-project-title">
                <RevealWords text={project.title} delay={0.1} />
              </h3>
              <FadeUp delay={0.25}>
                <p className="ss-project-desc">{project.description}</p>
              </FadeUp>
            </div>
            <ShowcasePanel
              image={project.main}
              className={`ss-panel-main ss-r-${project.main.ratio}`}
              from={flipped ? "left" : "right"}
              onOpen={onOpenStory}
            />
            <ShowcasePanel
              image={project.small}
              className="ss-panel-small"
              from={flipped ? "right" : "left"}
              onOpen={onOpenStory}
            />
          </article>
        );
      })}
    </section>
  );
}
