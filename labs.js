const amps=document.getElementById("amps"),feet=document.getElementById("feet"),wire=document.getElementById("wire"),volts=document.getElementById("volts"),vdOut=document.getElementById("vdOut");
function calc(){const I=+amps.value||0,D=+feet.value||0,CM=+wire.value,V=+volts.value||120;const vd=2*12.9*I*D/CM;const pct=V?vd/V*100:0;vdOut.textContent="Drop "+vd.toFixed(2)+" V ("+pct.toFixed(1)+"% of "+V+" V). Branch circuits are often kept near 3%; feeders near 5% total.";}
[amps,feet,wire,volts].forEach(el=>el.addEventListener("input",calc));calc();
let running=false,ol=false;
const startBtn=document.getElementById("startBtn"),stopBtn=document.getElementById("stopBtn"),olBtn=document.getElementById("olBtn"),ladder=document.getElementById("ladder");
function draw(){const seal=running&&!ol;ladder.innerHTML=
'<div class="rung"><span class="contact '+(ol?"":"on")+'">OL '+(ol?"open":"closed")+'</span><span></span><span></span></div>'+
'<div class="rung"><span class="contact">Stop NC</span><span class="contact '+(seal?"on":"")+'">M aux '+(seal?"closed":"open")+'</span><span class="coil '+(seal?"on":"")+'">M '+(seal?"energized":"off")+'</span></div>'+
'<div class="rung"><span class="contact">Start NO</span><span class="muted">parallel with aux</span><span></span></div>';}
startBtn.onclick=()=>{if(!ol)running=true;draw();};
stopBtn.onclick=()=>{running=false;draw();};
olBtn.onclick=()=>{ol=!ol;if(ol)running=false;olBtn.textContent=ol?"Reset overload":"Trip overload";draw();};
draw();
const canvas=document.getElementById("orbit"),ctx=canvas.getContext("2d");
const bodies=[{r:0,a:18,c:"#e2a23a",s:.004},{r:46,a:5,c:"#c9b59a",s:.03},{r:78,a:8,c:"#d7d2c4",s:.018},{r:118,a:7,c:"#8fb56a",s:.012},{r:160,a:6,c:"#c4654a",s:.008}];
let t=0,play=true;
function frame(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0e100c";ctx.fillRect(0,0,w,h);const cx=w/2,cy=h/2;bodies.forEach((b,i)=>{if(i===0){ctx.beginPath();ctx.fillStyle=b.c;ctx.arc(cx,cy,b.a,0,Math.PI*2);ctx.fill();return;}ctx.beginPath();ctx.strokeStyle="#3a4034";ctx.ellipse(cx,cy,b.r,b.r*.42,0,0,Math.PI*2);ctx.stroke();const ang=t*b.s;const x=cx+Math.cos(ang)*b.r,y=cy+Math.sin(ang)*b.r*.42;ctx.beginPath();ctx.fillStyle=b.c;ctx.arc(x,y,b.a,0,Math.PI*2);ctx.fill();});if(play)t++;requestAnimationFrame(frame);}
frame();
document.getElementById("orbitToggle").onclick=function(){play=!play;this.textContent=play?"Pause":"Resume";};
const KEY="nlane-shift-log";
const list=document.getElementById("logList");
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
function save(items){localStorage.setItem(KEY,JSON.stringify(items));render();}
function render(){const items=load();list.innerHTML=items.length?items.map(i=>'<div class="log-item"><strong>'+i.asset+'</strong> · <span class="muted">'+i.time+'</span><div>'+i.note+'</div></div>').join(""):'<p class="note">No entries yet.</p>';}
document.getElementById("addLog").onclick=()=>{const asset=document.getElementById("asset").value.trim()||"Unlabeled asset";const note=document.getElementById("note").value.trim()||"No note";const items=load();items.unshift({asset,note,time:new Date().toLocaleString()});save(items);document.getElementById("note").value="";};
document.getElementById("clearLog").onclick=()=>{localStorage.removeItem(KEY);render();};
render();
