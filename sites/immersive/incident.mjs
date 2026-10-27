export const scenarios = {
 latency: {name:'Latency spike',signal:'API latency exceeds the service objective.',cause:'A downstream connection pool is saturated.',action:'Limit concurrency and scale the worker pool.',risk:'Scaling consumes additional capacity. Watch queue depth before increasing traffic.',node:'services',metric:'2.4 s',label:'API latency',healthy:'180 ms',impact:'API responses are slowing. Requests still reach the database.',events:['Latency burn-rate alert fires','Correlated traces identify a saturated worker pool','AI suggests bounded scaling; human review required']},
 region: {name:'Region outage',signal:'Health checks fail in the primary region.',cause:'The regional service plane is unreachable.',action:'Fail over traffic to the secondary region.',risk:'Confirm replica freshness and secondary capacity before routing writes.',node:'cloud',metric:'1 / 2',label:'Regions available',healthy:'2 / 2',impact:'Primary region unavailable. Secondary region is ready for a controlled failover.',events:['Regional health checks fail','Secondary-region capacity and replication require validation','AI suggests traffic failover; human review required']},
 deployment: {name:'Deployment failure',signal:'Error rate rises after a service release.',cause:'The new release fails readiness checks.',action:'Roll back to the last healthy release.',risk:'Check schema compatibility before rolling back. Keep the failing revision for investigation.',node:'platform',metric:'12.8%',label:'Request errors',healthy:'0.02%',impact:'A new service revision is unhealthy. Existing healthy replicas remain available.',events:['Post-deployment error-rate alert fires','Release change correlates with failing readiness checks','AI suggests rollback; human review required']}
};

Object.assign(scenarios.latency,{
 samples:[180,190,220,380,720,1300,1900,2400], unit:'ms',
 alternative:'Restart every service simultaneously.',
 blocked:'Blast-radius check failed. A fleet-wide restart removes healthy capacity and can amplify the queue. Try a bounded change instead.',
 passed:'Capacity check passed in this fictional environment. Scale the affected worker pool by one increment, then verify latency and queue depth.',
 lesson:'Correlate latency with saturation before scaling. Make the smallest reversible change and verify the user-facing signal.',
 logs:['INFO worker_pool active=18 limit=32','INFO worker_pool active=25 limit=32','WARN queue_depth=42 downstream_wait_ms=220','WARN connection_pool saturation=78%','WARN queue_depth=130 saturation=92%','ERROR acquire_connection timeout_ms=1300','ERROR api p95_ms=1900 queue_depth=210','ERROR api p95_ms=2400 pool_saturated=true'],
 trace:'edge 12ms > api 2400ms > worker_queue 2180ms > database 28ms\nDominant wait: worker queue. Database execution remains healthy.'
});
Object.assign(scenarios.region,{
 samples:[2,2,2,2,1,1,1,1], unit:'regions',
 alternative:'Force all writes to the secondary immediately.',
 blocked:'Replication gate failed. Forced writes before checking replica freshness risk inconsistent data. Validate readiness before shifting traffic.',
 passed:'Simulated readiness checks passed: secondary capacity available and replication caught up. Shift traffic progressively, then verify writes.',
 lesson:'Regional failover is also a data decision. Verify replica freshness, capacity and write ownership before moving traffic.',
 logs:['INFO primary health=ok secondary health=ok','INFO replication lag_ms=20','INFO secondary capacity=available','WARN primary health_probe timeout','ERROR primary health_probe consecutive_failures=3','WARN primary routing_weight=0','INFO secondary replica_caught_up=true','INFO secondary capacity_check=passed writes=held_for_approval'],
 trace:'edge > primary_region TIMEOUT\nedge > secondary_region 210ms READ-ONLY\nWrite traffic held until readiness and ownership are verified.'
});
Object.assign(scenarios.deployment,{
 samples:[.02,.02,.03,.7,2.1,5.3,9.2,12.8], unit:'% errors',
 alternative:'Retry the same release across every replica.',
 blocked:'Rollout gate failed. The new revision is already failing readiness checks. Expanding it increases impact without addressing the cause.',
 passed:'Rollback compatibility passed in this fictional environment. Restore the last healthy revision, then verify readiness and request errors.',
 lesson:'Treat release changes as evidence. Check rollback compatibility and preserve the failing revision for a blameless review.',
 logs:['INFO revision=v41 ready=6/6','INFO rollout revision=v42 started','WARN revision=v42 readiness=failed','WARN revision=v42 restart_count=3','ERROR request_errors=2.1%','ERROR request_errors=5.3% revision=v42','WARN rollout paused healthy_revision=v41','INFO schema_backward_compatible=true rollback_candidate=v41'],
 trace:'edge 9ms > service_v42 503 READINESS_FAILED\nedge 9ms > service_v41 172ms OK\nFailure correlates with revision v42. Prior revision is healthy.'
});
export const initialState=()=>({phase:'healthy',scenario:null});
export function transition(state,event,id){
 if(event==='reset') return initialState();
 if(event==='inject' && Object.hasOwn(scenarios,id)) return {phase:'detected',scenario:id};
 if(event==='review' && ['detected','investigating'].includes(state.phase)) return {...state,phase:'review',plan:'bounded',dryRun:null,acknowledged:false};
 if(state.phase!=='review') return state;
 if(event==='plan' && ['bounded','broad'].includes(id)) return {...state,plan:id,dryRun:null,acknowledged:false};
 if(event==='dry-run') return {...state,dryRun:state.plan==='bounded'?'pass':'blocked',acknowledged:false};
 if(event==='acknowledge' && state.dryRun==='pass') return {...state,acknowledged:id===true};
 if(event==='approve' && state.dryRun==='pass' && state.acknowledged) return {...state,phase:'recovered'};
 if(event==='investigate') return {phase:'investigating',scenario:state.scenario};
 return state;
}
export function evidenceFor(id,view,index){
 const scenario=scenarios[id];
 if(!scenario) return 'Choose a scenario to inspect its telemetry.';
 const n=Math.max(0,Math.min(7,Number.isFinite(Number(index))?Math.trunc(Number(index)):7));
 if(view==='logs') return 'SIMULATED LOGS / T+'+n+'m\n'+scenario.logs.slice(0,n+1).map((line,i)=>'T+'+i+'m  '+line).join('\n');
 if(view==='traces') return 'SIMULATED TRACE / T+'+n+'m\n'+(n<4?'edge > services > data\nBaseline healthy. Continue the replay to inspect the failure.':scenario.trace);
 return 'SIMULATED METRICS / T+'+n+'m\n'+scenario.label+': '+scenario.samples[n]+' '+scenario.unit+'\n'+(n<4?'Baseline or early warning. Compare the next samples.':scenario.signal);
}
