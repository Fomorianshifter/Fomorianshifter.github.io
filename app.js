(function () {
  var start = document.getElementById("start");
  var stop = document.getElementById("stop");
  var ol = document.getElementById("ol");
  var estop = document.getElementById("estop");
  var ladder = document.getElementById("ladder");
  var motor = document.getElementById("motor");
  var sealed = false;

  function scan() {
    var path = (start.checked || sealed) && stop.checked && ol.checked && estop.checked;
    sealed = path;
    if (!stop.checked || !ol.checked || !estop.checked) sealed = false;
    var on = sealed;
    ladder.textContent =
      "Rung 1  [" + (start.checked ? "Start ON " : "Start off") + "]--" +
      "[" + (stop.checked ? "Stop NC" : "Stop OPEN") + "]--" +
      "[" + (ol.checked ? "OL NC" : "OL OPEN") + "]--" +
      "[" + (estop.checked ? "E-stop NC" : "E-stop OPEN") + "]--( M " + (on ? "ON " : "OFF") + " )\n" +
      "Seal-in " + (sealed ? "closed" : "open");
    motor.textContent = on ? "Motor RUNNING" : "Motor STOPPED";
    motor.style.color = on ? "#8fbf6a" : "#e0a14a";
  }
  [start, stop, ol, estop].forEach(function (el) { el.addEventListener("change", scan); });
  scan();

  var faults = document.getElementById("faults");
  document.getElementById("fault-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(e.target);
    var li = document.createElement("li");
    var when = new Date().toLocaleString();
    li.textContent = when + " · " + data.get("asset") + " · " + data.get("symptom");
    faults.prepend(li);
    e.target.reset();
  });

  var ohms = { "12": 1.98, "10": 1.24, "8": 0.778, "6": 0.491 };
  var vdForm = document.getElementById("vd-form");
  var vdOut = document.getElementById("vd-out");
  function voltage() {
    var data = new FormData(vdForm);
    var amps = Number(data.get("amps"));
    var feet = Number(data.get("feet"));
    var volts = Number(data.get("volts"));
    var r = ohms[data.get("awg")];
    var drop = (2 * feet * r * amps) / 1000;
    var pct = volts ? (drop / volts) * 100 : 0;
    vdOut.textContent = drop.toFixed(2) + " V drop (" + pct.toFixed(1) + "%). Branch circuits are often kept near 3%.";
  }
  vdForm.addEventListener("input", voltage);
  voltage();

  var canvas = document.getElementById("orbit");
  var ctx = canvas.getContext("2d");
  var t = 0;
  function draw() {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#e0a14a";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 16, 0, Math.PI * 2);
    ctx.fill();
    [[70, 0.8, "#c8d0c0"], [110, 0.45, "#8fbf6a"], [150, 0.28, "#7eb6d6"]].forEach(function (p) {
      ctx.strokeStyle = "#2c3128";
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, p[0], p[0] * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      var a = t * p[1];
      ctx.fillStyle = p[2];
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * p[0], h / 2 + Math.sin(a) * p[0] * 0.42, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.02;
    requestAnimationFrame(draw);
  }
  draw();
})();
