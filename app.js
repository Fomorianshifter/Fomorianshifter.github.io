
const cm = { 14: 4110, 12: 6530, 10: 10380, 8: 16510, 6: 26240, 4: 41740, 2: 66360 };
const stopBtn = document.getElementById("btn-stop");
const startBtn = document.getElementById("btn-start");
const olBtn = document.getElementById("btn-ol");
let stopClosed = true, startHeld = false, olOk = true, seal = false;
function motorOn() { return stopClosed && olOk && (startHeld || seal); }
function drawLadder() {
  const on = motorOn();
  seal = on;
  const bar = (closed) => (closed ? "====" : " /  ");
  document.getElementById("ladder").textContent =
    "L1 " + bar(stopClosed) + " STOP " + bar(olOk) + " OL " +
    (startHeld ? "==== START " : " /  START ") +
    (seal ? "==== M " : " /  M ") + " coil " + (on ? "[ON]" : "[off]") + " L2";
  const state = document.getElementById("motor-state");
  state.textContent = on ? "Motor: running (seal-in held)" : "Motor: off";
  state.className = "status " + (on ? "on" : "off");
}
stopBtn.addEventListener("click", () => {
  stopClosed = !stopClosed;
  stopBtn.textContent = stopClosed ? "Stop closed" : "Stop open";
  stopBtn.classList.toggle("held", stopClosed);
  drawLadder();
});
startBtn.addEventListener("mousedown", () => { startHeld = true; drawLadder(); });
startBtn.addEventListener("mouseup", () => { startHeld = false; drawLadder(); });
startBtn.addEventListener("mouseleave", () => { if (startHeld) { startHeld = false; drawLadder(); } });
startBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startHeld = true; drawLadder(); });
startBtn.addEventListener("touchend", () => { startHeld = false; drawLadder(); });
olBtn.addEventListener("click", () => {
  olOk = !olOk;
  olBtn.textContent = olOk ? "Trip overload" : "Reset overload";
  drawLadder();
});
drawLadder();

const stages = [[500, "Adult"], [200, "Young"], [50, "Hatchling"], [0, "Egg"]];
const loki = { hunger: 40, happy: 50, energy: 70, gp: 0 };
function mood() {
  if (loki.hunger >= 70) return "HUNGRY";
  if (loki.energy <= 20) return "SLEEPY";
  if (loki.happy <= 30 || loki.hunger >= 50) return "GRUMPY";
  if (loki.happy >= 70) return "HAPPY";
  if (loki.happy >= 50 && loki.energy >= 60) return "PLAYFUL";
  return "NEUTRAL";
}
function stage() { return stages.find((s) => loki.gp >= s[0])[1]; }
function paintLoki() {
  document.getElementById("loki-state").textContent =
    stage() + " · " + mood() + " · hunger " + loki.hunger + " · happy " + loki.happy +
    " · energy " + loki.energy + " · gp " + loki.gp;
}
function clamp(n) { return Math.max(0, Math.min(100, n)); }
function feed(cut, gp, joy) {
  const penalty = loki.hunger < 30 ? 0.5 : 1;
  loki.hunger = clamp(loki.hunger - cut * penalty);
  loki.happy = clamp(loki.happy + joy * penalty);
  loki.gp += Math.round(gp * penalty);
  paintLoki();
}
document.getElementById("feed-basic").onclick = () => feed(20, 5, 5);
document.getElementById("feed-tasty").onclick = () => feed(40, 10, 15);
document.getElementById("pet").onclick = () => {
  loki.happy = clamp(loki.happy + 12);
  loki.energy = clamp(loki.energy - 6);
  loki.gp += 4;
  paintLoki();
};
document.getElementById("tick").onclick = () => {
  if (mood() === "SLEEPY") loki.energy = clamp(loki.energy + 15);
  else loki.energy = clamp(loki.energy - 8);
  loki.hunger = clamp(loki.hunger + 6);
  paintLoki();
};
paintLoki();

function voltageDrop() {
  const amps = Number(document.getElementById("vd-amps").value);
  const feet = Number(document.getElementById("vd-feet").value);
  const awg = document.getElementById("vd-awg").value;
  const volts = Number(document.getElementById("vd-volts").value);
  const vd = (2 * 12.9 * amps * feet) / cm[awg];
  const pct = volts ? (vd / volts) * 100 : 0;
  document.getElementById("vd-out").textContent =
    vd.toFixed(2) + " V drop · " + pct.toFixed(2) + "% of " + volts + " V · " + awg + " AWG copper";
}
document.getElementById("vd-form").addEventListener("input", voltageDrop);
voltageDrop();

const KEY = "nl-faults";
function loadFaults() {
  const list = document.getElementById("fault-list");
  list.innerHTML = "";
  JSON.parse(localStorage.getItem(KEY) || "[]").forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.area + " — " + item.note;
    list.appendChild(li);
  });
}
document.getElementById("fault-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const items = JSON.parse(localStorage.getItem(KEY) || "[]");
  items.unshift({
    area: document.getElementById("fault-area").value,
    note: document.getElementById("fault-note").value
  });
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 12)));
  e.target.reset();
  loadFaults();
});
loadFaults();

const sky = document.getElementById("sky");
const ctx = sky.getContext("2d");
const bodies = [
  { r: 0, color: "#e2a23a", size: 16, a: 0, w: 0 },
  { r: 46, color: "#c9c3b8", size: 4, a: 0.4, w: 0.02 },
  { r: 72, color: "#d7a15a", size: 6, a: 1.2, w: 0.014 },
  { r: 104, color: "#6aa8d8", size: 7, a: 2.1, w: 0.01 },
  { r: 140, color: "#c46a3a", size: 5, a: 0.8, w: 0.007 }
];
function frame() {
  const w = sky.width, h = sky.height;
  ctx.fillStyle = "#0c0e14";
  ctx.fillRect(0, 0, w, h);
  bodies.forEach((b) => {
    b.a += b.w;
    const x = w / 2 + Math.cos(b.a) * b.r;
    const y = h / 2 + Math.sin(b.a) * b.r * 0.55;
    ctx.beginPath();
    ctx.strokeStyle = "#2a3142";
    ctx.ellipse(w / 2, h / 2, b.r, b.r * 0.55, 0, 0, Math.PI * 2);
    if (b.r) ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.arc(x, y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(frame);
}
frame();

document.getElementById("copy-about").onclick = async () => {
  const text = document.getElementById("about").value;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("copy-about").textContent = "Copied";
  } catch (err) {
    document.getElementById("about").select();
  }
};
