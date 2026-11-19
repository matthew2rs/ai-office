const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const shade=(h,a)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,v*a))|0;return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')'};
const poly=(c,pts,fill)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill()};
const rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
const ell=(c,x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fillStyle=fill;c.fill()};
function box(c,M,x,y,w,d,h,z,col,top){const P=M.P;
 poly(c,[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],shade(col,.86));
 poly(c,[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],shade(col,.68));
 poly(c,[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],top||col)}
function sky(){const h=new Date().getHours();return h>=7&&h<17?['#8fd0f7','#dff3ff',1]:h>=17&&h<20?['#ff9f6b','#ffe0a8',.6]:h>=5&&h<7?['#f7b9a0','#ffe9c9',.5]:['#141c44','#32407c',0]}
function plant(c,M,x,y){box(c,M,x-.2,y-.2,.4,.4,.42,0,'#e9e2d4');const [px,py]=M.P(x,y,.42),u=M.hw;
 [[-.26,-.5,.2,-.5],[.26,-.55,.2,.5],[0,-.8,.2,0],[-.14,-.95,.16,-.25],[.16,-1.0,.16,.3]].forEach(([dx,dy,r,rot],i)=>{c.beginPath();c.ellipse(px+dx*u,py+dy*u,r*u,r*u*1.9,rot,0,7);c.fillStyle=i%2?'#3f9d5c':'#2f8a4d';c.fill()})}

/* ---------- characters ---------- */
const SKIN=['#f6d2b3','#eab890','#c98e62','#8f5b3c','#f9dcc4'],HAIR=['#2b1d14','#51321f','#a8652a','#e0b96a','#1b1b1f','#8c2f1c','#9a9aa6'],SHIRT=['#ef476f','#2f7de1','#16a394','#f08a3c','#7a5cc9','#2e9d57','#f2b705','#e05fa0','#0ea5e9','#5c6ac4'];
const PRESET={
 'manager':{shirt:'#20263a',suit:1,hair:'#9a9aa6',style:2,glasses:1,skin:'#f6d2b3'}};
function lookFor(r){const h=hash(r.id);const base={skin:SKIN[h%5],hair:HAIR[(h>>>3)%7],shirt:SHIRT[(h>>>6)%10],style:(h>>>10)%5,glasses:((h>>>13)%4)===0,phones:((h>>>15)%5)===0};return Object.assign(base,PRESET[r.id]||{},{pants:['#2d3550','#3d3a52','#3a4a44'][(h>>>17)%3]})}
function person(c,px,py,s,L,o){
 c.save();if(o.alpha!=null&&o.alpha<1)c.globalAlpha=Math.max(0,o.alpha);
 const t=o.t||0,ph=o.ph||0,m=o.mode;
 if(!o.noShadow)ell(c,px,py,s*.27,s*.1,'rgba(10,12,30,.28)');
 const bob=o.walk?Math.abs(Math.sin(o.step))*s*.045:(reduce?0:Math.sin(t*2+ph)*s*.008),y0=py-bob;
 if(o.seated){rr(c,px-s*.26,y0-s*.74,s*.52,s*.56,s*.12);c.fillStyle='#343d5c';c.fill()}
 else{const sw=o.walk?Math.sin(o.step)*s*.05:0;c.fillStyle=L.pants;rr(c,px-s*.15,y0-s*.3+Math.max(0,sw),s*.13,s*.3-Math.max(0,sw),s*.05);c.fill();rr(c,px+s*.02,y0-s*.3+Math.max(0,-sw),s*.13,s*.3-Math.max(0,-sw),s*.05);c.fill()}
 // long hair sits behind the head
 const hy=y0-s*.82+(m==='nap'&&o.seated?s*.035:0),hr=s*.215,hx=px+(m==='nap'&&o.seated?s*.02:0);
 if(L.style===4&&!L.hat){rr(c,hx-hr*1.16,hy-hr*.9,hr*2.32,hr*2.35,hr*.8);c.fillStyle=L.hair;c.fill()}
 // arms behind torso for the back arm
 const arm=(sx,sy,ex,ey)=>{c.strokeStyle=L.shirt;c.lineWidth=s*.1;c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(ex,ey);c.stroke();ell(c,ex,ey,s*.055,s*.055,L.skin)};
 // torso
 rr(c,px-s*.2,y0-s*.64,s*.4,s*.4,s*.13);c.fillStyle=L.shirt;c.fill();
 if(L.vest){c.fillStyle='#ffe14a';c.fillRect(px-s*.2,y0-s*.48,s*.4,s*.05);c.fillRect(px-s*.11,y0-s*.63,s*.045,s*.38);c.fillRect(px+s*.065,y0-s*.63,s*.045,s*.38)}
 if(L.suit){poly(c,[[px-s*.07,y0-s*.64],[px+s*.07,y0-s*.64],[px,y0-s*.46]],'#fff');poly(c,[[px-s*.022,y0-s*.61],[px+s*.022,y0-s*.61],[px+s*.03,y0-s*.44],[px,y0-s*.4],[px-s*.03,y0-s*.44]],'#e5352b')}
 const shY=y0-s*.56;
 if(m==='alert'&&!o.walk){const w=reduce?0:Math.sin(t*9)*s*.06;arm(px-s*.19,shY,px-s*.25,y0-s*.3);arm(px+s*.19,shY,px+s*.34+w,y0-s*1.0)}
 else if(m==='rest'&&!o.walk){const sip=reduce?0:Math.max(0,Math.sin(t*.9+ph)-.75)*4,cxh=px+s*(.24-.12*sip),cyh=y0-s*(.42+.26*sip);arm(px-s*.19,shY,px-s*.25,y0-s*.3);arm(px+s*.19,shY,cxh,cyh);
  rr(c,cxh-s*.05,cyh-s*.11,s*.11,s*.12,s*.02);c.fillStyle='#fff';c.fill();
  if(!reduce&&!sip){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.3;const k=(t*.6+ph)%1;c.beginPath();c.moveTo(cxh,cyh-s*.14-k*s*.1);c.quadraticCurveTo(cxh+s*.04,cyh-s*.2-k*s*.1,cxh,cyh-s*.26-k*s*.1);c.globalAlpha*=1-k;c.stroke();c.globalAlpha=o.alpha!=null?Math.max(0,Math.min(1,o.alpha)):1}}
 else if(!(o.seated&&m==='work')){const sw=o.walk?Math.sin(o.step)*s*.07:0;arm(px-s*.19,shY,px-s*.25,y0-s*.3-sw);arm(px+s*.19,shY,px+s*.25,y0-s*.3+sw)}
 // head
 ell(c,hx,hy,hr,hr,L.skin);
 if(m==='work'&&o.seated){const g=c.createRadialGradient(hx,hy+hr*1.4,1,hx,hy+hr*1.4,hr*2.4);g.addColorStop(0,'rgba(140,225,255,.38)');g.addColorStop(1,'rgba(140,225,255,0)');c.fillStyle=g;c.fillRect(hx-hr*2.5,hy-hr*1.2,hr*5,hr*4)}
 // hair
 c.fillStyle=L.hair;
 if(L.hat){c.fillStyle=L.hat;c.beginPath();c.arc(hx,hy-hr*.2,hr*1.1,Math.PI,2*Math.PI);c.fill();rr(c,hx-hr*1.35,hy-hr*.32,hr*2.7,hr*.26,hr*.12);c.fill();c.fillStyle=shade(L.hat,.8);c.fillRect(hx-hr*.12,hy-hr*1.3,hr*.24,hr*1.0)}
 else if(L.style===5){c.beginPath();c.arc(hx,hy,hr*1.03,Math.PI*1.1,Math.PI*1.9);c.lineTo(hx,hy-hr*.7);c.fill()}
 else{c.beginPath();c.arc(hx,hy,hr*1.06,Math.PI,2*Math.PI);c.quadraticCurveTo(hx+hr*.3,hy-hr*.62,hx-hr*.2,hy-hr*.45);c.quadraticCurveTo(hx-hr*.8,hy-hr*.4,hx-hr*1.06,hy);c.fill();
  if(L.style===1){rr(c,hx-hr*1.14,hy-hr*.25,hr*.36,hr*1.15,hr*.16);c.fill();rr(c,hx+hr*.78,hy-hr*.25,hr*.36,hr*1.15,hr*.16);c.fill()}
  if(L.style===2)ell(c,hx,hy-hr*1.18,hr*.42,hr*.42,L.hair);
  if(L.style===3){c.beginPath();c.ellipse(hx+hr*.3,hy-hr*.98,hr*.62,hr*.34,-.25,0,7);c.fill()}}
 // face
 const ey=hy+hr*.12,ex=hr*.38,blink=!reduce&&((t+ph*3)%4.2)<.13;c.fillStyle='#22202e';c.strokeStyle='#22202e';c.lineWidth=Math.max(1.2,s*.022);c.lineCap='round';
 if(m==='nap'&&!o.walk||blink){[-1,1].forEach(k=>{c.beginPath();c.moveTo(hx+k*ex-hr*.14,ey);c.lineTo(hx+k*ex+hr*.14,ey);c.stroke()})}
 else{const lookD=m==='work'&&o.seated?hr*.07:0;[-1,1].forEach(k=>ell(c,hx+k*ex,ey+lookD,hr*.11,hr*.13,'#22202e'))}
 ell(c,hx-hr*.62,ey+hr*.3,hr*.16,hr*.1,'rgba(255,120,120,.35)');ell(c,hx+hr*.62,ey+hr*.3,hr*.16,hr*.1,'rgba(255,120,120,.35)');
 c.beginPath();if(m==='alert'){c.ellipse(hx,ey+hr*.45,hr*.12,hr*.15,0,0,7);c.fillStyle='#7a2b2b';c.fill()}else if(m==='nap'){c.moveTo(hx-hr*.1,ey+hr*.46);c.lineTo(hx+hr*.1,ey+hr*.46);c.stroke()}else{c.arc(hx,ey+hr*.3,hr*.2,.15*Math.PI,.85*Math.PI);c.stroke()}
 if(L.beard){c.beginPath();c.arc(hx,hy+hr*.1,hr*1.0,.12*Math.PI,.88*Math.PI);c.quadraticCurveTo(hx,hy+hr*.5,hx+hr*.93,hy+hr*.45);c.fillStyle=L.hair;c.globalAlpha*=.85;c.fill();c.globalAlpha=o.alpha!=null?Math.max(0,Math.min(1,o.alpha)):1}
 if(L.glasses){c.strokeStyle='#22202e';c.lineWidth=Math.max(1.2,s*.022);[-1,1].forEach(k=>{c.beginPath();c.arc(hx+k*ex,ey,hr*.26,0,7);c.stroke()});c.beginPath();c.moveTo(hx-ex+hr*.26,ey);c.lineTo(hx+ex-hr*.26,ey);c.stroke()}
 if(L.phones){c.strokeStyle='#2a2f45';c.lineWidth=s*.04;c.beginPath();c.arc(hx,hy,hr*1.12,Math.PI*1.08,Math.PI*1.92);c.stroke();c.fillStyle='#2a2f45';rr(c,hx-hr*1.3,hy-hr*.3,hr*.36,hr*.7,hr*.14);c.fill();rr(c,hx+hr*.94,hy-hr*.3,hr*.36,hr*.7,hr*.14);c.fill()}
 c.restore();
}
function desk(c,M,d,st,t,ph){const x=d.x,y=d.y;
 box(c,M,x-.82,y+.42,1.64,.64,.56,0,'#a8733f','#fbf3e4');
 box(c,M,x-.82,y+.42,1.64,.64,.05,.56,'#e9dcc4','#fbf3e4');
 const P=M.P,z=.61;
 poly(c,[P(x-.3,y+.52,z),P(x+.3,y+.52,z),P(x+.3,y+.82,z),P(x-.3,y+.82,z)],'#c7ccd8');
 if(st!=='away'){const on=st==='work'||st==='alert';poly(c,[P(x-.3,y+.84,z),P(x+.3,y+.84,z),P(x+.3,y+.9,z+.42),P(x-.3,y+.9,z+.42)],'#2c3348');
  const [lx,ly]=P(x,y+.88,z+.22);ell(c,lx,ly,M.hw*.06,M.hw*.06,st==='alert'?'#ffb23f':on?'#8fe6ff':'#566080')}
 else poly(c,[P(x-.3,y+.52,z+.03),P(x+.3,y+.52,z+.03),P(x+.3,y+.82,z+.03),P(x-.3,y+.82,z+.03)],'#2c3348');
 box(c,M,x+.5,y+.55,.14,.14,.14,z,'#ff6b6b','#fff');
 poly(c,[P(x-.72,y+.56,z),P(x-.45,y+.56,z),P(x-.45,y+.84,z),P(x-.72,y+.84,z)],'#ffffff');
 if(st==='work'&&!reduce){[-1,1].forEach(k=>{const j=Math.sin(t*14+ph+k)*.03;const [hx,hy]=P(x+k*.17,y+.6+j,z+.02);ell(c,hx,hy,M.s*.05,M.s*.04,d.skin||'#eab890')})}
}
