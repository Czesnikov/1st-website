const canvas = document.getElementById("triangleField");
const ctx = canvas.getContext("2d");
let w, h, dpr, points = [], mouse = {x:-9999,y:-9999}, last = performance.now(), frames=0, fps=0;

function resize(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr; canvas.style.width=w+"px"; canvas.style.height=h+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const spacing = Math.max(95, Math.min(145, w/8));
  const cols = Math.ceil(w/spacing)+2, rows=Math.ceil(h/spacing)+2;
  points=[];
  for(let y=-spacing;y<h+spacing;y+=spacing){
    for(let x=-spacing;x<w+spacing;x+=spacing){
      const jitter=spacing*.42;
      points.push({x:x+(Math.random()-.5)*jitter,y:y+(Math.random()-.5)*jitter,ox:x,oy:y});
    }
  }
}
addEventListener("resize",resize);
addEventListener("pointermove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener("pointerleave",()=>{mouse.x=-9999;mouse.y=-9999});
resize();

function draw(now){
  ctx.clearRect(0,0,w,h);
  const cell = Math.max(95, Math.min(145,w/8));
  // Cursor attraction/repulsion gives the field its reactive motion.
  for(const p of points){
    const dx=mouse.x-p.x, dy=mouse.y-p.y, dist=Math.hypot(dx,dy);
    const radius=230;
    if(dist<radius){
      const force=(1-dist/radius);
      p.x += (dx/dist||0)*force*7;
      p.y += (dy/dist||0)*force*7;
    }
    p.x += (p.ox-p.x)*.025; p.y += (p.oy-p.y)*.025;
  }
  // Triangulate a nearest-neighbour mesh.
  for(let i=0;i<points.length;i++){
    const p=points[i];
    let near=[];
    for(let j=0;j<points.length;j++){
      if(i===j) continue;
      const q=points[j], dx=p.x-q.x, dy=p.y-q.y, dd=dx*dx+dy*dy;
      if(dd<cell*cell*2.4) near.push({q,dd});
    }
    near.sort((a,b)=>a.dd-b.dd);
    near=near.slice(0,4);
    for(const n of near){
      const q=n.q;
      const alpha=Math.max(.025, .12*(1-Math.sqrt(n.dd)/(cell*1.55)));
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
      ctx.strokeStyle=`rgba(83,242,154,${alpha})`;ctx.lineWidth=1;ctx.stroke();
    }
  }
  // Small triangular facets.
  for(const p of points){
    const r=5;
    ctx.beginPath();ctx.moveTo(p.x,p.y-r);ctx.lineTo(p.x-r*.85,p.y+r*.7);ctx.lineTo(p.x+r*.85,p.y+r*.7);ctx.closePath();
    ctx.fillStyle="rgba(55,105,78,.045)";ctx.fill();
  }
  frames++;
  if(now-last>500){
    fps=Math.round(frames*1000/(now-last));frames=0;last=now;
    document.getElementById("fps").textContent=String(Math.min(99,fps)).padStart(2,"0");
    document.getElementById("nodes").textContent=String(Math.min(99,Math.floor(points.length/10))).padStart(2,"0");
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

let sync=0, dir=1;
setInterval(()=>{
  sync += dir * (Math.random()*4+.5);
  if(sync>100){sync=100;dir=-1}
  if(sync<0){sync=0;dir=1}
  document.getElementById("syncValue").textContent=String(Math.round(sync)).padStart(3,"0")+"%";
},120);

document.querySelectorAll("[data-action]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const action=btn.dataset.action;
    if(action==="reboot") location.reload();
    if(action==="logout") window.scrollTo({top:0,behavior:"smooth"});
    if(action==="exit") document.body.classList.toggle("quiet");
  });
});
