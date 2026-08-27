const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

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

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navItems.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

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

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent =
    "Thanks! This demo form is ready to connect to your email service or backend.";
  contactForm.reset();
});


/* ===== INTERACTIVE EFFECTS ===== */

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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const projectLinks = document.querySelectorAll(".project-link[href='#']");
projectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const card = link.closest(".project-card");
    card.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.025)" },
        { transform: "scale(1)" }
      ],
      { duration: 350, easing: "ease-out" }
    );
  });
});
