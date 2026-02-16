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
function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ================= GAME VAR ================= */
let snake=[];
let bots=[];
let foods=[];
let dir={x:1,y:0};
let score=0;
let energy=100;
let boost=false;
let alive=false;

let camera={x:0,y:0};
const worldSize=2000;

let currentSkin="green";

const skins={
    green:{head:"#b4ff4a",body:"#00ff88"},
    blue:{head:"#66ccff",body:"#0099ff"},
    red:{head:"#ff6666",body:"#ff0000"},
    gold:{head:"#ffe066",body:"#ffaa00"}
};

/* ================= START ================= */
startBtn.onclick = () => {

    currentSkin = skinSelect.value;

    snake=[{x:1000,y:1000}];
    bots=[];
    foods=[];
    score=0;
    energy=100;
    alive=true;

    // spawn food
    for(let i=0;i<200;i++){
        foods.push({
            x:Math.random()*worldSize,
            y:Math.random()*worldSize
        });
    }

    // spawn bots
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

/* ================= BOOST ================= */
boostBtn.onmousedown=()=>boost=true;
boostBtn.onmouseup=()=>boost=false;
boostBtn.ontouchstart=()=>boost=true;
boostBtn.ontouchend=()=>boost=false;

/* ================= BOT AI ================= */
function updateBots(){

    bots.forEach(bot=>{

        let head=bot.body[0];

        // cari food terdekat
        let nearest=null;
        let minDist=Infinity;

        foods.forEach(f=>{
            let d=Math.hypot(f.x-head.x,f.y-head.y);
            if(d<minDist){
                minDist=d;
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

        // makan food
        for(let i=foods.length-1;i>=0;i--){
            if(Math.hypot(foods[i].x-newHead.x,foods[i].y-newHead.y)<12){
                foods.splice(i,1);
                break;
            }
        }

        if(bot.body.length>30){
            bot.body.pop();
        }
    });
}

/* ================= UPDATE ================= */
function update(){
if(!alive) return;

/* PLAYER */
let head=snake[0];
let speed=(boost && energy>0)?4:2;

if(boost && energy>0) energy-=0.5;
else if(energy<100) energy+=0.2;

let newHead={
    x:head.x+dir.x*speed,
    y:head.y+dir.y*speed
};

snake.unshift(newHead);

for(let i=foods.length-1;i>=0;i--){
    if(Math.hypot(foods[i].x-newHead.x,foods[i].y-newHead.y)<12){
        foods.splice(i,1);
        score+=10;
    }
}

if(snake.length>score/10+20) snake.pop();

camera.x=newHead.x-window.innerWidth/2;
camera.y=newHead.y-window.innerHeight/2;

scoreEl.textContent=score;
energyEl.textContent=Math.floor(energy);

/* UPDATE BOT */
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

/* DRAW PLAYER */
drawSnake(snake, skins[currentSkin].body, skins[currentSkin].head);

/* DRAW BOTS */
bots.forEach(bot=>{
    drawSnake(bot.body, bot.color, bot.color);
});
}

function drawSnake(body, bodyColor, headColor){

    if(body.length>1){
        ctx.lineCap="round";
        ctx.lineJoin="round";
        ctx.lineWidth=16;

        ctx.beginPath();
        body.forEach((s,i)=>{
            let x=s.x-camera.x;
            let y=s.y-camera.y;
            if(i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        });

        ctx.strokeStyle=bodyColor;
        ctx.stroke();
    }

    let head=body[0];
    let hx=head.x-camera.x;
    let hy=head.y-camera.y;

    ctx.fillStyle=headColor;
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
