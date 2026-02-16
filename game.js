window.addEventListener("DOMContentLoaded", function(){

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

if("ontouchstart" in window){
    joy.style.display = "block";
}

/* CANVAS RESPONSIVE */
function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* GAME VAR */
let snake=[], foods=[];
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

/* START GAME */
function startGame(){
    menu.style.display="none";
    currentSkin=skinSelect.value;
    snake=[{x:1000,y:1000}];
    foods=[];
    score=0;
    energy=100;
    alive=true;

    for(let i=0;i<150;i++){
        foods.push({
            x:Math.random()*worldSize,
            y:Math.random()*worldSize
        });
    }
}
startBtn.onclick=startGame;

/* MOUSE CONTROL */
document.addEventListener("mousemove", e=>{
    if("ontouchstart" in window) return;
    let dx=e.clientX-window.innerWidth/2;
    let dy=e.clientY-window.innerHeight/2;
    let mag=Math.hypot(dx,dy);
    if(mag>0){
        dir.x=dx/mag;
        dir.y=dy/mag;
    }
});

/* BOOST */
boostBtn.onmousedown=boostBtn.ontouchstart=()=>boost=true;
boostBtn.onmouseup=boostBtn.ontouchend=()=>boost=false;

/* UPDATE */
function update(){
if(!alive) return;

let head=snake[0];
let speed=boost&&energy>0?4:2;

if(boost&&energy>0){
    energy-=0.5;
}else if(energy<100){
    energy+=0.2;
}

let newHead={
    x:head.x+dir.x*speed,
    y:head.y+dir.y*speed
};

snake.unshift(newHead);

for(let i=foods.length-1;i>=0;i--){
    let f=foods[i];
    if(Math.hypot(f.x-newHead.x,f.y-newHead.y)<10){
        foods.splice(i,1);
        score+=10;
    }
}

if(snake.length>score/10+20){
    snake.pop();
}

camera.x=newHead.x-window.innerWidth/2;
camera.y=newHead.y-window.innerHeight/2;

scoreEl.innerText=score;
energyEl.innerText=Math.floor(energy);
}

/* DRAW REALISTIC */
function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

/* FOOD */
foods.forEach(f=>{
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(f.x-camera.x,f.y-camera.y,4,0,Math.PI*2);
    ctx.fill();
});

/* BODY */
ctx.lineCap="round";
ctx.lineJoin="round";
ctx.lineWidth=16;

ctx.beginPath();
for(let i=0;i<snake.length;i++){
    let s=snake[i];
    let x=s.x-camera.x;
    let y=s.y-camera.y;
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
}

let grad=ctx.createLinearGradient(
    snake[0].x-camera.x,
    snake[0].y-camera.y,
    snake[snake.length-1].x-camera.x,
    snake[snake.length-1].y-camera.y
);

grad.addColorStop(0, skins[currentSkin].head);
grad.addColorStop(1, skins[currentSkin].body);

ctx.strokeStyle=grad;
ctx.shadowBlur=20;
ctx.shadowColor=skins[currentSkin].body;
ctx.stroke();
ctx.shadowBlur=0;

/* HEAD DETAIL */
let head=snake[0];
let hx=head.x-camera.x;
let hy=head.y-camera.y;

ctx.fillStyle=skins[currentSkin].head;
ctx.beginPath();
ctx.arc(hx,hy,10,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="black";
ctx.beginPath();
ctx.arc(hx-4,hy-3,2,0,Math.PI*2);
ctx.fill();

ctx.beginPath();
ctx.arc(hx+4,hy-3,2,0,Math.PI*2);
ctx.fill();
}

/* LOOP */
function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

});
