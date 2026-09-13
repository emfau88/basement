import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import type { StudioMaterials } from './materials'
import type { SceneTools, Triple } from './primitives'
import { buildGamesZone } from './zones/gamesZone'
import type { SceneDetailBudget } from './assets/detailBudget'
import { buildEntranceZone } from './zones/entranceZone'
import { buildWebZone } from './zones/webZone'
import { buildProjectsZone } from './zones/projectsZone'
import { buildArchiveZone } from './zones/archiveZone'

export interface StudioMeshes {
  gameMainScreen: THREE.Mesh
  gameLeftScreen: THREE.Mesh
  gameRightScreen: THREE.Mesh
  webMainScreen: THREE.Mesh
  webSideScreen: THREE.Mesh
  archiveScreen: THREE.Mesh
  projectCardFrames: THREE.Mesh[]
  projectCardMeshes: THREE.Mesh[]
}

function createSkyTexture(tools: SceneTools): THREE.CanvasTexture {
  return tools.canvasTexture('studio:sky', 1024, 512, (context, canvas) => {
    const gradient=context.createLinearGradient(0,0,0,canvas.height)
    gradient.addColorStop(0,'#9fbfc9');gradient.addColorStop(.52,'#d9e2df');gradient.addColorStop(1,'#f0e7d5')
    context.fillStyle=gradient;context.fillRect(0,0,canvas.width,canvas.height)
    context.fillStyle='rgba(255,255,255,.26)'
    context.beginPath();context.ellipse(780,110,120,42,0,0,Math.PI*2);context.fill()
    context.beginPath();context.ellipse(280,150,150,34,0,0,Math.PI*2);context.fill()
  })
}

export function buildStudioRoom(scene: THREE.Scene, M: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): StudioMeshes {
  RectAreaLightUniformsLib.init()
  const { box, group, addBox, addCylinder, point, tube } = tools
  const skyTexture = createSkyTexture(tools)
function plant(pos: Triple,scale=1){
  const g=group('Plant',pos);
  addCylinder(g,.26*scale,.33*scale,.48*scale,[0,.24*scale,0],M.terracotta,[0,0,0],28);
  const stemMat=new THREE.MeshStandardMaterial({color:0x53684f,roughness:.9});
  for(let i=0;i<5;i++){
    const a=(i/5)*Math.PI*2;
    const sx=Math.cos(a)*.12*scale, sz=Math.sin(a)*.12*scale;
    addCylinder(g,.018*scale,.026*scale,.9*scale,[sx,.78*scale,sz],stemMat,[0,0,-Math.cos(a)*.18],12);
    for(let j=0;j<3;j++){
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(.18*scale,...budget.plantLeafSegments),j%2?M.leaf:M.leaf2);
      leaf.scale.set(1.6,.52,.62);leaf.position.set(sx+Math.cos(a+j*.8)*.18*scale,.62*scale+j*.23*scale,sz+Math.sin(a+j*.8)*.18*scale);
      leaf.rotation.y=a+j*.7;leaf.castShadow=true;g.add(leaf);
    }
  }
  return g
}

/* shared architectural shell */
box('floor',[15.2,.20,10.8],[0,-.10,-1.2],M.floor);
box('leftWall',[.24,5.4,10.8],[-7.48,2.6,-1.2],M.plaster);
box('rightWall',[.24,5.4,10.8],[7.48,2.6,-1.2],M.plaster);
box('ceiling',[15.2,.16,10.8],[0,5.16,-1.2],M.white2);

/* continuous skirting and structural piers give the room believable construction depth */
box('leftSkirting',[.11,.20,10.45],[-7.32,.10,-1.2],M.graphite,[0,0,0],false,true,.025);
box('rightSkirting',[.11,.20,10.45],[7.32,.10,-1.2],M.graphite,[0,0,0],false,true,.025);
for(const z of [-5.78,-1.18,3.42]){
  // The middle left pier sat directly behind the Archive memorial and read as
  // an accidental rib through the screen and sideboard. The continuous wall
  // provides the required visual structure at this location.
  if(z!==-1.18) box('leftPier',[.20,4.82,.42],[-7.27,2.48,z],M.concreteDark,[0,0,0],true,true,.035);
  box('rightPier',[.20,4.82,.42],[7.27,2.48,z],M.concreteDark,[0,0,0],true,true,.035)
}

/* back wall structure around window */
box('backLow',[15.2,1.10,.24],[0,.55,-6.48],M.plaster);
box('backTop',[15.2,.60,.24],[0,4.86,-6.48],M.plaster);
box('backLeft',[2.5,3.8,.24],[-6.35,2.65,-6.48],M.plaster);
box('backRight',[2.5,3.8,.24],[6.35,2.65,-6.48],M.plaster);

/* huge window */
const skyMat=new THREE.MeshBasicMaterial({map:skyTexture,toneMapped:false});
box('sky',[10.25,3.55,.02],[0,2.70,-7.6],skyMat,[0,0,0],false,false);
box('windowGlass',[10.35,3.52,.035],[0,2.70,-6.34],M.glass,[0,0,0],false,false);
for(const x of [-5.12,-2.56,0,2.56,5.12]) box('mullion',[.055,3.55,.085],[x,2.70,-6.24],M.graphite,[0,0,0],false,false,.01);
box('windowTop',[10.35,.075,.09],[0,4.48,-6.24],M.graphite,[0,0,0],false,false,.01);
box('windowBottom',[10.35,.075,.09],[0,.93,-6.24],M.graphite,[0,0,0],false,false,.01);

/* city beyond */
const city=group('City',[0,0,-8.6]);
const cityMats=[
  new THREE.MeshStandardMaterial({color:0x8e9896,roughness:.86}),
  new THREE.MeshStandardMaterial({color:0xb0aaa0,roughness:.9}),
  new THREE.MeshStandardMaterial({color:0x7d8785,roughness:.84}),
  new THREE.MeshStandardMaterial({color:0xc1b8a9,roughness:.91})
];
let seed=17;
function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
for(let i=0;i<budget.cityBuildings;i++){
  const w=.45+rnd()*.9,h=.8+rnd()*2.8,d=.45+rnd()*.75,x=-7+rnd()*14,z=-1.2-rnd()*2.8;
  const m=addBox(city,[w,h,d],[x,h/2,z],cityMats[i%cityMats.length],[0,0,0],.02);
  m.castShadow=false;m.receiveShadow=false
}

/* clean recessed acoustic raft: the former timber slat field was visually noisy */
box('ceilingRaft',[10.4,.16,3.18],[0,5.02,-1.88],M.graphite,[0,0,0],false,false,.055);
const coveMaterial=new THREE.MeshBasicMaterial({color:0xffd69e,toneMapped:false,transparent:true,opacity:.42});
box('leftCove',[.055,.035,3.0],[-5.03,4.90,-1.88],coveMaterial,[0,0,0],false,false,.01);
box('rightCove',[.055,.035,3.0],[5.03,4.90,-1.88],coveMaterial,[0,0,0],false,false,.01);

/* track lights */
const track=group('TrackLights',[0,0,0]);
addBox(track,[9.45,.055,.07],[0,4.82,-2.08],M.black);
for(let i=0;i<7;i++){
  const x=-4.4+i*1.45;
  addCylinder(track,.06,.06,.20,[x,4.68,-2.08],M.graphite,[0,0,0],20);
  addCylinder(track,.105,.075,.22,[x,4.53,-2.08],M.black,[0,0,0],20);
}

/* rug */
box('rug',[5.7,.035,3.35],[0,.02,-2.20],M.rug,[0,0,0],false,true,.06);

const { gameMainScreen, gameLeftScreen, gameRightScreen } = buildGamesZone(M, tools, budget)
buildEntranceZone(M, tools, budget)

/* chair */
const chair=group('Chair',[0,0,-1.55],[0,.02,0]);
addBox(chair,[1.00,.15,.92],[0,.77,0],M.graphite,[0,0,0],.11);
addBox(chair,[1.00,1.16,.15],[0,1.43,.39],M.graphite,[.06,0,0],.11);
addCylinder(chair,.05,.05,.67,[0,.37,0],M.graphite2);
for(const [x,z] of [[.44,.36],[-.44,.36],[.44,-.36],[-.44,-.36]] as const) addBox(chair,[.50,.045,.07],[x*.52,.15,z*.52],M.graphite2,[0,Math.atan2(x,z),0],.02);

const { archiveScreen } = buildArchiveZone(M, tools, budget)

const { webMainScreen, webSideScreen } = buildWebZone(M, tools, budget)

const { projectCardFrames, projectCardMeshes } = buildProjectsZone(M, tools, budget)

/* Plants now frame the main desk/window composition instead of floating around the room. */
plant([-2.92,0,-4.92],.90);
plant([2.92,0,-4.92],.90);

/* realistic cable drops */
tube([[-.55,1.35,-4.05],[-.58,.90,-4.10],[-.35,.32,-4.18],[-.10,.08,-4.12]],.018,M.black);


/* lighting */
scene.add(new THREE.HemisphereLight(0xeaf2ee,0x8a7664,.68));

const sun=new THREE.DirectionalLight(0xffefd9,.82);
sun.position.set(-2.0,8.0,-1.0);
sun.castShadow=false;
scene.add(sun);

/* window fill */
const winLight=new THREE.RectAreaLight(0xd7e8e8,4.0,9.7,3.2);
winLight.position.set(0,2.75,-5.90);winLight.lookAt(0,2.0,0);scene.add(winLight);

/* ceiling area lights */
for(const x of [-3.4,0,3.4]){
  const l=new THREE.RectAreaLight(0xfff0d7,2.25,2.2,.7);
  l.position.set(x,4.78,-1.2);l.rotation.x=-Math.PI/2;scene.add(l)
}
/* practical glows */
if (budget.decorativeLights) {
  point(0xffd7a8,1.85,4.5,[-1.45,2.0,-2.95]);
  point(0x9bb5bd,1.65,4.5,[5.05,2.0,-2.65]);
}

/* dust motes */
function dustTexture(){
  const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');
  if(!x)throw new Error('Canvas 2D is unavailable');
  const g=x.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.25,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)
}
const dustGeo=new THREE.BufferGeometry(),dustCount=budget.dustParticles,dustPos=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){dustPos[i*3]=-6.8+Math.random()*13.6;dustPos[i*3+1]=.5+Math.random()*4.3;dustPos[i*3+2]=-5.8+Math.random()*8.6}
dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({map:dustTexture(),size:.045,transparent:true,opacity:.22,depthWrite:false,color:0xfff1d9,blending:THREE.AdditiveBlending}));
scene.add(dust);

  return { gameMainScreen, gameLeftScreen, gameRightScreen, webMainScreen, webSideScreen, archiveScreen, projectCardFrames, projectCardMeshes }
}
