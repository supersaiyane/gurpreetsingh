const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;

// Map real section positions to one continuous coordinate. Accordion height changes and
// static reading mode can move the anchors; callers remeasure instead of assuming page length.
export function journeyCoordinate(stops,scroll){
 if(!stops.length)return 0;
 if(scroll<=stops[0])return 0;
 for(let i=1;i<stops.length;i++){
  if(scroll<stops[i])return i-1+clamp((scroll-stops[i-1])/Math.max(1,stops[i]-stops[i-1]));
 }
 return stops.length-1;
}
export function samplePose(poses,coordinate){
 const n=clamp(Number.isFinite(coordinate)?coordinate:0,0,poses.length-1),i=Math.floor(n),t=n-i;
 const a=poses[i],b=poses[Math.min(i+1,poses.length-1)];
 return Object.fromEntries(Object.keys(a).map(key=>[key,mix(a[key],b[key],t)]));
}

export function createPageJourney(){
 const sections=[document.querySelector('.voyage'),document.querySelector('.manifesto'),document.querySelector('.experience'),document.querySelector('.lab-section'),document.querySelector('.project-section'),document.querySelector('.principles'),document.querySelector('.terminal-section'),document.querySelector('.contact'),document.querySelector('footer')];
 const labels=['The system','The purpose','The experience','The decisions','The builds','The principles','The conversation','The next chapter','Connected'];
 const svg=document.querySelector('.page-signal'),base=svg.querySelector('.signal-base'),trace=svg.querySelector('.signal-trace'),cursor=svg.querySelector('.signal-cursor'),nodes=svg.querySelector('.signal-nodes');
 const world=document.querySelector('.world-space'),status=document.querySelector('.continuity-status'),label=status.querySelector('span'),statusNumber=status.querySelector('b');
 let stops=[],tops=[],end=0,start=0,x=0,target=0,current=0,travel=0,needsMeasure=true,activeIncident=false;
 const ns='http://www.w3.org/2000/svg';
 const markers=sections.slice(1,8).map(()=>{const g=document.createElementNS(ns,'g'),circle=document.createElementNS(ns,'circle');circle.setAttribute('r','3');g.append(circle);nodes.append(g);return g;});
 let measureFrame;
 function invalidate(){needsMeasure=true;if(!measureFrame)measureFrame=requestAnimationFrame(()=>{measureFrame=null;measure();});}
 function measure(){
  const y=window.scrollY,h=window.innerHeight;
  tops=sections.map(e=>e.getBoundingClientRect().top+y);
  // The hand-off begins at the end of the pinned hero, before its visual leaves the viewport.
  stops=[Math.max(0,tops[0]+sections[0].offsetHeight-h),...tops.slice(1).map(top=>top-h*.14)];
  for(let i=1;i<stops.length;i++)stops[i]=Math.max(stops[i-1]+1,stops[i]);
  x=innerWidth<=700?9:24;start=tops[1]-innerHeight*.17;end=tops[7]+sections[7].offsetHeight*.76;
  const height=tops[8]+sections[8].offsetHeight;
  svg.setAttribute('viewBox',`0 0 ${innerWidth} ${height}`);svg.style.height=height+'px';
  // The same route persists through every section; no section starts a new animation.
  const d=`M ${x} ${start} L ${x} ${end}`;
  base.setAttribute('d',d);trace.setAttribute('d',d);
  markers.forEach((g,i)=>g.setAttribute('transform',`translate(${x},${Math.min(end,tops[i+1]+34)})`));
  needsMeasure=false;update();
 }
 function update(){
  if(!stops.length)return;
  target=journeyCoordinate(stops,scrollY);
  travel=clamp((scrollY+innerHeight*.48-start)/Math.max(1,end-start));
  document.body.classList.toggle('inside-incident',activeIncident&&target>2.35&&target<4.05);
  // Local scroll choreography is reversible and tied to the same page position.
  for(let i=1;i<8;i++){
   const section=sections[i],rect=section.getBoundingClientRect();
   const p=clamp((innerHeight*.86-rect.top)/(innerHeight*.85));
   section.style.setProperty('--section-progress',String(p));
   section.classList.toggle('chapter-in-view',rect.top<innerHeight&&rect.bottom>0);
  }
  document.querySelectorAll('.principle').forEach(row=>{
   const rect=row.getBoundingClientRect(),p=clamp((innerHeight*.85-rect.top)/(innerHeight*.6));
   row.style.setProperty('--row-progress',String(p));
  });
  document.querySelectorAll('.project-card').forEach(card=>{
   const rect=card.getBoundingClientRect(),p=clamp((rect.left+rect.width*.5)/Math.max(1,innerWidth));
   card.style.setProperty('--art-drift',`${(p-.5)*18}px`);
  });
 }
 function frame({time,still,light}){
  if(needsMeasure)measure();
  current=still?target:Math.abs(target-current)<.001?target:mix(current,target,.10);
  const visibility=current<.05?0:clamp(current/.7)*(1-clamp((current-7.6)/.4));
  svg.style.opacity=still?'0':String(visibility);
  status.style.opacity=still?'0':String(visibility*.95);
  status.hidden=still;svg.hidden=still;
  trace.style.strokeDashoffset=String(1-travel);
  cursor.setAttribute('cx',String(x));cursor.setAttribute('cy',String(mix(start,end,travel)));
  const active=Math.min(7,Math.max(1,Math.round(current)));
  label.textContent=labels[active];statusNumber.textContent=String(active).padStart(2,'0');
  markers.forEach((g,i)=>g.classList.toggle('passed',tops[i+1]<scrollY+innerHeight*.48));
  const pulse=still?0:Math.sin(time*1.2)*.5+.5;
  cursor.setAttribute('r',String(3+pulse*1.5));
  if(innerWidth<=700){
   const hero=document.querySelector('.scene-copy-0').getBoundingClientRect();
   const pose=samplePose([{x:innerWidth*.66,y:hero.bottom-95,s:1},{x:innerWidth*.83,y:130,s:.67},{x:innerWidth*.85,y:125,s:.65},{x:innerWidth*.83,y:125,s:.6},{x:innerWidth*.85,y:110,s:.6},{x:innerWidth*.85,y:100,s:.62},{x:innerWidth*.83,y:130,s:.65},{x:innerWidth*.5,y:innerHeight*.45,s:1.25},{x:innerWidth*.5,y:innerHeight*.35,s:.9}],current);
   world.style.setProperty('--mobile-x',pose.x+'px');world.style.setProperty('--mobile-y',pose.y+'px');world.style.setProperty('--mobile-scale',String(pose.s));
  }
  world.style.setProperty('--world-opacity',still?'0':String(current<.1?1:samplePose([{o:1},{o:.34},{o:.33},{o:.45},{o:.23},{o:.21},{o:.25},{o:.35},{o:.1}],current).o));
  return {chapter:current,fault:activeIncident&&current>2.3&&current<4.15?1:0};
 }
 const observer=new ResizeObserver(invalidate);observer.observe(document.querySelector('main'));observer.observe(document.querySelector('footer'));
 window.addEventListener('resize',invalidate);
 measure();
 return{update,frame,invalidate,incident(active){activeIncident=active;update();}};
}
