/* AI Office: the live isometric look, one room per department, each room dressed for its job, one shared lounge. */
window.THEME=(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/*CHUNK*/
const U=40,ZS=U*1.05,PJ=(x,y,z=0)=>[(x-y)*U,(x+y)*U/2-z*ZS],M={P:PJ,hw:U,hh:U/2,zs:ZS,s:U*1.9},WH=1.9;
const STY={
 ads:{wall:'#5b7fc4',floor:'carpet',f1:'#d9c4a4',f2:'#cdb795',rug:'#f4c95d',wallP:['chart','screens'],floorP:['bigscreen','plant']},
 studio:{wall:'#8d6cc9',floor:'parquet',f1:'#e6cfa6',f2:'#d6b98d',rug:'#ff9fb5',wallP:['render','poster'],floorP:['easel','camera','lights']},
 web:{wall:'#3f9a7c',floor:'planks',f1:'#e3c597',f2:'#d6b585',rug:'#8fd0ff',wallP:['sticky','screens'],floorP:['server','plant']},
 comms:{wall:'#d58a4c',floor:'checker',f1:'#f6ead6',f2:'#f1cfa6',rug:'#8ee0b6',wallP:['trays','clock'],floorP:['phones','mailbox']},
 ops:{wall:'#566a94',floor:'tiles',f1:'#d9a27a',f2:'#c98f66',rug:'#f08a6c',wallP:['board','cert'],floorP:['cabinet','cooler']},
 finance:{wall:'#2f8a82',floor:'marble',f1:'#ece3cf',f2:'#ddd2ba',rug:'#b8e6d2',wallP:['chart','cert'],floorP:['safe','ledgers','calc']},
 property:{wall:'#9a6b4f',floor:'herring',f1:'#cc9e6c',f2:'#b6875a',rug:'#f0d9a8',wallP:['keys','plans'],floorP:['houses','plant']},
 lounge:{wall:'#c96f5c',floor:'checker',f1:'#f4ebd9',f2:'#bfe1d6',rug:'#ffd27a',wallP:['tv','poster'],floorP:['coffee','sofa','vending','plant']},
 other:{wall:'#667090',floor:'planks',f1:'#dbbb8d',f2:'#cfac7c',rug:'#cfd8ea',wallP:['board'],floorP:['shelf','plant']}};
const EXTRA=[{re:/podcast|stage|event|course|coach/i,p:'stage'},{re:/warehouse|forklift|freight|dispatch|yard/i,p:'hivis'},{re:/tool|research|engineer|dev\b/i,p:'bench'}];
const sty=d=>STY[d.k]||STY.other;
const T={U,P:PJ,hmax:2.6,nameZoom:.2,deptZoom:.4,marker:null,bodyH:U*2.3,minR:6,maxR:13,lounge:true,margin:20,sideCol:1.9,phoneZoom:.62,fillClamp:true,plainChips:true,chipCenter:true,flyZoom:.7,chipHide:.42,CX:2.9,CY:3.3,PAD:1.4,BAND:2.7,STREET:1.9,deskZoom:.74,sideLabels:true,
 colors:Object.fromEntries(Object.entries(STY).map(([k,v])=>[k,v.wall]))};
T.label=d=>[d.x+d.w/2,d.y+T.BAND*.42,0];T.chipHide=.33;T.span=d=>d.w*U*1.1;
T.bg=(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a9cf8f');g.addColorStop(1,'#93bf7a');c.fillStyle=g;c.fillRect(0,0,W,H)};
const q4=(c,a,b,cc,d,f)=>poly(c,[a,b,cc,d],f);
/* ---------- wall pictures, drawn on the wall plane. W(u,z) maps along-wall u and height z to the screen ---------- */
const rq=(c,W,a,b,z0,z1,f)=>q4(c,W(a,z0),W(b,z0),W(b,z1),W(a,z1),f);
const circ=(c,W,u,z,r,f)=>{c.beginPath();for(let i=0;i<=16;i++){const a=i/16*Math.PI*2,p=W(u+Math.cos(a)*r,z+Math.sin(a)*r);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.fillStyle=f;c.fill()};
const line=(c,W,u0,z0,u1,z1,col,w)=>{const a=W(u0,z0),b=W(u1,z1);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()};
const DEC={
 window:(c,W,a,b,z0,z1)=>{const[s0,s1,lit]=sky();rq(c,W,a-.08,b+.08,z0-.08,z1+.08,'#fffaf0');const p=W(a,z1),q=W(a,z0),g=c.createLinearGradient(0,p[1],0,q[1]);g.addColorStop(0,s0);g.addColorStop(1,s1);rq(c,W,a,b,z0,z1,g);rq(c,W,(a+b)/2-.04,(a+b)/2+.04,z0,z1,'#fffaf0');if(!lit)circ(c,W,b-.35,z1-.3,.12,'#fff6c9')},
 chart:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#ffffff');const cols=['#4d8cf0','#35b56a','#f4c95d','#ef476f'];for(let i=0;i<4;i++){const u=a+.25+i*(b-a-.5)/4,h=(z1-z0-.3)*(.35+.17*i);rq(c,W,u,u+(b-a-.5)/5,z0+.12,z0+.12+h,cols[i])}line(c,W,a+.15,z0+.12,b-.15,z0+.12,'#9aa0b4',1.2)},
 screens:(c,W,a,b,z0,z1,d)=>{const on=d.items.some(r=>r.status==='BUILDING');const n=3,w=(b-a-.2)/n;for(let i=0;i<n;i++){const u=a+.1+i*w;rq(c,W,u+.04,u+w-.04,z0+.15,z1-.1,'#1d2336');for(let k=0;k<3;k++)line(c,W,u+.12,z0+.35+k*.18,u+w-.2-(k%2)*.15,z0+.35+k*.18,on?'#8fe6ff':'#4a5470',1.4)}},
 sticky:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#c9a46a');const cols=['#ffe066','#ff9fb5','#8fd0ff','#a6e3a1'],n=4,m=3,w=(b-a-.2)/n,h=(z1-z0-.2)/m;for(let i=0;i<n;i++)for(let k=0;k<m;k++)rq(c,W,a+.12+i*w,a+.12+i*w+w*.75,z0+.12+k*h,z0+.12+k*h+h*.72,cols[(i+k)%4])},
 trays:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#8a5a3a');for(let k=0;k<3;k++){rq(c,W,a+.12,b-.12,z0+.12+k*.3,z0+.3+k*.3,'#f5f0e6');rq(c,W,a+.2,b-.25,z0+.3+k*.3,z0+.34+k*.3,'#ffffff')}},
 cert:(c,W,a,b,z0,z1)=>{const m=(a+b)/2;rq(c,W,m-.55,m+.55,z0+.1,z1-.05,'#c9a227');rq(c,W,m-.45,m+.45,z0+.18,z1-.13,'#fff8e6');line(c,W,m-.3,z1-.35,m+.3,z1-.35,'#9a8a6a',1.3);circ(c,W,m+.22,z0+.38,.1,'#d92d20')},
 board:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#eef0f3');rq(c,W,a+.06,b-.06,z0+.06,z1-.06,'#ffffff');line(c,W,a+.3,z1-.3,b-.5,z1-.3,'#4d8cf0',2);line(c,W,a+.3,z1-.55,b-.8,z1-.55,'#ef476f',2);line(c,W,a+.3,z1-.8,b-.4,z1-.8,'#35b56a',2)},
 keys:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0+.3,z1-.1,'#8a5a3a');for(let i=0;i<5;i++){const u=a+.3+i*(b-a-.6)/4;line(c,W,u,z1-.3,u,z1-.6,'#c9a227',1.6);circ(c,W,u,z1-.7,.09,'#e8c547')}},
 plans:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#2f6db5');for(let i=1;i<4;i++){line(c,W,a+i*(b-a)/4,z0+.1,a+i*(b-a)/4,z1-.1,'rgba(255,255,255,.5)',1);line(c,W,a+.1,z0+i*(z1-z0)/4,b-.1,z0+i*(z1-z0)/4,'rgba(255,255,255,.5)',1)}rq(c,W,a+.4,a+1,z0+.3,z0+.65,'rgba(255,255,255,.85)')},
 render:(c,W,a,b,z0,z1,d)=>{rq(c,W,a,b,z0,z1,'#15182a');const m=(a+b)/2,zm=(z0+z1)/2,col='#c69cff';line(c,W,m-.3,zm-.15,m,zm-.3,col,2);line(c,W,m,zm-.3,m+.3,zm-.15,col,2);line(c,W,m-.3,zm-.15,m-.3,zm+.2,col,2);line(c,W,m+.3,zm-.15,m+.3,zm+.2,col,2);line(c,W,m-.3,zm+.2,m,zm+.35,col,2);line(c,W,m,zm+.35,m+.3,zm+.2,col,2);line(c,W,m,zm-.3+.65,m,zm+.35,col,2)},
 poster:(c,W,a,b,z0,z1,d)=>{rq(c,W,a+.2,b-.2,z0,z1,shade(sty(d).wall,1.25));circ(c,W,(a+b)/2,z1-.45,.25,'#fff');rq(c,W,a+.4,b-.4,z0+.2,z0+.3,'#fff')},
 tv:(c,W,a,b,z0,z1)=>{rq(c,W,a,b,z0,z1,'#111522');const p=W(a,z1),q=W(b,z0),g=c.createLinearGradient(p[0],p[1],q[0],q[1]);g.addColorStop(0,'#3b6fd9');g.addColorStop(1,'#ff7ab0');rq(c,W,a+.08,b-.08,z0+.08,z1-.08,g)},
 clock:(c,W,a,b,z0,z1)=>{const m=(a+b)/2,zm=(z0+z1)/2+.1;circ(c,W,m,zm,.42,'#fffaf0');circ(c,W,m,zm,.34,'#ffffff');const d=new Date(),ha=(d.getHours()%12+d.getMinutes()/60)/12*Math.PI*2,ma=d.getMinutes()/60*Math.PI*2;line(c,W,m,zm,m+Math.sin(ha)*.18,zm+Math.cos(ha)*.18,'#2a2f45',2);line(c,W,m,zm,m+Math.sin(ma)*.28,zm+Math.cos(ma)*.28,'#2a2f45',1.5)},
 sign:(c,W,a,b,z0,z1,d)=>{const col=sty(d).wall;rq(c,W,a,b,z0,z1,shade(col,.55));rq(c,W,a+.06,b-.06,z0+.06,z1-.06,'#fbf3e0');
  const o=W(a+.25,(z0+z1)/2);c.save();c.translate(o[0],o[1]);c.transform(U/100,U/200,0,ZS/100,0,0);c.fillStyle=shade(col,.62);c.font='800 64px Space Grotesk,Inter,sans-serif';c.textBaseline='middle';let t=d.name.toUpperCase();const max=(b-a-.5)*100;while(c.measureText(t).width>max&&t.length>3)t=t.slice(0,-1);c.fillText(t,0,4);c.restore()}};
function decorFor(d){if(d._dec)return d._dec;const s=sty(d),back=[],left=[];
 const sw=Math.min(6.4,d.w-2.0),sa=d.x+d.w/2-sw/2,sb=sa+sw;back.push({k:'sign',a:sa,b:sb,z0:.98,z1:1.82});
 const list=[...s.wallP,'window','poster','window','cert'];let r=sb+.45,l=sa-.45,side=0;
 for(const k of list){const w=k==='window'?1.7:1.9,z0=k==='window'?.75:.62,z1=k==='window'?1.72:1.62;
  if(side===0&&r+w<=d.x+d.w-.3){back.push({k,a:r,b:r+w,z0,z1});r+=w+.45}else if(l-w>=d.x+.3){back.push({k,a:l-w,b:l,z0,z1});l-=w+.45}else if(r+w<=d.x+d.w-.3){back.push({k,a:r,b:r+w,z0,z1});r+=w+.45}side=1-side}
 left.push({k:'window',a:d.y+T.BAND+.3,b:d.y+T.BAND+2.1,z0:.75,z1:1.72});if(d.h>T.BAND+5)left.push({k:s.wallP[1]||'board',a:d.y+T.BAND+2.6,b:d.y+T.BAND+4.5,z0:.62,z1:1.62});left.push({k:'clock',a:d.y+.6,b:d.y+1.6,z0:.9,z1:1.6});if(d.h>T.BAND+8)left.push({k:'poster',a:d.y+T.BAND+5,b:d.y+T.BAND+6.8,z0:.62,z1:1.62});
 return d._dec={back,left}}
/* ---------- things on the floor ---------- */
const lineW=(c,x0,y0,z0,x1,y1,z1,col,w)=>{const a=PJ(x0,y0,z0),b=PJ(x1,y1,z1);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()};
const PROP={
 plant:(c,x,y)=>plant(c,M,x,y),
 bigscreen:(c,x,y)=>{box(c,M,x-.15,y-.1,.3,.3,.9,0,'#3a3f52');box(c,M,x-.9,y-.05,1.8,.12,.95,.9,'#1d2336','#2c3348');const a=PJ(x-.8,y+.08,1.0),b=PJ(x+.8,y+.08,1.75);c.fillStyle='rgba(143,230,255,.55)';poly(c,[PJ(x-.8,y+.08,1.0),PJ(x+.8,y+.08,1.0),PJ(x+.8,y+.08,1.75),PJ(x-.8,y+.08,1.75)],'rgba(110,200,255,.55)')},
 easel:(c,x,y)=>{lineW(c,x-.4,y+.3,0,x,y,1.5,'#8a5a3a',3);lineW(c,x+.4,y+.3,0,x,y,1.5,'#8a5a3a',3);lineW(c,x,y-.3,0,x,y,1.5,'#8a5a3a',3);box(c,M,x-.45,y+.05,.9,.08,.8,.6,'#ffffff','#f0ece4');poly(c,[PJ(x-.3,y+.13,.75),PJ(x+.3,y+.13,.75),PJ(x+.3,y+.13,1.25),PJ(x-.3,y+.13,1.25)],'#ff9fb5')},
 camera:(c,x,y)=>{lineW(c,x-.3,y+.3,0,x,y,1.0,'#2a2f45',2.5);lineW(c,x+.3,y+.2,0,x,y,1.0,'#2a2f45',2.5);lineW(c,x,y-.35,0,x,y,1.0,'#2a2f45',2.5);box(c,M,x-.25,y-.15,.5,.3,.3,1.0,'#2a2f45','#3a4160');ell(c,...PJ(x,y+.17,1.15),U*.08,U*.08,'#8fd0ff')},
 lights:(c,x,y)=>{lineW(c,x,y,0,x,y,1.6,'#555b70',3);box(c,M,x-.35,y-.1,.7,.2,.55,1.4,'#f6f6f6','#ffffff');ell(c,...PJ(x,y+.12,1.65),U*.4,U*.2,'rgba(255,250,210,.35)')},
 server:(c,x,y)=>{box(c,M,x-.4,y-.35,.8,.7,1.6,0,'#2a2f45','#3a4160');for(let k=0;k<5;k++){const p=PJ(x-.3+(k%2)*.3,y+.36,.25+k*.25);ell(c,p[0],p[1],2.5,2.5,k%3?'#35b56a':'#8fe6ff')}},
 phones:(c,x,y)=>{box(c,M,x-.7,y-.3,1.4,.6,.6,0,'#a8733f','#f3e6cf');box(c,M,x-.55,y-.15,.4,.3,.12,.6,'#2a2f45');box(c,M,x+.15,y-.15,.4,.3,.12,.6,'#ef476f')},
 mailbox:(c,x,y)=>{box(c,M,x-.3,y-.3,.6,.6,.9,0,'#d92d20','#ef5a4f');box(c,M,x-.2,y+.3,.4,.02,.06,.65,'#5a1510')},
 cabinet:(c,x,y)=>{box(c,M,x-.4,y-.3,.8,.6,1.4,0,'#8c96a8','#a9b2c2');for(let k=0;k<3;k++)lineW(c,x-.2,y+.3,.3+k*.4,x+.2,y+.3,.3+k*.4,'#5c6578',2)},
 cooler:(c,x,y)=>{box(c,M,x-.3,y-.3,.6,.6,.9,0,'#e9eef4');box(c,M,x-.2,y-.2,.4,.4,.55,.9,'#8fd0ff','#bfe6ff')},
 safe:(c,x,y)=>{box(c,M,x-.5,y-.45,1,.9,1.0,0,'#3a4152','#4a5266');const p=PJ(x,y+.45,.55);ell(c,p[0],p[1],U*.16,U*.16,'#c9a227');ell(c,p[0],p[1],U*.07,U*.07,'#3a4152')},
 ledgers:(c,x,y)=>{box(c,M,x-.7,y-.3,1.4,.6,1.3,0,'#7a4e2e','#946240');const cols=['#2f8a82','#d92d20','#2457d6','#c9a227','#35b56a'];for(let k=0;k<5;k++)box(c,M,x-.6+k*.24,y-.15,.18,.35,.42,.8,cols[k])},
 calc:(c,x,y)=>{box(c,M,x-.6,y-.4,1.2,.8,.6,0,'#a8733f','#f3e6cf');box(c,M,x-.3,y-.25,.6,.5,.1,.6,'#2a2f45','#3a4160');for(let i=0;i<3;i++)for(let k=0;k<3;k++){const p=PJ(x-.18+i*.18,y-.12+k*.15,.71);ell(c,p[0],p[1],2.2,1.4,'#e9eef4')}},
 houses:(c,x,y)=>{box(c,M,x-.8,y-.45,1.6,.9,.6,0,'#a8733f','#e9d8bb');[[-.5,'#ffffff','#d92d20'],[0,'#f4e3c3','#2457d6'],[.5,'#e6eef7','#35b56a']].forEach(([dx,wc,rc])=>{box(c,M,x+dx-.17,y-.17,.34,.34,.26,.6,wc);poly(c,[PJ(x+dx-.2,y+.17,.86),PJ(x+dx+.2,y+.17,.86),PJ(x+dx,y+.17,1.06)],rc);poly(c,[PJ(x+dx+.2,y-.17,.86),PJ(x+dx+.2,y+.17,.86),PJ(x+dx,y+.17,1.06),PJ(x+dx,y-.17,1.06)],shade(rc,.8))})},
 coffee:(c,x,y)=>{box(c,M,x-.9,y-.35,1.8,.7,.85,0,'#8a5a3a','#f6ead6');box(c,M,x-.7,y-.25,.5,.4,.5,.85,'#2c3348');const p=PJ(x-.45,y+.16,1.15);ell(c,p[0],p[1],3,3,'#ff6b6b');box(c,M,x+.1,y-.1,.15,.15,.15,.85,'#fff');box(c,M,x+.4,y-.1,.15,.15,.15,.85,'#ffd27a')},
 sofa:(c,x,y)=>{box(c,M,x-1.1,y-.2,2.2,.75,.42,0,'#e0607e');box(c,M,x-1.1,y-.4,2.2,.25,.9,0,'#c94c6b')},
 vending:(c,x,y)=>{box(c,M,x-.45,y-.4,.9,.8,1.7,0,'#d92d20','#ef5a4f');poly(c,[PJ(x-.35,y+.41,.5),PJ(x+.2,y+.41,.5),PJ(x+.2,y+.41,1.55),PJ(x-.35,y+.41,1.55)],'#bfe6ff')},
 shelf:(c,x,y)=>{box(c,M,x-.7,y-.25,1.4,.5,1.5,0,'#8a5a3a','#a06e48');const cols=['#4d8cf0','#ef476f','#35b56a','#f4c95d'];for(let k=0;k<6;k++)box(c,M,x-.6+(k%3)*.4,y-.1,.3,.3,.35,.2+Math.floor(k/3)*.6,cols[k%4])},
 stage:(c,x,y)=>{box(c,M,x-.9,y-.6,1.8,1.2,.25,0,'#2a2f45','#3a4160');lineW(c,x,y,.25,x,y,1.3,'#9aa0b4',2.5);const p=PJ(x,y,1.38);ell(c,p[0],p[1],U*.09,U*.12,'#1b1b1f');ell(c,...PJ(x,y,.27),U*.6,U*.3,'rgba(255,214,90,.35)')},
 hivis:(c,x,y)=>{poly(c,[PJ(x-.55,y+.25,0),PJ(x-.25,y+.25,0),PJ(x-.4,y+.25,.6)],'#ff7a1a');lineW(c,x-.52,y+.25,.2,x-.28,y+.25,.2,'#fff',3);poly(c,[PJ(x-.1,y-.3,0),PJ(x+.8,y-.3,0),PJ(x+.8,y+.3,0),PJ(x-.1,y+.3,0)],'#9aa0b4');poly(c,[PJ(x+.8,y-.3,0),PJ(x+.8,y+.3,0),PJ(x+.8,y+.3,.35),PJ(x+.8,y-.3,.35)],'#6c7184');poly(c,[PJ(x-.1,y+.3,0),PJ(x+.8,y+.3,0),PJ(x+.8,y+.3,.35)],'#7f8496')},
 pool:(c,x,y)=>{box(c,M,x-1.1,y-.65,2.2,1.3,.7,0,'#6b4a33','#2e8b57');poly(c,[PJ(x-.95,y-.5,.71),PJ(x+.95,y-.5,.71),PJ(x+.95,y+.5,.71),PJ(x-.95,y+.5,.71)],'#2f9e5f');[[-.4,0,'#ffffff'],[.2,-.15,'#d92d20'],[.35,.15,'#f4c95d'],[.5,0,'#2457d6']].forEach(([dx,dy,col])=>{const p=PJ(x+dx,y+dy,.74);ell(c,p[0],p[1],3.2,2.4,col)})},
 nook:(c,x,y)=>{box(c,M,x-.75,y-.55,1.5,.45,.38,0,'#5c7fd0','#7a9ae0');box(c,M,x-.75,y-.7,1.5,.18,.75,0,'#4a6bb8');box(c,M,x-.35,y+.15,.7,.45,.32,0,'#8a5a3a','#c9a273');box(c,M,x-.1,y+.28,.16,.16,.14,.32,'#fff')},
 cafe:(c,x,y)=>{const p=PJ(x,y,.72);ell(c,...PJ(x,y,.02),U*.3,U*.15,'rgba(0,0,0,.15)');lineW(c,x,y,0,x,y,.7,'#6b4a33',4);ell(c,p[0],p[1],U*.42,U*.21,'#f6ead6');ell(c,p[0]-U*.12,p[1]-1,U*.07,U*.05,'#ffffff');ell(c,p[0]+U*.12,p[1]+1,U*.07,U*.05,'#ffd27a')},
 armchair:(c,x,y)=>{box(c,M,x-.4,y-.4,.8,.8,.4,0,'#3e8f86','#59b3a8');box(c,M,x+.25,y-.4,.15,.8,.75,0,'#357a72')},
 lamp:(c,x,y)=>{lineW(c,x,y,0,x,y,1.35,'#4a4f63',2.5);poly(c,[PJ(x-.28,y,1.25),PJ(x+.28,y,1.25),PJ(x+.18,y,1.6),PJ(x-.18,y,1.6)],'#ffe8a3');ell(c,...PJ(x,y,0.02),U*.5,U*.25,'rgba(255,232,163,.35)')},
 bench:(c,x,y)=>{box(c,M,x-.9,y-.3,1.8,.6,.75,0,'#8a5a3a','#c9a273');box(c,M,x-.7,y-.15,.4,.2,.15,.75,'#d92d20');box(c,M,x+.1,y-.1,.6,.1,.08,.75,'#9aa0b4');lineW(c,x+.6,y-.3,.75,x+.6,y-.3,1.5,'#555b70',2)}};
function propsFor(d){if(d._props)return d._props;const s=sty(d),list=[...s.floorP];const txt=d.items.map(r=>r.dept+' '+r.session).join(' ');for(const e of EXTRA)if(e.re.test(txt))list.unshift(e.p);
 const out=[],n=Math.max(1,Math.floor((d.w-1.8)/2.6));if(d.lounge){for(let q=0;q<d.rowsN;q++)for(let cc=0;cc<d.cols;cc+=2)out.push({k:(q===Math.floor((d.rowsN-1)/2)&&cc===0)?'pool':(q+cc/2)%2?'nook':'cafe',x:d.x+T.PAD+(cc+1)*T.CX,y:d.y+T.BAND+T.PAD*.4+q*T.CY+T.CY/2});for(let yy=d.y+T.BAND+.5;yy<d.y+d.h-1;yy+=2.2)out.push({k:'plant',x:d.x+.5,y:yy});out.push({k:'armchair',x:d.x+d.w-.8,y:d.y+T.BAND+1.2},{k:'armchair',x:d.x+d.w-.8,y:d.y+T.BAND+3.2},{k:'plant',x:d.x+d.w-.6,y:d.y+d.h-.6})}(d.lounge?list.slice(0,n):[]).forEach((k,i)=>out.push({k,big:0,x:d.x+1.5+i*2.6+(d.w-1.8-n*2.6)/2,y:d.y+1.35}));
 out.push({k:'plant',x:d.x+.55,y:d.y+.55});if(!d.lounge){const rowsN=Math.ceil(d.items.length/d.cols);for(let q=0;q<rowsN;q++){const yy=d.y+T.BAND+T.PAD*.4+q*T.CY+T.CY*.92;void yy}out.push({k:'plant',x:d.x+d.w-.6,y:d.y+d.h-.6});const hero=[...list.filter(k=>PROP[k]&&k!=='plant')],side=[...hero,'plant','lamp','shelf','plant'];for(let k=0,yy=d.y+T.BAND+.9;yy<d.y+d.h-1.4&&k<side.length;k++,yy+=2.2)out.push({k:side[k],big:k<hero.length?1:0,x:d.x+d.w-.85,y:yy})}return d._props=out}
/* ---------- floors (drawn once into a picture) ---------- */
function floor(c,d){const s=sty(d),x=d.x,y=d.y,w=d.w,h=d.h,P=PJ;
 poly(c,[P(x,y),P(x+w,y),P(x+w,y+h),P(x,y+h)],s.f1);
 const strokeLines=(pts,col,lw)=>{c.strokeStyle=col;c.lineWidth=lw;c.beginPath();for(const[a,b]of pts){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}c.stroke()};
 if(s.floor==='planks'){const L=[];for(let j=.5;j<h;j+=.5)L.push([P(x,y+j),P(x+w,y+j)]);for(let j=0,k=0;j<h;j+=.5,k++)for(let i=(k%2?1.1:2.3);i<w;i+=2.6)L.push([P(x+i,y+j),P(x+i,y+Math.min(h,j+.5))]);strokeLines(L,'rgba(120,80,40,.2)',1.2)}
 else if(s.floor==='checker'||s.floor==='parquet'){for(let i=0;i<w;i++)for(let j=0;j<h;j++)if((i+j)%2){const ww=Math.min(1,w-i),hh=Math.min(1,h-j);poly(c,[P(x+i,y+j),P(x+i+ww,y+j),P(x+i+ww,y+j+hh),P(x+i,y+j+hh)],s.f2)}
  if(s.floor==='parquet'){const L=[];for(let i=0;i<w;i++)for(let j=0;j<h;j++){if((i+j)%2)for(let t=.33;t<1;t+=.33)L.push([P(x+i+t,y+j),P(x+i+t,y+Math.min(h,j+1))]);else for(let t=.33;t<1;t+=.33)L.push([P(x+i,y+j+t),P(x+Math.min(w,i+1),y+j+t)])}strokeLines(L,'rgba(120,80,40,.14)',1)}}
 else if(s.floor==='carpet'){const L=[];for(let j=.5;j<h;j+=.5)L.push([P(x,y+j),P(x+w,y+j)]);for(let i=.5;i<w;i+=.5)L.push([P(x+i,y),P(x+i,y+h)]);strokeLines(L,'rgba(60,80,140,.07)',1)}
 else if(s.floor==='tiles'){const L=[];for(let j=1.5;j<h;j+=1.5)L.push([P(x,y+j),P(x+w,y+j)]);for(let i=1.5;i<w;i+=1.5)L.push([P(x+i,y),P(x+i,y+h)]);strokeLines(L,'rgba(255,255,255,.75)',2)}
 else if(s.floor==='marble'){for(let i=0;i<w;i+=2)for(let j=0;j<h;j+=2)if((i/2+j/2)%2)poly(c,[P(x+i,y+j),P(x+Math.min(w,i+2),y+j),P(x+Math.min(w,i+2),y+Math.min(h,j+2)),P(x+i,y+Math.min(h,j+2))],shade(s.f1,.96));const L=[];for(let k=0;k<6;k++){const a=(k*37%10)/10,b=(k*53%10)/10;L.push([P(x+a*w,y+.3),P(x+b*w*.8+1,y+h-.3)])}strokeLines(L,'rgba(140,160,155,.35)',1.2)}
 else if(s.floor==='herring'){for(let j=0;j<h;j+=.5)for(let i=((j*2)%2)*.5;i<w;i+=1){const ww=Math.min(.95,w-i),hh=Math.min(.45,h-j);if(ww>0&&hh>0)poly(c,[P(x+i,y+j),P(x+i+ww,y+j),P(x+i+ww,y+j+hh),P(x+i,y+j+hh)],((i+j*2)|0)%2?s.f1:s.f2)}}
 if(d.lounge){for(let q=0;q<d.rowsN;q++)for(let cc=0;cc<d.cols;cc+=2){const cx=x+T.PAD+(cc+1)*T.CX,cy=y+T.BAND+T.PAD*.4+q*T.CY+T.CY/2;const p=P(cx,cy);const rc=['#ffd27a','#f7b2a4','#a8d8ea','#b8e6c4','#d7c4f2'][(q*3+cc/2)%5];ell(c,p[0],p[1],U*1.5,U*.75,rc);ell(c,p[0],p[1],U*1.2,U*.6,shade(rc,1.08))}}
 else{
 const rx0=x+T.PAD*.6,ry0=y+T.BAND-.1,rx1=x+w-T.PAD*.6,ry1=y+h-T.PAD*.4,cx=(rx0+rx1)/2,cy=(ry0+ry1)/2,pc=P(cx,cy),rw=(rx1-rx0)/2,rh=(ry1-ry0)/2;
 c.save();c.translate(pc[0],pc[1]);c.transform(U,U/2,-U,U/2,0,0);c.beginPath();c.ellipse(0,0,rw,rh,0,0,7);c.fillStyle=s.rug;c.fill();c.beginPath();c.ellipse(0,0,rw*.82,rh*.82,0,0,7);c.fillStyle=shade(s.rug,1.1);c.fill();c.lineWidth=.06;c.setLineDash([.18,.14]);c.strokeStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(0,0,rw*.91,rh*.91,0,0,7);c.stroke();c.setLineDash([]);c.restore();
 }
 // open front edge with a doormat by the walkway
 c.strokeStyle='rgba(60,45,30,.45)';c.lineWidth=2.5;c.beginPath();let a=P(x,y+h);c.moveTo(a[0],a[1]);a=P(x+w,y+h);c.lineTo(a[0],a[1]);a=P(x+w,y);c.lineTo(a[0],a[1]);c.stroke();
 const ax=x+T.PAD*.45;poly(c,[P(ax-.55,y+h-.1),P(ax+.55,y+h-.1),P(ax+.55,y+h+.55),P(ax-.55,y+h+.55)],'#6b4a33');
}
/* ---------- the outside world: roads, car park, shops, pond, park, train, hill ---------- */
const RND=k=>{const s=Math.sin(k*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function tree(c,x,y,s,k){const p=PJ(x,y,0);ell(c,p[0],p[1]+2,U*.5*s,U*.25*s,'rgba(40,70,30,.25)');c.fillStyle='#7a5434';c.fillRect(p[0]-3*s,p[1]-U*.9*s,6*s,U*.9*s);
 if(k===1){c.fillStyle='#3f7f4a';c.beginPath();c.moveTo(p[0],p[1]-U*2.3*s);c.lineTo(p[0]+U*.55*s,p[1]-U*.6*s);c.lineTo(p[0]-U*.55*s,p[1]-U*.6*s);c.closePath();c.fill();c.fillStyle='#5a9e5c';c.beginPath();c.moveTo(p[0],p[1]-U*2.3*s);c.lineTo(p[0]+U*.2*s,p[1]-U*.8*s);c.lineTo(p[0]-U*.55*s,p[1]-U*.6*s);c.closePath();c.fill()}
 else{const g=k===2?['#7fae4a','#9cc95f']:['#4f9a4f','#6cb865'];ell(c,p[0],p[1]-U*1.25*s,U*.62*s,U*.62*s,g[0]);ell(c,p[0]-U*.18*s,p[1]-U*1.45*s,U*.36*s,U*.36*s,g[1])}}
function lamp(c,x,y){const p=PJ(x,y,0);ell(c,p[0],p[1],5,2.5,'rgba(0,0,0,.2)');c.fillStyle='#3b3f4a';c.fillRect(p[0]-1.5,p[1]-U*1.6,3,U*1.6);ell(c,p[0],p[1]-U*1.65,6,4,'#fff3c4');ell(c,p[0],p[1]-U*1.65,3,2,'#ffd76a')}
function car(c,x,y,ax,col){if(ax==='x'){box(c,M,x-.65,y-.35,1.3,.7,.32,0,col,shade(col,1.15));box(c,M,x-.32,y-.3,.6,.6,.26,.32,'#bfe3f2','#e8f6fc')}else{box(c,M,x-.35,y-.65,.7,1.3,.32,0,col,shade(col,1.15));box(c,M,x-.3,y-.32,.6,.6,.26,.32,'#bfe3f2','#e8f6fc')}}
function bench(c,x,y){box(c,M,x-.5,y-.15,1,.3,.25,0,'#8a5a3a','#b07a52');box(c,M,x-.5,y-.2,1,.08,.5,0,'#8a5a3a','#b07a52')}
function flowers(c,x,y,w,h,k){poly(c,[PJ(x,y),PJ(x+w,y),PJ(x+w,y+h),PJ(x,y+h)],'#7a5a3e');const cols=['#ff7aa2','#ffd23f','#ffffff','#c77dff','#ff8c42'];for(let i=0;i<w*h*6;i++){const p=PJ(x+RND(k+i)*w,y+RND(k+i+50)*h,.05);ell(c,p[0],p[1],2.6,1.8,cols[(k+i)%5])}}
function building(c,x,y,w,d,h,col,k,shop){box(c,M,x,y,w,d,h,0,col,shade(col,.8));
 for(let zz=.6;zz<h-.4;zz+=1){for(let u=.4;u<w-.3;u+=.9){const a=PJ(x+u,y+d,zz),b=PJ(x+u+.5,y+d,zz),e=PJ(x+u+.5,y+d,zz+.55),f=PJ(x+u,y+d,zz+.55);if(shop&&zz<1)continue;poly(c,[a,b,e,f],RND(k+u*7+zz)>.3?'#cfe8f5':'#ffe9a8')}
  for(let u=.4;u<d-.3;u+=.9){const a=PJ(x+w,y+u,zz),b=PJ(x+w,y+u+.5,zz),e=PJ(x+w,y+u+.5,zz+.55),f=PJ(x+w,y+u,zz+.55);poly(c,[a,b,e,f],'#a9cde0')}}
 if(shop){const aw=['#e8574a','#2f8a82'][k%2];for(let u=0;u<w;u+=.5)poly(c,[PJ(x+u,y+d,1.25),PJ(x+u+.5,y+d,1.25),PJ(x+u+.5,y+d+.6,.95),PJ(x+u,y+d+.6,.95)],(u*2)%2?aw:'#fff');
  poly(c,[PJ(x+.3,y+d,.05),PJ(x+w-.3,y+d,.05),PJ(x+w-.3,y+d,.9),PJ(x+.3,y+d,.9)],'#cfe8f5');const s=PJ(x+w/2,y+d,1.7);c.save();c.translate(s[0],s[1]);c.transform(1,.5,0,1,0,0);c.fillStyle='#fff';c.font='800 13px Inter,sans-serif';c.textAlign='center';c.fillText(['CAFE','BAKERY','NEWS','FLOWERS'][k%4],0,0);c.restore()}}
function W3(S){const mw=S.mapW,mh=S.mapH,m=T.margin;
 const zones=[[-6,-6,mw+12,mh+12]];const add=(x,y,w,h)=>zones.push([x,y,w,h]);const free=(x,y)=>!zones.some(([a,b,w,h])=>x>a-.6&&x<a+w+.6&&y>b-.6&&y<b+h+.6)&&x>-m+.5&&y>-m+.5&&x<mw+m-.5&&y<mh+m-.5;
 const Z={park:[2,mh+7,Math.max(14,mw*.55),9],pond:[-17,2,9,9],car:[mw+7,2,9,12],shops:[0,-12,mw,5],houses:[-13,mh*.5,5,mh*.5],rail:[mw*.6,mh+13.5,mw*.4+m,1.6],hill:[-m,-m,11,11],pitch:[-17,mh+3,12,9],houses2:[mw+7,17,4,Math.max(8,mh-14)]};
 Object.values(Z).forEach(z=>add(...z));return{mw,mh,m,Z,free}}
function buildOuter(S){const W=W3(S),{mw,mh,m,Z}=W;const pts=[PJ(-m,-m),PJ(mw+m,-m),PJ(-m,mh+m),PJ(mw+m,mh+m)],x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1]))-120,y1=Math.max(...pts.map(p=>p[1]))+40;
 const cs=Math.min(.9,4600/(x1-x0),4600/(y1-y0)),cv=document.createElement('canvas');cv.width=Math.ceil((x1-x0)*cs);cv.height=Math.ceil((y1-y0)*cs);const c=cv.getContext('2d');c.setTransform(cs,0,0,cs,-x0*cs,-y0*cs);
 const R=(x,y,w,h,col)=>poly(c,[PJ(x,y),PJ(x+w,y),PJ(x+w,y+h),PJ(x,y+h)],col);
 R(-m,-m,mw+2*m,mh+2*m,'#9fc987');for(let k=0;k<700;k++){const x=-m+RND(k)*(mw+2*m),y=-m+RND(k+999)*(mh+2*m),p=PJ(x,y);ell(c,p[0],p[1],U*.3,U*.15,k%3?'#8cbb73':'#b2d69a')}
 // hill in the far corner
 {const[hx,hy]=[Z.hill[0]+5.5,Z.hill[1]+5.5],p=PJ(hx,hy);ell(c,p[0],p[1]-U*.6,U*6,U*3.2,'#86b86a');ell(c,p[0]-U*1.2,p[1]-U*1.2,U*4,U*2.2,'#97c77a');ell(c,p[0]-U*1.8,p[1]-U*1.6,U*1.6,U*.8,'#a9d38c')}
 // ring road with pavements and markings
 const ring=(o,col)=>R(-o,-o,mw+2*o,mh+2*o,col);ring(5.8,'#d8d2c6');ring(4.8,'#5d6168');ring(2.4,'#d8d2c6');ring(1.5,'#a6cf8e');
 c.strokeStyle='#f4f1e8';c.lineWidth=2.5;c.setLineDash([14,12]);c.beginPath();[[-3.6,-3.6],[mw+3.6,-3.6],[mw+3.6,mh+3.6],[-3.6,mh+3.6],[-3.6,-3.6]].forEach(([a,b],i)=>{const p=PJ(a,b);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.stroke();c.setLineDash([]);
 // zebra crossing to the front door
 for(let i=0;i<6;i++)R(mw*.3+i*.4,mh+2.5,.22,2.2,'#f4f1e8');
 // hedges and flower beds round the office
 for(let x=1;x<mw-2;x+=7)flowers(c,x,mh+.4,2.2,.7,x|0);for(let y=1;y<mh-2;y+=7)flowers(c,mw+.4,y,.7,2.2,(y|0)+40);
 // car park
 {const[a,b,w,h]=Z.car;R(mw+5.8,b+5,1.2,2.2,'#5d6168');R(a,b,w,h,'#6a6e75');c.strokeStyle='#f4f1e8';c.lineWidth=2;for(let j=b+1.5;j<b+h-.5;j+=1.4){c.beginPath();let p=PJ(a+.3,j),q=PJ(a+3,j);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);p=PJ(a+w-3,j);q=PJ(a+w-.3,j);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}
  const cols=['#e8574a','#2457d6','#f4c95d','#ffffff','#2e2e38','#3f9a7c','#c77dff'];let k=0;for(let j=b+2.2;j<b+h-.6;j+=1.4){if(RND(j)>.25)car(c,a+1.6,j,'x',cols[k++%7]);if(RND(j+3)>.4)car(c,a+w-1.6,j,'x',cols[k++%7])}
  const s=PJ(a+w/2,b+.4,.05);c.save();c.translate(s[0],s[1]);c.fillStyle='#2457d6';c.fillRect(-14,-30,28,28);c.fillStyle='#fff';c.font='800 20px Inter,sans-serif';c.textAlign='center';c.fillText('P',0,-9);c.restore()}
 // pond with a footbridge
 {const[a,b,w,h]=Z.pond,p=PJ(a+w/2,b+h/2);ell(c,p[0],p[1],U*5.6,U*2.9,'#c9b48a');ell(c,p[0],p[1],U*5.2,U*2.6,'#6fb8dc');ell(c,p[0]-U*1.3,p[1]-U*.6,U*2,U*.7,'#9fd3ec');
  for(let i=0;i<5;i++){const q=PJ(a+1.5+RND(i+70)*6,b+1.5+RND(i+80)*6);ell(c,q[0],q[1],7,3.5,'#5c9e4a')}
  box(c,M,a+w/2-.6,b-.3,1.2,h+.6,.25,.15,'#9a6b4f','#c7966f');c.strokeStyle='#6b4a33';c.lineWidth=2;for(const dx of[-.6,.6]){c.beginPath();const q1=PJ(a+w/2+dx,b-.3,.8),q2=PJ(a+w/2+dx,b+h+.3,.8);c.moveTo(q1[0],q1[1]);c.lineTo(q2[0],q2[1]);c.stroke()}}
 // park: paths, fountain, benches, flower beds, fence
 {const[a,b,w,h]=Z.park;R(a,b,w,h,'#b3db97');c.strokeStyle='#e6dcc5';c.lineWidth=U*.7;c.lineCap='round';c.beginPath();let p=PJ(a,b+h/2),q=PJ(a+w,b+h/2);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);p=PJ(a+w/2,b);q=PJ(a+w/2,b+h);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();
  const f=PJ(a+w/2,b+h/2);ell(c,f[0],f[1],U*1.9,U*.95,'#e6dcc5');ell(c,f[0],f[1],U*1.4,U*.7,'#b9b0a0');ell(c,f[0],f[1]-3,U*1.2,U*.58,'#7cc4e4');
  flowers(c,a+1,b+1,2.5,1.5,7);flowers(c,a+w-3.5,b+1,2.5,1.5,9);flowers(c,a+1,b+h-2.5,2.5,1.5,11);flowers(c,a+w-3.5,b+h-2.5,2.5,1.5,13);
  bench(c,a+w/2-2.5,b+h/2-1);bench(c,a+w/2+2.5,b+h/2-1);bench(c,a+w/4,b+h/2+1);
  c.strokeStyle='#8a6a4a';c.lineWidth=2;const fence=[[a,b],[a+w,b],[a+w,b+h],[a,b+h],[a,b]];for(const zz of[.25,.55]){c.beginPath();fence.forEach(([x,y],i)=>{const r=PJ(x,y,zz);i?c.lineTo(r[0],r[1]):c.moveTo(r[0],r[1])});c.stroke()}
  for(let i=0;i<4;i++)for(let u=0;u<1;u+=.06){const[x,y]=[fence[i][0]+(fence[i+1][0]-fence[i][0])*u,fence[i][1]+(fence[i+1][1]-fence[i][1])*u];if(Math.abs(x-(a+w/2))<1&&(i===0||i===2))continue;const r0=PJ(x,y,0),r1=PJ(x,y,.65);c.beginPath();c.moveTo(r0[0],r0[1]);c.lineTo(r1[0],r1[1]);c.stroke()}}
 {const[a,b,w,h]=Z.pitch;R(a,b,w,h,'#7fbf5f');for(let i=0;i<w;i+=2)R(a+i,b,1,h,'#8cc96c');c.strokeStyle='#fff';c.lineWidth=2;const L=(p)=>{c.beginPath();p.forEach(([x,y],i)=>{const q=PJ(x,y);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.stroke()};L([[a+.5,b+.5],[a+w-.5,b+.5],[a+w-.5,b+h-.5],[a+.5,b+h-.5],[a+.5,b+.5]]);L([[a+w/2,b+.5],[a+w/2,b+h-.5]]);const o=PJ(a+w/2,b+h/2);c.beginPath();c.ellipse(o[0],o[1],U*1.4,U*.7,0,0,7);c.stroke();for(const gx of[a+.5,a+w-.5])box(c,M,gx-.1,b+h/2-1,.2,2,.6,0,'#ffffff','#ffffff')}
 // rail line in the far corner
 {const[a,b,w]=Z.rail;R(a,b,w,1.6,'#b8a68a');c.strokeStyle='#6b4a33';c.lineWidth=3;for(let x=a;x<a+w;x+=.5){const p=PJ(x,b+.2),q=PJ(x,b+1.4);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}c.strokeStyle='#5d6168';c.lineWidth=2.5;for(const yy of[b+.5,b+1.1]){const p=PJ(a,yy),q=PJ(a+w,yy);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}}
 // static 3D bits in depth order: buildings, houses, trees, lamps
 const st=[];const[sa,sb]=Z.shops;let k=0;for(let x=sa;x<sa+Z.shops[2]-3;x+=5.5,k++){const h=k%3===1?1.8:2.2+RND(k)*2.6,col=['#e7d3b0','#c9d6e3','#f0c7a8','#d9e2c4','#e3c0c8'][k%5],kk=k;st.push({d:x+sb,f:()=>building(c,x,sb,4.4,3.4,h,col,kk,kk%3===1)})}
 const[ha,hb,,hh]=Z.houses;for(let y=hb+1,j=0;y<hb+hh-2;y+=4.5,j++){const col=['#f2e3c6','#dfe9f2','#f5d6c6'][j%3];st.push({d:ha+y,f:()=>{building(c,ha,y,3.4,3.2,1.6,col,j+20,false);const r=['#b5523b','#6b5a8e','#3f7f6a'][j%3];poly(c,[PJ(ha,y,1.6),PJ(ha+3.4,y,1.6),PJ(ha+3.4,y+1.6,2.6),PJ(ha,y+1.6,2.6)],shade(r,1.1));poly(c,[PJ(ha,y+1.6,2.6),PJ(ha+3.4,y+1.6,2.6),PJ(ha+3.4,y+3.2,1.6),PJ(ha,y+3.2,1.6)],r)}})}
 {const[ha2,hb2,,hh2]=Z.houses2;for(let y=hb2+.5,j=0;y<hb2+hh2-2;y+=4.2,j++){const col=['#dfe9f2','#f5d6c6','#f2e3c6'][j%3],r=['#3f7f6a','#b5523b','#6b5a8e'][j%3];st.push({d:ha2+y,f:()=>{building(c,ha2,y,3.4,3.2,1.6,col,j+40,false);poly(c,[PJ(ha2,y,1.6),PJ(ha2+3.4,y,1.6),PJ(ha2+3.4,y+1.6,2.6),PJ(ha2,y+1.6,2.6)],shade(r,1.1));poly(c,[PJ(ha2,y+1.6,2.6),PJ(ha2+3.4,y+1.6,2.6),PJ(ha2+3.4,y+3.2,1.6),PJ(ha2,y+3.2,1.6)],r)}})}}
 for(let i=0;i<900;i++){const x=-m+1+RND(i+300)*(mw+2*m-2),y=-m+1+RND(i+600)*(mh+2*m-2);if(!W.free(x,y))continue;const s=.7+RND(i+900)*.8,kk=RND(i+1200)<.3?1:RND(i+1500)<.3?2:0;st.push({d:x+y,f:()=>tree(c,x,y,s,kk)})}
 for(let x=1;x<mw;x+=5){st.push({d:x+mh+2.1,f:()=>lamp(c,x,mh+2.1)});st.push({d:x-2.1,f:()=>lamp(c,x,-2.1)})}for(let y=1;y<mh;y+=5){st.push({d:mw+2.1+y,f:()=>lamp(c,mw+2.1,y)});st.push({d:y-2.1,f:()=>lamp(c,-2.1,y)})}
 st.sort((p,q)=>p.d-q.d).forEach(s=>s.f());return{cv,x0,y0,cs,W}}
let outer=null;
function lifeItems(S,items,vx){const O=outer.W,{mw,mh,Z}=O,t=S.reduce?0:S.t,o=3.6,per=2*(mw+mh+4*o);
 const ringPos=s=>{s=((s%per)+per)%per;const W=mw+2*o,H=mh+2*o;if(s<W)return[-o+s,-o,'x'];s-=W;if(s<H)return[mw+o,-o+s,'y'];s-=H;if(s<W)return[mw+o-s,mh+o,'x'];s-=W;return[-o,mh+o-s,'y']};
 [['#e8574a',0,.55],['#2457d6',per*.37,-.6],['#f4c95d',per*.7,.75]].forEach(([col,s0,dir],i)=>{const[x,y,ax]=ringPos(s0+t*2.4*dir*1.6),off=dir>0?-.45:.45,X=ax==='x'?x:x+off,Y=ax==='x'?y+off:y;if(vx(X,Y))items.push({d:X+Y,f:()=>car(S.c,X,Y,ax,col)})});
 // train shuttles along the rail
 {const[a,b,w]=Z.rail,u=(Math.sin(t*.12)+1)/2,x=a+1+u*(w-6);if(vx(x,b+.8))items.push({d:x+b+.8,f:()=>{const c=S.c;for(let j=0;j<3;j++)box(c,M,x+j*1.6,b+.35,1.4,.9,.75,.1,j?'#3f9a7c':'#d92d20',j?'#5fbf9c':'#f06a5a')}})}
 // dog walker on the park path
 {const[a,b,w,h]=Z.park,u=(t*.05)%2,x=a+.8+(u<1?u:2-u)*(w-1.6),y=b+h/2+.15;if(vx(x,y)){items.push({d:x+y+1,f:()=>{const[px,py]=PJ(x,y);person(S.c,px,py,M.s,lookFor({id:'walker'}),{t,ph:2,mode:'work',seated:false,walk:!S.reduce,step:t*7});const[dx,dy]=PJ(x+.9,y+.2);ell(S.c,dx,dy-9,12,7,'#8a5a3a');ell(S.c,dx+11,dy-15,6,5,'#8a5a3a');ell(S.c,dx-11,dy-12,4,2,'#8a5a3a')}})}}
 // fountain spray
 {const[a,b,w,h]=Z.park,x=a+w/2,y=b+h/2;if(vx(x,y))items.push({d:x+y,f:()=>{const p=PJ(x,y,0),c=S.c,k=S.reduce?0:Math.sin(t*4)*3;c.fillStyle='rgba(200,235,250,.85)';c.beginPath();c.ellipse(p[0],p[1]-U*.75+k*.3,5,U*.55+k,0,0,7);c.fill();ell(c,p[0],p[1]-U*1.3,10,4,'rgba(220,242,252,.9)')}})}
 // birds
 if(!S.reduce)for(let i=0;i<3;i++){const x=-12+((t*1.3+i*17)%(mw+30)),y=-8+i*6+Math.sin(t+i)*.6;items.push({d:9999,f:()=>{const p=PJ(x,y,6+i),c=S.c,f=Math.sin(t*8+i)*3;c.strokeStyle='#3b3f4a';c.lineWidth=1.6;c.beginPath();c.moveTo(p[0]-6,p[1]-f);c.lineTo(p[0],p[1]);c.lineTo(p[0]+6,p[1]-f);c.stroke()}})}}

let cache=null,cacheKey='';
function buildCache(S){const mw=S.mapW,mh=S.mapH,pts=[PJ(-1,-1),PJ(mw+1,-1),PJ(-1,mh+1),PJ(mw+1,mh+1)],x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1]))-10,y1=Math.max(...pts.map(p=>p[1]))+30;
 const cs=Math.min(1.2,4200/(x1-x0),4200/(y1-y0));const cv=cache&&cache.cv||document.createElement('canvas');cv.width=Math.ceil((x1-x0)*cs);cv.height=Math.ceil((y1-y0)*cs);const c=cv.getContext('2d');c.setTransform(cs,0,0,cs,-x0*cs,-y0*cs);
 poly(c,[PJ(0,mh),PJ(mw,mh),PJ(mw,mh,-.5),PJ(0,mh,-.5)],'#5c5448');poly(c,[PJ(mw,0),PJ(mw,mh),PJ(mw,mh,-.5),PJ(mw,0,-.5)],'#4a4339');
 poly(c,[PJ(0,mh),PJ(mw,mh),PJ(mw,mh,-.5),PJ(0,mh,-.5)],'#7a6a55');poly(c,[PJ(mw,0),PJ(mw,mh),PJ(mw,mh,-.5),PJ(mw,0,-.5)],'#6a5c49');
 poly(c,[PJ(0,0),PJ(mw,0),PJ(mw,mh),PJ(0,mh)],'#cdbfa6');
 for(const d of S.dists)poly(c,[PJ(d.x-.7,d.y-.7),PJ(d.x+d.w+.7,d.y-.7),PJ(d.x+d.w+.7,d.y+d.h+.7),PJ(d.x-.7,d.y+d.h+.7)],'#ddd5c4');
 c.strokeStyle='rgba(236,229,214,.9)';c.lineWidth=U*1.1;c.lineCap='round';c.beginPath();const st=S.street,seg=(a,b,e,f)=>{const p=PJ(a,b),q=PJ(e,f);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1])};
 seg(st*.4,st*.4,st*.4,mh-st*.4);const rowsY=[...new Set(S.dists.map(d=>d.rowStreet))];rowsY.forEach(y=>seg(st*.4,y,mw-st*.4,y));seg(st*.4,st*.4,mw-st*.4,st*.4);c.stroke();c.setLineDash([]);
 for(const d of S.dists)floor(c,d);
 cache={cv,x0,y0,cs}}
/* ---------- walls: one-tile pieces so people walking behind are hidden properly ---------- */
function wallPiece(c,d,axis,i){const s=sty(d),col=s.wall,dec=decorFor(d);
 if(axis==='b'){const x0=d.x+i,x1=Math.min(d.x+d.w,x0+1),y=d.y;box(c,M,x0,y-.22,x1-x0,.22,WH,0,col,shade(col,1.3));
  poly(c,[PJ(x0,y),PJ(x1,y),PJ(x1,y,.55),PJ(x0,y,.55)],shade(col,.7));poly(c,[PJ(x0,y),PJ(x1,y),PJ(x1,y,.1),PJ(x0,y,.1)],'#fffaf0');
  const W=(u,z)=>PJ(u,y,z),hit=dec.back.filter(q=>q.b>x0&&q.a<x1);if(hit.length){c.save();c.beginPath();[PJ(x0,y,0),PJ(x1,y,0),PJ(x1,y,WH),PJ(x0,y,WH)].forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();for(const q of hit)DEC[q.k](c,W,q.a,q.b,q.z0,q.z1,d);c.restore()}}
 else{const y0=d.y+i,y1=Math.min(d.y+d.h,y0+1),x=d.x;box(c,M,x-.22,y0,.22,y1-y0,WH,0,col,shade(col,1.2));
  poly(c,[PJ(x,y0),PJ(x,y1),PJ(x,y1,.55),PJ(x,y0,.55)],shade(col,.62));poly(c,[PJ(x,y0),PJ(x,y1),PJ(x,y1,.1),PJ(x,y0,.1)],'#f4efe6');
  const W=(u,z)=>PJ(x,u,z),hit=dec.left.filter(q=>q.b>y0&&q.a<y1);if(hit.length){c.save();c.beginPath();[PJ(x,y0,0),PJ(x,y1,0),PJ(x,y1,WH),PJ(x,y0,WH)].forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();for(const q of hit)DEC[q.k](c,W,q.a,q.b,q.z0,q.z1,d);c.restore()}}}
T.world=(c,S)=>{const t=S.t,z=S.z,key=S.dists.map(d=>d.k+d.x.toFixed(1)+','+d.y.toFixed(1)).join('|')+S.mapW.toFixed(1);
 if(key!==cacheKey){T._trees=null;S.dists.forEach(d=>{d._dec=null;d._props=null});buildCache(S);outer=buildOuter(S);cacheKey=key}
 c.drawImage(outer.cv,outer.x0,outer.y0,outer.cv.width/outer.cs,outer.cv.height/outer.cs);
 c.drawImage(cache.cv,cache.x0,cache.y0,cache.cv.width/cache.cs,cache.cv.height/cache.cs);
 const vis=d=>{const pts=[PJ(d.x,d.y,WH+1),PJ(d.x+d.w,d.y,WH+1),PJ(d.x,d.y+d.h),PJ(d.x+d.w,d.y+d.h)].map(p=>[S.cam.px+z*p[0],S.cam.py+z*p[1]]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return Math.max(...xs)>-60&&Math.min(...xs)<S.CW+60&&Math.max(...ys)>-60&&Math.min(...ys)<S.CH+60};
 const items=[];
 for(const d of S.dists){if(!vis(d))continue;
  items.push({d:d.x+d.y-.6,f:()=>box(c,M,d.x-.22,d.y-.22,.22,.22,WH,0,sty(d).wall,shade(sty(d).wall,1.3))});
  for(let i=0;i<Math.ceil(d.w);i++)items.push({d:d.x+i+.5+d.y-.3,f:()=>wallPiece(c,d,'b',i)});
  for(let j=0;j<Math.ceil(d.h);j++)items.push({d:d.x+d.y+j+.5-.3,f:()=>wallPiece(c,d,'l',j)});
  for(const p of propsFor(d))items.push({d:p.x+p.y,f:()=>{if(p.big){const q=PJ(p.x,p.y,0);c.save();c.translate(q[0],q[1]);c.scale(1.7,1.7);c.translate(-q[0],-q[1]);PROP[p.k](c,p.x,p.y);c.restore()}else PROP[p.k](c,p.x,p.y)}});
  for(const r of d.items){const m=S.modeOf(r.status),home=!r._walk&&Math.hypot(r._px-r._x,r._py-r._y)<.3,st=home?(m==='work'?'work':m==='alert'?'alert':m==='nap'?'nap':'away'):'away';
   items.push({d:r._x+r._y+.75,f:()=>desk(c,M,{x:r._x,y:r._y,skin:lookFor({id:r.id}).skin},st,t,(hash(r.id)%100)/10)})}}
 const vx=(x,y)=>{const p=PJ(x,y);const sx=S.cam.px+z*p[0],sy=S.cam.py+z*p[1];return sx>-80&&sx<S.CW+80&&sy>-120&&sy<S.CH+160};
 for(const r of S.rows){if(!vx(r._px,r._py))continue;const m=S.modeOf(r.status),home=!r._walk&&Math.hypot(r._px-r._x,r._py-r._y)<.3,L=lookFor({id:r.id}),ph=(hash(r.id)%100)/10;
  items.push({d:r._px+r._py+1.1,f:()=>{const[px,py]=PJ(r._px,r._py);person(c,px,py,M.s,L,{t,ph,mode:m,seated:home&&m!=='rest',walk:r._walk&&!reduce,step:t*9+ph})}})}
 S.c=c;lifeItems(S,items,vx);
 if(false){T._trees=[];const mw=S.mapW,mh=S.mapH;for(let x=1;x<mw;x+=3.2){T._trees.push([x,-1.6],[x+1.6,mh+1.6])}for(let y=1;y<mh;y+=3.2){T._trees.push([-1.6,y],[mw+1.6,y+1.6])}}
 for(const[x,y]of (T._trees||[]))if(vx(x,y))items.push({d:x+y,f:()=>{const p=PJ(x,y,0);ell(c,p[0],p[1]+2,U*.5,U*.25,'rgba(40,70,30,.25)');c.fillStyle='#7a5434';c.fillRect(p[0]-3,p[1]-U*.9,6,U*.9);ell(c,p[0],p[1]-U*1.25,U*.62,U*.62,'#4f9a4f');ell(c,p[0]-U*.18,p[1]-U*1.45,U*.36,U*.36,'#6cb865')}});
 const A=S.ada,AL=lookFor({id:'manager'});if(vx(A._x,A._y))items.push({d:A._x+A._y+.5,f:()=>{const[px,py]=PJ(A._x,A._y);person(c,px,py,M.s,AL,{t,ph:0,mode:'work',seated:false,walk:!reduce&&!!A._walk,step:t*8})}});
 items.sort((a,b)=>a.d-b.d);for(const it of items)it.f();
};
return T})();
