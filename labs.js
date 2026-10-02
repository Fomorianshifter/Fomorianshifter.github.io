const contacts = [
  { id: "start", label: "Start", nc: false },
  { id: "stop", label: "Stop (NC)", nc: true },
  { id: "ol", label: "OL (NC)", nc: true },
  { id: "estop", label: "E-stop (NC)", nc: true }
];
const state = { start: false, stop: true, ol: true, estop: true, seal: false };

function motorOn() {
  const path = (state.start || state.seal) && state.stop && state.ol && state.estop;
  state.seal = path;
  return path;
}

function bit(closed, name) {
  return closed ? `<span class="closed">[ ${name} ]</span>` : `<span class="open">[ ${name} open ]</span>`;
}

function renderStarter() {
  const on = motorOn();
  const box = document.getElementById("starter-controls");
  box.innerHTML = contacts.map((c) => {
    const closed = state[c.id];
    return `<button type="button" data-id="${c.id}" class="${closed ? "on" : "warn"}">${c.label}: ${closed ? "closed" : "open"}</button>`;
  }).join("");
  box.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      state[id] = !state[id];
      renderStarter();
    });
  });
  document.getElementById("rung").innerHTML =
    `Rung 1  ${bit(state.start, "Start")}--${bit(state.stop, "Stop NC")}--${bit(state.ol, "OL NC")}--${bit(state.estop, "E-stop NC")}--( M ${on ? "ON" : "OFF" } )\nSeal-in ${state.seal ? "closed" : "open"}`;
  const motor = document.getElementById("motor");
  motor.textContent = on ? "Motor RUNNING \u2014 seal-in holding" : "Motor STOPPED";
  motor.className = "status " + (on ? "ok" : "bad");
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem("nl-faults") || "[]"); }
  catch { return []; }
}
function saveLog(rows) { localStorage.setItem("nl-faults", JSON.stringify(rows)); }
function renderLog() {
  const body = document.getElementById("log-body");
  const rows = loadLog();
  body.innerHTML = rows.length ? rows.map((row, i) =>
    `<tr><td>${row.time}</td><td>${row.asset}</td><td>${row.fault}</td><td><button type="button" data-i="${i}">Remove</button></td></tr>`
  ).join("") : `<tr><td colspan="4">No entries yet.</td></tr>`;
  body.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = loadLog();
      next.splice(Number(btn.dataset.i), 1);
      saveLog(next);
      renderLog();
    });
  });
}

const CM = { "14": 4110, "12": 6530, "10": 10380, "8": 16510, "6": 26240 };
function renderDrop() {
  const form = document.getElementById("drop-form");
  const amps = Number(form.amps.value) || 0;
  const feet = Number(form.feet.value) || 0;
  const volts = Number(form.volts.value) || 120;
  const cm = Number(form.awg.value) || 6530;
  const vd = (2 * 12.9 * amps * feet) / cm;
  const pct = volts ? (vd / volts) * 100 : 0;
  const out = document.getElementById("drop-out");
  out.textContent = `${vd.toFixed(2)} V drop (${pct.toFixed(1)}%). Branch circuits are often kept near 3%.`;
  out.className = "status " + (pct > 3 ? "bad" : "ok");
}

function orbit() {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const bodies = [
    { name: "Mercury", a: 48, speed: 0.018, color: "#c9b59a" },
    { name: "Earth", a: 110, speed: 0.007, color: "#7eb0c9" },
    { name: "Mars", a: 150, speed: 0.005, color: "#d36b55" }
  ];
  let t = 0;
  function frame() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0d100b";
    ctx.fillRect(0, 0, w, h);
    const cx = w * 0.38, cy = h * 0.52;
    ctx.beginPath();
    ctx.fillStyle = "#e2a23a";
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    bodies.forEach((b) => {
      ctx.strokeStyle = "#3a4030";
      ctx.beginPath();
      ctx.ellipse(cx, cy, b.a, b.a * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
      const x = cx + Math.cos(t * b.speed) * b.a;
      const y = cy + Math.sin(t * b.speed) * b.a * 0.62;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 1;
    requestAnimationFrame(frame);
  }
  frame();
}

document.getElementById("log-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const rows = loadLog();
  rows.unshift({
    time: new Date().toLocaleString(),
    asset: String(data.get("asset")).slice(0, 60),
    fault: String(data.get("fault")).slice(0, 120)
  });
  saveLog(rows.slice(0, 20));
  event.target.reset();
  renderLog();
});
document.getElementById("drop-form").addEventListener("input", renderDrop);

const select = document.querySelector("#drop-form select");
select.innerHTML = Object.entries(CM).map(([awg, cm]) => `<option value="${cm}" ${awg === "12" ? "selected" : ""}>${awg}</option>`).join("");

renderStarter();
renderLog();
renderDrop();
orbit();
