(function(){'use strict';
const T=window.THEME,$=id=>document.getElementById('ow-'+id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FONT='Inter,system-ui,-apple-system,sans-serif',U=T.U||24;
const rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clock=t=>new Date(t).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'}).replace(' ','').toLowerCase();
const agoTxt=t=>{const a=Date.now()-t;return a<90e3?'just now':a<36e5?Math.round(a/6e4)+' min ago':a<864e5?Math.round(a/36e5)+' h ago':'over a day ago'};

/* ---------- data: the same fields the keeper writes (name, dept, status, latest, ts, order) ---------- */
const STATUS={BUILDING:['Working','#2f9bff'],DONE:['Finished, on a break','#35b56a'],IDLE:['Quiet','#9aa0b4'],'NEEDS YOU':['Needs you','#ff3b30'],BLOCKED:['Stuck','#ff3b30'],PARKED:['Parked','#9aa0b4']};
const sw=s=>STATUS[s]||STATUS.IDLE;
const modeOf=s=>s==='BUILDING'?'work':(s==='NEEDS YOU'||s==='BLOCKED')?'alert':s==='DONE'?'rest':'nap';
let rows=[],lastUpdate=0,refreshed=0,tNow=0,statusLine='';
const born=new Map();

/* ---------- districts: one per department, from the dept text. Never numbered, never split. ---------- */
const CATS=[
 {k:'property',n:'Property',re:/propert|lease|tenan|mortgage|real estate|rental/i},
 {k:'finance',n:'Finance',re:/financ|account|bookkeep|\btax\b|invoice|payroll|budget|cost/i},
 {k:'studio',n:'Studio',re:/creative|video|design|brand|photo|content studio|animation/i},
 {k:'ads',n:'Ads',re:/google ads|bing|meta ads|\bads\b|paid|ppc/i},
 {k:'web',n:'Web & Search',re:/web|seo|search|blog|landing|page|site|form/i},
 {k:'comms',n:'Comms',re:/email|newsletter|crm|social|organic|post|support|inbox|customer/i},
 {k:'ops',n:'Front office',re:null}];
const SHOW=['ads','studio','web','comms','ops','finance','property'];
const COL=Object.assign({ads:'#4d8cf0',studio:'#a266d6',web:'#34b27b',comms:'#f08a3c',ops:'#7a8ba8',finance:'#27a3a0',property:'#c9893f'},T.colors||{});
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const distOf=r=>{if(r.district)return {k:'x:'+r.district,n:r.district};const s=r.dept||'';for(const c of CATS)if(c.re&&c.re.test(s))return c;return CATS[6]};
const colorOf=d=>COL[d.k]||('hsl('+(hash(d.k)%360)+' 55% 52%)');
const CX=T.CX||2.5,CY=T.CY||2.3,PAD=T.PAD||1.5,BAND=T.BAND||2.1,STREET=T.STREET||3.4;
let dists=[],mapW=0,mapH=0,B={x0:0,x1:1,y0:0,y1:1},BW=B;
function layout(){
 const g=new Map();rows.forEach(r=>{const d=distOf(r);if(!g.has(d.k))g.set(d.k,{k:d.k,name:d.n,items:[]});g.get(d.k).items.push(r)});
 const ord=k=>{const i=SHOW.indexOf(k);return i<0?99:i};
 if(T.lounge)g.set('lounge',{k:'lounge',name:'Lounge',items:[],lounge:true,cap:6});
 dists=[...g.values()].sort((a,b)=>ord(a.k)-ord(b.k)||a.name.localeCompare(b.name));
 dists.forEach(d=>{d.items.sort((a,b)=>(a.order||99)-(b.order||99)||a.name.localeCompare(b.name));const n=d.lounge?d.cap:d.items.length;d.cols=Math.max(2,Math.min(5,Math.ceil(Math.sqrt(n*1.2))));d.rowsN=Math.ceil(n/d.cols);d.w=d.cols*CX+2*PAD+(d.lounge?0:(T.sideCol||0));d.h=d.rowsN*CY+2*PAD+BAND;d.color=colorOf(d)});
 const asp=clamp(($('stage').clientWidth||800)/($('stage').clientHeight||500),.5,2.2),area=dists.reduce((s,d)=>s+(d.w+STREET)*(d.h+STREET),0),target=Math.max(Math.max(...dists.map(d=>d.w))+2*STREET,Math.sqrt(area*asp)*1.15);
 let x=STREET,y=STREET,rowH=0,maxX=0,rowIdx=0;
 for(const d of dists){if(x>STREET&&x+d.w+STREET>target){x=STREET;y+=rowH+STREET;rowH=0;rowIdx++}d.x=x;d.y=y;d.row=rowIdx;x+=d.w+STREET;rowH=Math.max(rowH,d.h);maxX=Math.max(maxX,x)}
 mapW=maxX;mapH=y+rowH+STREET;
 const rb=[];dists.forEach(d=>{rb[d.row]=Math.max(rb[d.row]||0,d.y+d.h)});dists.forEach(d=>{d.rowStreet=rb[d.row]+STREET/2});
 dists.forEach(d=>{if(d.lounge){d.spots=[];for(let i=0;i<d.cap;i++){const c=i%d.cols,q=Math.floor(i/d.cols);d.spots.push({x:PAD+c*CX+CX/2,y:BAND+PAD*.4+q*CY+CY/2})}}});
 dists.forEach(d=>d.items.forEach((r,i)=>{const c=i%d.cols,q=Math.floor(i/d.cols);r._d=d;r._x=d.x+PAD+c*CX+CX/2;r._y=d.y+BAND+PAD*.4+q*CY+CY/2}));
 const pts=[T.P(0,-1.6,T.hmax||0),T.P(mapW,-1.6,T.hmax||0),T.P(0,mapH,0),T.P(mapW,mapH,0)];
 B={x0:Math.min(...pts.map(p=>p[0])),x1:Math.max(...pts.map(p=>p[0])),y0:Math.min(...pts.map(p=>p[1])),y1:Math.max(...pts.map(p=>p[1]))};{const m=T.margin||0,q=[T.P(-m,-m,0),T.P(mapW+m,-m,0),T.P(-m,mapH+m,0),T.P(mapW+m,mapH+m,0)];BW={x0:Math.min(...q.map(p=>p[0])),x1:Math.max(...q.map(p=>p[0])),y0:Math.min(...q.map(p=>p[1]))-60,y1:Math.max(...q.map(p=>p[1]))}}
}
const ps=new Map(),spotOf=new Map(),distBy=new Map();let layoutSig='';
const loungeD=()=>dists.find(d=>d.lounge);
function targetOf(r){if(T.lounge&&modeOf(r.status)==='rest'){const L=loungeD();let i=spotOf.get(r.id);if(i==null||i>=L.cap){const used=new Set(spotOf.values());i=0;while(used.has(i))i++;if(i>=L.cap){spotOf.delete(r.id);return{d:r._d,x:r._x,y:r._y}}spotOf.set(r.id,i)}const sp=L.spots[i%L.cap];return{d:L,x:L.x+sp.x,y:L.y+sp.y}}spotOf.delete(r.id);return{d:r._d,x:r._x,y:r._y}}
const aisle=d=>d.x+PAD*.45;
function route(da,db,ax,ay,sx,sy){const p=[];p.push({x:aisle(da),y:ay});
 if(da===db){p.push({x:aisle(da),y:sy},{x:sx,y:sy});return p}
 p.push({x:aisle(da),y:da.rowStreet});
 if(da.row===db.row)p.push({x:aisle(db),y:da.rowStreet});else p.push({x:STREET*.4,y:da.rowStreet},{x:STREET*.4,y:db.rowStreet},{x:aisle(db),y:db.rowStreet});
 p.push({x:aisle(db),y:sy},{x:sx,y:sy});return p}
function syncStates(snap){const sig=dists.map(d=>d.k+d.x.toFixed(1)+d.y.toFixed(1)+d.w.toFixed(1)).join();const geo=sig!==layoutSig;layoutSig=sig;distBy.clear();dists.forEach(d=>distBy.set(d.k,d));
 for(const r of rows){const t=targetOf(r);let s=ps.get(r.id);
  if(!s||snap||geo){s={x:t.x,y:t.y,path:[],at:t.d.k,tx:t.x,ty:t.y,next:null};ps.set(r.id,s)}
  else if(t.x!==s.tx||t.y!==s.ty){s.tx=t.x;s.ty=t.y;s.next=t}
  if(s.next&&!s.path.length)planWalk(s);r._px=s.x;r._py=s.y;r._walk=s.path.length>0;r._at=s.at}}
function planWalk(s){const t=s.next;s.next=null;const da=distBy.get(s.at)||t.d;s.path=reduce?[{x:t.x,y:t.y}]:route(da,t.d,s.x,s.y,t.x,t.y);s.at=t.d.k}
let pclock=0;function wander(r,s){if(reduce||modeOf(r.status)!=='nap'||s.path.length||s.next||s.at!==r._d.k)return;const home=Math.hypot(s.x-r._x,s.y-r._y)<.05;
 if(s.wt==null)s.wt=pclock+8+(hash(r.id)%40);if(pclock<s.wt)return;
 if(home){if([...ps.values()].filter(q=>q.out).length>=3){s.wt=pclock+10;return}const d=r._d,gy=r._y+CY*.48,sx=d.x+d.w-(T.sideCol?T.sideCol+.3:1.6);s.path=[{x:r._x,y:gy},{x:sx,y:gy}];s.out=1;s.wt=pclock+(s.path.length?6+(hash(r.id)%5):0)}
 else if(s.out){const gy=r._y+CY*.48;s.path=[{x:s.x,y:gy},{x:r._x,y:gy},{x:r._x,y:r._y}];s.out=0;s.wt=pclock+25+(hash(r.id+pclock)%50)}}
function stepPeople(dt){pclock+=dt;for(const r of rows){const s=ps.get(r.id);if(!s)continue;if(!s.path.length)wander(r,s);
 if(s.path.length){const w=s.path[0],dx=w.x-s.x,dy=w.y-s.y,d=Math.hypot(dx,dy),sp=(reduce?99:3.6)*dt;if(d<=sp){s.x=w.x;s.y=w.y;s.path.shift()}else{s.x+=dx/d*sp;s.y+=dy/d*sp}}
 else if(s.next)planWalk(s);
 r._px=s.x;r._py=s.y;r._walk=s.path.length>0;r._at=s.at}}
/* the manager walks the streets; she is not in any district */
const ada={id:'_ada',name:'Ada',dept:'Manager',status:'BUILDING',latest:'Walking the streets, keeping everyone moving.',ts:Date.now()-3*60000,_x:0,_y:0,isAda:true};
const AS={x:STREET*.4,y:STREET*.4,path:[],wait:0,d:null,i:0};
function adaStep(dt){if(reduce||!dists.length)return[AS.x,AS.y];if(AS.path.length){const w=AS.path[0],dx=w.x-AS.x,dy=w.y-AS.y,dd=Math.hypot(dx,dy),sp=2.6*dt;if(dd<=sp){AS.x=w.x;AS.y=w.y;AS.path.shift()}else{AS.x+=dx/dd*sp;AS.y+=dy/dd*sp}AS.walk=1;return[AS.x,AS.y]}
 AS.walk=0;if((AS.wait-=dt)>0)return[AS.x,AS.y];const rooms=dists.filter(d=>d.items.length||d.lounge),need=rows.find(r=>modeOf(r.status)==='alert');AS.i++;const tgt=need&&AS.i%3===0?need._d:rooms[(hash('ada'+AS.i))%rooms.length];
 const who=tgt.lounge?null:(need&&need._d===tgt?need:tgt.items[hash('w'+AS.i)%tgt.items.length]),sx=who?who._x+.95:tgt.x+tgt.w/2,sy=who?who._y+.35:tgt.y+tgt.h-1;
 const from=AS.d||tgt;AS.path=AS.d?route(from,tgt,AS.x,AS.y,sx,sy):[{x:AS.x,y:tgt.rowStreet},{x:aisle(tgt),y:tgt.rowStreet},{x:aisle(tgt),y:sy},{x:sx,y:sy}];AS.d=tgt;AS.wait=4+hash('p'+AS.i)%5;return[AS.x,AS.y]}
function adaPos(t){const m=.55,per=2*(mapW+mapH-4*m),d=(reduce?0:t*3)%per;let s=d;const W=mapW-2*m,H=mapH-2*m;
 if(s<W)return[m+s,m];s-=W;if(s<H)return[mapW-m,m+s];s-=H;if(s<W)return[mapW-m-s,mapH-m];s-=W;return[m,mapH-m-s]}

/* ---------- camera ---------- */
const cv=$('map'),ctx=cv.getContext('2d'),mini=$('mini'),mctx=mini.getContext('2d');
let CW=0,CH=0,DPR=1,fitZ=.3,touched=false,anim=null,sel=null,hover=null,hits=[];
const cam={z:1,px:0,py:0};
const MAXZ=3;
const clampCam=()=>{cam.z=clamp(cam.z,fitZ*.55,MAXZ);if(T.fillClamp){const w=cam.z*(BW.x1-BW.x0),h=cam.z*(BW.y1-BW.y0);cam.px=w>=CW?clamp(cam.px,CW-cam.z*BW.x1,-cam.z*BW.x0):CW/2-cam.z*(BW.x0+BW.x1)/2;cam.py=h>=CH?clamp(cam.py,CH-cam.z*BW.y1,-cam.z*BW.y0):CH/2-cam.z*(BW.y0+BW.y1)/2;return}cam.px=clamp(cam.px,CW*.2-cam.z*B.x1,CW*.8-cam.z*B.x0);cam.py=clamp(cam.py,CH*.2-cam.z*B.y1,CH*.8-cam.z*B.y0)};
function fitCam(){fitZ=Math.min((CW-20)/(B.x1-B.x0),(CH-20)/(B.y1-B.y0));return {z:fitZ,px:CW/2-fitZ*(B.x0+B.x1)/2,py:CH/2-fitZ*(B.y0+B.y1)/2}}
function goTo(t,fast){if(fast||reduce){Object.assign(cam,t);clampCam();anim=null;kick();return}anim={t0:performance.now(),dur:520,from:{...cam},to:t};kick()}
function zoomAt(f,sx,sy,fast){const nz=clamp(cam.z*f,fitZ*.55,MAXZ),k=nz/cam.z;goTo({z:nz,px:sx-(sx-cam.px)*k,py:sy-(sy-cam.py)*k},fast)}
const pzOf=r=>r&&r._d&&T.pzOf?T.pzOf(r._d):(T.pz||0);
const toS=(x,y,z=0)=>{const p=T.P(x,y,z);return[cam.px+cam.z*p[0],cam.py+cam.z*p[1]]};
function fly(id){const r=id==='_ada'?ada:rows.find(q=>q.id===id);if(!r)return;touched=true;hideHint();const nz=clamp(Math.max(cam.z,T.flyZoom||T.nameZoom*1.25),fitZ,MAXZ),p=T.P(r._px??r._x,r._py??r._y,pzOf(r));goTo({z:nz,px:CW/2-nz*p[0],py:CH*.34-nz*p[1]});select(id);$('stage').scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'})}
function sizeCanvas(){const st=$('stage');if(T.fitHeight&&innerWidth<700){const h=Math.max(250,Math.min(innerHeight*.6,(st.clientWidth-20)*(B.y1-B.y0)/(B.x1-B.x0)+28));st.style.height=Math.round(h)+'px'}else st.style.height='';CW=st.clientWidth;CH=st.clientHeight;if(!CW||!CH)return;DPR=Math.min(devicePixelRatio||1,2);cv.width=Math.round(CW*DPR);cv.height=Math.round(CH*DPR);const f=fitCam();if(!touched){if(CW<640&&T.phoneZoom){const need=rows.find(r=>modeOf(r.status)==='alert')||rows[0],dd=need._d,cs=[[dd.x,dd.y],[dd.x+dd.w,dd.y],[dd.x,dd.y+dd.h],[dd.x+dd.w,dd.y+dd.h]].map(([a,b])=>T.P(a,b,0)),x0=Math.min(...cs.map(q=>q[0])),x1=Math.max(...cs.map(q=>q[0])),y0=Math.min(...cs.map(q=>q[1]))-U*2.4,y1=Math.max(...cs.map(q=>q[1])),z=clamp(Math.min(CW*.96/(x1-x0),CH*.94/(y1-y0)),f.z,.95);Object.assign(cam,{z,px:CW/2-z*(x0+x1)/2,py:CH/2-z*(y0+y1)/2})}else if(T.deskZoom&&f.z<T.deskZoom){const need=rows.find(r=>modeOf(r.status)==='alert'),z=T.deskZoom;if(need){const dd=need._d,p=T.P(dd.x+dd.w/2,dd.y+dd.h/2,0);Object.assign(cam,{z,px:CW/2-z*p[0],py:CH*.45-z*p[1]})}else Object.assign(cam,{z,px:CW/2-z*(B.x0+B.x1)/2,py:CH/2-z*(B.y0+B.y1)/2})}else Object.assign(cam,f)}clampCam()}

/* ---------- drawing ---------- */
function frame(t){
 if(!CW)return;tNow=t;
 if(anim){const k=Math.min(1,(performance.now()-anim.t0)/anim.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;for(const q of['z','px','py'])cam[q]=anim.from[q]+(anim.to[q]-anim.from[q])*e;if(k>=1)anim=null;clampCam()}
 const c=ctx,z=cam.z;c.setTransform(DPR,0,0,DPR,0,0);T.bg(c,CW,CH,cam);
 const ap=adaStep(Math.min(.1,Math.max(0,t-(frame._t||t))));ada._x=ap[0];ada._y=ap[1];ada._walk=AS.walk;ada._px=ap[0];ada._py=ap[1];stepPeople(Math.min(.1,Math.max(0,t-(frame._t||t))));frame._t=t;
 c.setTransform(DPR*z,0,0,DPR*z,DPR*cam.px,DPR*cam.py);
 T.world(c,{dists,rows,mapW,mapH,t,z,cam,CW,CH,sel,hover,ada,reduce,street:STREET,PAD,BAND,CX,CY,modeOf});
 c.setTransform(DPR,0,0,DPR,0,0);overlay(c,t);drawMini();
}
function overlay(c,t){
 const z=cam.z,near=z>=T.nameZoom,deep=z>=(CW<520?.8:(T.deptZoom||T.nameZoom*1.3));hits=[];
 // district labels: one big label per department, with how many and how they are doing
 const lab=[];for(const d of dists.slice().sort((a,b)=>b.items.length-a.items.length)){const a=T.label(d);let[sx,sy]=toS(a[0],a[1],a[2]);if(sx<-300||sx>CW+300||sy<-80||sy>CH+80)continue;
  if(T.chipHide&&z>=T.chipHide)continue;const mem=d.lounge?rows.filter(r=>r._at===d.k):d.items;const wpx=(T.span?T.span(d):d.w*U)*z,f=clamp(wpx*.08,CW<520?12:14,20),cnt=[0,0,0,0];mem.forEach(r=>{const m=modeOf(r.status);cnt[m==='alert'?0:m==='work'?1:m==='rest'?2:3]++});
  c.font='800 '+f+'px '+FONT;const label=d.name+' · '+mem.length+(mem.length===1?' person':' people'),lw=c.measureText(label).width;const dots=T.plainChips?(cnt[0]?[0]:[]):[0,1,2,3].filter(i=>cnt[i]),dw=dots.length?dots.length*(f*1.5+4):0,ph=f*1.7,w=lw+f*1.6+(f*.8)+dw+f*.8;
  let x0=clamp(sx-w/2,4,CW-w-4),y0=sy-(T.chipCenter?ph/2:ph);const ov=()=>lab.some(q=>x0<q.x+q.w&&x0+w>q.x&&y0<q.y+q.h&&y0+ph>q.y);if(ov()){y0-=ph+3;if(ov()&&!cnt[0])continue}lab.push({x:x0,y:y0,w,h:ph});c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=8;c.shadowOffsetY=2;rr(c,x0,y0,w,ph,ph/2);c.fillStyle=T.chip?T.chip(d):d.color;c.fill();c.shadowColor='transparent';
  c.fillStyle='#fff';c.textBaseline='middle';c.textAlign='left';c.fillText(label,x0+f*.8,y0+ph/2+1);
  let dx=x0+f*.8+lw+f*.7;
  const cols=['#ff3b30','#2f9bff','#35b56a','#c9ced8'];dots.forEach(i=>{c.fillStyle='rgba(255,255,255,.95)';rr(c,dx-2,y0+ph/2-f*.62,f*1.5,f*1.24,f*.62);c.fill();c.fillStyle=cols[i];c.beginPath();c.arc(dx+f*.34,y0+ph/2,f*.26,0,7);c.fill();c.fillStyle='#222';c.font='800 '+(f*.72)+'px '+FONT;c.fillText(cnt[i],dx+f*.7,y0+ph/2+1);dx+=f*1.5+4});
  c.textBaseline='alphabetic'}
 // people: one figure each. Ring colour = status. Name only when close, hovered or tapped.
 const list=rows.concat([ada]).map(r=>{const p=toS(r._px??r._x,r._py??r._y,pzOf(r));return{r,sx:p[0],sy:p[1]}}).filter(o=>o.sx>-40&&o.sx<CW+40&&o.sy>-60&&o.sy<CH+60).sort((a,b)=>a.sy-b.sy);
 const R0=clamp(z*U*.5,T.minR||5.5,T.maxR||12),placed=lab.slice(),plates=[],tokens=[];
 for(const o of list){const r=o.r,isA=r.isAda,m=isA?'ada':modeOf(r.status),col=isA?'#f5b700':sw(r.status)[1],dcol=isA?'#f5b700':r._d.color;
  const R=R0*(isA?1.25:1),pin=T.marker==='pin',disc=T.marker==='disc';
  let cx=o.sx,cy=o.sy;if(pin)cy=o.sy-R*1.55;else if(!disc)cy=o.sy-(T.bodyH||0)*z*.5;
  const dim=m==='nap'?.88:1;
  if(disc||pin){c.globalAlpha=dim;c.fillStyle=pin&&!isA?'#fff':dcol;if(pin){c.beginPath();c.arc(cx,cy,R*.88,Math.PI*.78,Math.PI*2.22);c.lineTo(o.sx,o.sy);c.closePath();c.fill();if(!isA){c.strokeStyle=dcol;c.lineWidth=2;c.stroke()}}else{c.beginPath();c.arc(cx,cy,R*.8,0,7);c.fill()}
   if(R>=6.5){c.fillStyle=pin&&!isA?dcol:'#fff';c.font='800 '+Math.round(R*1.05)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(isA?'★':(r.name||'?')[0],cx,cy+1);c.textBaseline='alphabetic';c.textAlign='left'}c.globalAlpha=1}
  const flat=(disc||pin)?1:.55,rad=(disc||pin)?R:R*1.15;
  if(m==='work'&&!reduce){const k=(t*1.3+hash(r.id)%7)%1;c.strokeStyle=col;c.globalAlpha=(1-k)*.55;c.lineWidth=2;c.beginPath();c.ellipse(cx,(disc||pin)?cy:o.sy,(rad+2+k*7),(rad+2+k*7)*flat,0,0,7);c.stroke();c.globalAlpha=1}
  if(m==='alert'){const g=c.createRadialGradient(cx,cy,2,cx,cy,rad*3);g.addColorStop(0,'rgba(255,59,48,.5)');g.addColorStop(1,'rgba(255,59,48,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,rad*3,0,7);c.fill()}
  c.globalAlpha=m==='nap'?.85:1;c.strokeStyle=col;c.lineWidth=m==='alert'?3.6:3;c.beginPath();c.ellipse(cx,(disc||pin)?cy:o.sy,rad+1.5,(rad+1.5)*flat,0,0,7);c.stroke();c.globalAlpha=1;
  const ty=cy-rad-(pin?R*.6:0);
  if(m==='alert'){const by=ty-R*1.05-(reduce?0:Math.abs(Math.sin(t*4))*3),br=Math.max(8,R*.95);c.fillStyle='#fff';c.beginPath();c.arc(cx,by,br+2,0,7);c.fill();c.fillStyle='#ff3b30';c.beginPath();c.arc(cx,by,br,0,7);c.fill();c.fillStyle='#fff';c.font='800 '+Math.round(br*1.4)+'px '+FONT;c.textAlign='center';c.fillText('!',cx,by+br*.5);c.textAlign='left'}
  else if(m==='rest'){const ux=cx+rad*.95,uy=ty+R*.3,s=Math.max(5,R*.7);c.fillStyle='#fff';c.strokeStyle='#35b56a';c.lineWidth=1.6;rr(c,ux-s/2,uy-s/2,s,s,s*.2);c.fill();c.stroke();c.beginPath();c.arc(ux+s/2,uy,s*.28,-1.2,1.2);c.stroke();c.fillStyle='#35b56a';c.fillRect(ux-s*.35,uy-s*.1,s*.7,s*.22)}
  const isNew=born.has(r.id)&&tNow-born.get(r.id)<9;
  if(isNew){c.font='800 10px '+FONT;c.fillStyle='#ffd23f';rr(c,cx-14,ty-R*2.2-9,28,15,7);c.fill();c.fillStyle='#3a2a00';c.textAlign='center';c.fillText('NEW',cx,ty-R*2.2+2);c.textAlign='left'}
  if(sel===r.id){c.strokeStyle='#fff';c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.ellipse(cx,(disc||pin)?cy:o.sy,rad+6,(rad+6)*flat,0,0,7);c.stroke();c.setLineDash([])}
  const hr=Math.max(rad+7,15);hits.push({id:r.id,x:cx,y:(disc||pin)?cy:o.sy-(T.bodyH||0)*z*.3,r:hr});tokens.push({id:r.id,x:cx-rad-3,y:((disc||pin)?cy:o.sy)-rad-3,w:2*rad+6,h:2*rad+6});if(!disc&&!pin)tokens.push({id:r.id,x:o.sx-R*.9,y:o.sy-(T.bodyH||0)*z*.78,w:R*1.8,h:(T.bodyH||0)*z*.78});
  if(near||sel===r.id||hover===r.id||isA&&near){const nm=r.name||r.session,dp=near&&deep?(isA?'Manager':r.dept):'';if(cx<6||cx>CW-6||cy<6||cy>CH-6)continue;plates.push({id:r.id,nm,dp,side:!!(T.sideLabels&&!isA),hx:o.sx,hy:o.sy-(T.bodyH||0)*z*.62,R:Math.max(14,(T.bodyH||0)*z*.22),fy:o.sy,cx,py:cy+rad+4,pri:(sel===r.id||hover===r.id)?0:1})}
 }
 // name plates: the tapped or hovered person first, then anyone who still fits without covering another
 plates.sort((a,b)=>a.pri-b.pri);for(const q of plates){c.font='700 12px '+FONT;const nw=c.measureText(q.nm).width;c.font='500 11px '+FONT;const dw=q.dp?c.measureText(q.dp).width:0,w=Math.max(nw,dw)+14,h=q.dp?31:20;
  const G=4,hit=(px,py)=>tokens.some(o=>o.id!==q.id&&px<o.x+o.w&&px+w>o.x&&py<o.y+o.h&&py+h>o.y)||placed.some(o=>px<o.x+o.w+G&&px+w+G>o.x&&py<o.y+o.h+G&&py+h+G>o.y);
  const cands=q.side?[[q.hx+q.R*.9,q.hy-h/2],[q.hx-q.R*.9-w,q.hy-h/2],[q.hx-w/2,q.hy-q.R*1.6-h],[q.hx-w/2,q.fy+4]]:[[q.cx-w/2,q.py]];let px=null,py=null;
  for(const[a,b]of cands){const ax=clamp(a,4,CW-w-4),by=clamp(b,4,CH-h-4);if(!hit(ax,by)){px=ax;py=by;break}}
  if(px===null){if(q.pri>0)continue;px=clamp(cands[0][0],4,CW-w-4);py=clamp(cands[0][1],4,CH-h-4)}q.cx=px+w/2;placed.push({x:px,y:py,w,h});c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=6;c.shadowOffsetY=1;rr(c,px,py,w,h,8);c.fillStyle='#fff';c.fill();c.shadowColor='transparent';c.textAlign='center';c.fillStyle='#16182a';c.font='700 12px '+FONT;c.fillText(q.nm,q.cx,py+14);if(q.dp){c.fillStyle='#5a5f76';c.font='500 11px '+FONT;c.fillText(q.dp,q.cx,py+26)}c.textAlign='left'}
}
function drawMini(){
 mini.style.display=CH>=340&&CW>=520?'':'none';
 const asp=(B.x1-B.x0)/(B.y1-B.y0);let w=78*asp,h=78;if(w>118){w=118;h=118/asp}
 mini.style.width=w+'px';mini.style.height=h+'px';if(mini.width!==Math.round(w*2)){mini.width=Math.round(w*2);mini.height=Math.round(h*2)}
 const mw=mini.width,mh=mini.height,s=Math.min((mw-8)/(B.x1-B.x0),(mh-8)/(B.y1-B.y0)),c=mctx;c.clearRect(0,0,mw,mh);c.fillStyle='rgba(214,205,188,.95)';c.fillRect(0,0,mw,mh);
 const M=(x,y,z=0)=>{const p=T.P(x,y,z);return[4+(p[0]-B.x0)*s,4+(p[1]-B.y0)*s]};
 for(const d of dists){const q=[M(d.x,d.y),M(d.x+d.w,d.y),M(d.x+d.w,d.y+d.h),M(d.x,d.y+d.h)];c.beginPath();q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=d.color;c.globalAlpha=.75;c.fill();c.globalAlpha=1}
 for(const r of rows){const p=M(r._px??r._x,r._py??r._y),m=modeOf(r.status);c.fillStyle=m==='alert'?'#ff3b30':'rgba(40,40,60,.75)';c.beginPath();c.arc(p[0],p[1],m==='alert'?4:1.8,0,7);c.fill()}
 const a=M(ada._x,ada._y);c.fillStyle='#f5b700';c.beginPath();c.arc(a[0],a[1],3,0,7);c.fill();
 const v=[[0,0],[CW,0],[CW,CH],[0,CH]].map(([x,y])=>{const bx=(x-cam.px)/cam.z,by=(y-cam.py)/cam.z;return[4+(bx-B.x0)*s,4+(by-B.y0)*s]});
 c.strokeStyle='#1b1b19';c.lineWidth=2;c.beginPath();v.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.stroke();
 mini._s=s;
}
function miniGo(e){const r=mini.getBoundingClientRect(),k=mini.width/r.width,mx=(e.clientX-r.left)*k,my=(e.clientY-r.top)*k,s=mini._s||1;const bx=(mx-4)/s+B.x0,by=(my-4)/s+B.y0;touched=true;hideHint();cam.px=CW/2-cam.z*bx;cam.py=CH/2-cam.z*by;anim=null;clampCam();kick()}
let mdrag=false;mini.addEventListener('pointerdown',e=>{mdrag=true;mini.setPointerCapture(e.pointerId);miniGo(e)});mini.addEventListener('pointermove',e=>{if(mdrag)miniGo(e)});mini.addEventListener('pointerup',()=>{mdrag=false});

/* ---------- loop: only while visible, about 24 frames a second, nothing moves under reduced motion ---------- */
let raf=0,last=0,inView=true;
function loop(ts){raf=0;if(document.hidden||!inView)return;if(ts-last>=41){last=ts;frame(ts/1000)}raf=requestAnimationFrame(loop)}
function kick(){if(reduce){if(!raf)raf=requestAnimationFrame(()=>{raf=0;frame(0)});return}if(!raf&&!document.hidden&&inView){last=performance.now();raf=requestAnimationFrame(loop)}}
document.addEventListener('visibilitychange',kick);
new IntersectionObserver(e=>{inView=e[0].isIntersecting;kick()}).observe(cv);
let rz=0;new ResizeObserver(()=>{clearTimeout(rz);rz=setTimeout(()=>{sizeCanvas();kick()},100)}).observe($('stage'));

/* ---------- touch, mouse, keyboard ---------- */
const ptrs=new Map();let drag=null,pinch=null,moved=false,hintGone=false;
const hideHint=()=>{if(!hintGone){hintGone=true;$('hint').hidden=true}};setTimeout(hideHint,6000);
const rel=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const pick=(x,y)=>{let best=null,bd=1e9;for(const h of hits){const d=Math.hypot(h.x-x,h.y-y);if(d<h.r&&d<bd){bd=d;best=h.id}}return best};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const[x,y]=rel(e);ptrs.set(e.pointerId,{x,y});anim=null;moved=false;
 if(ptrs.size===1)drag={x,y,px:cam.px,py:cam.py,sx:x,sy:y};if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,px:cam.px,py:cam.py};drag=null}});
cv.addEventListener('pointermove',e=>{const[x,y]=rel(e);
 if(e.pointerType==='mouse'&&!ptrs.size){const h=pick(x,y);if(h!==hover){hover=h;cv.style.cursor=h?'pointer':'grab';kick()}}
 if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x,y});
 if(pinch&&ptrs.size>=2){const[a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,nz=clamp(pinch.z*d/pinch.d,fitZ*.55,MAXZ),k=nz/pinch.z;cam.z=nz;cam.px=cx-(pinch.cx-pinch.px)*k;cam.py=cy-(pinch.cy-pinch.py)*k;clampCam();moved=true;touched=true;hideHint();kick();return}
 if(drag){if(Math.hypot(x-drag.sx,y-drag.sy)>6)moved=true;if(moved){cam.px=drag.px+x-drag.x;cam.py=drag.py+y-drag.y;clampCam();touched=true;hideHint();cv.style.cursor='grabbing';kick()}}});
const up=(e,cancel)=>{if(!ptrs.has(e.pointerId))return;const was=ptrs.size;if(cancel)moved=true;ptrs.delete(e.pointerId);cv.style.cursor='grab';
 if(was===1&&!moved&&drag){const[x,y]=rel(e);select(pick(x,y))}
 if(ptrs.size===1){const[[,p]]=[...ptrs.entries()];drag={x:p.x,y:p.y,px:cam.px,py:cam.py,sx:p.x,sy:p.y};pinch=null;moved=true}if(ptrs.size===0){drag=null;pinch=null}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>up(e,true));
cv.addEventListener('pointerleave',()=>{if(hover){hover=null;kick()}});
cv.addEventListener('wheel',e=>{e.preventDefault();const[x,y]=rel(e);touched=true;hideHint();zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)),x,y,true)},{passive:false});
cv.addEventListener('dblclick',e=>{const[x,y]=rel(e);touched=true;hideHint();zoomAt(1.8,x,y)});
cv.addEventListener('keydown',e=>{const s=60;if(e.key==='+'||e.key==='=')zoomAt(1.25,CW/2,CH/2);else if(e.key==='-')zoomAt(.8,CW/2,CH/2);else if(e.key==='ArrowLeft')cam.px+=s;else if(e.key==='ArrowRight')cam.px-=s;else if(e.key==='ArrowUp')cam.py+=s;else if(e.key==='ArrowDown')cam.py-=s;else if(e.key==='0')goTo(fitCam());else return;e.preventDefault();clampCam();touched=true;kick()});
$('zin').onclick=()=>{touched=true;hideHint();zoomAt(1.4,CW/2,CH/2)};$('zout').onclick=()=>{touched=true;hideHint();zoomAt(1/1.4,CW/2,CH/2)};$('zfit').onclick=()=>{touched=true;goTo(fitCam())};

/* ---------- card, banner, list, header ---------- */
function select(id){sel=id;const r=id==='_ada'?ada:rows.find(q=>q.id===id),s=$('sheet');if(!r){s.hidden=true;kick();return}
 const[sl,sc]=r.isAda?['Manager','#f5b700']:sw(r.status);s.hidden=false;const w=$('s-sw');w.style.borderColor=sc;w.style.background=r.isAda?'#f5b700':r._d.color;w.textContent=r.isAda?'★':(r.name||'?')[0];
 const nm=$('s-nm');nm.replaceChildren(document.createTextNode(r.name||r.session));const pl=el('span','pill',sl);pl.style.background=sc;nm.append(pl);
 $('s-dp').textContent=(r.isAda?'Manager, walks the streets':(r._d.name+' · '+(r.dept||'')));$('s-do').textContent=r.latest||'Nothing reported yet.';$('s-ts').textContent=r.ts?'Last reported '+clock(r.ts)+' ('+agoTxt(r.ts)+')':(r.updatedText?'Last reported '+r.updatedText:'');const fb=$('s-fb');fb.replaceChildren();if(!r.isAda&&typeof feedbackBox==='function')fb.append(feedbackBox('session:'+(r.session||r.id),r.session||r.name));kick()}
$('s-x').onclick=()=>select(null);
function header(){const n={w:0,r:0,q:0,a:0};rows.forEach(r=>{const m=modeOf(r.status);n[m==='work'?'w':m==='alert'?'a':m==='rest'?'r':'q']++});
 $('pulse').textContent=(n.a?n.a+' need'+(n.a>1?'':'s')+' you · ':'')+n.w+' working · '+n.r+' on a break · '+n.q+' quiet · '+(lastUpdate?'updated '+clock(lastUpdate)+' ('+agoTxt(lastUpdate)+')':(statusLine.split(' · ')[0]||'Press Refresh to update'));
 const bx=$('banners');bx.replaceChildren();if(!rows.length){const n=el('div','banner');n.style.cursor='default';n.style.borderColor='var(--line)';n.style.background='var(--panel)';n.append(el('span','bang','i'));const d=el('span');d.append(el('b',null,'Nobody on the Office yet. '),document.createTextNode('Rename a long-running session so its title ends with a name in brackets, like "Meta ads (Rory)". Your manager gives them a desk at its next check-in. Until then you can wander round the town.'));n.append(d);bx.append(n)}const need=rows.filter(r=>modeOf(r.status)==='alert');
 if(need.length){const b=el('button','banner');b.type='button';b.append(el('span','bang','!'));const d=el('span');d.append(el('b',null,need.length>1?need.length+' need you: '+need.map(r=>r.name).join(', ')+'. ':need[0].name+' needs you. '),document.createTextNode(need.length>1?'Tap to fly to the first.':(need[0].latest||'')+' Tap to fly there.'));b.append(d);b.onclick=()=>fly(need[0].id);bx.append(b)}
 const ch=$('chips');ch.replaceChildren();
 for(const d of dists){const g=el('div','chipgroup');const sq=el('i');sq.style.background=d.color;g.append(sq,document.createTextNode(d.name+' · '+d.items.length));ch.append(g);
  d.items.slice().sort((a,b)=>(modeOf(b.status)==='alert')-(modeOf(a.status)==='alert')).forEach(r=>{const b=el('button','chip'+(modeOf(r.status)==='alert'?' need':''));b.type='button';const t=el('b');const rg=el('i','ring');rg.style.borderColor=sw(r.status)[1];t.append(rg,document.createTextNode(r.name));b.append(t,el('small',null,r.dept||''));b.onclick=()=>fly(r.id);ch.append(b)})}}

/* ---------- live data: every sessions doc gets a desk, a name and a department ---------- */
const mgrName=()=>(typeof people==='object'&&people.manager&&people.manager.name)||'Ada';
const mapRow=(id,x)=>{const sf=typeof staffOf==='function'?staffOf(x.session||id):null;return {id,session:x.session||id,name:x.name||(sf&&sf.name)||x.session||id,dept:x.dept||x.role||x.session||id,district:x.district,status:String(x.status||'IDLE').toUpperCase(),latest:x.latest||'',order:x.order||60,ts:x.ts?Date.parse(x.ts)||0:0,updatedText:x.updated||''}};
let first=true;
db.collection('sessions').onSnapshot(q=>{ada.name=mgrName();const mn=ada.name.toLowerCase();rows=q.docs.map(x=>mapRow(x.id,x.data())).filter(r=>r.name.toLowerCase()!==mn&&!/^manager\b/i.test(r.session));
 if(!first)rows.forEach(r=>{if(!ps.has(r.id))born.set(r.id,tNow)});layout();syncStates(first);if(first){sizeCanvas();first=false}else{fitCam();clampCam()}header();kick()},()=>{$('pulse').textContent="Couldn't load the office."});
/* ---------- Refresh: leaves a request note; the manager's check-in fills the sessions in and stamps meta/status.filled_at ---------- */
let busy=false,reqAt=0,tmo=0;
const idle=()=>{busy=false;$('refresh').disabled=false;clearTimeout(tmo)};
$('refresh').onclick=async()=>{if(busy)return;busy=true;$('refresh').disabled=true;$('rnote').textContent='Refresh requested, filling in...';reqAt=Date.now();
 try{await db.doc('meta/refresh').set({requested_at:new Date(reqAt).toISOString()})}catch(e){$('rnote').textContent="Couldn't send the request. Check you're signed in.";idle();return}
 tmo=setTimeout(()=>{if(busy){$('rnote').textContent='Request sent. It fills in at the next check-in.';idle()}},120000)};
db.doc('meta/status').onSnapshot(x=>{const v=x.data()||{};statusLine=v.line||'';if(v.filled_at){lastUpdate=Date.parse(v.filled_at)||0;if(busy&&lastUpdate>=reqAt-5000){$('rnote').textContent='Updated '+clock(lastUpdate);idle()}}header()},()=>{});
setInterval(header,30000);
if(/^#fly=/.test(location.hash)){const nm=decodeURIComponent(location.hash.slice(5)),r=rows.find(q=>q.name===nm);if(r){touched=true;const nz=clamp(T.flyZoom||T.nameZoom*1.4,fitZ,MAXZ),p=T.P(r._px??r._x,r._py??r._y,pzOf(r));cam.z=nz;cam.px=CW/2-nz*p[0];cam.py=CH*.34-nz*p[1];clampCam();select(r.id);hideHint()}}
})();
