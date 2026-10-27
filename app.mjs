import {resolveCommand,commandNames} from './terminal.mjs';
import {initialState, transition, scenarios, evidenceFor} from './incident.mjs';

const nodeContent={
 observability:['OBSERVABILITY / SIGNALS','See the system through the user’s experience.','Connect logs, metrics and traces to service objectives. Useful signals reduce noise and help teams investigate with evidence.'],
 edge:['01 / EDGE & TRAFFIC','Reliability starts with the user.','Shape traffic around service health. Use objectives, load patterns and graceful degradation to protect the experience at the edge.'],
 services:['OPERATIONS / RELIABILITY','Turn every incident into a stronger system.','Runbooks, tested recovery and blameless reviews turn operational experience into improvements that outlast the incident.'],
 platform:['03 / PLATFORM','The paved road should earn adoption.','Build developer platforms that remove friction. Useful defaults, GitOps and clear ownership let teams focus on their products.'],
 cloud:['04 / CLOUD','Resilience is an architecture decision.','Design for capacity, failure domains and recovery. Bring cloud economics and security into the same conversation as availability.'],
 ai:['05 / AI OPERATIONS','Automate the toil. Own the decision.','AI can connect signals and propose a response. Clear boundaries, evidence and human accountability make it useful.'],
 human:['06 / HUMAN JUDGMENT','Autonomy needs accountability.','Set the risk boundaries, review consequential changes and learn without blame. Engineering leadership remains a human responsibility.']
};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let selectedArchitectureNode=null;
function closeArchitectureInsight(returnFocus=false){
 $('#architecture-insight').hidden=true;
 $$('[data-node]').forEach(node=>{node.setAttribute('aria-pressed','false');node.setAttribute('aria-expanded','false');});
 if(returnFocus&&selectedArchitectureNode)selectedArchitectureNode.focus({preventScroll:true});
 selectedArchitectureNode=null;
}
$$('[data-node]').forEach(button=>button.addEventListener('click',()=>{
 if(selectedArchitectureNode===button){closeArchitectureInsight();return;}
 selectedArchitectureNode=button;
 $$('[data-node]').forEach(node=>{node.setAttribute('aria-pressed',String(node===button));node.setAttribute('aria-expanded',String(node===button));});
 const [,title,description]=nodeContent[button.dataset.node];
 $('#node-index').textContent='Architecture insight / '+button.querySelector('.layer-heading strong').textContent;
 $('#node-title').textContent=title;$('#node-description').textContent=description;
 $('#architecture-insight').classList.toggle('insight-left',['ai','human','services'].includes(button.dataset.node));
 $('#architecture-insight').hidden=false;
}));
$('#close-insight').addEventListener('click',()=>closeArchitectureInsight(true));
$('.architecture').addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!$('#architecture-insight').hidden){event.preventDefault();closeArchitectureInsight(true);}
});

// Native details grouping handles modern browsers; toggle closes siblings as a fallback.
$$('.work-item').forEach(item=>item.addEventListener('toggle',()=>{
 if(item.open) $$('.work-item').forEach(other=>{if(other!==item)other.open=false;});
}));
let state=initialState();
let evidenceView='metrics';
let replayIndex=7;
const completed=new Set();
const addEvent=(title,description,className='event-complete')=>{
 const li=document.createElement('li');li.className=className;
 const heading=document.createElement('span');heading.textContent=title;
 const p=document.createElement('p');p.textContent=description;
 li.append(heading,p);$('#event-list').append(li);
};
function renderEvidence(){
 const scenario=state.scenario?scenarios[state.scenario]:null;
 $$('[data-evidence]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.evidence===evidenceView)));
 $('#signal-replay').disabled=!scenario;
 $('#signal-replay').value=String(replayIndex);
 $('#replay-time').textContent=scenario?'T+'+replayIndex+'m':'READY';
 $('#chart-label').textContent=scenario?scenario.label.toUpperCase()+' / SIMULATED':'SIMULATED SIGNAL';
 $('#evidence-output').textContent=evidenceFor(state.scenario,evidenceView,replayIndex);
 const samples=scenario?scenario.samples:[1,1,1,1,1,1,1,1];
 const max=Math.max(...samples)*1.15;
 const points=samples.slice(0,replayIndex+1).map((value,i)=>[i/7*480,100-(value/max)*80]);
 $('#signal-line').setAttribute('points',points.map(point=>point.join(',')).join(' '));
 const last=points[points.length-1];
 $('#signal-point').setAttribute('cx',String(last[0]));$('#signal-point').setAttribute('cy',String(last[1]));
 $('#signal-chart-title').textContent=scenario?scenario.label+' at minute '+replayIndex+': '+samples[replayIndex]+' '+scenario.unit+' (simulated)':'Choose a scenario to replay simulated telemetry';
 $('#signal-replay').setAttribute('aria-valuetext',scenario?'Minute '+replayIndex+', '+samples[replayIndex]+' '+scenario.unit:'Choose a scenario');
}
function renderIncident(){
 const scenario=state.scenario?scenarios[state.scenario]:null;
 const active=!!scenario && state.phase!=='recovered';
 $$('[data-scenario]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scenario===state.scenario)));
 $$('[data-system]').forEach(node=>node.classList.toggle('degraded',active&&node.dataset.system===scenario.node));
 $('#lab-dot').style.background=active?'var(--amber)':'var(--cyan)';
 $('#lab-status').textContent=active?scenario.name.toUpperCase()+' / SIMULATED INCIDENT':state.phase==='recovered'?'RECOVERY COMPLETE / SIMULATED':'ALL SYSTEMS OPERATIONAL';
 $('#lab-metric').textContent=scenario?(active?scenario.metric:scenario.healthy):'180 ms';
 $('#lab-metric').style.color=active?'var(--amber)':'var(--cyan)';
 $('#lab-metric-label').textContent=(scenario?scenario.label.toUpperCase():'API LATENCY')+' · SIMULATED';
 $('#lab-impact').textContent=scenario?(active?scenario.impact:'Simulated recovery complete. The affected system is healthy again. Review what your decision demonstrated below.'):'Healthy services. Traffic is flowing. Choose a scenario to see what changes.';
 $('#event-list').replaceChildren();
 if(!scenario){
  addEvent('System ready','Observability is active. No incident has been introduced.');
  addEvent('Your move','Choose a failure on the left to begin.','');
 }else{
  addEvent('Signal detected',scenario.events[0]);
  addEvent('Evidence correlated',scenario.events[1]);
  if(state.phase==='recovered'){
   addEvent('Dry run passed','A bounded change passed the simulated safety check.');
   addEvent('Human decision recorded','You reviewed the risk and approved the simulated recovery.');
   addEvent('Service restored','Validate health, capture the learning and improve the system.');
  }else if(state.phase==='investigating'){
   addEvent('Investigation requested',scenario.risk,'event-review');
  }else{
   addEvent(state.dryRun==='blocked'?'Safety gate blocked the plan':state.dryRun==='pass'?'Dry run passed':state.phase==='review'?'Choose and test a strategy':'Recommendation available',state.dryRun==='blocked'?'Revise the strategy. Approval remains blocked.':scenario.events[2],'event-review');
  }
 }
 $('#review-plan').disabled=!['detected','investigating'].includes(state.phase);
 $('#review-plan').textContent=state.phase==='recovered'?'Recovery complete ✓':'Open recovery workbench ↗';
 $('#recovery-panel').hidden=state.phase!=='review';
 $('#incident-debrief').hidden=state.phase!=='recovered';
 if(scenario){
  $('#bounded-action').textContent=scenario.action;$('#broad-action').textContent=scenario.alternative;
  $('#recovery-risk').textContent=scenario.risk;
  $('#debrief-lesson').textContent=scenario.lesson;
  $('#debrief-title').textContent=scenario.name+' / decision debrief';
 }
 $$('[name="recovery-strategy"]').forEach(radio=>radio.checked=radio.value===state.plan);
 $('#dry-run-result').hidden=!state.dryRun;
 $('#dry-run-result').className=state.dryRun==='pass'?'dry-run-pass':'dry-run-blocked';
 $('#dry-run-result').textContent=state.dryRun&&scenario?(state.dryRun==='pass'?'PASS / '+scenario.passed:'BLOCKED / '+scenario.blocked):'';
 $('#risk-ack').disabled=state.dryRun!=='pass';$('#risk-ack').checked=!!state.acknowledged;
 $('#approve-plan').disabled=!(state.dryRun==='pass'&&state.acknowledged);
 $('#dry-run-plan').textContent=state.dryRun?'Run dry run again ↗':'Run simulated dry run ↗';
 const step=state.phase==='healthy'?0:state.phase==='recovered'?3:state.dryRun?2:1;
 $$('[data-step]').forEach((element,i)=>{element.classList.toggle('current',i===step);element.classList.toggle('complete',i<step||state.phase==='recovered');});
 $('#lab-completed').textContent=completed.size+' / 3 explored this visit';
 const prompts={healthy:'You’re in command. Start by introducing a failure.',detected:'Inspect metrics, logs and traces below. Then compare recovery strategies.',review:'Choose a strategy, run the safety check and review the risk before approval.',investigating:'The action is on hold. Replay the evidence, then return to the workbench.',recovered:'Service restored. Read your decision debrief, then try another scenario.'};
 $('#lab-next').textContent=prompts[state.phase];
 renderEvidence();
}
function dispatch(event,id){
 state=transition(state,event,id);
 if(event==='inject'||event==='reset'){evidenceView='metrics';replayIndex=7;}
 if(state.phase==='recovered')completed.add(state.scenario);
 renderIncident();
}
$$('[data-scenario]').forEach(button=>button.addEventListener('click',()=>dispatch('inject',button.dataset.scenario)));
$('#reset-lab').addEventListener('click',()=>dispatch('reset'));
function focusPanel(selector){const panel=$(selector);panel.focus({preventScroll:true});panel.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#review-plan').addEventListener('click',()=>{dispatch('review');focusPanel('#recovery-panel');});
$$('[name="recovery-strategy"]').forEach(radio=>radio.addEventListener('change',()=>dispatch('plan',radio.value)));
$('#dry-run-plan').addEventListener('click',()=>dispatch('dry-run'));
$('#risk-ack').addEventListener('change',event=>dispatch('acknowledge',event.target.checked));
$('#approve-plan').addEventListener('click',()=>{dispatch('approve');focusPanel('#incident-debrief');});
$('#investigate-plan').addEventListener('click',()=>{dispatch('investigate');$('#review-plan').focus();});
$$('[data-evidence]').forEach(button=>button.addEventListener('click',()=>{evidenceView=button.dataset.evidence;renderEvidence();}));
$('#signal-replay').addEventListener('input',event=>{replayIndex=Number(event.target.value);renderEvidence();});
$('#next-scenario').addEventListener('click',()=>{
 const ids=Object.keys(scenarios);const next=ids.find(id=>!completed.has(id))||ids[(ids.indexOf(state.scenario)+1)%ids.length];
 dispatch('inject',next);const button=$('[data-scenario="'+next+'"]');button.focus();button.scrollIntoView({block:'center',behavior:motion.matches?'instant':'smooth'});
});

$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 $$('[data-filter]').forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
 let count=0;
 $$('[data-category]').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&!item.dataset.category.split(' ').includes(button.dataset.filter);if(!item.hidden)count++;});
 $('.filter-status').textContent=`${count} exploration${count===1?'':'s'} shown.`;
}));
const motion=matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion(){const map=$('.topology');if(motion.matches)map.pauseAnimations();else map.unpauseAnimations();}
motion.addEventListener('change',updateMotion);updateMotion();
renderIncident();


// Portfolio commands are local, allowlisted interactions - never a system shell.
const terminalInput=$('#terminal-input');
const terminalHistory=[];
let terminalHistoryIndex=0;
let terminalDraft='';
function runTerminal(raw){
 const command=raw.trim();if(!command)return;
 const result=resolveCommand(command);
 terminalHistory.push(command);if(terminalHistory.length>30)terminalHistory.shift();
 terminalHistoryIndex=terminalHistory.length;terminalDraft='';
 if(result.clear){$('#terminal-output').replaceChildren();$('.terminal-boot').hidden=true;}
 else{
  const group=document.createElement('div');group.className='terminal-result';
  const prompt=document.createElement('p');prompt.className='terminal-command';prompt.textContent='$ '+command;group.append(prompt);
  for(const line of result.lines){const row=document.createElement('p');row.textContent=line;group.append(row);}
  $('#terminal-output').append(group);
  while($('#terminal-output').children.length>12)$('#terminal-output').firstElementChild.remove();
 }
 terminalInput.value='';
 $('#terminal-screen').scrollTop=$('#terminal-screen').scrollHeight;
 if(result.navigate){
  window.location.hash=result.navigate;
  const heading=$(result.navigate);heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
 }else terminalInput.focus({preventScroll:true});
}
$('#terminal-form').addEventListener('submit',event=>{event.preventDefault();runTerminal(terminalInput.value);});
$$('[data-command]').forEach(button=>button.addEventListener('click',()=>runTerminal(button.dataset.command)));
terminalInput.addEventListener('keydown',event=>{
 if(event.key==='ArrowUp'||event.key==='ArrowDown'){
  event.preventDefault();
  if(terminalHistoryIndex===terminalHistory.length)terminalDraft=terminalInput.value;
  terminalHistoryIndex=Math.max(0,Math.min(terminalHistory.length,terminalHistoryIndex+(event.key==='ArrowUp'?-1:1)));
  terminalInput.value=terminalHistoryIndex===terminalHistory.length?terminalDraft:terminalHistory[terminalHistoryIndex];
 }else if(event.key==='Tab'&&terminalInput.value.trim()){
  const prefix=terminalInput.value.trim().toLowerCase();const matches=commandNames.filter(name=>name.toLowerCase().startsWith(prefix));
  if(matches.length===1&&matches[0].toLowerCase()!==prefix){event.preventDefault();terminalInput.value=matches[0];}
 }
});

// The label describes the destination mode; the current preference survives reloads.
const themeToggle = document.querySelector('#theme-toggle');
function syncThemeControl() {
 const isDay = document.documentElement.dataset.theme === 'light';
 const action = isDay ? 'Switch to night mode' : 'Switch to day mode';
 themeToggle.setAttribute('aria-label', action);
 themeToggle.title = action;
 document.querySelector('#theme-label').textContent = isDay ? 'Night' : 'Day';
 document.querySelector('meta[name="theme-color"]').content = isDay ? '#f5f8fa' : '#080d10';
}
themeToggle.addEventListener('click', () => {
 const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
 document.documentElement.dataset.theme = theme;
 try { localStorage.setItem('portfolio-theme', theme); } catch {}
 syncThemeControl();
});
syncThemeControl();
