const stopBtn = document.getElementById("btn-stop");
const startBtn = document.getElementById("btn-start");
const olBtn = document.getElementById("btn-ol");
const ladder = document.getElementById("ladder");
const motorState = document.getElementById("motor-state");
let stopClosed = true;
let startHeld = false;
let sealed = false;
let olOk = true;
function renderStarter() {
  const on = stopClosed && olOk && (startHeld || sealed);
  if (on && startHeld) sealed = true;
  if (!on) sealed = false;
  const running = stopClosed && olOk && (startHeld || sealed);
  ladder.textContent =
    "|--[ " + (stopClosed ? "stop" : "STOP") + " ]--[ " + (startHeld ? "START" : "start") + " ]--+--( M " + (running ? "ON " : "off") + ")--|   OL: " + (olOk ? "ok" : "TRIP") + "\n" +
    "                       |\n" +
    "                       +----[ " + (sealed ? "M" : "m") + "   ]---------+";
  motorState.textContent = "Motor: " + (running ? "running" : "off");
  stopBtn.textContent = stopClosed ? "Stop closed" : "Stop open";
  stopBtn.classList.toggle("held", stopClosed);
  olBtn.textContent = olOk ? "Trip overload" : "Reset overload";
}
stopBtn.addEventListener("click", () => { stopClosed = !stopClosed; if (!stopClosed) sealed = false; renderStarter(); });
startBtn.addEventListener("mousedown", () => { startHeld = true; renderStarter(); });
startBtn.addEventListener("mouseup", () => { startHeld = false; renderStarter(); });
startBtn.addEventListener("mouseleave", () => { if (startHeld) { startHeld = false; renderStarter(); } });
startBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startHeld = true; renderStarter(); }, { passive: false });
startBtn.addEventListener("touchend", () => { startHeld = false; renderStarter(); });
olBtn.addEventListener("click", () => { olOk = !olOk; if (!olOk) sealed = false; renderStarter(); });
renderStarter();
const cm = { 14: 4110, 12: 6530, 10: 10380, 8: 16510, 6: 26240, 4: 41740, 2: 66360 };
function renderDrop() {
  const amps = Number(document.getElementById("vd-amps").value) || 0;
  const feet = Number(document.getElementById("vd-feet").value) || 0;
  const volts = Number(document.getElementById("vd-volts").value) || 1;
  const circular = cm[document.getElementById("vd-awg").value];
  const drop = (2 * 12.9 * amps * feet) / circular;
  const pct = (drop / volts) * 100;
  document.getElementById("vd-out").textContent = drop.toFixed(2) + " V drop · " + pct.toFixed(2) + "% of " + volts + " V";
}
document.getElementById("vd-form").addEventListener("input", renderDrop);
renderDrop();
const KEY = "nl-faults";
const faultList = document.getElementById("fault-list");
function loadFaults() {
  const items = JSON.parse(localStorage.getItem(KEY) || "[]");
  faultList.innerHTML = "";
  if (!items.length) { faultList.innerHTML = "<li>No notes yet.</li>"; return; }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.when + " — " + item.area + ": " + item.note;
    faultList.appendChild(li);
  });
}
document.getElementById("fault-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const items = JSON.parse(localStorage.getItem(KEY) || "[]");
  items.unshift({
    when: new Date().toLocaleString(),
    area: document.getElementById("fault-area").value.trim(),
    note: document.getElementById("fault-note").value.trim()
  });
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 20)));
  e.target.reset();
  loadFaults();
});
loadFaults();
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
const bodies = [
  { a: 46, color: "#c4b6a6", r: 3, w: 0.02 },
  { a: 70, color: "#e0c48a", r: 5, w: 0.012 },
  { a: 96, color: "#7eb0d4", r: 5, w: 0.01 },
  { a: 124, color: "#c46b4a", r: 4, w: 0.008 },
  { a: 168, color: "#d7b48a", r: 10, w: 0.004 }
];
let t = 0;
function draw() {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#07080d";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f2e2b0";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 16, 0, Math.PI * 2);
  ctx.fill();
  bodies.forEach((b) => {
    const ang = t * b.w;
    const x = w / 2 + Math.cos(ang) * b.a;
    const y = h / 2 + Math.sin(ang) * b.a * 0.42;
    ctx.strokeStyle = "#2c3344";
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, b.a, b.a * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(x, y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
  t += 1;
  requestAnimationFrame(draw);
}
draw();
document.getElementById("copy-about").addEventListener("click", async () => {
  const text = document.getElementById("about").value;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("copy-about").textContent = "Copied";
  } catch (err) {
    document.getElementById("about").select();
  }
});
