window.addEventListener("DOMContentLoaded", function(){

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const energyEl = document.getElementById("energy");
const boostBtn = document.getElementById("boostBtn");

const joy = document.getElementById("joystick");
const stick = document.getElementById("stick");

/* ================= DETECT TOUCH DEVICE ================= */

if("ontouchstart" in window){
    joy.style.display = "block";
}

/* ================= CANVAS RESPONSIVE ================= */

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ================= GAME VAR ================= */

let snake=[], foods=[];
let dir={x:1,y:0};
let score=0;
let energy=100;
let boost=false;
let alive=false;

let camera={x:0,y:0};
const worldSize=2000;

/* ================= START GAME ================= */

function startGame(){
    menu.style.display="none";
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

/* ================= PC CONTROL ================= */

document.addEventListener("mousemove", e=>{
    if("ontouchstart" in window) return; // disable on mobile
    let dx=e.clientX-window.innerWidth/2;
    let dy=e.clientY-window.innerHeight/2;
    let mag=Math.hypot(dx,dy);
    if(mag>0){
        dir.x=dx/mag;
        dir.y=dy/mag;
    }
});

/* ================= JOYSTICK ANALOG ================= */

let dragging=false;

joy.addEventListener("touchstart", ()=>dragging=true);

joy.addEventListener("touchmove", e=>{
    if(!dragging) return;
    e.preventDefault();

    let rect=joy.getBoundingClientRect();
    let x=e.touches[0].clientX-rect.left-rect.width/2;
    let y=e.touches[0].clientY-rect.top-rect.height/2;

    let max=rect.width/2;
    let dist=Math.hypot(x,y);

    if(dist>max){
        x=x/dist*max;
        y=y/dist*max;
    }

    stick.style.left=(x+rect.width/2-stick.offsetWidth/2)+"px";
    stick.style.top=(y+rect.height/2-stick.offsetHeight/2)+"px";

    dir.x=x/max;
    dir.y=y/max;
});

joy.addEventListener("touchend", ()=>{
    dragging=false;
    stick.style.left="30px";
    stick.style.top="30px";
    dir={x:1,y:0};
});

/* ================= BOOST ================= */

boostBtn.onmousedown=boostBtn.ontouchstart=()=>boost=true;
boostBtn.onmouseup=boostBtn.ontouchend=()=>boost=false;

/* ================= UPDATE ================= */

function update(){
if(!alive) return;

let head=snake[0];
let speed=boost&&energy>0?4:2;

if(boost&&energy>0){
    energy-=0.5;
}else{
    if(energy<100) energy+=0.2;
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

/* ================= DRAW ================= */

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="white";
foods.forEach(f=>{
    ctx.beginPath();
    ctx.arc(f.x-camera.x,f.y-camera.y,4,0,Math.PI*2);
    ctx.fill();
});

snake.forEach((s,i)=>{
    ctx.fillStyle=i===0?"#fff":"#00ff88";
    ctx.beginPath();
    ctx.arc(s.x-camera.x,s.y-camera.y,8,0,Math.PI*2);
    ctx.fill();
});
}

function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

});
