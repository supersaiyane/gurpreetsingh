import {scenarios,evidenceFor} from './incident.mjs';
import {newJourney,journeyAction} from './guided.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const gsap=window.gsap;
if(gsap&&window.ScrollTrigger)gsap.registerPlugin(window.ScrollTrigger);

// Actual browser information, deliberately distinct from simulated system signals.
function updateClock(){ $('#console-time').textContent=new Date().toLocaleTimeString('en-GB',{hour12:false}); }
function updateViewport(){ $('#console-viewport').textContent=`VIEWPORT ${innerWidth} × ${innerHeight} / CSS PX`; }
updateClock();updateViewport();setInterval(updateClock,1000);addEventListener('resize',updateViewport);

const assembly=$('.assembly-object');
const fragments=[];
for(let z=-1;z<=1;z++)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
 const block=document.createElement('span');block.className='assembly-block';
 block.innerHTML='<i class="block-front"></i><i class="block-back"></i><i class="block-left"></i><i class="block-right"></i><i class="block-top"></i><i class="block-bottom"></i>';
 block.dataset.x=x;block.dataset.y=y;block.dataset.z=z;
 block.style.transform=`translate3d(${x*42}px,${y*42}px,${z*42}px)`;
 assembly.append(block);fragments.push(block);
}
if(gsap)gsap.set(assembly,{rotationX:-22,rotationY:-32,rotationZ:0,scale:1,force3D:true});
let floatTween=null;
if(gsap&&!reduced.matches)floatTween=gsap.to(assembly,{y:9,duration:3.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
function syncAssemblyMotion(){if(floatTween)floatTween.paused(reduced.matches||$('.core-stage').classList.contains('motion-paused')||$('.core-stage').classList.contains('core-offscreen'));}
new MutationObserver(syncAssemblyMotion).observe($('.core-stage'),{attributes:true,attributeFilter:['class']});
reduced.addEventListener('change',syncAssemblyMotion);
let exploded=false;
function setAssemblyExpanded(expanded){
 if(exploded===expanded)return;
 exploded=expanded;
 $('#assembly-toggle').setAttribute('aria-pressed',String(exploded));
 $('#assembly-toggle').innerHTML=(exploded?'Reassemble the system':'Disassemble the system')+' <span>↗</span>';
 fragments.forEach((block,i)=>{
  const size=exploded?70:42;
  const values={x:Number(block.dataset.x)*size,y:Number(block.dataset.y)*size,z:Number(block.dataset.z)*size,rotationZ:exploded?(i%3-1)*7:0};
  if(gsap)gsap.to(block,{...values,duration:reduced.matches?0:1.15,delay:reduced.matches?0:i*.012,ease:'expo.inOut',overwrite:true});
  else block.style.transform=`translate3d(${values.x}px,${values.y}px,${values.z}px)`;
 });
}
$('#assembly-toggle').addEventListener('click',()=>setAssemblyExpanded(!exploded));
const hoverPointer=matchMedia('(hover: hover) and (pointer: fine)');
$('.core-space').addEventListener('pointerenter',event=>{if(hoverPointer.matches&&event.pointerType!=='touch')setAssemblyExpanded(true);});
$('.core-space').addEventListener('pointerleave',event=>{if(hoverPointer.matches&&event.pointerType!=='touch')setAssemblyExpanded(false);});
$('.core-space').addEventListener('pointercancel',()=>setAssemblyExpanded(false));
const rotations={sre:-32,cloud:-122,ai:-212,platform:58};
$$('[data-core]').forEach(button=>button.addEventListener('click',()=>{
 if(gsap)gsap.to(assembly,{rotationY:rotations[button.dataset.core],rotationX:-22,duration:reduced.matches?0:1.1,ease:'power3.inOut',overwrite:'auto'});
 else assembly.style.transform=`rotateX(-22deg) rotateY(${rotations[button.dataset.core]}deg)`;
}));
if(gsap){
 gsap.set(assembly,{rotationX:-22,rotationY:-32});
 if(!reduced.matches){
  gsap.from('#hero-title>span',{yPercent:115,rotate:3,opacity:0,stagger:.13,duration:1.1,ease:'expo.out',clearProps:'transform,opacity'});
  gsap.from(fragments,{z:()=>160+Math.random()*140,duration:1.4,stagger:{amount:.5,from:'center'},ease:'expo.out',overwrite:'auto'});
  gsap.from('.identity-statement,.console-rail,.hero-positioning',{y:18,opacity:0,stagger:.13,duration:.8,delay:.35,clearProps:'transform,opacity'});
  gsap.from('.flow-node',{scrollTrigger:{trigger:'.signal-console',start:'top 85%',once:true},y:35,opacity:0,stagger:.085,duration:.8,ease:'power3.out',clearProps:'transform,opacity'});
 }
}

const chapters=[
 ['01 / REQUEST','Every request is a promise.','A user asks the platform to do something. Reliability starts with that experience.','ingress.accept(request) → route_by_health()', 'edge'],
 ['02 / PLATFORM','Make the good path easy.','The platform provides the paved road: healthy services, repeatable delivery and clear ownership.','platform.route() → service.execute() → emit(signals)', 'platform'],
 ['03 / INTELLIGENCE','Turn signals into evidence.','AI correlates the signals and proposes a bounded response. A recommendation is not an approval.','ai.correlate() → confidence.check() → propose(change)', 'ai'],
 ['04 / ACCOUNTABILITY','Keep the decision human.','Review the evidence, test the change and own the result. Autonomy follows the risk boundary.','human.review() → dry_run() → approve_or_override()', 'human']
];
let playback=null,progress=0,lastChapter=-1;
const packet=$('#request-packet'),route=$('#signal-route');
function renderPlayback(value){
 progress=value;const index=Math.min(3,Math.floor(value*4));const chapter=chapters[index];
 if(index!==lastChapter){
  $('#signal-heading').textContent=chapter[1];$('#signal-story').textContent=chapter[2];$('#signal-stage').textContent=chapter[0];$('#signal-log').textContent=chapter[3];
  $$('.flow-node').forEach(node=>node.classList.toggle('signal-active',node.dataset.node===chapter[4]));
  if(gsap&&!reduced.matches)gsap.fromTo('#signal-heading,#signal-log',{y:12,opacity:.3},{y:0,opacity:1,duration:.4,overwrite:true});
  lastChapter=index;
 }
 const point=route.getPointAtLength(route.getTotalLength()*value);
 packet.setAttribute('cx',point.x);packet.setAttribute('cy',point.y);
 route.style.strokeDashoffset=String(route.getTotalLength()*(1-value));
 $('#signal-scrub').value=String(Math.round(value*100));$('#signal-percent').textContent=Math.round(value*100)+'%';
 if(value>=1)$('#signal-play').textContent='Replay the system ↺';
}
route.style.strokeDasharray=String(route.getTotalLength());route.style.strokeDashoffset=String(route.getTotalLength());
function playSignal(){
 if(playback&&!playback.paused()&&progress<1){playback.pause();$('#signal-play').textContent='Continue playback ▶';return;}
 if(reduced.matches||!gsap){renderPlayback(progress>=1?0:Math.min(1,progress+.25));return;}
 if(playback&&progress<1){playback.play();$('#signal-play').textContent='Pause playback Ⅱ';return;}
 const cursor={value:progress>=1?0:progress};
 playback=gsap.to(cursor,{value:1,duration:12*(1-cursor.value),ease:'none',onUpdate:()=>renderPlayback(cursor.value),onComplete:()=>$('#signal-play').textContent='Replay the system ↺'});
 $('#signal-play').textContent='Pause playback Ⅱ';
}
$('#signal-play').addEventListener('click',playSignal);
$('#signal-reset').addEventListener('click',()=>{playback?.kill();playback=null;lastChapter=-1;renderPlayback(0);$('#signal-play').textContent='Play the system ▶';});
$('#signal-scrub').addEventListener('input',event=>{playback?.kill();playback=null;renderPlayback(Number(event.target.value)/100);$('#signal-play').textContent='Play from here ▶';});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playback){playback.pause();if(progress<1)$('#signal-play').textContent='Continue playback ▶';}}).observe($('.architecture'));
reduced.addEventListener('change',()=>{playback?.pause();if(progress<1)$('#signal-play').textContent='Continue playback ▶';});

// A focused incident demo shares the same tested transition model as free exploration.
let journey=newJourney(),evidence='metrics',minute=7;
const diagnosis={
 deployment:['A release regression','The failing revision matches the start of errors. Healthy v41 requests still succeed.','A regional outage','The database is saturated'],
 latency:['A saturated worker pool','The trace spends most time in the worker queue. Database execution remains healthy.','A bad DNS record','A region is unreachable'],
 region:['Primary region is unavailable','Primary health probes time out. The secondary can serve reads while writes await readiness checks.','Every replica needs a restart','A new release failed readiness']
};
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const e=escapeText;
function renderJourney(focus=false){
 const active=document.activeElement;
 const activeId=active?.id;
 const activeData=active?.getAttributeNames?.().find(name=>name.startsWith('data-journey-')||name==='data-diagnosis');
 const activeValue=activeData?active.getAttribute(activeData):null;
 const j=journey,s=scenarios[j.incident.scenario],d=diagnosis[j.incident.scenario];
 const steps=['Observe','Diagnose','Decide','Recover'];
 let content='';
 if(j.step===0){content=`<div class="player-evidence"><div><span class="player-label">SIMULATED USER IMPACT</span><strong class="impact-number">${e(s.metric)}</strong><span>${e(s.label)}</span><p>${e(s.signal)}</p><div class="player-scenarios" aria-label="Choose incident">${Object.entries(scenarios).map(([id,item])=>`<button data-journey-scenario="${id}" aria-pressed="${id===j.incident.scenario}">${e(item.name)}</button>`).join('')}</div></div><div class="evidence-window"><div class="player-tabs" role="group" aria-label="Guided evidence">${['metrics','logs','traces'].map(tab=>`<button data-journey-evidence="${tab}" aria-pressed="${tab===evidence}">${tab}</button>`).join('')}</div><pre>${e(evidenceFor(j.incident.scenario,evidence,minute))}</pre><label for="journey-minute">Inspect the timeline <output>T+${minute}m</output></label><input id="journey-minute" type="range" min="0" max="7" value="${minute}"></div></div>`;}
 if(j.step===1){content=`<div class="diagnosis-question"><span class="player-label">YOUR READ OF THE EVIDENCE</span><h4>What best explains the failure?</h4><div class="diagnosis-options">${[['correlated',d[0]],['unrelated',d[2]],['unsupported',d[3]]].map(([id,label],i)=>`<button data-diagnosis="${id}" aria-pressed="${j.diagnosis===id}"><span>0${i+1}</span>${e(label)}<b>↗</b></button>`).join('')}</div>${j.diagnosis?`<p class="diagnosis-feedback ${j.diagnosis==='correlated'?'correct':'incorrect'}" role="status">${j.diagnosis==='correlated'?'EVIDENCE MATCH / '+e(d[1]):'LOOK AGAIN / That conclusion is not supported by these signals. Go back to the evidence or choose another explanation.'}</p>`:'<p class="player-hint">Make a call based on the evidence. You can return to inspect it.</p>'}</div>`;}
 if(j.step===2){content=`<div class="player-plan"><div><span class="player-label">PROPOSED RESPONSE / HUMAN DECISION</span><h4>Choose the change you can defend.</h4><div class="diagnosis-options">${[['bounded',s.action,'Small scope / verify after acting'],['broad',s.alternative,'Broader scope / larger blast radius']].map(([id,label,description])=>`<button data-journey-plan="${id}" aria-pressed="${j.incident.plan===id}"><span>${id==='bounded'?'A':'B'}</span><div>${e(label)}<small>${description}</small></div></button>`).join('')}</div><button id="journey-dry-run" class="button secondary">${j.incident.dryRun?'Run safety check again':'Test this plan'} ↗</button></div><aside class="decision-gate"><span class="player-label">THE SAFETY GATE</span><h4>${j.incident.dryRun==='pass'?'Check passed. Your decision.':j.incident.dryRun==='blocked'?'Change blocked.':'Test before you act.'}</h4><p role="status">${e(j.incident.dryRun==='pass'?s.passed:j.incident.dryRun==='blocked'?s.blocked:'Run a simulated safety check. Approval stays locked until the plan passes.')}</p><p><strong>Risk to review:</strong> ${e(s.risk)}</p><label class="risk-ack"><input id="journey-ack" type="checkbox" ${j.incident.acknowledged?'checked':''} ${j.incident.dryRun!=='pass'?'disabled':''}>I understand the test result and recovery risk.</label><button id="journey-approve" class="button primary" ${!(j.incident.dryRun==='pass'&&j.incident.acknowledged)?'disabled':''}>Approve simulated recovery ↗</button></aside></div>`;}
 if(j.step===3){content=`<div class="player-receipt"><span class="receipt-check">✓</span><div><span class="player-label">SERVICE RESTORED / DECISION RECEIPT</span><h4>You restored service.<br>You own the learning.</h4><div class="receipt-metrics"><div><span>BEFORE</span><strong>${e(s.metric)}</strong></div><span>→</span><div><span>AFTER / SIMULATED</span><strong>${e(s.healthy)}</strong></div></div><p>${e(s.lesson)}</p><dl><div><dt>Decision</dt><dd>${e(s.action)}</dd></div><div><dt>Controls</dt><dd>Evidence matched · Dry run passed · Risk acknowledged</dd></div></dl><button id="journey-restart" class="button secondary">Try another incident ↗</button></div></div>`;}
 $('#guided-player').innerHTML=`<div class="player-chrome"><span><i class="signal-dot"></i>INCIDENT PLAYER / ${e(s.name).toUpperCase()}</span><button id="journey-exit">Exit to free exploration ↗</button></div><div class="player-layout"><nav class="player-chapters" aria-label="Guided incident progress">${steps.map((step,i)=>`<span class="${i===j.step?'active':i<j.step?'done':''}" ${i===j.step?'aria-current="step"':''}><b>${i<j.step?'✓':'0'+(i+1)}</b>${step}</span>`).join('')}<small>SIMULATION<br>All signals are fictional.<br>Every decision is yours.</small></nav><div class="player-main"><div class="player-heading"><span class="player-label">STEP 0${j.step+1} / 04</span><h3 id="journey-heading" tabindex="-1">${['Read the system.','Find the cause.','Test your judgment.','Close the loop.'][j.step]}</h3></div>${content}<div class="player-footer"><button id="journey-back" ${j.step===0||j.step===3?'hidden':''}>← Previous step</button><span>${j.step===3?'COMPLETE':Math.round(j.step/3*100)+'% / YOUR PROGRESS'}</span><button id="journey-next" class="button primary" ${j.step>=2?'hidden':''} ${j.step===1&&j.diagnosis!=='correlated'?'disabled':''}>${j.step===0?'I have read the evidence':'Choose a recovery plan'} →</button></div></div></div>`;
 if(focus){$('#journey-heading').focus({preventScroll:true});$('#guided-player').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
 else if(activeId&&$('#'+activeId))$('#'+activeId).focus({preventScroll:true});
 else if(activeData)$('#guided-player ['+activeData+'="'+activeValue+'"]').focus({preventScroll:true});
}
function act(event,value){journey=journeyAction(journey,event,value);renderJourney(['next','back','approve'].includes(event));}
$('#start-mission').addEventListener('click',()=>{
 journey=newJourney();minute=7;evidence='metrics';$('#free-lab').hidden=true;$('#guided-player').hidden=false;renderJourney(true);
 $('#guided-player').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
});
$('#guided-player').addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.journeyScenario){act('scenario',button.dataset.journeyScenario);return;}
 if(button.dataset.journeyEvidence){evidence=button.dataset.journeyEvidence;renderJourney();return;}
 if(button.dataset.diagnosis){act('diagnosis',button.dataset.diagnosis);return;}
 if(button.dataset.journeyPlan){act('plan',button.dataset.journeyPlan);return;}
 const actions={'journey-next':'next','journey-back':'back','journey-dry-run':'dry-run','journey-approve':'approve'};
 if(actions[button.id])act(actions[button.id]);
 if(button.id==='journey-exit'){$('#guided-player').hidden=true;$('#free-lab').hidden=false;$('#start-mission').focus();}
 if(button.id==='journey-restart'){act('scenario',journey.incident.scenario==='deployment'?'region':'latency');}
});
$('#guided-player').addEventListener('change',event=>{if(event.target.id==='journey-ack')act('acknowledge',event.target.checked);});
$('#guided-player').addEventListener('input',event=>{
 if(event.target.id==='journey-minute'){
  minute=Number(event.target.value);$('#guided-player pre').textContent=evidenceFor(journey.incident.scenario,evidence,minute);$('#guided-player .evidence-window output').textContent='T+'+minute+'m';
 }
});
