
function vd() {
  const volts = Number(document.getElementById("v").value);
  const amps = Number(document.getElementById("a").value);
  const feet = Number(document.getElementById("ft").value);
  const cmil = Number(document.getElementById("cmil").value);
  const factor = document.getElementById("ph").value === "3" ? 1.732 : 2;
  const drop = (factor * 12.9 * amps * feet) / cmil;
  const pct = volts ? (drop / volts) * 100 : 0;
  const el = document.getElementById("vdout");
  el.textContent = drop.toFixed(2) + " V drop (" + pct.toFixed(1) + "%) · about " + (volts - drop).toFixed(1) + " V at the load";
  el.style.color = pct > 5 ? "#e07a5f" : "#8fb56a";
}
document.querySelectorAll("#vd input, #vd select").forEach((n) => n.addEventListener("input", vd));
vd();

const canvas = document.getElementById("orbit");
const ctx = canvas.getContext("2d");
const planets = [
  { a: 42, speed: 0.018, color: "#c4b49a" },
  { a: 62, speed: 0.012, color: "#e2c07a" },
  { a: 84, speed: 0.01, color: "#7eb6d6" },
  { a: 108, speed: 0.008, color: "#c46b4a" },
  { a: 148, speed: 0.0045, color: "#d8b48a" }
];
let t = 0;
function draw() {
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
  ctx.fillStyle = "#0c0e0a";
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath(); ctx.fillStyle = "#e2a23a"; ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
  planets.forEach((p) => {
    ctx.beginPath(); ctx.strokeStyle = "#343628";
    ctx.ellipse(cx, cy, p.a, p.a * 0.72, 0, 0, Math.PI * 2); ctx.stroke();
    const ang = t * p.speed;
    ctx.beginPath(); ctx.fillStyle = p.color;
    ctx.arc(cx + Math.cos(ang) * p.a, cy + Math.sin(ang) * p.a * 0.72, 5, 0, Math.PI * 2); ctx.fill();
  });
  t += 1; requestAnimationFrame(draw);
}
draw();

const faults = [
  { time: "06:12", area: "Mold line", symptom: "E-stop loop open", action: "Reset pull-cord, verified continuity" },
  { time: "09:40", area: "Sand mixer", symptom: "Motor overload", action: "Checked amp draw, cleaned starter contacts" },
  { time: "13:05", area: "Conveyor 3", symptom: "Photoeye missed part", action: "Wiped lens, confirmed PLC input" }
];
function renderLog() {
  document.getElementById("log").innerHTML = faults.map((f) =>
    "<tr><td>" + f.time + "</td><td>" + f.area + "</td><td>" + f.symptom + "</td><td>" + f.action + "</td></tr>"
  ).join("");
}
document.getElementById("addfault").addEventListener("click", () => {
  const area = document.getElementById("area").value.trim();
  const symptom = document.getElementById("symptom").value.trim();
  if (!area || !symptom) return;
  faults.unshift({ time: new Date().toTimeString().slice(0, 5), area, symptom, action: "Logged — pending check" });
  document.getElementById("area").value = "";
  document.getElementById("symptom").value = "";
  renderLog();
});
renderLog();

const rungs = [{ name: "Stop", on: true }, { name: "Start", on: false }, { name: "OL", on: true }];
let sealed = false;
function ladder() {
  sealed = rungs[0].on && rungs[2].on && (rungs[1].on || sealed);
  const coil = document.getElementById("coil");
  coil.textContent = sealed ? "M1 sealed in — running" : "M1 off";
  coil.style.color = sealed ? "#8fb56a" : "#efe7d2";
  document.getElementById("rungs").innerHTML = rungs.map((r, i) =>
    '<button class="btn ghost" data-i="' + i + '" type="button">' + r.name + ": " + (r.on ? "closed" : "open") + "</button>"
  ).join(" ");
  document.querySelectorAll("#rungs button").forEach((b) => b.addEventListener("click", () => {
    rungs[Number(b.dataset.i)].on = !rungs[Number(b.dataset.i)].on;
    ladder();
  }));
}
ladder();
