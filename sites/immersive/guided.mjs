import {initialState,transition} from './incident.mjs';
export const newJourney=(scenario='deployment')=>({step:0,incident:transition(initialState(),'inject',scenario),diagnosis:null,attempts:0});
export function journeyAction(journey,event,value){
 if(event==='scenario')return newJourney(value);
 if(event==='diagnosis'&&journey.step===1)return {...journey,diagnosis:value,attempts:journey.attempts+1};
 if(event==='next'&&journey.step===0)return {...journey,step:1};
 if(event==='next'&&journey.step===1&&journey.diagnosis==='correlated')return {...journey,step:2,incident:transition(journey.incident,'review')};
 if(event==='back'&&journey.step>0&&journey.step<3)return {...journey,step:journey.step-1};
 if(journey.step===2){const incident=transition(journey.incident,event,value);return {...journey,incident,step:incident.phase==='recovered'?3:2};}
 return journey;
}
