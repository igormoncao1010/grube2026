const canvas = document.querySelector("#motion-canvas");
const ctx = canvas.getContext("2d");
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const musicButton = document.querySelector(".music-button");
const siteJingle = document.querySelector("#site-jingle");
const navLinks = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll("[data-reveal]");
const marqueeTrack = document.querySelector(".ticker-track");
const causeButtons = document.querySelectorAll(".cause-item");
const causeTitle = document.querySelector("#cause-title");
const causeText = document.querySelector("#cause-text");
const form = document.querySelector(".signup-form");
const formNote = document.querySelector(".form-note");
const countItems = document.querySelectorAll("[data-count]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const supportCard = document.querySelector("#support-card");
const supportName = document.querySelector("#support-name");
const supportCity = document.querySelector("#support-city");
const supportPhotoInput = document.querySelector("#support-photo");
const supportFormatInputs = document.querySelectorAll('input[name="support-format"]');
const supportStoryModelInputs = document.querySelectorAll('input[name="support-story-model"]');
const supportProfileModelInputs = document.querySelectorAll('input[name="support-profile-model"]');
const supportModelGroups = document.querySelectorAll("[data-format-models]");
const downloadSupportCard = document.querySelector("#download-support-card");
const supportCardStatus = document.querySelector("#support-card-status");

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

let particles = [];
let supportPhoto = null;
let supportLogo = null;
let supportCityBackground = null;
let jingleStarted = false;

function resizeCanvas() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  particles = Array.from({ length: Math.min(110, Math.floor(window.innerWidth / 11)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.2 + 0.6,
    vx: Math.random() * 0.38 - 0.19,
    vy: Math.random() * 0.42 - 0.16,
    hue: ["#00a870", "#ffd63d", "#2257ff", "#ff6048"][Math.floor(Math.random() * 4)]
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

    if (distance < 180) {
      particle.x -= dx * 0.002;
      particle.y -= dy * 0.002;
    }

    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -12) particle.x = window.innerWidth + 12;
    if (particle.x > window.innerWidth + 12) particle.x = -12;
    if (particle.y < -12) particle.y = window.innerHeight + 12;
    if (particle.y > window.innerHeight + 12) particle.y = -12;

    ctx.beginPath();
    ctx.fillStyle = particle.hue;
    ctx.globalAlpha = 0.36;
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}

function animateCount(item) {
  if (item.dataset.counted) return;
  item.dataset.counted = "true";

  const target = Number(item.dataset.count || 0);
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.matches("[data-count]")) animateCount(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));
countItems.forEach((item) => revealObserver.observe(item));

function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);

  if (header) {
    header.style.minHeight = window.innerWidth <= 960 ? "68px" : window.scrollY > 70 ? "56px" : "62px";
  }

  if (marqueeTrack) {
    marqueeTrack.style.setProperty("--marquee-x", `${-window.scrollY * 0.34}px`);
  }

  document.documentElement.style.setProperty("--orbit-x", `${Math.sin(window.scrollY * 0.003) * 18}px`);
  document.documentElement.style.setProperty("--orbit-y", `${Math.cos(window.scrollY * 0.003) * 16}px`);

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.speed || 0.12);
    const rect = item.getBoundingClientRect();
    const offset = (rect.top - window.innerHeight / 2) * speed;
    item.style.transform = `translateY(${offset}px)`;
  });
}

function updateMusicButton() {
  if (!musicButton || !siteJingle) return;
  const isPlaying = !siteJingle.paused;
  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.setAttribute("aria-label", isPlaying ? "Pausar jingle" : "Tocar jingle");
  document.body.classList.toggle("music-playing", isPlaying);
}

async function playJingle() {
  if (!siteJingle) return;

  try {
    await siteJingle.play();
    jingleStarted = true;
    updateMusicButton();
  } catch (error) {
    updateMusicButton();
  }
}

function toggleJingle() {
  if (!siteJingle) return;

  if (siteJingle.paused) {
    playJingle();
    return;
  }

  siteJingle.pause();
  updateMusicButton();
}

function getSupportFormat() {
  const selected = document.querySelector('input[name="support-format"]:checked');
  return selected?.value || "story";
}

function getSupportModel() {
  const format = getSupportFormat();
  const selected = document.querySelector(
    format === "profile" ? 'input[name="support-profile-model"]:checked' : 'input[name="support-story-model"]:checked'
  );
  return selected?.value || "1";
}

function updateSupportModelGroups() {
  const format = getSupportFormat();
  supportModelGroups.forEach((group) => {
    group.classList.toggle("is-hidden", group.dataset.formatModels !== format);
  });
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }

    if (index === words.length - 1) context.fillText(line, x, currentY);
  });

  return currentY;
}

function drawSingleLineText(context, text, x, y, maxWidth, maxSize, minSize, weight = 900, family = "Arial") {
  let size = maxSize;
  while (size > minSize) {
    context.font = `${weight} ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  context.fillText(text, x, y);
  return size;
}

function drawCoverImage(context, image, x, y, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function roundedRectangle(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawLogo(context, x, y, width) {
  if (supportLogo?.complete && supportLogo.naturalWidth) {
    const height = (supportLogo.naturalHeight / supportLogo.naturalWidth) * width;
    context.drawImage(supportLogo, x, y, width, height);
    return height;
  }

  return 0;
}

function drawStoryCard(context, width, height, name, city, model) {
  context.fillStyle = model === "2" ? "#f4f4f1" : model === "3" ? "#151515" : "#eeeeea";
  context.fillRect(0, 0, width, height);

  if (model === "1") {
    const softGradient = context.createLinearGradient(0, 270, 0, height - 390);
    softGradient.addColorStop(0, "#f2f2ee");
    softGradient.addColorStop(1, "#d8d8d2");
    context.fillStyle = softGradient;
    context.fillRect(0, 270, width, height - 660);

    context.fillStyle = "#0b68f0";
    context.fillRect(0, 0, width, 270);
    context.fillStyle = "#34383f";
    context.fillRect(0, height - 390, width, 390);
  } else if (model === "2") {
    if (supportCityBackground?.complete && supportCityBackground.naturalWidth) {
      drawCoverImage(context, supportCityBackground, 0, 0, width, height);
    }

    const cityGradient = context.createLinearGradient(0, 0, width, height);
    cityGradient.addColorStop(0, "rgba(18,63,159,0.94)");
    cityGradient.addColorStop(0.5, "rgba(0,168,112,0.7)");
    cityGradient.addColorStop(1, "rgba(255,255,255,0.38)");
    context.fillStyle = cityGradient;
    context.fillRect(0, 0, width, height);

  } else {
    const greenGradient = context.createLinearGradient(0, 0, 0, height);
    greenGradient.addColorStop(0, "#006b3d");
    greenGradient.addColorStop(0.58, "#078447");
    greenGradient.addColorStop(1, "#03482c");
    context.fillStyle = greenGradient;
    context.fillRect(0, 0, width, height);

    context.save();
    context.beginPath();
    context.moveTo(width * 0.78, 0);
    context.lineTo(width, 0);
    context.lineTo(width, height * 0.16);
    context.lineTo(width * 0.56, height * 0.56);
    context.closePath();
    context.fillStyle = "#ffd63d";
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    context.moveTo(width, height * 0.16);
    context.lineTo(width, height * 0.56);
    context.lineTo(width * 0.72, height * 0.72);
    context.lineTo(width * 0.56, height * 0.56);
    context.closePath();
    context.fillStyle = "#0b68f0";
    context.fill();
    context.restore();

    context.fillStyle = "rgba(0,0,0,0.22)";
    context.fillRect(0, height - 640, width, 640);
  }

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = model === "1" || model === "2" || model === "3" ? "#ffffff" : "#151515";
  context.font = "900 46px Arial";
  if (model !== "2" && model !== "3") {
    context.fillText("EU APOIO", 78, 148);
  }

  if (model !== "2") {
    drawLogo(context, model === "1" ? 535 : model === "3" ? 74 : 84, model === "1" ? 48 : model === "3" ? 72 : 220, model === "1" ? 440 : model === "3" ? 420 : 620);
  }

  if (supportPhoto?.complete) {
    const photoX = model === "2" ? -81 : model === "3" ? 80 : 0;
    const photoY = model === "2" ? -96 : model === "3" ? 315 : 270;
    const photoWidth = model === "2" ? width + 162 : model === "1" ? width : 920;
    const photoHeight = model === "2" ? Math.round((height - 530) * 1.155) : model === "1" ? height - 660 : 1050;
    const radius = model === "2" ? 24 : 0;
    context.save();
    roundedRectangle(context, photoX, photoY, photoWidth, photoHeight, radius);
    context.clip();
    drawCoverImage(context, supportPhoto, photoX, photoY, photoWidth, photoHeight);
    context.restore();

    if (model !== "1" && model !== "2") {
      context.strokeStyle = "#ffd63d";
      context.lineWidth = model === "3" ? 14 : 8;
      roundedRectangle(context, photoX, photoY, photoWidth, photoHeight, radius);
      context.stroke();
    }
  }

  if (model === "2") {
    context.save();
    context.beginPath();
    context.moveTo(0, height - 444);
    context.bezierCurveTo(width * 0.3, height - 530, width * 0.64, height - 570, width, height - 552);
    context.lineTo(width, height - 518);
    context.bezierCurveTo(width * 0.62, height - 540, width * 0.28, height - 500, 0, height - 410);
    context.closePath();
    context.fillStyle = "#ffd63d";
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    context.moveTo(0, height - 410);
    context.bezierCurveTo(width * 0.28, height - 500, width * 0.62, height - 540, width, height - 520);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = "#0b68f0";
    context.fill();
    context.restore();
  }

  context.fillStyle = model === "2" ? "#ffd63d" : "#ffffff";
  context.textAlign = model === "1" ? "right" : "left";
  if (model === "2") {
    drawSingleLineText(context, name.toUpperCase(), 70, height - 300, 540, 74, 40);
  } else {
    context.font = "900 74px Arial";
    if (model === "3") {
      context.textAlign = "center";
      context.font = "900 86px Arial";
      drawSingleLineText(context, name.toUpperCase(), width / 2, height - 350, 860, 86, 48);
    } else {
      drawWrappedText(context, name.toUpperCase(), model === "1" ? width - 86 : 86, height - 230, model === "1" ? 820 : 560, 82);
    }
  }
  context.textAlign = "left";

  context.fillStyle = model === "2" ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.74)";
  context.font = "500 38px Arial";
  context.textAlign = model === "1" ? "right" : "left";
  context.textAlign = model === "3" ? "center" : context.textAlign;
  context.fillText(city, model === "2" ? 70 : model === "1" ? width - 86 : model === "3" ? width / 2 : 86, model === "2" ? height - 210 : model === "3" ? height - 195 : height - 150);
  context.textAlign = "left";

  context.fillStyle = model === "2" ? "#ffffff" : model === "1" ? "#ffffff" : "#ffd63d";
  context.font = "900 34px Arial";
  context.textAlign = model === "3" ? "center" : "left";
  context.fillText("PRE-CAMPANHA", model === "2" ? 70 : model === "3" ? width / 2 : 86, model === "3" ? height - 110 : model === "1" ? height - 150 : height - 108);
  context.textAlign = "left";

  context.fillStyle = "#ffd63d";
  context.fillRect(model === "2" ? 70 : model === "3" ? width / 2 - 130 : 86, model === "1" ? height - 112 : model === "2" ? height - 70 : height - 92, 260, 8);

  if (model === "2") {
    context.fillStyle = "#ffffff";
    context.font = "900 34px Arial";
    context.fillText("EU APOIO", width - 430, height - 252);
    drawLogo(context, width - 430, height - 220, 350);
  }
}

function drawProfileCard(context, width, height, model) {
  context.fillStyle = model === "2" ? "#f2f2ee" : model === "3" ? "#101216" : "#ffffff";
  context.fillRect(0, 0, width, height);

  if (model === "1") {
    context.fillStyle = "#0b68f0";
    context.fillRect(0, 0, width, height);
  } else if (model === "2") {
    context.fillStyle = "#34383f";
    context.fillRect(0, 0, width, 245);
    context.fillStyle = "#ffd63d";
    context.fillRect(0, 245, width, 20);
    context.fillStyle = "#0b68f0";
    context.fillRect(0, height - 210, width, 210);

    context.strokeStyle = "rgba(21,21,21,0.08)";
    context.lineWidth = 2;
    for (let x = -width; x < width; x += 90) {
      context.beginPath();
      context.moveTo(x, 260);
      context.lineTo(x + width, height - 250);
      context.stroke();
    }
  } else {
    const darkGradient = context.createLinearGradient(0, 0, width, height);
    darkGradient.addColorStop(0, "#078447");
    darkGradient.addColorStop(0.52, "#006b3d");
    darkGradient.addColorStop(1, "#03482c");
    context.fillStyle = darkGradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#ffd63d";
    context.beginPath();
    context.moveTo(width * 0.68, 0);
    context.lineTo(width, 0);
    context.lineTo(width, height * 0.22);
    context.lineTo(width * 0.5, height * 0.72);
    context.closePath();
    context.fill();

    context.fillStyle = "#0b68f0";
    context.beginPath();
    context.moveTo(width, height * 0.22);
    context.lineTo(width, height);
    context.lineTo(width * 0.78, height);
    context.lineTo(width * 0.5, height * 0.72);
    context.closePath();
    context.fill();

    context.strokeStyle = "rgba(255,255,255,0.08)";
    context.lineWidth = 2;
    context.strokeRect(68, 68, width - 136, height - 136);
  }

  const centerX = width / 2;
  const photoSize = model === "2" ? 650 : model === "3" ? 680 : 720;
  const photoX = centerX - photoSize / 2;
  const photoY = model === "2" ? 250 : model === "3" ? 170 : 125;

  context.save();
  if (model === "2") {
    roundedRectangle(context, photoX, photoY, photoSize, photoSize, 24);
  } else if (model === "3") {
    roundedRectangle(context, photoX, photoY, photoSize, photoSize, 0);
  } else {
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
  }
  context.clip();
  if (supportPhoto?.complete) {
    drawCoverImage(context, supportPhoto, photoX, photoY, photoSize, photoSize);
  } else {
    context.fillStyle = "rgba(255,255,255,0.9)";
    context.fillRect(photoX, photoY, photoSize, photoSize);
    context.fillStyle = "#101014";
    context.textAlign = "center";
    context.font = "900 58px Arial";
    context.fillText("SUA FOTO", centerX, photoY + 300);
  }
  context.restore();

  context.strokeStyle = model === "2" ? "#ffd63d" : model === "3" ? "#ffffff" : "#ffd63d";
  context.lineWidth = model === "1" ? 16 : 10;
  if (model === "2") {
    roundedRectangle(context, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, 26);
  } else if (model === "3") {
    roundedRectangle(context, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, 0);
  } else {
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2 + 12, 0, Math.PI * 2);
  }
  context.stroke();

  if (model === "1") {
    context.strokeStyle = "#ffffff";
    context.lineWidth = 7;
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2 + 34, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "#ffd63d";
    context.beginPath();
    context.moveTo(0, height - 285);
    context.quadraticCurveTo(width / 2, height - 390, width, height - 285);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();

    context.fillStyle = "#078447";
    context.beginPath();
    context.moveTo(0, height - 245);
    context.quadraticCurveTo(width / 2, height - 345, width, height - 245);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();
  }

  context.textAlign = "center";
  if (supportLogo?.complete && supportLogo.naturalWidth) {
    const logoWidth = model === "2" ? 380 : model === "3" ? 421 : 480;
    const logoHeight = (supportLogo.naturalHeight / supportLogo.naturalWidth) * logoWidth;
    const logoY = model === "2" ? 52 : model === "3" ? height - 205 : 810;
    context.drawImage(supportLogo, centerX - logoWidth / 2, logoY, logoWidth, logoHeight);
  }
}

function drawSupportCard() {
  if (!supportCard) return;

  const context = supportCard.getContext("2d");
  const format = getSupportFormat();
  const model = getSupportModel();
  const name = supportName?.value.trim() || "Seu nome";
  const city = supportCity?.value.trim() || "Regiao administrativa";

  supportCard.width = 1080;
  supportCard.height = format === "profile" ? 1080 : 1920;

  context.clearRect(0, 0, supportCard.width, supportCard.height);

  if (format === "profile") {
    drawProfileCard(context, supportCard.width, supportCard.height, model);
  } else {
    drawStoryCard(context, supportCard.width, supportCard.height, name, city, model);
  }
}

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

musicButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleJingle();
});

document.addEventListener("click", (event) => {
  if (jingleStarted || musicButton?.contains(event.target)) return;
  playJingle();
});

siteJingle?.addEventListener("play", updateMusicButton);
siteJingle?.addEventListener("pause", updateMusicButton);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

causeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    causeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    causeTitle.textContent = button.dataset.title;
    causeText.textContent = button.dataset.text;
  });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
    card.style.boxShadow = "0 34px 90px rgba(16, 19, 26, 0.16)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});

document.querySelectorAll(".magnetic").forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("nome")?.toString().trim();
  formNote.textContent = name
    ? `${name}, pronto: você vai acompanhar as próximas conversas dessa construção.`
    : "Pronto: você vai acompanhar as próximas conversas dessa construção.";
  form.reset();
});

supportName?.addEventListener("input", drawSupportCard);
supportCity?.addEventListener("input", drawSupportCard);
supportFormatInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateSupportModelGroups();
    drawSupportCard();
  });
});
supportStoryModelInputs.forEach((input) => input.addEventListener("change", drawSupportCard));
supportProfileModelInputs.forEach((input) => input.addEventListener("change", drawSupportCard));

supportPhotoInput?.addEventListener("change", () => {
  const file = supportPhotoInput.files?.[0];

  if (!file) {
    supportPhoto = null;
    if (supportCardStatus) supportCardStatus.textContent = "A imagem sera baixada como PNG.";
    drawSupportCard();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    supportPhoto = new Image();
    supportPhoto.onload = () => {
      if (supportCardStatus) supportCardStatus.textContent = "Foto adicionada.";
      drawSupportCard();
    };
    supportPhoto.onerror = () => {
      supportPhoto = null;
      if (supportCardStatus) supportCardStatus.textContent = "Nao foi possivel carregar essa foto.";
      drawSupportCard();
    };
    supportPhoto.src = reader.result;
  };
  reader.readAsDataURL(file);
});

downloadSupportCard?.addEventListener("click", () => {
  if (!supportCard) return;
  drawSupportCard();
  const link = document.createElement("a");
  link.download = getSupportFormat() === "profile" ? "apoio-breno-grube-perfil.png" : "apoio-breno-grube-stories.png";

  try {
    link.href = supportCard.toDataURL("image/png");
    link.click();
    if (supportCardStatus) supportCardStatus.textContent = "Download iniciado.";
  } catch (error) {
    if (supportCardStatus) supportCardStatus.textContent = "Nao foi possivel baixar a imagem. Tente trocar a foto enviada.";
  }
});

window.addEventListener("mousemove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawParticles();
if (supportCard) {
  supportLogo = new Image();
  supportLogo.onload = drawSupportCard;
  supportLogo.onerror = drawSupportCard;
  supportLogo.src = "logobreno.svg";
  supportCityBackground = new Image();
  supportCityBackground.onload = drawSupportCard;
  supportCityBackground.onerror = drawSupportCard;
  supportCityBackground.src = "back.png";
  updateSupportModelGroups();
  drawSupportCard();
}
updateScrollEffects();
