import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import type { StudioMaterials } from './materials'
import type { SceneTools, Triple } from './primitives'
import { buildGamesZone } from './zones/gamesZone'
import type { SceneDetailBudget } from './assets/detailBudget'
import { buildEntranceZone } from './zones/entranceZone'
import { buildWebZone } from './zones/webZone'

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
  const { box, group, addBox, addCylinder, point, tube, screen } = tools
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

/* architecture */
box('floor',[15.2,.20,10.8],[0,-.10,-1.2],M.floor);
box('leftWall',[.24,5.4,10.8],[-7.48,2.6,-1.2],M.white2);
box('rightWall',[.24,5.4,10.8],[7.48,2.6,-1.2],M.white2);
box('ceiling',[15.2,.16,10.8],[0,5.16,-1.2],M.white);

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

/* oak slat accent wall left-back */
for(let i=0;i<12;i++) box('slat',[.07,3.25,.16],[-7.30,2.65,-5.55+i*.34],M.oakLight,[0,0,0],false,true,.01);

/* acoustic ceiling baffles */
for(let i=0;i<7;i++){
  box('baffle',[1.35,.11,.40],[-4.6+i*1.53,4.93,-1.2],i%2?M.sage:M.white2,[0,0,.02*(i%2?1:-1)],false,false,.05)
}

/* track lights */
const track=group('TrackLights',[0,0,0]);
addBox(track,[9.5,.055,.07],[0,4.84,-2.1],M.graphite);
for(let i=0;i<7;i++){
  const x=-4.4+i*1.45;
  addCylinder(track,.07,.07,.24,[x,4.68,-2.1],M.graphite,[0,0,0],20);
  addCylinder(track,.11,.08,.20,[x,4.53,-2.1],M.black,[0,0,0],20);
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

/* left archive wall */
const archive=group('Archive',[-6.55,0,-4.10],[0,.04,0]);
for(let y=.45;y<=3.55;y+=.77) addBox(archive,[1.18,.065,2.45],[0,y,0],M.oak,[0,0,0],.02);
addBox(archive,[.08,3.75,2.45],[-.50,1.88,0],M.graphite);
addBox(archive,[.08,3.75,2.45],[.50,1.88,0],M.graphite);
for(let i=0;i<12;i++){
  const z=-.80+(i%3)*.80,y=.60+Math.floor(i/3)*.77;
  addBox(archive,[.66,.35,.54],[0,y,z],i%4===0?M.terracotta:(i%3===0?M.sage:M.graphite2),[0,0,0],.04)
}
/* retro CRT on side cabinet */
const crt=group('ArchiveCRT',[-5.05,0,-4.52],[0,.07,0]);
addBox(crt,[1.20,.78,.72],[0,1.03,0],M.white2,[0,0,0],.075);
const archiveScreen=screen(crt,.78,.46,[0,1.12,.38],'ARCHIVE','retired builds','#c88462');
addBox(crt,[1.30,.54,.80],[0,.42,0],M.oak,[0,0,0],.045);

const { webMainScreen, webSideScreen } = buildWebZone(M, tools, budget)

/* Project zone: wall-mounted board with a continuous workbench directly below it.
   The whole zone is flush to the right wall, leaving the center circulation clear. */
const proj=group('Projects',[6.82,0,.72],[0,-Math.PI/2,0]);
addBox(proj,[2.75,.15,.86],[0,.88,0],M.oakLight,[0,0,0],.045);
for(const x of [-1.16,1.16]) addBox(proj,[.085,.84,.085],[x,.42,-.28],M.graphite,[0,0,0],.016);
addBox(proj,[.72,.22,.46],[-.72,1.08,-.03],M.sage,[0,0,0],.035);
addBox(proj,[.58,.18,.40],[.05,1.06,-.03],M.terracotta,[0,0,0],.035);
addBox(proj,[.52,.08,.34],[.78,1.02,-.03],M.graphite2,[0,0,0],.025);

const board=group('ProjectBoard',[7.25,0,.72],[0,-Math.PI/2,0]);
addBox(board,[2.95,2.72,.075],[0,2.40,0],M.white,[0,0,0],.04);
const projectCardPositions=[
  [-.82,2.98], [.82,2.98],
  [-.82,2.02], [.82,2.02]
] as const;

/* Thin halo plates behind the images. They are invisible at rest and illuminate on hover. */
const projectCardFrames=projectCardPositions.map(([x,y])=>{
  const mat=new THREE.MeshBasicMaterial({
    color:0xc8e4d1,transparent:true,opacity:0,
    depthWrite:false,toneMapped:false
  });
  const frame=addBox(board,[1.105,.725,.018],[x,y,.036],mat,[0,0,0],.025);
  frame.castShadow=false;frame.receiveShadow=false;
  return frame
});
const projectCardMeshes=projectCardPositions.map(([x,y],i)=>{
  const card=addBox(board,[1.02,.64,.03],[x,y,.055],M.white2,[0,0,0],.02);
  card.userData.hoverFrame=projectCardFrames[i];
  card.userData.baseScale=new THREE.Vector3(1,1,1);
  return card
});
addBox(board,[2.12,.05,.026],[0,3.52,.060],M.graphite);

/* Lounge: deliberately placed against the left wall, clearly readable as a sofa.
   Separate base/frame, seat cushions, back cushions and armrests create a real furniture silhouette. */
box('loungeRug',[3.45,.028,2.55],[-5.25,.018,.82],M.rug,[0,0,0],false,true,.07);

const sofa=group('Lounge',[-6.58,0,.75],[0,-Math.PI/2,0]);
addBox(sofa,[2.55,.30,.92],[0,.31,0],M.graphite,[0,0,0],.13);            // base
addBox(sofa,[2.30,.26,.77],[0,.58,-.03],M.sage,[0,0,0],.12);             // seat cushion
addBox(sofa,[1.08,.23,.69],[-.58,.72,-.03],M.sage,[0,0,0],.11);          // left seat pad
addBox(sofa,[1.08,.23,.69],[.58,.72,-.03],M.sage,[0,0,0],.11);           // right seat pad
addBox(sofa,[1.05,.72,.20],[-.58,1.15,.31],M.sage,[.07,0,0],.11);        // back cushion
addBox(sofa,[1.05,.72,.20],[.58,1.15,.31],M.sage,[.07,0,0],.11);         // back cushion
addBox(sofa,[.20,.70,.92],[-1.20,.73,0],M.graphite,[0,0,0],.10);         // arms
addBox(sofa,[.20,.70,.92],[1.20,.73,0],M.graphite,[0,0,0],.10);
addBox(sofa,[.58,.20,.50],[-.47,.93,-.24],M.white,[0,0,.06],.09);        // pillow
addBox(sofa,[.55,.20,.48],[.49,.92,-.22],M.terracotta,[0,0,-.05],.09);

const coffee=group('Coffee',[-4.75,0,.78]);
addBox(coffee,[1.35,.09,.72],[0,.43,0],M.oakLight,[0,0,0],.07);
for(const x of [-.50,.50])for(const z of [-.25,.25]) addBox(coffee,[.05,.39,.05],[x,.20,z],M.graphite,[0,0,0],.014);
addBox(coffee,[.38,.028,.24],[-.20,.49,.02],M.white2,[0,.10,0],.014);
addCylinder(coffee,.085,.105,.15,[.30,.51,.01],M.white,[0,0,0],20);

/* Plants now frame the main desk/window composition instead of floating around the room. */
plant([-2.92,0,-4.92],.90);
plant([2.92,0,-4.92],.90);

/* wall art left/front */
for(let i=0;i<3;i++){
  const a=group('Art'+i,[-7.32,0,1.95+i*.92],[0,Math.PI/2,0]);
  addBox(a,[.70,.84,.06],[0,2.75,0],M.white,[0,0,0],.02);
  addBox(a,[.54,.68,.022],[0,2.75,.045],[M.terracotta,M.blue,M.sage][i],[0,0,0],.012)
}

/* realistic cable drops */
tube([[-.55,1.35,-4.05],[-.58,.90,-4.10],[-.35,.32,-4.18],[-.10,.08,-4.12]],.018,M.black);
tube([[5.07,1.20,-3.0],[5.14,.72,-3.05],[5.00,.18,-3.08]],.016,M.black);


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

/* Tasteful floor markers retained from v11. */
const marker = (position: Triple, color: number) => {
  const material = new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.18,roughness:.38,metalness:.32});
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(.13,.012,8,40),material);
  mesh.position.set(...position);mesh.rotation.x=Math.PI/2;scene.add(mesh);return mesh
};
marker([0,.03,-2.25],0x90a886);
marker([4.55,.03,-2.25],0x78a8b9);
marker([5.75,.03,.72],0xc88462);
marker([-5,.03,-3.55],0xa58357);

  return { gameMainScreen, gameLeftScreen, gameRightScreen, webMainScreen, webSideScreen, archiveScreen, projectCardFrames, projectCardMeshes }
}
