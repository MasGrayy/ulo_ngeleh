window.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const energyEl = document.getElementById("energy");
const boostBtn = document.getElementById("boostBtn");
const skinSelect = document.getElementById("skinSelect");

const joy = document.getElementById("joystick");
const stick = document.getElementById("stick");

/* ================= DEVICE ================= */
if (window.matchMedia("(pointer: coarse)").matches) {
    joy.style.display = "block";
}

/* ================= CANVAS ================= */
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ================= GAME DATA ================= */
let player = [];
let bots = [];
let foods = [];
let dir = {x:1,y:0};
let score = 0;
let energy = 100;
let boost = false;
let alive = false;
let camera = {x:0,y:0};
const worldSize = 2000;

/* ================= START ================= */
startBtn.onclick = () => {

    player = [{x:1000,y:1000}];
    bots = [];
    foods = [];
    score = 0;
    energy = 100;
    alive = true;

    for(let i=0;i<200;i++){
        foods.push({
            x:Math.random()*worldSize,
            y:Math.random()*worldSize
        });
    }

    for(let i=0;i<3;i++){
        bots.push({
            body:[{x:Math.random()*worldSize,y:Math.random()*worldSize}],
            dir:{x:1,y:0},
            color:["#ff00ff","#00ffff","#ffaa00"][i]
        });
    }

    menu.style.display="none";
};

/* ================= PLAYER CONTROL ================= */
document.addEventListener("mousemove", e=>{
    if(!alive) return;
    let dx=e.clientX-window.innerWidth/2;
    let dy=e.clientY-window.innerHeight/2;
    let mag=Math.hypot(dx,dy);
    if(mag>0){
        dir.x=dx/mag;
        dir.y=dy/mag;
    }
});

/* ================= JOYSTICK ULTRA SMOOTH ================= */

if (window.matchMedia("(pointer: coarse)").matches) {
    joy.style.display = "block";
}

let dragging = false;
let inputX = 1;
let inputY = 0;

joy.addEventListener("pointerdown", e => {
    if (!alive) return;
    dragging = true;
    joy.setPointerCapture(e.pointerId);
});

joy.addEventListener("pointermove", e => {
    if (!dragging || !alive) return;

    const rect = joy.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2;
    let y = e.clientY - rect.top - rect.height / 2;

    const max = rect.width / 2;
    const dist = Math.hypot(x, y);

    if (dist > max) {
        x = (x / dist) * max;
        y = (y / dist) * max;
    }

    stick.style.left = (x + rect.width / 2 - 30) + "px";
    stick.style.top = (y + rect.height / 2 - 30) + "px";

    inputX = x / max;
    inputY = y / max;
});

joy.addEventListener("pointerup", () => {
    dragging = false;
    stick.style.left = "30px";
    stick.style.top = "30px";
});
/* ================= BOT AI ================= */
function updateBots(){
    bots.forEach(bot=>{
        let head=bot.body[0];

        let nearest=null;
        let min=Infinity;

        foods.forEach(f=>{
            let d=Math.hypot(f.x-head.x,f.y-head.y);
            if(d<min){
                min=d;
                nearest=f;
            }
        });

        if(nearest){
            let dx=nearest.x-head.x;
            let dy=nearest.y-head.y;
            let mag=Math.hypot(dx,dy);
            bot.dir.x=dx/mag;
            bot.dir.y=dy/mag;
        }

        let newHead={
            x:head.x+bot.dir.x*2,
            y:head.y+bot.dir.y*2
        };

        bot.body.unshift(newHead);

        if(bot.body.length>30){
            bot.body.pop();
        }
    });
}

/* ================= UPDATE ================= */
function update(){
if(!alive) return;

let head=player[0];
let speed=(boost && energy>0)?4:2;

if(boost && energy>0) energy-=0.5;
else if(energy<100) energy+=0.2;

let newHead={
    x:head.x+dir.x*speed,
    y:head.y+dir.y*speed
};

player.unshift(newHead);

for(let i=foods.length-1;i>=0;i--){
    if(Math.hypot(foods[i].x-newHead.x,foods[i].y-newHead.y)<12){
        foods.splice(i,1);
        score+=10;
    }
}

if(player.length>score/10+20) player.pop();

camera.x=newHead.x-window.innerWidth/2;
camera.y=newHead.y-window.innerHeight/2;

scoreEl.textContent=score;
energyEl.textContent=Math.floor(energy);

updateBots();
}

/* ================= DRAW ================= */
function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
if(!alive) return;

/* FOOD */
foods.forEach(f=>{
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(f.x-camera.x,f.y-camera.y,4,0,Math.PI*2);
    ctx.fill();
});

/* PLAYER */
drawSnake(player,"#00ff88");

/* BOTS */
bots.forEach(bot=>{
    drawSnake(bot.body,bot.color);
});
}

function drawSnake(body,color){
    if(body.length>1){
        ctx.lineWidth=16;
        ctx.lineCap="round";
        ctx.beginPath();
        body.forEach((s,i)=>{
            let x=s.x-camera.x;
            let y=s.y-camera.y;
            if(i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        });
        ctx.strokeStyle=color;
        ctx.stroke();
    }

    let head=body[0];
    let hx=head.x-camera.x;
    let hy=head.y-camera.y;

    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(hx,hy,10,0,Math.PI*2);
    ctx.fill();
}

/* ================= LOOP ================= */
function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

});


