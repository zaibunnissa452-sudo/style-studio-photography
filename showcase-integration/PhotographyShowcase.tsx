import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";

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

/* ---------- B. Blue editorial statement ---------- */

export function PhotographyEditorial() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  // The blue band rises from the bottom edge of the hero while the section scrolls in.
  const bandY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["100%", "0%"]);

  return (
    <section className="ss-editorial" ref={ref} aria-labelledby="ss-editorial-title">
      <motion.div className="ss-editorial-band" style={{ y: bandY }} aria-hidden="true" />
      <div className="ss-editorial-inner">
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
    </section>
  );
}

/* ---------- C. Animated statistics ---------- */

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(prefersReducedMotion ? to : 0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 2.4,
      delay: 0.5,
      ease: EASE,
      onUpdate: (latest: number) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, prefersReducedMotion, to]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">
        {value}
        {suffix}
      </span>
      <span className="ss-sr">
        {to}
        {suffix}
      </span>
    </span>
  );
}

export function PhotographyStats() {
  const prefersReducedMotion = useReducedMotion();
  const still = Boolean(prefersReducedMotion);

  const archVariants = {
    hidden: still ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: "inset(100% 0% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: still ? 0 : 1.2, ease: EASE } },
  };
  const lineVariants = {
    hidden: still ? { scaleX: 1 } : { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: still ? 0 : 0.9, ease: EASE } },
  };
  const statLeftVariants = {
    hidden: still ? { opacity: 1, x: 0 } : { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0, transition: { duration: still ? 0 : 0.9, ease: EASE } },
  };
  const statRightVariants = {
    hidden: still ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 28, filter: "blur(10px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: still ? 0 : 1.4, ease: EASE } },
  };

  return (
    <section className="ss-stats" id="experience" aria-labelledby="ss-stats-title">
      <motion.div
        className="ss-stats-stage"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: still ? 0 : 0.22, delayChildren: 0.05 } } }}
      >
        <motion.div className="ss-stat ss-stat-left" variants={statLeftVariants}>
          <p className="ss-stat-number">
            <CountUp to={40} suffix="+" />
          </p>
          <p className="ss-stat-caption">Years of photography experience</p>
        </motion.div>

        <motion.span className="ss-line ss-line-left" variants={lineVariants} aria-hidden="true" />

        <motion.div className="ss-arch" variants={archVariants}>
          <p className="ss-arch-eyebrow">MOHAMMED SALEEMUDDIN</p>
          <h2 id="ss-stats-title">Over four decades of seeing what matters.</h2>
          <p className="ss-arch-copy">
            Photographing the people and in-between moments that make each gathering yours.
          </p>
          <p className="ss-arch-signature" aria-hidden="true">Saleem</p>
        </motion.div>

        <motion.span className="ss-line ss-line-right" variants={lineVariants} aria-hidden="true" />

        <motion.div className="ss-stat ss-stat-right" variants={statRightVariants}>
          <p className="ss-stat-number ss-stat-word">Countless</p>
          <p className="ss-stat-caption">Photoshoots completed over the years</p>
        </motion.div>
      </motion.div>
    </section>
  );
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
          <motion.img src={image.src} alt="" loading="lazy" decoding="async" style={{ y: imageY }} />
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
