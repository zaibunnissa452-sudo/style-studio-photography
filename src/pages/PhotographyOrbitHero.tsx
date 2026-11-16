
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type OrbitEvent = {
  storyIndex: number;
  image: string;
  title: string;
};

type Props = {
  events: readonly OrbitEvent[];
  portrait: string;
  onOpenStory: (storyIndex: number) => void;
};

const cinematicEase = [0.22, 1, 0.36, 1] as const;

function OrbitCard({
  event,
  index,
  carouselOffset,
  carouselWidth,
  itemCount,
  onOpenStory,
}: {
  event: OrbitEvent;
  index: number;
  carouselOffset: ReturnType<typeof useMotionValue<number>>;
  carouselWidth: number;
  itemCount: number;
  onOpenStory: (storyIndex: number) => void;
}) {
  const position = (offset: number) => {
    const step = carouselWidth / Math.max(itemCount, 1);
    const wrappedX =
      ((index * step + offset + carouselWidth / 2) % carouselWidth +
        carouselWidth) %
      carouselWidth;
    const x = wrappedX - carouselWidth / 2;
    const phase = (x / carouselWidth) * Math.PI * 2;
    const depth = Math.cos(phase);

    return {
      x,
      y: Math.sin(phase) * 14,
      z: depth * 46,
      depth,
      scale: 0.84 + ((depth + 1) / 2) * 0.14,
      tilt: Math.sin(phase) * -3,
    };
  };

  const transform = useTransform(carouselOffset, (offset) => {
    const card = position(offset);
    return `translate3d(calc(-50% + ${card.x.toFixed(2)}px), calc(-50% + ${card.y.toFixed(2)}px), ${card.z.toFixed(2)}px) rotateY(${card.tilt.toFixed(2)}deg) scale(${card.scale.toFixed(3)})`;
  });

  const opacity = useTransform(
    carouselOffset,
    (offset) => 0.7 + ((position(offset).depth + 1) / 2) * 0.24,
  );

  return (
    <motion.button
      className="photo-orbit-card"
      type="button"
      style={{ transform, opacity }}
      onClick={() => onOpenStory(event.storyIndex)}
      aria-label={`View Style Studio photograph: ${event.title}`}
    >
      <img
        src={event.image}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="low"
      />
      <span className="photo-orbit-card-caption">{event.title}</span>
    </motion.button>
  );
}

export function PhotographyOrbitHero({
  events,
  portrait,
  onOpenStory,
}: Props) {
  const carouselOffset = useMotionValue(0);

  const [backdropIndex, setBackdropIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  const prefersReducedMotion = useReducedMotion();

  const roleWords = ["weddings", "celebrations", "brand stories"];
  const entranceDelay = 2.35;

  const stageWidth = Math.min(
    1380,
    Math.max(320, width - (width <= 760 ? 30 : width * 0.12)),
  );

  const cardWidth =
    width <= 760
      ? Math.min(112, Math.max(82, width * 0.27))
      : Math.min(176, Math.max(132, width * 0.13));

  const carouselWidth = stageWidth + cardWidth * 2;

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const roleTimer = window.setInterval(() => {
      setRoleIndex((index) => (index + 1) % roleWords.length);
    }, 2200);

    return () => window.clearInterval(roleTimer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || events.length < 2) return;

    const backdropTimer = window.setInterval(() => {
      setBackdropIndex((index) => (index + 1) % events.length);
    }, 7200);

    return () => window.clearInterval(backdropTimer);
  }, [events.length, prefersReducedMotion]);

  // Preserve the original continuous 12-second carousel movement.
  useAnimationFrame((_time, delta) => {
    if (prefersReducedMotion || events.length < 2) return;

    const speed = carouselWidth / 12000;

    carouselOffset.set(
      (carouselOffset.get() + Math.min(delta, 50) * speed) % carouselWidth,
    );
  });

  const copyVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : entranceDelay,
      },
    },
  };

  const eyebrowVariants = {
    hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  const headingVariants = {
    hidden: {
      opacity: 0,
      y: 26,
      clipPath: "inset(0 0 100% 0)",
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      className="photo-orbit-hero"
      id="home"
      aria-label="Style Studio event photography"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
        event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--pointer-x", "50%");
        event.currentTarget.style.setProperty("--pointer-y", "42%");
      }}
    >
      <div className="photo-orbit-ambient" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={events[backdropIndex]?.image}
            className="photo-orbit-ambient-image"
            style={{
              backgroundImage: `url("${events[backdropIndex]?.image ?? ""}")`,
            }}
            initial={{ opacity: 0, scale: 1.09 }}
            animate={{ opacity: 1, scale: 1.015 }}
            exit={{ opacity: 0, scale: 1.055 }}
            transition={{
              opacity: { duration: 0.9, ease: "easeInOut" },
              scale: { duration: 8.5, ease: "linear" },
            }}
          />
        </AnimatePresence>
      </div>

      <motion.div
        className="photo-orbit-copy"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={copyVariants}
      >
        <motion.p
          className="photo-orbit-eyebrow"
          variants={eyebrowVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            ease: cinematicEase,
          }}
        >
          STYLE STUDIO PHOTOGRAPHY · HYDERABAD
        </motion.p>

        <motion.h1
          variants={headingVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Every tradition <em>deserves to be remembered.</em>
        </motion.h1>

        <motion.p
          className="photo-orbit-role"
          variants={textVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: cinematicEase,
          }}
          aria-label={`Photographer for ${roleWords[roleIndex]}`}
        >
          Photographing{" "}
          <span className="photo-orbit-role-word" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={roleWords[roleIndex]}
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 9, filter: "blur(5px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, y: -8, filter: "blur(4px)" }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.3,
                }}
              >
                {roleWords[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.p>

        <motion.p
          className="photo-orbit-description"
          variants={textVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            ease: cinematicEase,
          }}
        >
          Thoughtful photography and film for weddings, family milestones,
          press, and brands.
        </motion.p>

        <motion.div
          className="photo-orbit-actions"
          variants={textVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            ease: cinematicEase,
          }}
        >
          <motion.a
            className="photo-orbit-cta"
            href="#stories"
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.05 }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.98 }
            }
          >
            Explore the portfolio <span aria-hidden="true">→</span>
          </motion.a>

          <motion.a
            className="photo-orbit-secondary"
            href="#contact"
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.04 }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.98 }
            }
          >
            Check your date <span aria-hidden="true">→</span>
          </motion.a>
        </motion.div>
      </motion.div>

      <nav
        className="photo-orbit-services"
        aria-label="Photography categories"
      >
        <a href="#event-services">Weddings</a>
        <a href="#event-services">Birthdays &amp; family</a>
        <a href="#event-services">Press</a>
        <a href="#event-services">Brands &amp; events</a>
      </nav>

      <motion.a
        className="photo-orbit-scroll"
        href="#stories"
        initial={
          prefersReducedMotion ? false : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : entranceDelay + 0.85,
          duration: prefersReducedMotion ? 0 : 0.7,
          ease: cinematicEase,
        }}
      >
        <span>SCROLL TO EXPLORE</span>
        <i aria-hidden="true" />
      </motion.a>

      <div
        className="photo-orbit-stage"
        aria-label="Event photographs move across the hero behind Saleem"
      >
        <div className="photo-orbit-track">
          {events.map((event, index) => (
            <OrbitCard
              key={`${event.storyIndex}-${event.title}`}
              event={event}
              index={index}
              carouselOffset={carouselOffset}
              carouselWidth={carouselWidth}
              itemCount={events.length}
              onOpenStory={onOpenStory}
            />
          ))}
        </div>

        <motion.div
          className="photo-orbit-portrait"
          initial={
            prefersReducedMotion
              ? false
              : {
                  opacity: 0,
                  filter: "blur(14px)",
                  clipPath: "inset(100% 0 0 0)",
                }
          }
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            clipPath: "inset(0% 0 0 0)",
          }}
          transition={{
            delay: prefersReducedMotion ? 0 : entranceDelay + 0.05,
            duration: prefersReducedMotion ? 0 : 1.35,
            ease: cinematicEase,
          }}
        >
          <img
            src={portrait}
            alt="Mohammed Saleemuddin, Style Studio photographer in Hyderabad"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </motion.div>
      </div>
    </section>
  );
}
