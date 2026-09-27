const canvas=document.getElementById("triangleField"),ctx=canvas.getContext("2d");
let w,h,dpr,points=[],mouse={x:-9999,y:-9999},last=performance.now();
function resize(){
 dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
 canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);
 const spacing=Math.max(95,Math.min(145,w/8));points=[];
 for(let y=-spacing;y<h+spacing;y+=spacing)for(let x=-spacing;x<w+spacing;x+=spacing){
   const j=spacing*.42;points.push({x:x+(Math.random()-.5)*j,y:y+(Math.random()-.5)*j,ox:x,oy:y});
 }
}
addEventListener("resize",resize);addEventListener("pointermove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener("pointerleave",()=>{mouse.x=-9999;mouse.y=-9999});resize();
function draw(){
 ctx.clearRect(0,0,w,h);const cell=Math.max(95,Math.min(145,w/8));
 for(const p of points){
   const dx=mouse.x-p.x,dy=mouse.y-p.y,dist=Math.hypot(dx,dy),radius=230;
   if(dist<radius){const force=(1-dist/radius);p.x+=(dx/dist||0)*force*7;p.y+=(dy/dist||0)*force*7}
   p.x+=(p.ox-p.x)*.025;p.y+=(p.oy-p.y)*.025;
 }
 for(let i=0;i<points.length;i++){
   const p=points[i],near=[];
   for(let j=0;j<points.length;j++){if(i===j)continue;const q=points[j],dx=p.x-q.x,dy=p.y-q.y,dd=dx*dx+dy*dy;if(dd<cell*cell*2.4)near.push({q,dd})}
   near.sort((a,b)=>a.dd-b.dd);
   for(const n of near.slice(0,4)){const a=.12*(1-Math.sqrt(n.dd)/(cell*1.55));if(a<=0)continue;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(n.q.x,n.q.y);ctx.strokeStyle=`rgba(83,242,154,${a})`;ctx.lineWidth=1;ctx.stroke()}
 }
 for(const p of points){ctx.beginPath();ctx.moveTo(p.x,p.y-5);ctx.lineTo(p.x-4.3,p.y+3.5);ctx.lineTo(p.x+4.3,p.y+3.5);ctx.closePath();ctx.fillStyle="rgba(55,105,78,.045)";ctx.fill()}
 requestAnimationFrame(draw)
}
requestAnimationFrame(draw);
