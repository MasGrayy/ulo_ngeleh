const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const gameOverDiv = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const scoreEl = document.getElementById("score");
const energyEl = document.getElementById("energy");
const rankEl = document.getElementById("rank");
const boostBtn = document.getElementById("boostBtn");

let player, enemies=[], foods=[];
let dir={x:1,y:0};
let score=0;
let energy=100;
let boost=false;
let alive=false;

let camera={x:0,y:0};

const worldSize=3000;

/* START */

startBtn.onclick = ()=>{
    menu.style.display="none";
    init();
};

function init(){
    player = { body:[{x:1500,y:1500}], length:20 };
    enemies=[];
    foods=[];
    score=0;
    energy=100;
    alive=true;

    for(let i=0;i<300;i++){
        foods.push({
            x:Math.random()*worldSize,
            y:Math.random()*worldSize
        });
    }

    for(let i=0;i<15;i++){
        enemies.push(createEnemy());
    }
}

function createEnemy(){
    return{
        body:[{x:Math.random()*worldSize,y:Math.random()*worldSize}],
        dir:{x:Math.random()-0.5,y:Math.random()-0.5},
        length:20+Math.random()*30,
        alive:true,
        color:"hsl("+Math.random()*360+",100%,50%)"
    };
}

/* CONTROL */

document.addEventListener("mousemove", e=>{
    let dx=e.clientX-canvas.width/2;
    let dy=e.clientY-canvas.height/2;
    let mag=Math.hypot(dx,dy);
    if(mag>0){
        dir.x=dx/mag;
        dir.y=dy/mag;
    }
});

boostBtn.onmousedown=()=>boost=true;
boostBtn.onmouseup=()=>boost=false;

/* UPDATE */

function update(){
if(!alive) return;

let head=player.body[0];
let speed=boost&&energy>0?4:2;

if(boost&&energy>0) energy-=0.4;
else if(energy<100) energy+=0.2;

let newHead={
    x:head.x+dir.x*speed,
    y:head.y+dir.y*speed
};

/* BATAS MAP */
newHead.x=Math.max(0,Math.min(worldSize,newHead.x));
newHead.y=Math.max(0,Math.min(worldSize,newHead.y));

player.body.unshift(newHead);
if(player.body.length>player.length) player.body.pop();

/* FOOD */
for(let i=foods.length-1;i>=0;i--){
    let f=foods[i];
    if(Math.hypot(f.x-newHead.x,f.y-newHead.y)<10){
        foods.splice(i,1);
        player.length+=3;
        score+=10;
    }
}

/* ENEMY */
enemies.forEach(enemy=>{
if(!enemy.alive) return;

let eHead=enemy.body[0];

let dx=newHead.x-eHead.x;
let dy=newHead.y-eHead.y;
let dist=Math.hypot(dx,dy);

if(dist>0 && dist<250){
    enemy.dir.x=dx/dist;
    enemy.dir.y=dy/dist;
}else if(Math.random()<0.02){
    enemy.dir.x=Math.random()-0.5;
    enemy.dir.y=Math.random()-0.5;
}

eHead.x+=enemy.dir.x*2;
eHead.y+=enemy.dir.y*2;

enemy.body.unshift({x:eHead.x,y:eHead.y});
if(enemy.body.length>enemy.length) enemy.body.pop();

/* COLLISION */
enemy.body.forEach(seg=>{
    if(Math.hypot(seg.x-newHead.x,seg.y-newHead.y)<8){
        gameOver();
    }
});
});

/* CAMERA SMOOTH */
camera.x += ((newHead.x - canvas.width/2) - camera.x) * 0.1;
camera.y += ((newHead.y - canvas.height/2) - camera.y) * 0.1;

/* RANK */
let bigger=enemies.filter(e=>e.length>player.length).length;
rankEl.innerText=bigger+1;

scoreEl.innerText=score;
energyEl.innerText=Math.floor(energy);
}

/* DRAW */

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.save();
ctx.translate(-camera.x,-camera.y);

/* GRID */
ctx.strokeStyle="rgba(255,255,255,0.05)";
for(let i=0;i<worldSize;i+=100){
    ctx.beginPath();
    ctx.moveTo(i,0);
    ctx.lineTo(i,worldSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i);
    ctx.lineTo(worldSize,i);
    ctx.stroke();
}

/* FOOD */
ctx.fillStyle="white";
foods.forEach(f=>{
    ctx.beginPath();
    ctx.arc(f.x,f.y,4,0,Math.PI*2);
    ctx.fill();
});

/* PLAYER */
ctx.fillStyle="#00ff88";
player.body.forEach(s=>{
    ctx.beginPath();
    ctx.arc(s.x,s.y,8,0,Math.PI*2);
    ctx.fill();
});

/* ENEMY */
enemies.forEach(enemy=>{
    ctx.fillStyle=enemy.color;
    enemy.body.forEach(s=>{
        ctx.beginPath();
        ctx.arc(s.x,s.y,8,0,Math.PI*2);
        ctx.fill();
    });
});

ctx.restore();
}

/* LOOP */

function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

/* GAME OVER */

function gameOver(){
alive=false;
gameOverDiv.style.display="flex";
finalScoreEl.innerText="Final Score: "+score;
}
