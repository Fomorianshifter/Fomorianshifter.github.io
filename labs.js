(function () {
  var held = false;
  var stop = document.getElementById("stopBtn");
  var start = document.getElementById("startBtn");
  var coil = document.getElementById("coil");
  var aux = document.getElementById("aux");
  var starterStatus = document.getElementById("starterStatus");
  function paint() {
    coil.classList.toggle("on", held);
    aux.classList.toggle("on", held);
    starterStatus.textContent = held ? "Contactor sealed in. Motor circuit would be closed." : "Contactor dropped out.";
  }
  function pressStart() { held = true; paint(); }
  function pressStop() { held = false; paint(); }
  start.addEventListener("click", pressStart);
  stop.addEventListener("click", pressStop);
  start.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") pressStart(); });
  stop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") pressStop(); });
  paint();

  var cm = { 14: 4110, 12: 6530, 10: 10380, 8: 16510, 6: 26240, 4: 41740, 2: 66360 };
  var vdForm = document.getElementById("vdForm");
  function voltage() {
    var I = Number(document.getElementById("amps").value) || 0;
    var D = Number(document.getElementById("feet").value) || 0;
    var awg = document.getElementById("awg").value;
    var V = Number(document.getElementById("volts").value) || 120;
    var drop = (2 * 12.9 * I * D) / cm[awg];
    var pct = V ? (drop / V) * 100 : 0;
    document.getElementById("vdOut").textContent =
      drop.toFixed(2) + " V drop · " + pct.toFixed(1) + "% of " + V + " V · " + awg + " AWG copper";
  }
  vdForm.addEventListener("input", voltage);
  voltage();

  var canvas = document.getElementById("orbit");
  var ctx = canvas.getContext("2d");
  var paused = false;
  var t = 0;
  var bodies = [
    { name: "Mercury", r: 38, speed: 0.04, color: "#c4b6a6" },
    { name: "Venus", r: 62, speed: 0.028, color: "#d7b56d" },
    { name: "Earth", r: 90, speed: 0.02, color: "#6aa6d6" },
    { name: "Mars", r: 118, speed: 0.015, color: "#c46b4a" }
  ];
  function draw() {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0d1013";
    ctx.fillRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    ctx.beginPath();
    ctx.fillStyle = "#e2a322";
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    bodies.forEach(function (b) {
      ctx.strokeStyle = "#2c343c";
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.stroke();
      var a = t * b.speed;
      var x = cx + Math.cos(a) * b.r;
      var y = cy + Math.sin(a) * b.r * 0.55;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!paused) t += 1;
    requestAnimationFrame(draw);
  }
  draw();
  document.getElementById("orbitPause").addEventListener("click", function () {
    paused = !paused;
    this.textContent = paused ? "Resume" : "Pause";
  });

  var state = { hunger: 20, happy: 55, energy: 70, gp: 0, stage: "Egg", eating: 0 };
  function stageOf(gp) {
    if (gp >= 500) return "Adult";
    if (gp >= 200) return "Young";
    if (gp >= 50) return "Hatchling";
    return "Egg";
  }
  function mood() {
    if (state.hunger >= 70) return "Hungry";
    if (state.energy <= 20) return "Sleepy";
    if (state.happy <= 30 || state.hunger >= 50) return "Grumpy";
    if (state.happy >= 70) return "Happy";
    if (state.happy >= 50 && state.energy >= 60) return "Playful";
    return "Neutral";
  }
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function renderLoki() {
    state.stage = stageOf(state.gp);
    document.getElementById("dragon").textContent = state.stage.toLowerCase();
    document.getElementById("lokiStatus").textContent =
      state.stage + " · " + mood() + " · growth " + state.gp +
      " · hunger " + state.hunger + " · happy " + state.happy + " · energy " + state.energy;
  }
  function feed(kind) {
    var table = { basic: [20, 5, 5], tasty: [40, 10, 15], special: [60, 20, 25] };
    var row = table[kind];
    var pen = state.hunger < 25 ? 0.5 : 1;
    state.hunger = clamp(state.hunger - row[0] * pen);
    state.gp += Math.round(row[1] * pen);
    state.happy = clamp(state.happy + row[2] * pen);
    state.eating = 2;
    renderLoki();
  }
  document.querySelectorAll("[data-food]").forEach(function (btn) {
    btn.addEventListener("click", function () { feed(btn.getAttribute("data-food")); });
  });
  document.getElementById("playBtn").addEventListener("click", function () {
    state.happy = clamp(state.happy + 8);
    state.energy = clamp(state.energy - 6);
    state.gp += 2;
    renderLoki();
  });
  document.getElementById("tickBtn").addEventListener("click", function () {
    if (mood() === "Sleepy") state.energy = clamp(state.energy + 15);
    else state.energy = clamp(state.energy - 8);
    state.hunger = clamp(state.hunger + 6);
    state.happy = clamp(state.happy - 2);
    renderLoki();
  });
  renderLoki();

  var KEY = "nl-fault-log";
  var list = document.getElementById("faultList");
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function show() {
    var rows = load();
    list.innerHTML = "";
    if (!rows.length) {
      var empty = document.createElement("li");
      empty.textContent = "No faults logged in this browser.";
      list.appendChild(empty);
      return;
    }
    rows.slice().reverse().forEach(function (row) {
      var li = document.createElement("li");
      li.textContent = row.time + " · " + row.asset + " — " + row.note;
      list.appendChild(li);
    });
  }
  document.getElementById("faultForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var rows = load();
    rows.push({
      time: new Date().toLocaleString(),
      asset: document.getElementById("asset").value.trim(),
      note: document.getElementById("note").value.trim()
    });
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-40)));
    e.target.reset();
    show();
  });
  show();
})();
