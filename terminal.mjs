export const commandNames=['help','whoami','cat role.txt','echo $MISSION','ls ~/passions/','ls projects','ls skills','cat about.txt','uptime','ping reliability','projects','experience','lab','contact','sudo hire gurpreet','clear'];
export function resolveCommand(input){
 const command=String(input).trim().replace(/\s+/g,' ').toLowerCase();
 if(!command)return {lines:[]};
 const commands=new Map([
  ['help',{lines:['Available commands:',...commandNames.map(name=>'  '+name),'Use ↑ / ↓ for command history. Tab completes a unique command.']}],
  ['whoami',{lines:['Gurpreet Singh - Senior Staff SRE @ NatWest Group']}],
  ['cat role.txt',{lines:['Senior Staff SRE @ NatWest Group','SRE / Cloud / DevOps / Platform Engineering / AI Operations']}],
  ['echo $mission',{lines:['Building reliable platforms. Leading engineering teams.','Bringing human judgment to AI-driven operations.']}],
  ['ls ~/passions/',{lines:['Engineering / Open source / Writing / Systems thinking']}],
  ['ls projects',{lines:['Keel / AI SRE Platform','auto-agent-k8s','Loop Engineering','Smart LLM Gateway','Engineering Blueprints','Run projects to explore the full gallery.']}],
  ['ls skills',{lines:['SRE / Kubernetes / AWS / Azure / GCP / Terraform','GitOps / Observability / FinOps / DevSecOps','Agentic AI / Autonomous Operations / Engineering Leadership']}],
  ['cat about.txt',{lines:['14+ years across engineering, reliability and cloud platforms.','I build platforms, lead people and shape how AI operates systems.','Explore my experience, projects and engineering principles below.']}],
  ['uptime',{lines:['14+ years in engineering. Still building. Still learning.']}],
  ['ping reliability',{lines:['Portfolio shell ready. No production systems are connected.','Run lab to explore a simulated incident.']}],
  ['projects',{lines:['Opening selected projects.'],navigate:'#writing'}],
  ['experience',{lines:['Opening selected experience.'],navigate:'#work'}],
  ['lab',{lines:['Opening the interactive incident lab.'],navigate:'#lab'}],
  ['contact',{lines:['Let’s build something reliable together.'],navigate:'#contact'}],
  ['sudo hire gurpreet',{lines:['No sudo needed. Let’s start a conversation.'],navigate:'#contact'}],
  ['clear',{lines:[],clear:true}]
 ]);
 return commands.get(command)||{lines:['Command not found. Type help to see what you can explore.']};
}
