const canvas = document.querySelector("#motion-canvas");
const ctx = canvas.getContext("2d");
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
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
    hue: ["#0a8f62", "#ffd23f", "#2247ff", "#ff5f4f"][Math.floor(Math.random() * 4)]
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
    header.style.minHeight = window.scrollY > 70 ? "56px" : "62px";
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
  const gradient = context.createLinearGradient(0, 0, width, height);
  if (model === "2") {
    gradient.addColorStop(0, "#101014");
    gradient.addColorStop(0.52, "#0b8f62");
    gradient.addColorStop(1, "#ffd63d");
  } else if (model === "3") {
    gradient.addColorStop(0, "#11131b");
    gradient.addColorStop(0.62, "#183d52");
    gradient.addColorStop(1, "#00a870");
  } else {
    gradient.addColorStop(0, "#0b3d2c");
    gradient.addColorStop(0.5, "#ffd63d");
    gradient.addColorStop(1, "#2257ff");
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = model === "2" ? "rgba(16,16,20,0.28)" : "rgba(16,16,20,0.56)";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = model === "2" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.16)";
  context.lineWidth = 4;
  for (let x = -width; x < width * 2; x += model === "3" ? 62 : 86) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + width, model === "2" ? height * 0.72 : height);
    context.stroke();
  }

  if (model === "2") {
    context.fillStyle = "rgba(255,214,61,0.96)";
    context.fillRect(0, 0, width, 170);
    context.fillStyle = "rgba(16,16,20,0.96)";
    context.fillRect(0, height - 180, width, 180);
    context.fillStyle = "rgba(255,255,255,0.12)";
    context.fillRect(70, 250, width - 140, 780);
  }

  if (model === "3") {
    context.save();
    context.translate(92, 1110);
    context.rotate(-Math.PI / 2);
    context.fillStyle = "rgba(255,214,61,0.2)";
    context.font = "900 168px Arial";
    context.fillText("APOIO", 0, 0);
    context.restore();
  }

  context.fillStyle = model === "2" ? "rgba(255,214,61,0.72)" : "rgba(255,214,61,0.92)";
  context.beginPath();
  context.arc(width - 120, model === "2" ? 250 : 120, model === "3" ? 210 : 160, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = model === "2" ? "#101014" : "#ffffff";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = "900 52px Arial";
  context.fillText("EU APOIO", 86, 150);

  drawLogo(context, model === "2" ? 90 : 80, model === "2" ? 292 : 230, model === "2" ? 560 : 640);

  if (supportPhoto?.complete) {
    context.save();
    roundedRectangle(context, model === "2" ? 680 : 650, model === "3" ? 500 : 540, model === "2" ? 300 : 330, model === "2" ? 300 : 330, model === "2" ? 150 : 36);
    context.clip();
    drawCoverImage(context, model === "2" ? 680 : 650, model === "3" ? 500 : 540, model === "2" ? 300 : 330, model === "2" ? 300 : 330);
    context.restore();

    context.strokeStyle = model === "2" ? "#ffd63d" : "#ffd63d";
    context.lineWidth = 10;
    roundedRectangle(context, model === "2" ? 680 : 650, model === "3" ? 500 : 540, model === "2" ? 300 : 330, model === "2" ? 300 : 330, model === "2" ? 150 : 36);
    context.stroke();
  }

  context.fillStyle = model === "2" ? "#ffffff" : "#ffffff";
  context.font = model === "2" ? "900 70px Arial" : "900 78px Arial";
  drawWrappedText(context, name.toUpperCase(), 86, model === "2" ? 830 : 760, 520, 86);

  context.fillStyle = model === "2" ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.82)";
  context.font = "500 42px Arial";
  context.fillText(city, 86, model === "2" ? 948 : 880);

  context.fillStyle = model === "2" ? "#ffd63d" : "rgba(255,255,255,0.92)";
  context.font = "900 34px Arial";
  context.fillText("PRE-CAMPANHA", 86, 1170);

  context.fillStyle = model === "2" ? "#ffd63d" : "#ffd63d";
  context.fillRect(86, 1244, 300, 12);
}

function drawProfileCard(context, width, height, model) {
  const gradient = context.createRadialGradient(width * 0.72, height * 0.18, 80, width * 0.5, height * 0.5, width);
  if (model === "2") {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.46, "#ffd63d");
    gradient.addColorStop(1, "#0b8f62");
  } else if (model === "3") {
    gradient.addColorStop(0, "#ffd63d");
    gradient.addColorStop(0.4, "#ffffff");
    gradient.addColorStop(1, "#101014");
  } else {
    gradient.addColorStop(0, "#ffd63d");
    gradient.addColorStop(0.42, "#0b8f62");
    gradient.addColorStop(1, "#11131b");
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = model === "2" ? "rgba(255,255,255,0.2)" : "rgba(16,16,20,0.26)";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = model === "2" ? "rgba(16,16,20,0.08)" : "rgba(255,255,255,0.12)";
  context.lineWidth = 5;
  for (let y = 80; y < height; y += 88) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, model === "3" ? y - 40 : y - 120);
    context.stroke();
  }

  const centerX = width / 2;
  const photoSize = model === "2" ? 650 : model === "3" ? 700 : 560;
  const photoX = centerX - photoSize / 2;
  const photoY = model === "2" ? 92 : model === "3" ? 60 : 132;

  context.save();
  if (model === "2") {
    roundedRectangle(context, photoX, photoY, photoSize, photoSize, 8);
  } else if (model === "3") {
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
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

  context.strokeStyle = "#ffd63d";
  context.lineWidth = model === "2" ? 12 : 18;
  if (model === "2") {
    roundedRectangle(context, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, 8);
  } else if (model === "3") {
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2 + 10, 0, Math.PI * 2);
  } else {
    context.beginPath();
    context.arc(centerX, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
  }
  context.stroke();

  context.textAlign = "center";
  if (supportLogo?.complete && supportLogo.naturalWidth) {
    const logoWidth = model === "2" ? 500 : model === "3" ? 620 : 560;
    const logoHeight = (supportLogo.naturalHeight / supportLogo.naturalWidth) * logoWidth;
    context.drawImage(supportLogo, centerX - logoWidth / 2, model === "2" ? 810 : model === "3" ? 800 : 770, logoWidth, logoHeight);
  }
}

function drawSupportCard() {
  if (!supportCard) return;

  const context = supportCard.getContext("2d");
  const format = getSupportFormat();
  const model = getSupportModel();
  const name = supportName?.value.trim() || "Seu nome";
  const city = supportCity?.value.trim() || "Brasilia, DF";

  supportCard.width = format === "profile" ? 1080 : 1080;
  supportCard.height = format === "profile" ? 1080 : 1350;

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
  updateSupportModelGroups();
  drawSupportCard();
}
updateScrollEffects();
