import {initialState, transition, scenarios, evidenceFor} from './incident.mjs';
import {resolveCommand, commandNames} from './terminal.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x);};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false, light=false, inScene=true, targetProgress=0, progress=0, frame=null, lastTime=0, clock=0;
const voyage=$('.voyage'),stage=$('.stage'),canvas=$('#system-scene'),ctx=canvas.getContext('2d');
const copies=$$('.scene-copy'),chapterButtons=$$('[data-chapter]');
let width=0,height=0,dpr=1;
try{light=localStorage.getItem('portfolio-theme')==='light';}catch{}
function theme(){
 document.documentElement.dataset.theme=light?'light':'dark';
 $('#theme-toggle').setAttribute('aria-label',light?'Switch to night mode':'Switch to day mode');
 $('#theme-toggle').textContent=light?'☾':'☼';
 $('meta[name="theme-color"]').content=light?'#eaf0f6':'#080b10';
 requestDraw();
}
$('#theme-toggle').addEventListener('click',()=>{light=!light;try{localStorage.setItem('portfolio-theme',light?'light':'dark');}catch{}theme();});
const isStatic=()=>reduced.matches||paused;
function setMotion(){
 voyage.classList.toggle('static-journey',isStatic());
 $('.project-section').classList.toggle('static-projects',isStatic());
 copies.forEach((el,i)=>{if(isStatic()){el.inert=false;el.style.visibility='visible';el.setAttribute('aria-hidden','false');}else updateCopy(i,progress);});
 $('#motion-toggle').disabled=reduced.matches;
 $('#motion-toggle').textContent=reduced.matches?'Motion reduced':paused?'Resume motion':'Pause motion';
 document.body.classList.toggle('motion-paused',paused||reduced.matches);
 updateScroll();resize();requestDraw();
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;$('#motion-toggle').setAttribute('aria-pressed',String(paused));setMotion();});
reduced.addEventListener('change',setMotion);
document.body.classList.add('js-motion');

// A deterministic, projected architecture model. Scroll changes the camera and layer spacing.
// Canvas stays decorative; every story beat and control is real, accessible HTML.
function projection(x,y,z,pose){
 const cy=Math.cos(pose.yaw),sy=Math.sin(pose.yaw),cx=Math.cos(pose.pitch),sx=Math.sin(pose.pitch);
 const rx=x*cy-z*sy,rz=x*sy+z*cy,ry=y*cx-rz*sx,depth=y*sx+rz*cx;
 const perspective=900/(900+depth);
 return [pose.x+rx*pose.scale*perspective,pose.y+ry*pose.scale*perspective,depth];
}
function drawScene(){
 if(!ctx)return;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 const mobile=width<=700,p=reduced.matches?.18:progress;
 const expand=smooth(.15,.55,p),intelligence=smooth(.65,1,p);
 const pose={x:width*(mobile?.59:.735),y:height*(mobile?.72:.52),scale:Math.min(width/(mobile?650:1120),height/720)*(mobile?1.02:1.10),yaw:.58+p*.65+(paused||reduced.matches?0:Math.sin(clock*.12)*.035),pitch:.62+expand*.10-intelligence*.19};
 const blue=light?'55,104,158':'154,194,246',text=light?'#46627f':'#adc6e8';
 const bg=light?'#eaf0f6':'#080b10';
 const glow=ctx.createRadialGradient(pose.x,pose.y,0,pose.x,pose.y,width*.42);
 glow.addColorStop(0,light?'rgba(125,169,220,.13)':'rgba(40,87,148,.18)');glow.addColorStop(1,'rgba(20,40,70,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 const project=(v)=>projection(...v,pose);
 function line(points,color,lineWidth=1){ctx.beginPath();points.forEach((v,i)=>{const q=project(v);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();}
 function poly(points,fill,stroke){ctx.beginPath();points.forEach((v,i)=>{const q=project(v);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke();}}
 // Foundation grid disappears at its edges rather than competing with the content.
 for(let n=-5;n<=5;n++){
  const alpha=.04+(1-Math.abs(n)/6)*.045;
  line([[-320,205,n*60],[320,205,n*60]],`rgba(${blue},${alpha})`,.7);
  line([[n*60,205,-320],[n*60,205,320]],`rgba(${blue},${alpha})`,.7);
 }
 const layers=[0,1,2,3].map(i=>({y:(i-1.5)*(30+expand*67),i}));
 const slabs=layers.map(({y,i})=>({x:(i%2?1:-1)*expand*12,y,z:0,w:112-intelligence*i*8,d:100-intelligence*i*6,h:13,i}));
 // A central spine and four dependency trunks keep exploded layers visually connected.
 for(const [x,z] of [[-70,-65],[70,-65],[-70,65],[70,65]])line([[x,layers[0].y,z],[x,layers[3].y,z]],`rgba(${blue},.23)`);
 slabs.sort((a,b)=>project([a.x,a.y,a.z])[2]-project([b.x,b.y,b.z])[2]).reverse();
 for(const slab of slabs){
  const{x,y,z,w,d,h,i}=slab;
  const a=[x-w,y,z-d],b=[x+w,y,z-d],c=[x+w,y,z+d],e=[x-w,y,z+d];
  const down=v=>[v[0],v[1]+h,v[2]];
  poly([b,c,down(c),down(b)],light?'#ccd9e9':'#101e32',`rgba(${blue},.45)`);
  poly([c,e,down(e),down(c)],light?'#d8e3ef':'#0c1728',`rgba(${blue},.4)`);
  poly([a,b,c,e],light?'rgba(209,224,242,.91)':'rgba(15,31,52,.93)',`rgba(${blue},.8)`);
  line([a,b],`rgba(${blue},.95)`,1.2);
  // The surface is a miniature circuit rather than a decorative solid block.
  for(const k of [-.55,0,.55]){
   line([[x-w*.78,y-1,z+d*k],[x+w*.78,y-1,z+d*k]],`rgba(${blue},.14)`,.6);
   line([[x+w*k,y-1,z-d*.78],[x+w*k,y-1,z+d*.78]],`rgba(${blue},.14)`,.6);
  }
  const size=i===1?26:17;
  const positions=i===1?[[0,0]]:[[-44,-35],[44,35],[-44,35],[44,-35]];
  for(const [dx,dz]of positions){
   const X=x+dx,Z=z+dz,Y=y-3;
   poly([[X-size,Y,Z-size],[X+size,Y,Z-size],[X+size,Y,Z+size],[X-size,Y,Z+size]],light?'#b9d0eb':'#182d49',`rgba(${blue},.8)`);
   poly([[X-size*.65,Y-2,Z-size*.65],[X+size*.65,Y-2,Z-size*.65],[X+size*.65,Y-2,Z+size*.65],[X-size*.65,Y-2,Z+size*.65]],light?'#95b8df':'#233f64',`rgba(${blue},.45)`);
   const q=project([X,Y-4,Z]);ctx.beginPath();ctx.arc(q[0],q[1],i===1?3:1.6,0,Math.PI*2);ctx.fillStyle=light?'#426fa3':'#d7e8ff';ctx.shadowColor='#7cb8ff';ctx.shadowBlur=i===1?18:6;ctx.fill();ctx.shadowBlur=0;
  }

 }
 // Label overlays are painted last so another layer never hides their text.
 if(!mobile&&expand>.2){
  const labelx=Math.min(width-180,pose.x+100);
  ctx.globalAlpha=expand;
  for(const {y,i} of layers){
   const q=project([80,y,0]);
   const ly=pose.y+(i-1.5)*76;
   ctx.strokeStyle=`rgba(${blue},.35)`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(labelx-14,ly);ctx.lineTo(labelx-4,ly);ctx.stroke();
   ctx.fillStyle=bg;ctx.fillRect(labelx-2,ly-9,166,18);
   ctx.font='8px "IBM Plex Mono", monospace';ctx.fillStyle=text;
   ctx.fillText(['SIGNALS','AI OPERATIONS','PLATFORM','CLOUD FOUNDATION'][i],labelx+3,ly+3);
  }
  ctx.globalAlpha=1;
 }
 // Traffic travels between layers. The scroll pose is still available while ambient motion is paused.
 for(let i=0;i<12;i++){
  const t=((paused||reduced.matches?.37:clock*.12)+i/12)%1;
  const x=i%2?70:-70,z=i%3?-65:65,y=mix(layers[0].y,layers[3].y,t);
  const q=project([x,y,z]);ctx.beginPath();ctx.arc(q[0],q[1],1.4,0,Math.PI*2);ctx.fillStyle=`rgba(${blue},.85)`;ctx.fill();
 }
 if(intelligence>.01){
  const radius=175+intelligence*18;
  const ring=Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2;return[Math.cos(a)*radius,10,Math.sin(a)*radius];});
  line(ring,`rgba(${blue},${intelligence*.5})`,1);
  const q=project([Math.cos(-clock*.15)*radius,10,Math.sin(-clock*.15)*radius]);ctx.globalAlpha=intelligence;ctx.beginPath();ctx.arc(q[0],q[1],4,0,Math.PI*2);ctx.fillStyle=light?'#315c91':'#e7f2ff';ctx.fill();ctx.globalAlpha=1;
  const badge=project([0,-210,0]);ctx.font='9px "IBM Plex Mono", monospace';ctx.textAlign='center';ctx.fillStyle=text;ctx.globalAlpha=intelligence;ctx.fillText('HUMAN OVERSIGHT / ALWAYS',badge[0],badge[1]);ctx.textAlign='left';ctx.globalAlpha=1;
 }
 // Decorative horizon annotation provides a sense of scale.
 ctx.font='8px "IBM Plex Mono", monospace';ctx.fillStyle=light?'#6a809a':'#526c8d';
 if(!mobile)ctx.fillText('FIG. 01 / INTERDEPENDENCE',width*.59,height*.86);
}
function updateCopy(i,p){
 const center=[0,.49,.96][i];let opacity;
 if(i===0)opacity=1-smooth(.15,.31,p);
 else if(i===1)opacity=smooth(.24,.38,p)*(1-smooth(.60,.73,p));
 else opacity=smooth(.67,.83,p);
 const copy=copies[i];copy.style.setProperty('--copy-opacity',opacity);copy.style.opacity=opacity;
 copy.style.transform=`translateY(${(1-opacity)*(i===0?-24:30)}px)`;
 copy.style.visibility=opacity<.015?'hidden':'visible';copy.inert=opacity<.5;copy.setAttribute('aria-hidden',String(opacity<.5));
}
function updateNarrative(){
 if(isStatic())return;
 copies.forEach((_,i)=>updateCopy(i,progress));
 const active=progress<.3?0:progress<.7?1:2;
 chapterButtons.forEach((b,i)=>{b.classList.toggle('active',i===active);if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('#scene-number').textContent=`SYS / 00${active+1}`;
 $('#scene-description').textContent=['A LIVING ARCHITECTURE','EVERY LAYER. CONNECTED.','AUTONOMY. ACCOUNTABILITY.'][active];
 $('#scene-progress').textContent=String(Math.round(progress*100)).padStart(2,'0')+' / 100';
}
function draw(time){
 frame=null;
 const dt=Math.min((time-lastTime)/1000,.05)||0;lastTime=time;
 if(!paused&&!reduced.matches&&inScene&&!document.hidden)clock+=dt;
 progress=Math.abs(targetProgress-progress)<.0005?targetProgress:mix(progress,targetProgress,.15);
 updateNarrative();drawScene();
 if(!document.hidden&&inScene&&((!paused&&!reduced.matches)||Math.abs(targetProgress-progress)>.0005))frame=requestAnimationFrame(draw);
}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
function resize(){width=stage.clientWidth;height=stage.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);requestDraw();updateProjects();}
function updateScroll(){
 $('.nav').classList.toggle('scrolled',scrollY>30);
 const rect=voyage.getBoundingClientRect();targetProgress=clamp(-rect.top/Math.max(1,voyage.offsetHeight-innerHeight));
 updateProjects();requestDraw();
}
chapterButtons.forEach(button=>button.addEventListener('click',()=>{
 const target=[0,.49,.96][Number(button.dataset.chapter)];
 window.scrollTo({top:scrollY+voyage.getBoundingClientRect().top+target*(voyage.offsetHeight-innerHeight),behavior:reduced.matches?'instant':'smooth'});
}));
new IntersectionObserver(entries=>{inScene=entries[0].isIntersecting;if(inScene)requestDraw();},{rootMargin:'100px'}).observe(voyage);
window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastTime=performance.now();requestDraw();}});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.08});
$$('.reveal').forEach(el=>revealObserver.observe(el));
$$('.career-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.career-item').forEach(other=>{if(other!==item)other.open=false;});}));

// Project gallery: a scroll-scrubbed horizontal chapter on desktop, native swipe on phones.
const projectSection=$('.project-section'),track=$('.project-track'),projectViewport=$('.project-viewport');
let projectIndex=0;
function updateProjects(){
 if(!projectSection)return;
 const native=innerWidth<=700||isStatic();
 const cards=$$('.project-card');const overflow=Math.max(0,track.scrollWidth-innerWidth);
 const p=native?clamp(projectViewport.scrollLeft/Math.max(1,projectViewport.scrollWidth-projectViewport.clientWidth)):clamp(-projectSection.getBoundingClientRect().top/Math.max(1,projectSection.offsetHeight-innerHeight));
 if(!native)track.style.transform=`translate3d(${-p*overflow}px,0,0)`;
 projectIndex=Math.min(cards.length-1,Math.round(p*(cards.length-1)));
 $('#project-count').textContent=String(projectIndex+1).padStart(2,'0')+' / 05';
 $('#project-prev').disabled=projectIndex===0;$('#project-next').disabled=projectIndex===cards.length-1;
 $('.project-meter>span').style.transform=`scaleX(${.2+.8*p})`;
}
function goProject(direction){
 const i=clamp(projectIndex+direction,0,4);
 if(innerWidth<=700||isStatic()){const card=$$('.project-card')[i];projectViewport.scrollTo({left:card.offsetLeft-22,behavior:reduced.matches?'instant':'smooth'});}
 else window.scrollTo({top:scrollY+projectSection.getBoundingClientRect().top+i/4*(projectSection.offsetHeight-innerHeight),behavior:'smooth'});
}
$('#project-prev').addEventListener('click',()=>goProject(-1));$('#project-next').addEventListener('click',()=>goProject(1));projectViewport.addEventListener('scroll',updateProjects,{passive:true});
// Tabbing into a horizontally displaced card brings the card into the visible chapter.
$$('.project-card').forEach((card,i)=>card.addEventListener('focusin',()=>{
 if(innerWidth>700&&!isStatic()){window.scrollTo({top:scrollY+projectSection.getBoundingClientRect().top+i/4*(projectSection.offsetHeight-innerHeight),behavior:'instant'});}
}));

// The incident engine shares the existing validated state machine, not visual code.
let state=initialState(),evidenceView='metrics';const completed=new Set();
function renderIncident(){
 const scenario=state.scenario?scenarios[state.scenario]:null,active=!!scenario&&state.phase!=='recovered';
 $$('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario)));
 $$('[data-system]').forEach(node=>{const degraded=active&&node.dataset.system===scenario.node;node.classList.toggle('degraded',degraded);node.querySelector('.health').textContent=degraded?'DEGRADED':'HEALTHY';});
 $('#lab-status').textContent=active?scenario.name.toUpperCase()+' / SIMULATED':state.phase==='recovered'?'SERVICE RESTORED / SIMULATED':'ALL SYSTEMS OPERATIONAL';
 $('#lab-indicator').style.background=active?'var(--amber)':'#b2dfbf';
 $('#lab-metric').textContent=scenario?(active?scenario.metric:scenario.healthy):'180 ms';
 $('#lab-metric').style.color=active?'var(--amber)':'var(--text)';
 $('#lab-metric-label').textContent=(scenario?scenario.label.toUpperCase():'API LATENCY')+' / SIMULATED';
 $('#lab-impact').textContent=scenario?(active?scenario.impact:'Service restored. Capture the learning and improve the system.'):'Traffic is flowing. Choose a scenario to see what changes.';
 $$('[data-evidence]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.evidence===evidenceView)));
 $('#evidence-output').textContent=evidenceFor(state.scenario,evidenceView,7);
 $('#review-plan').disabled=!['detected','investigating'].includes(state.phase);
 $('#review-plan').textContent=state.phase==='recovered'?'Recovery complete ✓':'Review recovery plan ↗';
 $('#decision-prompt').textContent=scenario?(state.phase==='recovered'?'A bounded change restored the service.':scenario.events[2]):'Automation can recommend. You own the decision.';
 $('#recovery-panel').hidden=state.phase!=='review';$('#incident-debrief').hidden=state.phase!=='recovered';
 if(scenario){
  $('#risk-description').textContent=scenario.risk;$('#bounded-label').textContent=scenario.action;$('#broad-label').textContent=scenario.alternative;
  $$('[name=strategy]').forEach(input=>input.checked=input.value===(state.plan||'bounded'));
  $('#dry-run-result').textContent=state.dryRun==='pass'?scenario.passed:state.dryRun==='blocked'?scenario.blocked:'Run the simulated check before approving a change.';
  $('#dry-run-result').style.color=state.dryRun==='blocked'?'var(--amber)':state.dryRun==='pass'?'var(--blue)':'var(--muted)';
  $('#acknowledge').disabled=state.dryRun!=='pass';$('#acknowledge').checked=!!state.acknowledged;
  $('#approve-plan').disabled=!(state.dryRun==='pass'&&state.acknowledged);
  $('#lesson').textContent=scenario.lesson;
 }
 $('#completion-count').textContent=completed.size+' / 3 SCENARIOS RECOVERED';
}
function dispatch(event,id){state=transition(state,event,id);if(state.phase==='recovered')completed.add(state.scenario);renderIncident();}
$$('[data-scenario]').forEach(b=>b.addEventListener('click',()=>dispatch('inject',b.dataset.scenario)));
$$('[data-evidence]').forEach(b=>b.addEventListener('click',()=>{evidenceView=b.dataset.evidence;renderIncident();}));
$('#reset-lab').addEventListener('click',()=>dispatch('reset'));
$('#review-plan').addEventListener('click',()=>{dispatch('review');$('#recovery-panel').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});$('#dry-run').focus({preventScroll:true});});
$$('[name=strategy]').forEach(input=>input.addEventListener('change',()=>dispatch('plan',input.value)));
$('#dry-run').addEventListener('click',()=>dispatch('dry-run'));
$('#acknowledge').addEventListener('change',e=>dispatch('acknowledge',e.target.checked));
$('#approve-plan').addEventListener('click',()=>{dispatch('approve');$('#incident-debrief').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});

// Portfolio terminal. No shell execution or remote requests.
const history=[];let historyIndex=0;
function runCommand(input){
 if(!input.trim())return;const result=resolveCommand(input),output=$('#terminal-output');
 if(result.clear)output.replaceChildren();else{const p=document.createElement('p'),command=document.createElement('span');command.textContent='$ '+input;p.append(command,document.createTextNode('\n'+result.lines.join('\n')));output.append(p);}
 if(output.children.length>50)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;
 history.push(input);historyIndex=history.length;$('#terminal-input').value='';
 if(result.navigate){const target={'#writing':'#projects','#work':'#experience'}[result.navigate]||result.navigate;$(target)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});}
}
$('#terminal-form').addEventListener('submit',e=>{e.preventDefault();runCommand($('#terminal-input').value);});
$$('[data-command]').forEach(button=>button.addEventListener('click',()=>runCommand(button.dataset.command)));
$('#terminal-input').addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();historyIndex=clamp(historyIndex+(e.key==='ArrowUp'?-1:1),0,history.length);e.target.value=history[historyIndex]||'';}
 if(e.key==='Tab'){const matches=commandNames.filter(command=>command.startsWith(e.target.value));if(matches.length===1){e.preventDefault();e.target.value=matches[0];}}
});
theme();setMotion();resize();renderIncident();updateScroll();
