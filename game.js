const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const gameOverDiv = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const leadersEl = document.getElementById("leaders");

const scoreEl = document.getElementById("score");
const energyEl = document.getElementById("energy");
const rankEl = document.getElementById("rank");
const boostBtn = document.getElementById("boostBtn");
const coinCountEl = document.getElementById("coinCount");

const skinBtns = document.querySelectorAll(".skinBtn");

let coins = 0;
let selectedSkin = "green";
let unlocked = {green:true, blue:true};

skinBtns.forEach(btn=>{
    btn.onclick = ()=>{
        let skin = btn.dataset.skin;
        let cost = btn.dataset.cost;

        if(cost && !unlocked[skin]){
            if(coins >= cost){
                coins -= cost;
                unlocked[skin] = true;
                alert("Skin unlocked!");
            } else {
                alert("Not enough coins!");
                return;
            }
        }
        selectedSkin = skin;
        coinCountEl.innerText = coins;
    };
});

let player, enemies=[], foods=[];
let dir={x:1,y:0};
let score=0, energy=100;
let alive=false;

let camera={x:0,y:0};
const worldSize=4000;

/* START */

startBtn.onclick=()=>{
    menu.style.display="none";
    init();
};

function init(){
    player={body:[{x:2000,y:2000}], length:20};
    enemies=[];
    foods=[];
    score=0;
    energy=100;
    alive=true;

    for(let i=0;i<400;i++){
        foods.push({x:Math.random()*worldSize,y:Math.random()*worldSize});
    }

    for(let i=0;i<25;i++){
        enemies.push(createEnemy());
    }
}

function createEnemy(){
    return{
        body:[{x:Math.random()*worldSize,y:Math.random()*worldSize}],
        dir:{x:Math.random()-0.5,y:Math.random()-0.5},
        length:20+Math.random()*50,
        color:"hsl("+Math.random()*360+",100%,50%)",
        alive:true
    };
}

/* CONTROL */

document.addEventListener("mousemove",e=>{
    let dx=e.clientX-canvas.width/2;
    let dy=e.clientY-canvas.height/2;
    let mag=Math.hypot(dx,dy);
    if(mag>0){ dir.x=dx/mag; dir.y=dy/mag; }
});

boostBtn.onmousedown=()=>boost=true;
boostBtn.onmouseup=()=>boost=false;
let boost=false;

/* UPDATE */

function update(){
if(!alive) return;

let head=player.body[0];
let speed=boost&&energy>0?4:2;

if(boost&&energy>0) energy-=0.4;
else if(energy<100) energy+=0.2;

let newHead={x:head.x+dir.x*speed,y:head.y+dir.y*speed};
player.body.unshift(newHead);
if(player.body.length>player.length) player.body.pop();

/* FOOD */
foods.forEach((f,i)=>{
    if(Math.hypot(f.x-newHead.x,f.y-newHead.y)<10){
        foods.splice(i,1);
        player.length+=3;
        score+=10;
        coins+=1;
    }
});

/* AI */
enemies.forEach(enemy=>{
if(!enemy.alive) return;

let eHead=enemy.body[0];

/* AI chase player */
let dx=newHead.x-eHead.x;
let dy=newHead.y-eHead.y;
let dist=Math.hypot(dx,dy);

if(dist<300){
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

/* collide player */
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
let bigger=enemies.filter(e=>e.alive&&e.length>player.length).length;
rankEl.innerText=bigger+1;

scoreEl.innerText=score;
energyEl.innerText=Math.floor(energy);
coinCountEl.innerText=coins;

updateLeaderboard();
}

/* DRAW */

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.save();
ctx.translate(-camera.x,-camera.y);

/* grid */
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

/* food */
ctx.fillStyle="white";
foods.forEach(f=>{
ctx.beginPath();
ctx.arc(f.x,f.y,4,0,Math.PI*2);
ctx.fill();
});

/* player */
player.body.forEach(s=>{
if(selectedSkin==="rainbow")
ctx.fillStyle="hsl("+(Date.now()/10%360)+",100%,50%)";
else if(selectedSkin==="gold")
ctx.fillStyle="gold";
else if(selectedSkin==="blue")
ctx.fillStyle="#00aaff";
else
ctx.fillStyle="#00ff88";

ctx.beginPath();
ctx.arc(s.x,s.y,8,0,Math.PI*2);
ctx.fill();
});

/* enemies */
enemies.forEach(enemy=>{
if(!enemy.alive) return;
ctx.fillStyle=enemy.color;
enemy.body.forEach(s=>{
ctx.beginPath();
ctx.arc(s.x,s.y,8,0,Math.PI*2);
ctx.fill();
});
});

ctx.restore();
}

function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

/* LEADERBOARD */

function updateLeaderboard(){
let arr=[...enemies.map(e=>e.length),player.length];
arr.sort((a,b)=>b-a);
leadersEl.innerHTML=arr.slice(0,5).map((l,i)=>`${i+1}. ${Math.floor(l)}`).join("<br>");
}

/* GAME OVER */

function gameOver(){
alive=false;
gameOverDiv.style.display="flex";
finalScoreEl.innerText="Final Score: "+score;
}
