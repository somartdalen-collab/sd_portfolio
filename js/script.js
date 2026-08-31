const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navIndicator = document.getElementById("navIndicator");
const navItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

/* ===== Preloader ===== */
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloaderBar");
if (preloader && preloaderBar) {
  requestAnimationFrame(() => { preloaderBar.style.width = "85%"; });
  window.addEventListener("load", () => {
    preloaderBar.style.width = "100%";
    setTimeout(() => preloader.classList.add("done"), 250);
  });
  // Fallback in case load event is delayed
  setTimeout(() => {
    preloaderBar.style.width = "100%";
    preloader.classList.add("done");
  }, 2200);
}

/* ===== Mobile menu ===== */
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* ===== Sliding nav indicator ===== */
function moveIndicatorTo(link) {
  if (!navIndicator || !link) return;
  const linkRect = link.getBoundingClientRect();
  const parentRect = navLinks.getBoundingClientRect();
  navIndicator.style.opacity = "1";
  navIndicator.style.width = `${linkRect.width}px`;
  navIndicator.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
}

navItems.forEach((link) => {
  link.addEventListener("mouseenter", () => moveIndicatorTo(link));
});
navLinks.addEventListener("mouseleave", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicatorTo(active);
});
window.addEventListener("resize", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicatorTo(active);
});

/* ===== Active section tracking ===== */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navItems.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) moveIndicatorTo(link);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener("load", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicatorTo(active);
});

/* ===== Scroll reveal with stagger ===== */
const revealGroups = new Map();
revealItems.forEach((item) => {
  const parent = item.parentElement;
  if (!revealGroups.has(parent)) revealGroups.set(parent, []);
  revealGroups.get(parent).push(item);
});
revealGroups.forEach((items) => {
  items.forEach((item, i) => {
    item.style.setProperty("--reveal-delay", `${Math.min(i * 0.08, 0.4)}s`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

/* ===== Terminal typing effect ===== */
function typeLine(el, text, speed) {
  return new Promise((resolve) => {
    if (reduceMotion) {
      el.textContent = text;
      resolve();
      return;
    }
    let i = 0;
    el.textContent = "";
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

async function runTerminal() {
  const lines = document.querySelectorAll(".typed-line");
  for (const line of lines) {
    await typeLine(line, line.dataset.text, 32);
    await new Promise((r) => setTimeout(r, 220));
  }
}

const terminal = document.querySelector(".terminal-window");
if (terminal) {
  const terminalObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runTerminal();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  terminalObserver.observe(terminal);
}

/* ===== Typing animation for section labels + hero subtitle ===== */
function typeElement(el) {
  if (!el || el.dataset.typed === "true") return;
  el.dataset.typed = "true";
  const text = el.dataset.text || el.textContent;
  typeLine(el, text, 28).then(() => el.classList.add("is-done"));
}

window.addEventListener("load", () => {
  document.querySelectorAll(".hero .type-target").forEach((el) => typeElement(el));
});

const labelTypeObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      typeElement(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll(".type-target").forEach((el) => {
  if (el.closest(".hero")) return;
  labelTypeObserver.observe(el);
});

/* ===== Animated skill bars + count-up ===== */
const skillCards = document.querySelectorAll(".skill-card");
function animateCount(el, target, duration) {
  if (reduceMotion) {
    el.textContent = `${target}%`;
    return;
  }
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(progress * target);
    el.textContent = `${value}%`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const skillObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.classList.add("in-view");
      const valueEl = card.querySelector(".skill-value");
      if (valueEl) animateCount(valueEl, parseInt(valueEl.dataset.target, 10), 1100);
      observer.unobserve(card);
    });
  },
  { threshold: 0.35 }
);
skillCards.forEach((card) => skillObserver.observe(card));

/* ===== Contact form ===== */
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent =
    "Thanks! This demo form is ready to connect to your email service or backend.";
  contactForm.reset();
});

/* ===== Scroll progress + header state ===== */
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.appendChild(progress);

const header = document.querySelector(".header");

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const percent = total > 0 ? (scrollTop / total) * 100 : 0;

  progress.style.width = `${percent}%`;

  if (header) {
    header.classList.toggle("scrolled", scrollTop > 30);
  }
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

/* ===== Cursor spotlight + card glow ===== */
document.addEventListener("mousemove", (event) => {
  document.body.style.setProperty("--mx", `${event.clientX}px`);
  document.body.style.setProperty("--my", `${event.clientY}px`);

  const card = event.target.closest(".skill-card, .project-card, .interest");
  if (card) {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
  }
});

/* ===== Magnetic buttons ===== */
if (!reduceMotion) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 3}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ===== Smooth in-page navigation ===== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

/* ===== Hero particle network ===== */
(function () {
  const canvas = document.getElementById("particles");
  const hero = document.getElementById("home");
  if (!canvas || !hero || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h, dpr;
  const mouse = { x: null, y: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.offsetWidth;
    h = hero.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(65, Math.floor((w * h) / 20000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.5 + 0.6
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0.01) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 0.7;
          p.y += (dy / dist) * force * 0.7;
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - dist / 130) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(103,232,249,.8)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });
  hero.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(step);
})();

/* ===== Custom cursor ===== */
(function () {
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!cursorDot || !cursorRing || !finePointer || reduceMotion) return;

  document.body.classList.add("has-custom-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const interactiveSelector = "a, button, .project-card, .skill-card, .interest, .detail-card, input, textarea";
  document.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
  });
})();

/* ===== 3D tilt on the terminal window and project cards ===== */
if (!reduceMotion) {
  function addTilt(el, max, extraTransform) {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * max).toFixed(2);
      const ry = (px * max).toFixed(2);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) ${extraTransform}`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  }

  const terminalEl = document.querySelector(".terminal-window");
  if (terminalEl) addTilt(terminalEl, 9, "translateY(-4px)");

  document.querySelectorAll(".project-card").forEach((card) => addTilt(card, 5, "translateY(-6px)"));
}

/* ===== Project card click feedback ===== */
const projectLinks = document.querySelectorAll(".project-link[href='#']");
projectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const card = link.closest(".project-card");
    if (reduceMotion) return;
    card.animate(
      [
        { transform: "translateY(-6px) scale(1)" },
        { transform: "translateY(-6px) scale(1.02)" },
        { transform: "translateY(-6px) scale(1)" }
      ],
      { duration: 350, easing: "ease-out" }
    );
  });
});
