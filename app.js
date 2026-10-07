function drop() {
  const el = document.getElementById("vdrop");
  if (!el) return;
  const V = Number(document.getElementById("v").value);
  const A = Number(document.getElementById("a").value);
  const ft = Number(document.getElementById("ft").value);
  const r = Number(document.getElementById("ohm").value);
  const vd = (2 * A * r * ft) / 1000;
  const pct = V ? (vd / V) * 100 : 0;
  const cls = pct <= 3 ? "ok" : pct <= 5 ? "warn" : "bad";
  el.className = "out " + cls;
  el.textContent = vd.toFixed(2) + " V drop \u00b7 " + pct.toFixed(2) + "%";
}
["v", "a", "ft", "ohm"].forEach((id) => {
  const n = document.getElementById(id);
  if (n) n.addEventListener("input", drop);
});
drop();

const state = { stop: false, start: false, ol: true, seal: false };
function rung() {
  const box = document.getElementById("ladder");
  const coil = document.getElementById("coil");
  if (!box || !coil) return;
  const path = !state.stop && state.ol && (state.start || state.seal);
  state.seal = path;
  box.innerHTML = "";
  const bits = [
    ["Stop NC", !state.stop, () => { state.stop = !state.stop; }],
    ["Start NO", state.start, () => { state.start = !state.start; }],
    ["OL NC", state.ol, () => { state.ol = !state.ol; }]
  ];
  bits.forEach(([name, on, fn]) => {
    const b = document.createElement("button");
    b.className = "btn ghost";
    b.type = "button";
    b.textContent = name + (on ? " closed" : " open");
    b.onclick = () => { fn(); rung(); };
    box.appendChild(b);
  });
  const c = document.createElement("span");
  c.className = "coil" + (state.seal ? " on" : "");
  box.appendChild(c);
  coil.textContent = state.seal ? "M coil sealed in" : "M coil off";
  coil.className = "out " + (state.seal ? "ok" : "");
}
rung();

const faults = JSON.parse(localStorage.getItem("nl-faults") || "[]");
function paintFaults() {
  const ul = document.getElementById("faults");
  if (!ul) return;
  ul.innerHTML = "";
  faults.slice(-5).reverse().forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f.asset + " \u2014 " + f.note;
    ul.appendChild(li);
  });
}
const add = document.getElementById("addFault");
if (add) add.onclick = () => {
  const asset = document.getElementById("asset").value.trim();
  const note = document.getElementById("note").value.trim();
  if (!asset || !note) return;
  faults.push({ asset, note, t: Date.now() });
  localStorage.setItem("nl-faults", JSON.stringify(faults));
  document.getElementById("note").value = "";
  paintFaults();
};
paintFaults();

const loki = { hunger: 30, happy: 50, gp: 0 };
function stage() {
  if (loki.gp >= 40) return "Adult";
  if (loki.gp >= 18) return "Young";
  if (loki.gp >= 6) return "Hatchling";
  return "Egg";
}
function face() {
  const s = stage();
  if (loki.hunger > 70) return "\ud83d\ude24";
  if (s === "Egg") return "\ud83e\udd5a";
  if (loki.happy > 70) return "\ud83d\udc32";
  return "\ud83d\udc09";
}
function paintLoki() {
  const f = document.getElementById("face");
  const st = document.getElementById("lokiStatus");
  if (!f || !st) return;
  f.textContent = face();
  st.textContent = stage() + " \u00b7 hunger " + loki.hunger + " \u00b7 happy " + loki.happy + " \u00b7 gp " + loki.gp;
}
const feed = document.getElementById("feed");
const play = document.getElementById("play");
if (feed) feed.onclick = () => { loki.hunger = Math.max(0, loki.hunger - 25); loki.happy += 8; loki.gp += 4; paintLoki(); };
if (play) play.onclick = () => { loki.happy += 12; loki.hunger += 6; loki.gp += 2; paintLoki(); };
paintLoki();

const sky = document.getElementById("sky");
if (sky) {
  const ctx = sky.getContext("2d");
  const planets = [
    { r: 46, s: 0.8, c: "#c9b18a" },
    { r: 72, s: 0.55, c: "#d4843a" },
    { r: 104, s: 0.35, c: "#7dba6a" },
    { r: 136, s: 0.22, c: "#8eb4d4" }
  ];
  let t = 0;
  function frame() {
    const w = sky.clientWidth || 640;
    sky.width = w * devicePixelRatio;
    sky.height = 280 * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.fillStyle = "#0c0b09";
    ctx.fillRect(0, 0, w, 280);
    const cx = w / 2, cy = 140;
    ctx.fillStyle = "#f0b27a";
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    planets.forEach((p) => {
      const a = t * p.s;
      ctx.strokeStyle = "#3a342c";
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * p.r, cy + Math.sin(a) * p.r * 0.42, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.02;
    requestAnimationFrame(frame);
  }
  frame();
}
