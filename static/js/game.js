const $ = (q) => document.querySelector(q);
function closeModal(el){
  if(!el)return;
  if(el.id==='game') stopGame();
  el.classList.remove('show'); el.setAttribute('aria-hidden','true');
  if(el.id==='game')document.body.classList.remove('game-open');
}
const modal = (id) => { closeModal($('.modal.show')); const el = $('#'+id); el.classList.add('show'); el.setAttribute('aria-hidden','false'); if(id==='game')document.body.classList.add('game-open'); };
document.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => modal(b.dataset.modal)));
document.querySelectorAll('.close').forEach(b => b.addEventListener('click', () => closeModal(b.closest('.modal'))));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {if(e.target===m)closeModal(m)}));

const canvas=$('#river-game'),ctx=canvas.getContext('2d');
let running=false, paused=false, finished=false, lane=2, score=0, rescued=0, lives=3, objects=[], speed=2.25, last=0, touchX=0, goal=16, spawnTimer=0, elapsed=0, shield=0, combo=1, lastRescueAt=0, playerName='Pipa', difficultyConfig, gameMode='rescate', scene='rio';
const difficulties={
  tranquila:{goal:16,baseSpeed:1.25,step:.18,maxSpeed:2.2,spawnEvery:760},
  movida:{goal:20,baseSpeed:1.6,step:.23,maxSpeed:3,spawnEvery:670},
  torbellino:{goal:24,baseSpeed:1.95,step:.28,maxSpeed:3.8,spawnEvery:590}
};
const scenes={rio:{water:'#46bcd0',wave:'rgba(255,255,255,.2)',duck:'#fff1c8'},atardecer:{water:'#558eb6',wave:'rgba(255,205,132,.32)',duck:'#fff0c3'},noche:{water:'#174f79',wave:'rgba(183,230,243,.22)',duck:'#fff9d8'}};
function drawDuck(x,y,s=1,orange='#ffd34d'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(20,93,120,.16)';ctx.beginPath();ctx.ellipse(0,23,34,6,0,0,7);ctx.fill();ctx.fillStyle=orange;ctx.beginPath();ctx.ellipse(-7,0,30,20,-.15,0,7);ctx.fill();ctx.beginPath();ctx.arc(12,-19,16,0,7);ctx.fill();ctx.fillStyle='#ff914d';ctx.beginPath();ctx.moveTo(25,-17);ctx.lineTo(42,-12);ctx.lineTo(25,-7);ctx.fill();ctx.fillStyle='#173a5e';ctx.beginPath();ctx.arc(18,-23,2.5,0,7);ctx.fill();ctx.restore()}
function object(o){ctx.save();ctx.translate(o.x,o.y);if(o.type==='baby'){drawDuck(0,0,.55)}else if(o.type==='star'){ctx.fillStyle='#fff17a';ctx.font='34px sans-serif';ctx.textAlign='center';ctx.fillText('★',0,12)}else if(o.type==='shield'){ctx.strokeStyle='#d9ffff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,18,0,7);ctx.stroke();ctx.fillStyle='#83e3e1';ctx.font='19px sans-serif';ctx.textAlign='center';ctx.fillText('🫧',0,7)}else if(o.type==='log'){ctx.rotate(.12);ctx.fillStyle='#86543b';ctx.fillRect(-30,-12,60,24);ctx.fillStyle='#bd7b4c';ctx.beginPath();ctx.arc(-30,0,12,0,7);ctx.arc(30,0,12,0,7);ctx.fill()}else if(o.type==='lily'){ctx.fillStyle='#42a96d';ctx.beginPath();ctx.arc(0,0,19,.2,6);ctx.lineTo(0,0);ctx.fill();ctx.fillStyle='#ff8ba3';ctx.beginPath();ctx.arc(0,-5,7,0,7);ctx.fill()}else if(o.type==='fish'){ctx.fillStyle='#ff8668';ctx.beginPath();ctx.ellipse(0,0,18,10,0,0,7);ctx.moveTo(-16,0);ctx.lineTo(-29,-12);ctx.lineTo(-29,12);ctx.fill();ctx.fillStyle='#173a5e';ctx.beginPath();ctx.arc(8,-3,2,0,7);ctx.fill()}else{ctx.fillStyle='#fff2d0';ctx.fillRect(-28,-15,56,28);ctx.fillStyle='#fb745c';ctx.fillRect(-31,-18,62,7);ctx.fillStyle='#8e623e';ctx.fillRect(-18,13,5,12);ctx.fillRect(13,13,5,12)}ctx.restore()}
function addObject(){const stage=Math.floor(rescued/4), roll=Math.random();let type;if(roll<.09)type='star';else if(roll<.14)type='shield';else type=roll<Math.max(.42,.58-stage*.045)?'baby':['log','lily','fish','boat'][Math.floor(Math.random()*4)];objects.push({x:106+Math.floor(Math.random()*5)*142,y:-40,type})}
function collect(o){
  if(o.type==='baby'){
    combo=elapsed-lastRescueAt<2600?Math.min(combo+1,5):1; lastRescueAt=elapsed; rescued++; score+=100*combo;
  } else if(o.type==='star'){score+=250*combo;} else if(o.type==='shield'){shield=1;}
  else if(shield){shield=0;combo=1;} else {lives--;combo=1;if(!lives) endGame(false);}
}
function drawRiver(t){const palette=scenes[scene];ctx.clearRect(0,0,780,500);ctx.fillStyle=palette.water;ctx.fillRect(0,0,780,500);if(scene==='atardecer'){ctx.fillStyle='rgba(255,160,95,.34)';ctx.beginPath();ctx.arc(650,62,45,0,7);ctx.fill()}if(scene==='noche'){ctx.fillStyle='#fff4b3';for(let i=0;i<16;i++)ctx.fillRect((i*89)%770,(i*61)%230,2,2)}for(let i=0;i<10;i++){ctx.strokeStyle=palette.wave;ctx.lineWidth=3;ctx.beginPath();ctx.arc((i*103+t*.025)%800,(i*67)%500,25,0,Math.PI);ctx.stroke()}}
function updateHud(){ $('.score b').textContent=Math.floor(score);$('.rescue b').textContent=rescued;$('.rescue-goal').textContent=gameMode==='rescate'?`/${goal}`:'';$('.lives').textContent='♥'.repeat(lives)+'♡'.repeat(3-lives);$('.timer b').textContent=gameMode==='contrarreloj'?`${Math.max(0,Math.ceil(60-elapsed/1000))}s`:'∞';$('.combo b').textContent=`x${combo}`;$('.game-progress span').style.width=gameMode==='rescate'?`${Math.min(100,rescued/goal*100)}%`:`${Math.min(100,elapsed/60000*100)}%`; }
function frame(t){
  if(!running)return;
  if(paused){last=t;requestAnimationFrame(frame);return;}
  const delta=Math.min(32,t-last||16);last=t;elapsed+=delta;
  const stage=Math.floor(rescued/4);speed=Math.min(difficultyConfig.maxSpeed,difficultyConfig.baseSpeed+stage*difficultyConfig.step);drawRiver(t);
  const targetX=106+lane*142;drawDuck(targetX,410,1.15,scenes[scene].duck);if(shield){ctx.strokeStyle='#e2ffff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(targetX,397,43,0,7);ctx.stroke()}
  objects.forEach(o=>{o.y+=speed*delta/16;object(o);if(Math.abs(o.y-407)<34&&Math.abs(o.x-targetX)<47){collect(o);o.used=true;}});
  objects=objects.filter(o=>o.y<540&&!o.used);spawnTimer+=delta;while(spawnTimer>=difficultyConfig.spawnEvery){spawnTimer-=difficultyConfig.spawnEvery;addObject()}score+=.12*speed;updateHud();
  if(gameMode==='rescate'&&rescued>=goal)endGame(true);else if(gameMode==='contrarreloj'&&elapsed>=60000)endGame(lives>0);else if(running)requestAnimationFrame(frame);
}
function getScores(){try{const scores=JSON.parse(localStorage.getItem('pato-rescate-scores')||'[]');return Array.isArray(scores)?scores.map(item=>typeof item==='number'?{name:'Pipa',score:item,rescued:0}:item).filter(item=>Number.isFinite(item.score)):[]}catch{return []}}
function getStats(){try{return JSON.parse(localStorage.getItem('pato-rescate-stats')||'{"games":0,"ducks":0}')}catch{return {games:0,ducks:0}}}
function saveScore(){const entry={name:playerName,score:Math.floor(score),rescued};const scores=[...getScores(),entry].sort((a,b)=>b.score-a.score).slice(0,5);const stats=getStats();stats.games=(stats.games||0)+1;stats.ducks=(stats.ducks||0)+rescued;localStorage.setItem('pato-rescate-scores',JSON.stringify(scores));localStorage.setItem('pato-rescate-stats',JSON.stringify(stats));renderScores(scores)}
function renderScores(scores=getScores()){const stats=getStats(),list=$('#rank-list');$('#stat-games').textContent=stats.games||0;$('#stat-ducks').textContent=stats.ducks||0;$('#stat-best').textContent=(scores[0]?.score||0).toLocaleString('es-AR');list.replaceChildren();if(!scores.length){const empty=document.createElement('p');empty.textContent='Todavía no hay vueltas guardadas. ¡Empezá la primera!';list.append(empty);return}scores.forEach((entry,index)=>{const p=document.createElement('p'),rank=document.createElement('b'),name=document.createTextNode(`${entry.name} · ${entry.rescued} 🦆`),points=document.createElement('span');rank.textContent=`★ ${index+1}`;points.textContent=entry.score.toLocaleString('es-AR');p.append(rank,name,points);list.append(p)})}
function showResult(win){const result=$('#result');$('#result-title').textContent=win?'¡Bahía a la vista!':'A remar una vez más';const detail=gameMode==='contrarreloj'?`En 60 segundos rescataste ${rescued} patitos`:`Rescataste a ${rescued} de ${goal} patitos`;$('#result-message').textContent=`${detail} y sumaste ${Math.floor(score)} puntos.`;closeModal($('#game'));result.classList.add('show');result.setAttribute('aria-hidden','false');result.querySelector('.result-action').focus()}
function endGame(win=false){if(finished)return;finished=true;running=false;saveScore();setTimeout(()=>showResult(win),120)}
function stopGame(){running=false;paused=false;$('#game .pause-overlay').hidden=true;}
function togglePause(){if(!running)return;paused=!paused;const overlay=$('#game .pause-overlay');overlay.hidden=!paused;$('.pause-game').textContent=paused?'▶':'Ⅱ';}
function startGame(e){e.preventDefault();playerName=$('#player-name').value.trim().replace(/\s+/g,' ').slice(0,14)||'Pipa';$('#player-name').value=playerName;const difficulty=document.querySelector('input[name="difficulty"]:checked').value;gameMode=document.querySelector('input[name="mode"]:checked').value;scene=document.querySelector('input[name="scene"]:checked').value;difficultyConfig=difficulties[difficulty];goal=difficultyConfig.goal;speed=difficultyConfig.baseSpeed;lane=2;score=0;rescued=0;lives=3;objects=[];spawnTimer=0;last=0;elapsed=0;shield=0;combo=1;lastRescueAt=-3000;finished=false;paused=false;$('.pause-game').textContent='Ⅱ';updateHud();running=true;modal('game');requestAnimationFrame(frame)}
$('#game-form').addEventListener('submit',startGame);$('.pause-game').addEventListener('click',togglePause);$('#game .pause-overlay').addEventListener('click',togglePause);
function moveToTappedLane(clientX){const bounds=canvas.getBoundingClientRect();lane=Math.max(0,Math.min(4,Math.floor((clientX-bounds.left)/bounds.width*5)));}
window.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=$('.modal.show');if(open)closeModal(open);return}if(!running)return;if(e.key===' '){e.preventDefault();togglePause()}if(!paused&&e.key==='ArrowLeft')lane=Math.max(0,lane-1);if(!paused&&e.key==='ArrowRight')lane=Math.min(4,lane+1)});canvas.addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});canvas.addEventListener('touchend',e=>{if(paused)return;const clientX=e.changedTouches[0].clientX,d=clientX-touchX;if(Math.abs(d)>30)lane=Math.max(0,Math.min(4,lane+(d>0?1:-1)));else moveToTappedLane(clientX);});
$('#result .result-action').addEventListener('click',()=>closeModal($('#result')));renderScores();
