const $ = (q) => document.querySelector(q);
function closeModal(el){
  if(!el)return;
  if(el.id==='game')running=false;
  el.classList.remove('show'); el.setAttribute('aria-hidden','true');
  if(el.id==='game')document.body.classList.remove('game-open');
}
const modal = (id) => { closeModal($('.modal.show')); const el = $('#'+id); el.classList.add('show'); el.setAttribute('aria-hidden','false'); if(id==='game')document.body.classList.add('game-open'); };
document.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => modal(b.dataset.modal)));
document.querySelectorAll('.close').forEach(b => b.addEventListener('click', () => closeModal(b.closest('.modal'))));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {if(e.target===m)closeModal(m)}));

const canvas=$('#river-game'),ctx=canvas.getContext('2d');
let running=false,lane=2,score=0,rescued=0,lives=3,objects=[],speed=2.25,last=0,touchX=0,goal=16,spawnTimer=0,difficultyConfig;
const difficulties={
  tranquila:{goal:16,baseSpeed:1.25,step:0.18,maxSpeed:2.2,spawnEvery:760},
  movida:{goal:20,baseSpeed:1.6,step:0.23,maxSpeed:3,spawnEvery:670},
  torbellino:{goal:24,baseSpeed:1.95,step:0.28,maxSpeed:3.8,spawnEvery:590}
};
function drawDuck(x,y,s=1,orange='#ffd34d'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(20,93,120,.16)';ctx.beginPath();ctx.ellipse(0,23,34,6,0,0,7);ctx.fill();ctx.fillStyle=orange;ctx.beginPath();ctx.ellipse(-7,0,30,20,-.15,0,7);ctx.fill();ctx.beginPath();ctx.arc(12,-19,16,0,7);ctx.fill();ctx.fillStyle='#ff914d';ctx.beginPath();ctx.moveTo(25,-17);ctx.lineTo(42,-12);ctx.lineTo(25,-7);ctx.fill();ctx.fillStyle='#173a5e';ctx.beginPath();ctx.arc(18,-23,2.5,0,7);ctx.fill();ctx.restore()}
function object(o){ctx.save();ctx.translate(o.x,o.y);if(o.type==='baby'){drawDuck(0,0,.55)}else if(o.type==='log'){ctx.rotate(.12);ctx.fillStyle='#86543b';ctx.fillRect(-30,-12,60,24);ctx.fillStyle='#bd7b4c';ctx.beginPath();ctx.arc(-30,0,12,0,7);ctx.arc(30,0,12,0,7);ctx.fill()}else if(o.type==='lily'){ctx.fillStyle='#42a96d';ctx.beginPath();ctx.arc(0,0,19,.2,6);ctx.lineTo(0,0);ctx.fill();ctx.fillStyle='#ff8ba3';ctx.beginPath();ctx.arc(0,-5,7,0,7);ctx.fill()}else if(o.type==='fish'){ctx.fillStyle='#ff8668';ctx.beginPath();ctx.ellipse(0,0,18,10,0,0,7);ctx.moveTo(-16,0);ctx.lineTo(-29,-12);ctx.lineTo(-29,12);ctx.fill();ctx.fillStyle='#173a5e';ctx.beginPath();ctx.arc(8,-3,2,0,7);ctx.fill()}else{ctx.fillStyle='#fff2d0';ctx.fillRect(-28,-15,56,28);ctx.fillStyle='#fb745c';ctx.fillRect(-31,-18,62,7);ctx.fillStyle='#8e623e';ctx.fillRect(-18,13,5,12);ctx.fillRect(13,13,5,12)}ctx.restore()}
function addObject(){const stage=Math.floor(rescued/4),babyChance=Math.max(.3,.52-stage*.045),type=Math.random()<babyChance?'baby':['log','lily','fish','boat'][Math.floor(Math.random()*4)];objects.push({x:106+Math.floor(Math.random()*5)*142,y:-40,type})}
function frame(t){if(!running)return;const delta=Math.min(32,t-last||16);last=t;const stage=Math.floor(rescued/4);speed=Math.min(difficultyConfig.maxSpeed,difficultyConfig.baseSpeed+stage*difficultyConfig.step);ctx.clearRect(0,0,780,500);ctx.fillStyle='#46bcd0';ctx.fillRect(0,0,780,500);for(let i=0;i<10;i++){ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=3;ctx.beginPath();ctx.arc((i*103+t*.025)%800,(i*67)%500,25,0,Math.PI);ctx.stroke()}const targetX=106+lane*142;drawDuck(targetX,410,1.15,'#fff1c8');objects.forEach(o=>{o.y+=speed*delta/16;object(o);if(Math.abs(o.y-407)<34&&Math.abs(o.x-targetX)<47){if(o.type==='baby'){rescued++;score+=100;objects=objects.filter(n=>n!==o)}else{lives--;objects=objects.filter(n=>n!==o);if(!lives)endGame()}}});objects=objects.filter(o=>o.y<540);spawnTimer+=delta;while(spawnTimer>=difficultyConfig.spawnEvery){spawnTimer-=difficultyConfig.spawnEvery;addObject()}score+=.12*speed;$('.score b').textContent=Math.floor(score);$('.rescue b').textContent=rescued;$('.rescue-goal').textContent=`/${goal}`;$('.lives').textContent='♥'.repeat(lives)+'♡'.repeat(3-lives);if(rescued>=goal)endGame(true);requestAnimationFrame(frame)}
function showResult(win){const result=$('#result');$('#result-title').textContent=win?'¡Bahía a la vista!':'A remar una vez más';$('#result-message').textContent=win?`Rescataste a los ${goal} patitos y sumaste ${Math.floor(score)} puntos.`:`Rescataste ${rescued} patitos. Pipa te espera para intentarlo de nuevo.`;closeModal($('#game'));result.classList.add('show');result.setAttribute('aria-hidden','false');result.querySelector('.result-action').focus()}
function endGame(win=false){running=false;setTimeout(()=>showResult(win),100)}
function startGame(e){e.preventDefault();const difficulty=document.querySelector('input[name="difficulty"]:checked').value;difficultyConfig=difficulties[difficulty];goal=difficultyConfig.goal;speed=difficultyConfig.baseSpeed;lane=2;score=0;rescued=0;lives=3;objects=[];spawnTimer=0;last=0;$('.rescue-goal').textContent=`/${goal}`;running=true;modal('game');requestAnimationFrame(frame)}
$('#game-form').addEventListener('submit',startGame);window.addEventListener('keydown',e=>{if(!running)return;if(e.key==='ArrowLeft')lane=Math.max(0,lane-1);if(e.key==='ArrowRight')lane=Math.min(4,lane+1)});canvas.addEventListener('touchstart',e=>touchX=e.touches[0].clientX);canvas.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>30)lane=Math.max(0,Math.min(4,lane+(d>0?1:-1)))})

$('#result .result-action').addEventListener('click',()=>closeModal($('#result')));
