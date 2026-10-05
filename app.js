const cm = { 14: 4110, 12: 6530, 10: 10380, 8: 16510, 6: 26240, 4: 41740, 2: 66360 };

function renderLadder(stop, start, ol, seal) {
  const on = (v) => (v ? "====" : " -- ");
  const motor = stop && !ol && (start || seal);
  document.getElementById("ladder").textContent =
    `L1 ${on(stop)} stop ${on(!ol)} OL ${on(start)} start\n` +
    `         ${on(seal)} seal-in (M)\n` +
    `         motor coil: ${motor ? "ENERGIZED" : "off"}`;
  document.getElementById("motor-state").textContent = motor ? "Motor: running" : "Motor: off";
  return motor;
}

function starter() {
  let stop = true, start = false, ol = false, seal = false;
  const stopBtn = document.getElementById("btn-stop");
  const startBtn = document.getElementById("btn-start");
  const olBtn = document.getElementById("btn-ol");
  const draw = () => {
    seal = renderLadder(stop, start, ol, seal) && stop && !ol;
    stopBtn.textContent = stop ? "Stop closed" : "Stop open";
    stopBtn.classList.toggle("held", stop);
    startBtn.classList.toggle("held", start);
    olBtn.textContent = ol ? "Reset overload" : "Trip overload";
  };
  stopBtn.addEventListener("click", () => { stop = !stop; if (!stop) seal = false; draw(); });
  startBtn.addEventListener("mousedown", () => { start = true; draw(); });
  startBtn.addEventListener("mouseup", () => { start = false; draw(); });
  startBtn.addEventListener("mouseleave", () => { start = false; draw(); });
  olBtn.addEventListener("click", () => { ol = !ol; if (ol) seal = false; draw(); });
  draw();
}

function loki() {
  const state = { hunger: 40, energy: 70, happy: 55, gp: 0, stage: "egg" };
  const stageOf = (gp) => gp >= 500 ? "adult" : gp >= 200 ? "young" : gp >= 50 ? "hatchling" : "egg";
  const moodOf = (s) => s.hunger >= 70 ? "hungry" : s.energy <= 20 ? "sleepy" : (s.happy <= 30 || s.hunger >= 50) ? "grumpy" : s.happy >= 70 ? "happy" : (s.happy >= 50 && s.energy >= 60) ? "playful" : "neutral";
  const paint = () => {
    state.stage = stageOf(state.gp);
    document.getElementById("loki-state").textContent =
      `${state.stage} · ${moodOf(state)} · hunger ${state.hunger} · energy ${state.energy} · happy ${state.happy} · gp ${state.gp}`;
  };
  const feed = (cut, gp, happy) => {
    const half = state.hunger < 70;
    state.hunger = Math.max(0, state.hunger - (half ? cut / 2 : cut));
    state.gp += half ? gp / 2 : gp;
    state.happy = Math.min(100, state.happy + (half ? happy / 2 : happy));
    paint();
  };
  document.getElementById("feed-basic").onclick = () => feed(20, 5, 5);
  document.getElementById("feed-tasty").onclick = () => feed(40, 10, 15);
  document.getElementById("pet").onclick = () => { state.happy = Math.min(100, state.happy + 8); state.energy = Math.max(0, state.energy - 4); paint(); };
  document.getElementById("tick").onclick = () => {
    if (state.energy <= 20) state.energy = Math.min(100, state.energy + 12);
    else state.energy = Math.max(0, state.energy - 6);
    state.hunger = Math.min(100, state.hunger + 4);
    paint();
  };
  paint();
}

function voltage() {
  const out = () => {
    const amps = Number(document.getElementById("vd-amps").value);
    const feet = Number(document.getElementById("vd-feet").value);
    const awg = document.getElementById("vd-awg").value;
    const volts = Number(document.getElementById("vd-volts").value);
    const vd = (2 * 12.9 * amps * feet) / cm[awg];
    const pct = volts ? (vd / volts) * 100 : 0;
    document.getElementById("vd-out").textContent = `${vd.toFixed(2)} V drop · ${pct.toFixed(1)}% of ${volts} V`;
  };
  ["vd-amps", "vd-feet", "vd-awg", "vd-volts"].forEach((id) => document.getElementById(id).addEventListener("input", out));
  out();
}

function wire() {
  const out = () => {
    const amps = Number(document.getElementById("w-amps").value);
    const feet = Number(document.getElementById("w-feet").value);
    const volts = Number(document.getElementById("w-volts").value);
    const limit = volts * 0.03;
    const pick = Object.keys(cm).map(Number).sort((a, b) => b - a).find((awg) => (2 * 12.9 * amps * feet) / cm[awg] <= limit);
    document.getElementById("w-out").textContent = pick
      ? `Smallest listed size under 3%: ${pick} AWG (${((2 * 12.9 * amps * feet) / cm[pick]).toFixed(2)} V)`
      : "None of the listed sizes stay under 3%. Shorten the run or raise voltage.";
  };
  ["w-amps", "w-feet", "w-volts"].forEach((id) => document.getElementById(id).addEventListener("input", out));
  out();
}

function faults() {
  const key = "nl-faults";
  const list = document.getElementById("fault-list");
  const read = () => JSON.parse(localStorage.getItem(key) || "[]");
  const paint = () => {
    list.innerHTML = "";
    read().forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.when} · ${item.area} — ${item.note}`;
      list.appendChild(li);
    });
  };
  document.getElementById("fault-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const next = read();
    next.unshift({
      when: new Date().toLocaleString(),
      area: document.getElementById("fault-area").value,
      note: document.getElementById("fault-note").value
    });
    localStorage.setItem(key, JSON.stringify(next.slice(0, 12)));
    e.target.reset();
    paint();
  });
  paint();
}

function orbit() {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const bodies = [
    { name: "Mercury", r: 46, size: 3, speed: 0.02, color: "#c7b299" },
    { name: "Venus", r: 70, size: 5, speed: 0.012, color: "#e0c07a" },
    { name: "Earth", r: 98, size: 5, speed: 0.008, color: "#7eb6d6" },
    { name: "Mars", r: 126, size: 4, speed: 0.006, color: "#d08a45" }
  ];
  let t = 0;
  const frame = () => {
    t += 1;
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f4e2a8";
    ctx.beginPath();
    ctx.arc(320, 180, 16, 0, Math.PI * 2);
    ctx.fill();
    bodies.forEach((b) => {
      ctx.strokeStyle = "#2c3550";
      ctx.beginPath();
      ctx.arc(320, 180, b.r, 0, Math.PI * 2);
      ctx.stroke();
      const a = t * b.speed;
      const x = 320 + Math.cos(a) * b.r;
      const y = 180 + Math.sin(a) * b.r * 0.42;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(x, y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  };
  frame();
}

document.getElementById("copy-about").onclick = async () => {
  await navigator.clipboard.writeText(document.getElementById("about").value);
  document.getElementById("copy-about").textContent = "Copied";
};

starter();
loki();
voltage();
wire();
faults();
orbit();
