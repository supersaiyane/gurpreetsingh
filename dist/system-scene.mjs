import * as THREE from './vendor/three.module.min.js';
import {samplePose} from './page-journey.mjs';

const clamp=v=>Math.max(0,Math.min(1,v));
const ease=(a,b,p)=>{const v=clamp((p-a)/(b-a));return v*v*(3-2*v);};
const lerp=(a,b,t)=>a+(b-a)*t;

// A real-time sculptural system: three interdependent orbital paths surround a live core.
// It is decorative. All narrative content, navigation and controls live outside WebGL.
export function createSystemScene(canvas){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.1,80);
 camera.position.set(0,0,10);
 const root=new THREE.Group();scene.add(root);
 const system=new THREE.Group();root.add(system);
 const hemisphere=new THREE.HemisphereLight(0xb9d6ff,0x10172a,3.4);scene.add(hemisphere);
 const key=new THREE.DirectionalLight(0xe6f0ff,5);key.position.set(-3,5,6);scene.add(key);
 const rim=new THREE.PointLight(0x589cff,35,20,2);rim.position.set(4,1,-1);scene.add(rim);
 const fill=new THREE.PointLight(0xffffff,20,20,2);fill.position.set(-3,-1,4);scene.add(fill);
 const metal=new THREE.MeshPhysicalMaterial({color:0x8fa4c2,metalness:.66,roughness:.22,clearcoat:1,clearcoatRoughness:.16});
 const lightMetal=new THREE.MeshPhysicalMaterial({color:0xc3d5ef,metalness:.53,roughness:.18,clearcoat:1});
 const graphite=new THREE.MeshPhysicalMaterial({color:0x253c60,metalness:.6,roughness:.27,clearcoat:1});
 const uniforms={uTime:{value:0},uProgress:{value:0},uLight:{value:0},uFault:{value:0}};
 const coreMaterial=new THREE.ShaderMaterial({
  uniforms,
  vertexShader:`
   varying vec3 vNormal; varying vec3 vWorld; varying vec3 vPosition;
   uniform float uTime; uniform float uProgress;
   void main(){
    vec3 p=position;
    float wave=sin(p.x*4.0+uTime*.28)*sin(p.y*3.0-uTime*.21)*sin(p.z*3.0+uTime*.16);
    p+=normal*wave*.065;
    vec4 world=modelMatrix*vec4(p,1.0);vWorld=world.xyz;
    vNormal=normalize(mat3(modelMatrix)*normal);vPosition=position;
    gl_Position=projectionMatrix*viewMatrix*world;
   }`,
  fragmentShader:`
   varying vec3 vNormal; varying vec3 vWorld; varying vec3 vPosition;
   uniform float uTime; uniform float uProgress; uniform float uLight; uniform float uFault;
   void main(){
    vec3 n=normalize(vNormal),v=normalize(cameraPosition-vWorld);
    float fres=pow(1.0-max(0.0,dot(n,v)),2.2);
    float key=pow(max(0.0,dot(reflect(-normalize(vec3(-.5,1.0,1.5)),n),v)),34.0);
    float secondary=pow(max(0.0,dot(reflect(-normalize(vec3(1.0,-.4,.5)),n),v)),8.0);
    float contour=sin(vPosition.y*23.0+sin(vPosition.x*5.0+uTime*.15)*2.3+sin(vPosition.z*5.0)*2.0);
    contour=smoothstep(.89,1.0,contour);
    vec3 deep=mix(vec3(.035,.07,.14),vec3(.20,.32,.49),uLight);
    vec3 silver=vec3(.65,.80,1.0);
    vec3 col=deep+silver*fres*.75+silver*key*1.6+vec3(.12,.28,.5)*secondary;
    col+=silver*contour*.12*(.25+fres);
    col+=vec3(.06,.15,.27)*pow(max(0.0,n.y),2.0);
    col=mix(col,col*vec3(1.9,1.1,.35)+vec3(.12,.045,.0)*fres,uFault*.8);
    gl_FragColor=vec4(col,1.0);
   }`
 });
 const core=new THREE.Mesh(new THREE.SphereGeometry(1.08,80,48),coreMaterial);system.add(core);
 const coreShell=new THREE.Mesh(new THREE.IcosahedronGeometry(1.13,2),new THREE.MeshBasicMaterial({color:0x9dbff0,wireframe:true,transparent:true,opacity:.065}));system.add(coreShell);

 // Bands have actual thickness, reflective faces and luminous inner rails.
 const orbitConfigs=[{radius:1.80,angle:[.48,.12,-.55]},{radius:2.15,angle:[1.18,-.35,.57]},{radius:2.48,angle:[.70,.65,.15]}];
 const orbits=[];
 for(let i=0;i<orbitConfigs.length;i++){
  const config=orbitConfigs[i],group=new THREE.Group();system.add(group);
  const band=new THREE.Mesh(new THREE.TorusGeometry(config.radius,.062+i*.008,12,160),i===1?lightMetal:metal);
  band.scale.z=.65;group.add(band);
  const innerRail=new THREE.Mesh(new THREE.TorusGeometry(config.radius-.05,.012,6,160),new THREE.MeshBasicMaterial({color:0xc8e5ff}));group.add(innerRail);
  const dimRail=new THREE.Mesh(new THREE.TorusGeometry(config.radius+.065,.005,4,160),new THREE.MeshBasicMaterial({color:0x538dc5,transparent:true,opacity:.65}));group.add(dimRail);
  // Small satellites make relative motion and depth legible without labels on the object.
  const satellites=[];
  for(let j=0;j<3;j++){
   const g=new THREE.Group();
   const body=new THREE.Mesh(new THREE.OctahedronGeometry(j===0?.095:.055,0),j===0?lightMetal:graphite);g.add(body);
   const dot=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshBasicMaterial({color:0xe5f2ff}));dot.position.z=.08;g.add(dot);group.add(g);satellites.push(g);
  }
  const ticks=new THREE.Group();
  const tickMaterial=new THREE.MeshBasicMaterial({color:0x6c8cb6,transparent:true,opacity:.45});
  for(let n=0;n<64;n++){
   const a=n/64*Math.PI*2;
   const tick=new THREE.Mesh(new THREE.BoxGeometry(.006,n%4===0?.07:.025,.004),tickMaterial);
   tick.position.set(Math.cos(a)*(config.radius+.13),Math.sin(a)*(config.radius+.13),0);tick.rotation.z=a-Math.PI/2;ticks.add(tick);
  }
  group.add(ticks);orbits.push({group,satellites,config,index:i});
 }
 // Translucent sprite light produces atmospheric depth; it never covers the text column.
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;
 const glowContext=glowCanvas.getContext('2d');
 const gradient=glowContext.createRadialGradient(64,64,0,64,64,64);
 gradient.addColorStop(0,'rgba(130,188,255,.65)');gradient.addColorStop(.22,'rgba(63,128,220,.22)');gradient.addColorStop(1,'rgba(20,65,130,0)');
 glowContext.fillStyle=gradient;glowContext.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(glowCanvas);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:0x6faaff,transparent:true,opacity:.23,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(11,11,1);halo.position.z=-2;root.add(halo);
 const sparkMaterial=new THREE.SpriteMaterial({map:texture,color:0xe6f3ff,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
 const sparks=[];
 for(let i=0;i<7;i++){const sprite=new THREE.Sprite(sparkMaterial);sprite.scale.setScalar(i===0?.8:.28);system.add(sprite);sparks.push(sprite);}
 // Stars have bounded deterministic positions. Foreground points move faster during the camera passage.
 const count=innerWidth<=700?180:500,positions=new Float32Array(count*3);
 const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<count;i++){positions[i*3]=(rand(i+1)-.5)*25;positions[i*3+1]=(rand(i+831)-.5)*15;positions[i*3+2]=(rand(i+419)-.5)*20;}
 const pointGeometry=new THREE.BufferGeometry();pointGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const starMaterial=new THREE.PointsMaterial({color:0x93b7e2,size:.015,transparent:true,opacity:.4,sizeAttenuation:true,depthWrite:false});
 const stars=new THREE.Points(pointGeometry,starMaterial);scene.add(stars);
 const debris=[];
 for(let i=0;i<20;i++){
  const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.015+rand(i+53)*.028,0),graphite);
  const a=rand(i+34)*Math.PI*2,r=3+rand(i+66)*1.8;
  mesh.position.set(Math.cos(a)*r,Math.sin(a)*r,(rand(i+7)-.5)*3);system.add(mesh);debris.push(mesh);
 }
 let mobile=false,w=1,h=1,previousTheme=null;
 const pointer={x:0,y:0},targetPointer={x:0,y:0};
 function resize(width,height){w=width;h=height;mobile=w<=700;renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.7));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function render({progress:p,time:t,light,still,chapter=0,fault=0}){
  const open=ease(.17,.58,p)*(1-ease(6,7,chapter)),focus=ease(.65,1,p)*(1-ease(6,7,chapter));
  uniforms.uFault.value=lerp(uniforms.uFault.value,fault,.06);
  uniforms.uTime.value=t;uniforms.uProgress.value=p;uniforms.uLight.value=light?1:0;
  if(previousTheme!==light){
   previousTheme=light;
   halo.material.opacity=light?.07:.23;starMaterial.color.set(light?0x356698:0x93b7e2);starMaterial.opacity=light?.23:.4;
   metal.color.set(light?0x728ca9:0x8fa4c2);lightMetal.color.set(light?0xa8bdd5:0xc3d5ef);
   renderer.toneMappingExposure=light?1.05:1.25;
  }
  pointer.x=lerp(pointer.x,still?0:targetPointer.x,.035);pointer.y=lerp(pointer.y,still?0:targetPointer.y,.035);
  const origin={x:mobile?.38:2.55,y:mobile?lerp(-2.3,-1.3,open):.02,s:mobile?.50:1,rx:0,ry:0};
  const poses=mobile?[
   origin,{x:.7,y:1.6,s:.28,rx:.5,ry:.6},{x:.8,y:1.6,s:.24,rx:.2,ry:1.2},
   {x:.5,y:1.8,s:.28,rx:.4,ry:1.7},{x:.8,y:1.9,s:.25,rx:.6,ry:2.3},
   {x:-.8,y:1.8,s:.24,rx:.3,ry:2.7},{x:.7,y:1.5,s:.26,rx:.1,ry:3.2},
   {x:0,y:.1,s:.68,rx:0,ry:3.6},{x:0,y:1,s:.4,rx:0,ry:4}
  ]:[
   origin,{x:3.1,y:1.25,s:.42,rx:.25,ry:.7},{x:3.35,y:1,s:.4,rx:.15,ry:1.3},
   {x:3.2,y:.9,s:.43,rx:.4,ry:1.8},{x:3.7,y:1.2,s:.32,rx:.3,ry:2.4},
   {x:-3.7,y:.9,s:.35,rx:.15,ry:2.9},{x:-2.8,y:.7,s:.38,rx:.1,ry:3.3},
   {x:0,y:.15,s:1.13,rx:0,ry:3.7},{x:0,y:1.1,s:.8,rx:0,ry:4.1}
  ];
  const pose=samplePose(poses,chapter);
  root.position.set(pose.x,pose.y,0);root.scale.setScalar(pose.s);root.rotation.set(pose.rx,pose.ry,0);
  // The camera approaches and passes around the core over the pinned chapter.
  camera.position.set(Math.sin(p*1.3)*.45+pointer.x*.14,-.04+pointer.y*.12,10-open*.9-focus*.6);
  camera.lookAt(0,0,0);
  system.rotation.set(.10+open*.35+pointer.y*.08,-.15+open*.7+pointer.x*.12,-.16+focus*.12);
  system.position.z=focus*.25;
  core.scale.setScalar(1-focus*.12);
  core.rotation.y=t*.07+p*.7;coreShell.rotation.copy(core.rotation);
  for(const orbit of orbits){
   const{group,config,index:i,satellites}=orbit;
   group.rotation.set(config.angle[0]+open*(i-1)*.5+focus*.25,config.angle[1]+t*(i%2?-.035:.028)+p*.65,config.angle[2]+t*.025*(i%2?-1:1));
   group.position.y=(i-1)*open*.62;
   group.position.z=focus*(i-1)*.34;
   group.scale.setScalar(1+open*.16-focus*.08);
   satellites.forEach((satellite,j)=>{const a=t*(.15+i*.035)+j*Math.PI*2/3+i;satellite.position.set(Math.cos(a)*config.radius,Math.sin(a)*config.radius,0);satellite.rotation.z=a;});
  }
  sparks.forEach((spark,i)=>{
   const a=t*(.12+(i%3)*.025)+i*.9,r=orbitConfigs[i%3].radius;
   // Positions follow the actual orbit's local coordinate frame.
   const v=new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0);orbits[i%3].group.localToWorld(v);system.worldToLocal(v);spark.position.copy(v);
   spark.material.opacity=light?.35:.8;
  });
  debris.forEach((mesh,i)=>{mesh.rotation.x=t*.04+i;mesh.rotation.y=t*.06;});
  stars.rotation.y=p*.08+t*.0015;stars.position.z=p*.9;
  renderer.render(scene,camera);
 }
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.add('scene-fallback');});
 canvas.addEventListener('webglcontextrestored',()=>document.body.classList.remove('scene-fallback'));
 return{resize,render,pointer(x,y){targetPointer.x=x;targetPointer.y=y;}};
}
