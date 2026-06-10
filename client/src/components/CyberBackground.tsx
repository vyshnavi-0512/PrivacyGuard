import { useEffect, useRef } from "react";

const A = "#00d9ff";
const A2 = "#7c3aed";
const A3 = "#10b981";
const GL = "#f59e0b";
const PK = "#e879f9";
// ── Neural BG ──
function NeuralBg(){
  const r = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=r.current; if(!cv)return;
   const cx = cv.getContext("2d");
if (!cx) return;
 let W=0,H=0,id=0;
    const resize=()=>{W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);
    const pts=Array.from({length:80},()=>({x:Math.random()*1600-200,y:Math.random()*1200-100,z:.3+Math.random()*.7,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,hue:Math.random()<.6?192:270}));
    let hs=0,mx=800,my=400,sy=0;
    const m = (e: MouseEvent)=>{mx=e.clientX;my=e.clientY;};
    const s=()=>{sy=window.scrollY;};
    window.addEventListener("mousemove",m); window.addEventListener("scroll",s);
    const draw=()=>{
      cx.clearRect(0,0,W,H); hs+=.07;
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<-200)p.x=W+100;if(p.x>W+200)p.x=-100;if(p.y<-100)p.y=H+100;if(p.y>H+100)p.y=-100;});
      const pj=pts.map(p=>({...p,px:p.x+(mx-W/2)*.03*(1-p.z),py:p.y+(my-H/2)*.02*(1-p.z)-sy*.06}));
      for(let i=0;i<pj.length;i++)for(let j=i+1;j<pj.length;j++){
        const a=pj[i],b=pj[j],dx=a.px-b.px,dy=a.py-b.py,d=Math.sqrt(dx*dx+dy*dy);
        if(d<140){const al=(1-d/140)*.16*a.z*b.z;const g=cx.createLinearGradient(a.px,a.py,b.px,b.py);g.addColorStop(0,`hsla(${a.hue+hs*.2},100%,65%,${al})`);g.addColorStop(1,`hsla(${b.hue+hs*.2},100%,65%,${al})`);cx.beginPath();cx.moveTo(a.px,a.py);cx.lineTo(b.px,b.py);cx.strokeStyle=g;cx.lineWidth=a.z*.6;cx.stroke();}
      }
      pj.forEach(p=>{const rv=2*p.z,al=.4+.6*p.z,h=p.hue+hs*.3;const gw=cx.createRadialGradient(p.px,p.py,0,p.px,p.py,rv*5);gw.addColorStop(0,`hsla(${h},100%,70%,${al*.3})`);gw.addColorStop(1,`hsla(${h},100%,70%,0)`);cx.beginPath();cx.arc(p.px,p.py,rv*5,0,Math.PI*2);cx.fillStyle=gw;cx.fill();cx.beginPath();cx.arc(p.px,p.py,rv,0,Math.PI*2);cx.fillStyle=`hsla(${h},100%,80%,${al})`;cx.fill();});
      id=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);window.removeEventListener("mousemove",m);window.removeEventListener("scroll",s);};
  },[]);
  return <canvas ref={r} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",width:"100%",height:"100%"}}/>;
}

// ── 3D Floating Cubes ──
function FloatingCubes(){
  const r = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=r.current; if(!cv)return;
    const cx = cv.getContext("2d");
if (!cx) return;
 let W=0,H=0,id=0;
    const resize=()=>{W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;};
    resize(); window.addEventListener("resize",resize);
    const cubes=[
      {x:.10,y:.20,z:.3,rx:.3,ry:.5,rz:.1,vrx:.007,vry:.011,vrz:.005,vx:.0005,vy:.0004,s:26,c:A,a:.55},
      {x:.85,y:.20,z:.7,rx:1,ry:.2,rz:.8,vrx:.009,vry:-.007,vrz:.006,vx:-.0004,vy:.0005,s:20,c:A2,a:.5},
      {x:.90,y:.68,z:.5,rx:.5,ry:1.1,rz:.3,vrx:-.006,vry:.008,vrz:.009,vx:-.0003,vy:-.0005,s:17,c:A3,a:.45},
      {x:.06,y:.75,z:.4,rx:.2,ry:.7,rz:1.2,vrx:.008,vry:.006,vrz:-.007,vx:.0006,vy:-.0004,s:22,c:GL,a:.5},
      {x:.50,y:.07,z:.6,rx:.9,ry:.4,rz:.6,vrx:-.007,vry:.009,vrz:.005,vx:.0003,vy:.0006,s:15,c:PK,a:.4},
      {x:.42,y:.90,z:.3,rx:.4,ry:1.3,rz:.2,vrx:.006,vry:-.008,vrz:.007,vx:-.0005,vy:.0003,s:19,c:A,a:.38},
      {x:.75,y:.45,z:.8,rx:1.2,ry:.6,rz:.9,vrx:.005,vry:.007,vrz:-.008,vx:.0004,vy:.0005,s:13,c:A2,a:.42},
      {x:.20,y:.50,z:.2,rx:.7,ry:1,rz:.4,vrx:-.009,vry:.005,vrz:.006,vx:-.0003,vy:-.0003,s:11,c:A3,a:.35},
    ];
    const p2 = (x:number,y:number,z:number)=>{const f=480/(480+z*180);return{x:x*f,y:y*f,sc:f};};
    const drawCube=(ccx:number,ccy:number,sz:number,rx:number,ry:number,rz:number,col:string,al:number)=>{
      const h=sz/2,c=Math.cos,s=Math.sin;
      const verts=[[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]];
      const rot=verts.map(([x,y,z])=>{let ny=y*c(rx)-z*s(rx),nz=y*s(rx)+z*c(rx);y=ny;z=nz;let nx=x*c(ry)+z*s(ry);nz=-x*s(ry)+z*c(ry);x=nx;z=nz;nx=x*c(rz)-y*s(rz);ny=x*s(rz)+y*c(rz);x=nx;y=ny;return[x,y,z];});
      const pts=rot.map(([x,y,z])=>{const p=p2(x,y,z);return{px:ccx+p.x,py:ccy+p.y,z};});
      const faces=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
      const bright=[1,.3,.7,.5,.6,.8];
      const fd=faces.map((vi,fi)=>({vi,fi,avgZ:vi.reduce((sum,i)=>sum+rot[i][2],0)/4})).sort((a,b)=>a.avgZ-b.avgZ);
      const[r2,g2,b2]=[parseInt(col.slice(1,3),16),parseInt(col.slice(3,5),16),parseInt(col.slice(5,7),16)];
      fd.forEach(({vi,fi})=>{const v2=vi.map(i=>pts[i]);const br=bright[fi];cx.beginPath();cx.moveTo(v2[0].px,v2[0].py);v2.forEach((v,i)=>i>0&&cx.lineTo(v.px,v.py));cx.closePath();cx.fillStyle=`rgba(${r2},${g2},${b2},${al*br*.32})`;cx.strokeStyle=`rgba(${r2},${g2},${b2},${al*br*.75})`;cx.lineWidth=.8;cx.fill();cx.stroke();});
    };
    const draw=()=>{
      cx.clearRect(0,0,W,H);
      cubes.forEach(cube=>{
        cube.x+=cube.vx;cube.y+=cube.vy;
        if(cube.x<-.05)cube.x=1.05;if(cube.x>1.05)cube.x=-.05;if(cube.y<-.05)cube.y=1.05;if(cube.y>1.05)cube.y=-.05;
        cube.rx+=cube.vrx;cube.ry+=cube.vry;cube.rz+=cube.vrz;
        const sc=.5+cube.z*.7,ccx=cube.x*W,ccy=cube.y*H;
        const[r2,g2,b2]=[parseInt(cube.c.slice(1,3),16),parseInt(cube.c.slice(3,5),16),parseInt(cube.c.slice(5,7),16)];
        const g=cx.createRadialGradient(ccx,ccy,0,ccx,ccy,cube.s*sc*2.5);g.addColorStop(0,`rgba(${r2},${g2},${b2},${cube.a*sc*.4})`);g.addColorStop(1,`rgba(${r2},${g2},${b2},0)`);cx.beginPath();cx.arc(ccx,ccy,cube.s*sc*2.5,0,Math.PI*2);cx.fillStyle=g;cx.fill();
        drawCube(ccx,ccy,cube.s*sc,cube.rx,cube.ry,cube.rz,cube.c,cube.a*sc);
      });
      id=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={r} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}/>;
}
export default function CyberBackground() {
  return (
    <>
      <NeuralBg />
      <FloatingCubes />
    </>
  );
}