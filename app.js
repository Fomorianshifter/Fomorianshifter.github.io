const $ = (id) => document.getElementById(id);

function voltage() {
  const amps = Number($("amps").value);
  const feet = Number($("feet").value);
  const volts = Number($("volts").value);
  const phase = $("phase").value;
  const k = phase === "1" ? 12.9 : 1.732 * 12.9;
  const ohms = { "14": 3.14, "12": 1.98, "10": 1.24, "8": 0.778, "6": 0.491, "4": 0.308 };
  const awg = $("awg").value;
  const drop = (k * amps * feet * ohms[awg]) / 1000;
  const pct = (drop / volts) * 100;
  $("vdrop").textContent = `${drop.toFixed(2)} V  ·  ${pct.toFixed(2)}% of ${volts} V`;
  $("vnote").textContent = pct > 3
    ? "Over a common 3% branch-circuit target. Upsize the conductor or shorten the run."
    : "Inside a common 3% branch-circuit planning target.";
}

function orbit() {
  const c = $("orbit");
  const ctx = c.getContext("2d");
  const planets = [
    { n: "Mercury", r: 28, s: 0.03, c: "#c9b7a2" },
    { n: "Venus", r: 42, s: 0.022, c: "#e2b15a" },
    { n: "Earth", r: 58, s: 0.016, c: "#7d9a62" },
    { n: "Mars", r: 74, s: 0.012, c: "#c45c4a" },
    { n: "Jupiter", r: 96, s: 0.007, c: "#c9854a" }
  ];
  let t = 0;
  function frame() {
    const w = c.width = c.clientWidth * 2;
    const h = c.height = 440;
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.fillStyle = "#e2b15a";
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    planets.forEach((p) => {
      ctx.strokeStyle = "#2d3328";
      ctx.beginPath(); ctx.arc(0, 0, p.r * 2, 0, Math.PI * 2); ctx.stroke();
      const a = t * p.s;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * p.r * 2, Math.sin(a) * p.r * 2, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    t += 1;
    requestAnimationFrame(frame);
  }
  frame();
}

const stages = [
  { name: "Egg", need: 0 },
  { name: "Hatchling", need: 50 },
  { name: "Young", need: 200 },
  { name: "Adult", need: 500 }
];
const loki = { gp: 0, hunger: 40, happy: 50, energy: 70 };

function stageOf(gp) {
  return [...stages].reverse().find((s) => gp >= s.need).name;
}
function moodOf() {
  if (loki.hunger >= 70) return "Hungry";
  if (loki.energy <= 20) return "Sleepy";
  if (loki.happy <= 30) return "Grumpy";
  if (loki.happy >= 70) return "Happy";
  if (loki.happy >= 50 && loki.energy >= 60) return "Playful";
  return "Neutral";
}
function paintLoki() {
  $("loki-status").textContent = `${stageOf(loki.gp)} · ${moodOf()} · ${loki.gp} gp`;
  $("hunger").style.height = `${loki.hunger}%`;
  $("happy").style.height = `${loki.happy}%`;
  $("energy").style.height = `${loki.energy}%`;
}
function feed(kind) {
  const table = { basic: [20, 5, 5], tasty: [40, 10, 15], special: [60, 20, 25] };
  let [h, g, p] = table[kind];
  if (loki.hunger < 30) { h /= 2; g /= 2; p /= 2; }
  loki.hunger = Math.max(0, loki.hunger - h);
  loki.gp += g;
  loki.happy = Math.min(100, loki.happy + p);
  paintLoki();
}
function tickLoki() {
  loki.hunger = Math.min(100, loki.hunger + 4);
  loki.energy = moodOf() === "Sleepy" ? Math.min(100, loki.energy + 8) : Math.max(0, loki.energy - 3);
  paintLoki();
}

const faults = [];
function addFault(e) {
  e.preventDefault();
  faults.unshift({
    area: $("area").value,
    note: $("note").value,
    when: new Date().toLocaleString()
  });
  $("note").value = "";
  $("log").innerHTML = faults.map((f) => `<div><strong>${f.area}</strong> · ${f.when}<br>${f.note}</div>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  orbit();
  paintLoki();
  setInterval(tickLoki, 2500);
  $("vform").addEventListener("input", voltage);
  voltage();
  $("logform").addEventListener("submit", addFault);
  document.querySelectorAll("[data-feed]").forEach((b) => b.addEventListener("click", () => feed(b.dataset.feed)));
});
