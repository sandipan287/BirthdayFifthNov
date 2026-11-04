const screens=[...document.querySelectorAll('.screen')];
function showScreen(id){screens.forEach(screen=>screen.classList.toggle('active',screen.id===id));}
document.getElementById('startBtn').addEventListener('click',()=>showScreen('date'));
document.getElementById('yesBtn').addEventListener('click',()=>showScreen('thanks'));

// NO starts beside YES. Whenever she approaches it, move it once to
// a random visible pink-background area OUTSIDE the white card.
const noBtn=document.getElementById('noBtn');
const proposalCard=document.querySelector('#date .card');

function moveNoButton(event){
 // Randomly relocate NO only inside the white proposal card.
 // Use the visible intersection of the card and the browser viewport,
 // so the button cannot disappear beyond the screen edges.
 const card=proposalCard.getBoundingClientRect();
 const pad=16;
 const width=noBtn.offsetWidth || 120;
 const height=noBtn.offsetHeight || 48;

 const left=Math.max(pad,card.left+pad);
 const top=Math.max(pad,card.top+pad);
 const right=Math.min(window.innerWidth-pad,card.right-pad);
 const bottom=Math.min(window.innerHeight-pad,card.bottom-pad);

 const availableWidth=right-left-width;
 const availableHeight=bottom-top-height;

 // If the card is temporarily too small (for example during resize),
 // keep the button visible in the viewport instead of hiding it.
 let x,y;
 if(availableWidth>=0 && availableHeight>=0){
  x=left+Math.random()*availableWidth;
  y=top+Math.random()*availableHeight;
 }else{
  const maxX=Math.max(pad,window.innerWidth-width-pad);
  const maxY=Math.max(pad,window.innerHeight-height-pad);
  x=pad+Math.random()*Math.max(0,maxX-pad);
  y=pad+Math.random()*Math.max(0,maxY-pad);
 }

 // Do not place it directly beneath the pointer; this makes each hover
 // a distinct attempt and avoids an immediate re-trigger.
 if(event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) &&
    Math.hypot(x+width/2-event.clientX,y+height/2-event.clientY)<width+40 &&
    availableWidth>=0 && availableHeight>=0){
  for(let i=0;i<30;i++){
   const nx=left+Math.random()*availableWidth;
   const ny=top+Math.random()*availableHeight;
   if(Math.hypot(nx+width/2-event.clientX,ny+height/2-event.clientY)>=width+40){
    x=nx;y=ny;break;
   }
  }
 }

 noBtn.style.position='fixed';
 noBtn.style.left=Math.max(pad,Math.min(window.innerWidth-width-pad,x))+'px';
 noBtn.style.top=Math.max(pad,Math.min(window.innerHeight-height-pad,y))+'px';
 noBtn.style.right='auto';
 noBtn.style.bottom='auto';
 noBtn.style.zIndex='100';
}

noBtn.addEventListener('pointerenter',event=>{
 if(event.pointerType==='mouse' || event.pointerType==='pen') moveNoButton(event);
});
noBtn.addEventListener('pointerdown',event=>{
 event.preventDefault();
 moveNoButton(event);
});
noBtn.addEventListener('focus',()=>moveNoButton(null));

window.addEventListener('resize',()=>{
 if(noBtn.style.position==='fixed') moveNoButton(null);
});

// Floating sparkles.
const sparkleLayer=document.getElementById('sparkles');
const symbols=['✦','♡','✧','♥'];
for(let i=0;i<26;i++){
 const item=document.createElement('span');item.className='sparkle';
 item.textContent=symbols[i%symbols.length];item.style.left=Math.random()*100+'%';
 item.style.animationDelay=(-Math.random()*12)+'s';
 item.style.animationDuration=(7+Math.random()*8)+'s';
 item.style.fontSize=(12+Math.random()*18)+'px';sparkleLayer.appendChild(item);
}

// Soft original browser-generated instrumental chime; starts after the visitor taps Play.
let audioContext=null,musicPlaying=false,musicTimer=null,noteIndex=0;
const musicButton=document.getElementById('musicBtn');
const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,783.99,659.25,587.33,523.25];
function playMelodyNote(){
 if(!musicPlaying||!audioContext)return;
 const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
 oscillator.type='sine';oscillator.frequency.value=melody[noteIndex%melody.length];
 gain.gain.setValueAtTime(.0001,audioContext.currentTime);
 gain.gain.exponentialRampToValueAtTime(.035,audioContext.currentTime+.05);
 gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.55);
 oscillator.connect(gain);gain.connect(audioContext.destination);
 oscillator.start();oscillator.stop(audioContext.currentTime+.58);
 noteIndex++;musicTimer=setTimeout(playMelodyNote,620);
}
musicButton.addEventListener('click',async()=>{
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass){musicButton.textContent='Music unavailable';musicButton.disabled=true;return;}
 if(!audioContext)audioContext=new AudioContextClass();
 if(audioContext.state==='suspended')await audioContext.resume();
 musicPlaying=!musicPlaying;
 musicButton.setAttribute('aria-pressed',String(musicPlaying));
 if(musicPlaying){musicButton.textContent='♫ Pause music';playMelodyNote();}
 else{clearTimeout(musicTimer);musicButton.textContent='♫ Play soft music';}
});
