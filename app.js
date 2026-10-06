const vd = () => {
  const i = Number(document.getElementById('vd-i').value);
  const l = Number(document.getElementById('vd-l').value);
  const v = Number(document.getElementById('vd-v').value);
  const cm = Number(document.getElementById('vd-awg').value);
  const drop = (2 * 12.9 * i * l) / cm;
  const pct = v ? (drop / v) * 100 : 0;
  document.getElementById('vd-out').textContent =
    drop.toFixed(2) + ' V drop (' + pct.toFixed(1) + '%). A common study target is under 3% on a branch.';
};
['vd-i', 'vd-l', 'vd-v', 'vd-awg'].forEach((id) => {
  document.getElementById(id).addEventListener('input', vd);
});
vd();

let start = false;
let stop = true;
let ol = false;
const drawCoil = () => {
  const sealed = start && !stop && !ol;
  document.getElementById('coil').textContent = sealed ? 'Coil: ON — start is sealed in' : 'Coil: off';
};
document.getElementById('btn-start').onclick = () => { start = true; stop = false; drawCoil(); };
document.getElementById('btn-stop').onclick = () => { stop = true; start = false; drawCoil(); };
document.getElementById('btn-ol').onclick = () => { ol = true; drawCoil(); };
document.getElementById('btn-reset').onclick = () => { ol = false; drawCoil(); };

const KEY = 'nl-faults';
const list = document.getElementById('fault-list');
const load = () => {
  list.innerHTML = '';
  JSON.parse(localStorage.getItem(KEY) || '[]').forEach((row) => {
    const li = document.createElement('li');
    li.textContent = row.area + ' — ' + row.note;
    list.appendChild(li);
  });
};
document.getElementById('fault-form').onsubmit = (e) => {
  e.preventDefault();
  const rows = JSON.parse(localStorage.getItem(KEY) || '[]');
  rows.unshift({
    area: document.getElementById('fault-area').value,
    note: document.getElementById('fault-note').value
  });
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 12)));
  e.target.reset();
  load();
};
load();

const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
const planets = [
  { r: 46, size: 3, hue: 200, w: 0.018 },
  { r: 78, size: 5, hue: 42, w: 0.011 },
  { r: 112, size: 4, hue: 18, w: 0.007 }
];
let t = 0;
const sky = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#d7c48a';
  ctx.beginPath();
  ctx.arc(320, 140, 14, 0, Math.PI * 2);
  ctx.fill();
  planets.forEach((p) => {
    const a = t * p.w;
    ctx.strokeStyle = '#3d4634';
    ctx.beginPath();
    ctx.ellipse(320, 140, p.r, p.r * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'hsl(' + p.hue + ' 60% 62%)';
    ctx.beginPath();
    ctx.arc(320 + Math.cos(a) * p.r, 140 + Math.sin(a) * p.r * 0.42, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  t += 1;
  requestAnimationFrame(sky);
};
sky();

const stages = ['Egg', 'Hatchling', 'Juvenile', 'Adult'];
let hunger = 2;
let age = 0;
const loki = () => {
  const stage = stages[Math.min(3, Math.floor(age / 3))];
  document.getElementById('loki-stage').textContent = stage + ' · hunger ' + hunger + '/5 · day ' + age;
};
document.getElementById('loki-feed').onclick = () => { hunger = Math.max(0, hunger - 1); loki(); };
document.getElementById('loki-tick').onclick = () => { age += 1; hunger = Math.min(5, hunger + 1); loki(); };
loki();
