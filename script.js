const CONTACT_EMAIL = "acquire@youfind.com";

const canvas = document.querySelector("#scene-canvas");
const ctx = canvas.getContext("2d");
const revealField = document.querySelector("[data-reveal-field]");
const inquiryForm = document.querySelector("[data-inquiry-form]");
const manualInquiryButton = document.querySelector("[data-manual-inquiry]");
const manualStatus = document.querySelector("[data-manual-status]");

let width = 0;
let height = 0;
let dpr = 1;
let revealFrame = 0;
let latestPointer = {
  clientX: window.innerWidth * 0.5,
  clientY: window.innerHeight * 0.52
};

function mailtoLink(extra = "") {
  const subject = encodeURIComponent("Confidential inquiry for YouFind.com");
  const body = extra
    ? `Hello,\n\nI would like to discuss a private acquisition of YouFind.com.\n\n${extra}`
    : "Hello,\n\nI would like to discuss a private acquisition of YouFind.com.\n\nName:\nCompany:\nEmail:\nIndicative offer:\nAcquisition timeline:\nIntended use:\n";

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

function inquiryMessageFromForm() {
  const data = new FormData(inquiryForm);

  return [
    `Name: ${data.get("name") || ""}`,
    `Company: ${data.get("company") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `Indicative offer: ${data.get("offer") || ""}`,
    `Acquisition timeline: ${data.get("timeline") || ""}`,
    `Intended use / message: ${data.get("message") || ""}`
  ].join("\n");
}

function manualInquiryTemplate() {
  return [
    `To: ${CONTACT_EMAIL}`,
    "Subject: Confidential inquiry for YouFind.com",
    "",
    "Hello,",
    "",
    "I would like to discuss a private acquisition of YouFind.com.",
    "",
    inquiryMessageFromForm()
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

function updateRevealPosition() {
  revealFrame = 0;
  const rect = revealField.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, latestPointer.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, latestPointer.clientY - rect.top));

  revealField.style.setProperty("--reveal-x", `${x}px`);
  revealField.style.setProperty("--reveal-y", `${y}px`);
  revealField.classList.add("is-revealing");
}

function queueRevealPosition(event) {
  latestPointer = {
    clientX: event.clientX,
    clientY: event.clientY
  };

  if (!revealFrame) {
    revealFrame = requestAnimationFrame(updateRevealPosition);
  }
}

function attachRevealExperience() {
  revealField.addEventListener("pointermove", queueRevealPosition, { passive: true });
  revealField.addEventListener("pointerenter", queueRevealPosition, { passive: true });
  revealField.addEventListener("pointerdown", queueRevealPosition, { passive: true });
  revealField.addEventListener("pointerleave", () => {
    if (revealFrame) {
      cancelAnimationFrame(revealFrame);
      revealFrame = 0;
    }
    revealField.classList.remove("is-revealing");
  });
}

function attachInquiryForm() {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    window.location.href = mailtoLink(inquiryMessageFromForm());
  });

  manualInquiryButton.addEventListener("click", async () => {
    try {
      await copyText(manualInquiryTemplate());
      manualStatus.textContent = "Manual email template copied.";
    } catch {
      manualStatus.textContent = `Copy failed. Send your inquiry to ${CONTACT_EMAIL}.`;
    }
  });

  inquiryForm.addEventListener("input", () => {
    manualStatus.textContent = "";
  });
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawScene();
}

function clear() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#020205";
  ctx.fillRect(0, 0, width, height);
}

function drawScene() {
  clear();

  const px = width * 0.54;
  const py = height * 0.42;
  const deepGlow = ctx.createRadialGradient(px, py, 10, px, py, Math.max(width, height) * 0.82);
  deepGlow.addColorStop(0, "rgba(75, 107, 255, 0.18)");
  deepGlow.addColorStop(0.22, "rgba(0, 219, 197, 0.08)");
  deepGlow.addColorStop(0.48, "rgba(255, 79, 122, 0.05)");
  deepGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = deepGlow;
  ctx.fillRect(0, 0, width, height);

  const orbitX = width * 0.44;
  const orbitY = height * 0.28;
  const aurora = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, width * 0.56);
  aurora.addColorStop(0, "rgba(86, 53, 255, 0.16)");
  aurora.addColorStop(0.38, "rgba(0, 219, 197, 0.055)");
  aurora.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    const y = height * (0.14 + i * 0.12) + Math.sin(i) * 18;
    ctx.beginPath();
    for (let x = -40; x <= width + 40; x += 36) {
      const wave = Math.sin(x * 0.008 + i) * (16 + i * 3);
      if (x === -40) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
}

attachRevealExperience();
attachInquiryForm();
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
