const K = 12.9; // copper approx ohm-cmil / ft at 75C

function vdCalc() {
  const volts = Number(document.getElementById("volts").value);
  const amps = Number(document.getElementById("amps").value);
  const feet = Number(document.getElementById("feet").value);
  const cmil = Number(document.getElementById("cmil").value);
  const phase = document.getElementById("phase").value;
  const factor = phase === "1" ? 2 : 1.732;
  const drop = (factor * K * amps * feet) / cmil;
  const pct = volts ? (drop / volts) * 100 : 0;
  const ok = pct <= 3 ? "within a common 3% branch target" : "above a common 3% branch target";
  document.getElementById("vdout").textContent =
    drop.toFixed(2) + " V drop · " + pct.toFixed(2) + "% · " + ok;
}

function wireLadder() {
  const stop = document.getElementById("stop");
  const start = document.getElementById("start");
  const ol = document.getElementById("ol");
  const coil = document.getElementById("coil");
  const seal = document.getElementById("seal");
  let latched = false;
  function draw() {
    const path = stop.classList.contains("on") && ol.classList.contains("on") && (start.classList.contains("on") || latched);
    latched = path;
    coil.classList.toggle("energized", path);
    coil.textContent = path ? "M ON" : "M OFF";
    seal.textContent = path ? "M seal closed" : "M seal open";
    seal.classList.toggle("on", path);
  }
  [stop, start, ol].forEach((el) => el.addEventListener("click", () => {
    el.classList.toggle("on");
    if (el === stop || el === ol) {
      if (!el.classList.contains("on")) latched = false;
    }
    draw();
  }));
  draw();
}

function faultLog() {
  const key = "nlane-faults";
  const body = document.getElementById("faults");
  function load() { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
  function save(rows) { localStorage.setItem(key, JSON.stringify(rows)); }
  function render() {
    const rows = load();
    body.innerHTML = rows.length ? rows.map((r) => `<tr><td>${r.when}</td><td>${r.area}</td><td>${r.note}</td></tr>`).join("") : `<tr><td colspan="3">No faults logged on this browser yet.</td></tr>`;
  }
  document.getElementById("addfault").addEventListener("click", () => {
    const note = document.getElementById("fnote").value.trim();
    if (!note) return;
    const rows = load();
    rows.unshift({ when: new Date().toLocaleString(), area: document.getElementById("farea").value, note });
    save(rows.slice(0, 20));
    document.getElementById("fnote").value = "";
    render();
  });
  render();
}

function solar() {
  const c = document.getElementById("sky");
  const ctx = c.getContext("2d");
  const planets = [
    { n: "Mercury", a: 38, s: 0.02, r: 3, col: "#c4b7a6" },
    { n: "Venus", a: 56, s: 0.015, r: 4, col: "#e2c07a" },
    { n: "Earth", a: 76, s: 0.012, r: 4.5, col: "#7eb6d8" },
    { n: "Mars", a: 96, s: 0.01, r: 3.5, col: "#d4654a" },
    { n: "Jupiter", a: 128, s: 0.006, r: 8, col: "#d8b48a" }
  ];
  let t = 0;
  function frame() {
    const w = c.width = c.clientWidth * 2;
    const h = c.height = 280 * 2;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0c100b";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    ctx.fillStyle = "#e2a123";
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    planets.forEach((p) => {
      ctx.strokeStyle = "#3d4a2e";
      ctx.beginPath(); ctx.arc(cx, cy, p.a * 2, 0, Math.PI * 2); ctx.stroke();
      const x = cx + Math.cos(t * p.s) * p.a * 2;
      const y = cy + Math.sin(t * p.s) * p.a * 2;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(x, y, p.r * 2, 0, Math.PI * 2); ctx.fill();
    });
    t += 1;
    requestAnimationFrame(frame);
  }
  frame();
}

function loki() {
  const state = { hunger: 30, happy: 50, gp: 0, stage: "Egg" };
  const face = document.getElementById("loki-face");
  const line = document.getElementById("loki-line");
  function tick() {
    if (state.hunger < 80) state.stage = "Egg";
    else if (state.happy < 70) state.stage = "Hatchling";
    else state.stage = "Wyrm";
    face.textContent = state.stage === "Egg" ? "egg" : state.stage === "Hatchling" ? "hatch" : "wyrm";
    line.textContent = state.stage + " · hunger " + state.hunger + " · happy " + state.happy + " · gp " + state.gp;
  }
  document.getElementById("feed").onclick = () => { state.hunger = Math.min(100, state.hunger + 18); state.gp += 1; tick(); };
  document.getElementById("play").onclick = () => { state.happy = Math.min(100, state.happy + 14); state.hunger = Math.max(0, state.hunger - 6); state.gp += 1; tick(); };
  tick();
}

document.querySelectorAll("[data-vd]").forEach((el) => el.addEventListener("input", vdCalc));
vdCalc();
wireLadder();
faultLog();
solar();
loki();
