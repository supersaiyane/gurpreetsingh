import {createPageJourney} from './page-journey.mjs?v=mobile-4';
import {initialState, transition, scenarios, evidenceFor} from './incident.mjs';
import {resolveCommand, commandNames} from './terminal.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x);};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false, light=false, inScene=true, targetProgress=0, progress=0, frame=null, lastTime=0, clock=0;
const voyage=$('.voyage'),stage=$('.stage'),canvas=$('#system-scene');
let spatialScene=null,pageJourney=null,sceneFactory=null,sceneLoading=false;
const compactScreen=()=>innerWidth<=700;
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
 voyage.classList.toggle('compact-journey',compactScreen());
 $('.project-section').classList.toggle('static-projects',isStatic());
 copies.forEach((el,i)=>{if(isStatic()||compactScreen()){el.inert=false;el.style.visibility='visible';el.setAttribute('aria-hidden','false');}else updateCopy(i,progress);});
 $('#motion-toggle').disabled=reduced.matches;
 $('#motion-toggle').textContent=reduced.matches?'Motion reduced':paused?'Resume motion':'Pause motion';
 document.body.classList.toggle('motion-paused',paused||reduced.matches);
 pageJourney?.invalidate();updateScroll();resize();requestDraw();
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;$('#motion-toggle').setAttribute('aria-pressed',String(paused));setMotion();});
reduced.addEventListener('change',setMotion);
document.body.classList.add('js-motion');

// GPU scene loading is independent of page behavior: content remains usable without WebGL.
function drawScene(){
 const journey=pageJourney?.frame({time:clock,still:isStatic(),light})||{chapter:0,fault:0};
 if(!compactScreen()&&!isStatic())spatialScene?.render({progress,time:clock,light,still:false,...journey});
}
function loadSpatialScene(){
 if(compactScreen()||spatialScene||sceneLoading)return;
 sceneLoading=true;
 import('./system-scene.mjs?v=mobile-4').then(({createSystemScene})=>{
 sceneFactory=createSystemScene;
 if(!compactScreen())spatialScene=createSystemScene(canvas);
 stage.classList.toggle('scene-fallback',!spatialScene);document.body.classList.toggle('scene-fallback',!spatialScene);
 if(spatialScene){spatialScene.resize(width,height);stage.classList.add('scene-ready');document.body.classList.add('scene-ready');}
 requestDraw();
}).catch(()=>{stage.classList.add('scene-fallback');document.body.classList.add('scene-fallback');}).finally(()=>{sceneLoading=false;});
}
loadSpatialScene();
stage.addEventListener('pointermove',event=>{
 if(!isStatic()&&event.pointerType!=='touch')spatialScene?.pointer((event.clientX/innerWidth-.5)*2,(event.clientY/innerHeight-.5)*2);
},{passive:true});
stage.addEventListener('pointerleave',()=>spatialScene?.pointer(0,0));
function updateCopy(i,p){
 let opacity;
 if(i===0)opacity=1-smooth(.15,.31,p);
 else if(i===1)opacity=smooth(.24,.38,p)*(1-smooth(.60,.73,p));
 else opacity=smooth(.67,.83,p);
 const copy=copies[i];copy.style.setProperty('--copy-opacity',opacity);copy.style.opacity=opacity;
 copy.style.transform=`translateY(${(1-opacity)*(i===0?-24:30)}px)`;
 copy.style.visibility=opacity<.015?'hidden':'visible';copy.inert=opacity<.5;copy.setAttribute('aria-hidden',String(opacity<.5));
}
function updateNarrative(){
 if(isStatic()||compactScreen())return;
 copies.forEach((_,i)=>updateCopy(i,progress));
 const active=progress<.3?0:progress<.7?1:2;
 chapterButtons.forEach((b,i)=>{b.classList.toggle('active',i===active);if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('#scene-number').textContent=`SYS / 00${active+1}`;
 $('#scene-description').textContent=['A LIVING ARCHITECTURE','INDEPENDENT. INTERCONNECTED.','AUTONOMY. ACCOUNTABILITY.'][active];
 $('#scene-progress').textContent=String(Math.round(progress*100)).padStart(2,'0')+' / 100';
}
function draw(time){
 frame=null;
 const dt=Math.min((time-lastTime)/1000,.05)||0;lastTime=time;
 if(!paused&&!reduced.matches&&!document.hidden)clock+=dt;
 progress=Math.abs(targetProgress-progress)<.0005?targetProgress:mix(progress,targetProgress,.15);
 updateNarrative();drawScene();
 if(!document.hidden&&((!paused&&!reduced.matches)||Math.abs(targetProgress-progress)>.0005))frame=requestAnimationFrame(draw);
}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
function resize(){
 width=innerWidth;height=innerHeight;
 voyage.classList.toggle('compact-journey',compactScreen());
 copies.forEach((el,i)=>{if(compactScreen()||isStatic()){el.inert=false;el.style.visibility='visible';el.setAttribute('aria-hidden','false');}else updateCopy(i,progress);});
 if(!compactScreen()&&!spatialScene&&sceneFactory){spatialScene=sceneFactory(canvas);if(spatialScene){stage.classList.add('scene-ready');document.body.classList.add('scene-ready');document.body.classList.remove('scene-fallback');}}
 if(!compactScreen()){spatialScene?.resize(width,height);loadSpatialScene();}
 pageJourney?.invalidate();requestDraw();updateProjects();
}
function updateScroll(){
 $('.nav').classList.toggle('scrolled',scrollY>30);
 const rect=voyage.getBoundingClientRect();targetProgress=clamp(-rect.top/Math.max(1,voyage.offsetHeight-innerHeight));
 updateProjects();pageJourney?.update();requestDraw();
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
 pageJourney?.incident(active);
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
pageJourney=createPageJourney();theme();setMotion();resize();renderIncident();updateScroll();
