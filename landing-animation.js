(() => {
  const canvas = document.querySelector('#journey-canvas');
  const ctx = canvas.getContext('2d');
  const video = document.querySelector('#journey');
  const sound = document.querySelector('#sound');
  const files = {
    plane:'robot-pilot-wheels-repaired.webp',
    boat:'robot-ship.webp',
    rocket:'robot-rocket.webp',
    cloud1:'landing-cloud-1.webp', cloud2:'landing-cloud-2.webp', cloud3:'landing-cloud-3.webp',
    ring:'landing-planet-ring.webp', crater:'landing-planet-crater.webp'
  };
  const art = {};
  for (const [key,file] of Object.entries(files)) {
    const image = new Image(); image.onload = () => { art[key] = image; }; image.src = `assets/${file}`;
  }
  let w=0,h=0;
  function resize() {
    w=window.innerWidth; h=window.innerHeight;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize',resize); resize();
  const wrap=(v,max)=>((v%max)+max)%max;
  function draw(name,x,y,maxW,maxH,rotation=0,alpha=1) {
    const image=art[name]; if(!image)return;
    const scale=Math.min(maxW/image.width,maxH/image.height);
    const iw=image.width*scale, ih=image.height*scale;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);
    ctx.drawImage(image,-iw/2,-ih/2,iw,ih);ctx.restore();
  }
  function fade(t,a,b,c,d){if(t<a||t>=d)return 0;if(t<b)return(t-a)/(b-a);if(t<=c)return 1;return(d-t)/(d-c);}
  function drawCards(t) {
    const cards=[
      ['robinson has found a new home.',fade(t,.3,1.05,2.45,3),52,400],
      ['christmas 2026',fade(t,3.25,3.9,5.2,5.7),54,400],
      ['fw/r',fade(t,5.95,6.65,7.85,8.3),84,600]
    ];
    for(const [copy,alpha,size,weight] of cards){
      if(alpha<=0)continue;
      ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#111';
      ctx.font=`${weight} ${Math.min(size*h/600,w/(copy.length*.51))}px Helvetica, Arial, sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(copy,w/2,h/2);ctx.restore();
    }
  }
  function plane(p) {
    const clouds=[
      ['cloud1',.11,.14,.19,.8,-1.2],['cloud2',.86,.1,.15,.72,-.8],
      ['cloud3',.18,.77,.13,.7,-1.5],['cloud1',.82,.77,.21,.85,-1.1],
      ['cloud2',.45,.26,.11,.6,-1.3],['cloud3',.93,.45,.12,.65,-1.7]
    ];
    for(const [name,nx,ny,size,alpha,speed] of clouds){
      const cw=Math.max(82,Math.min(w*size,260));
      const x=wrap(nx*w+p*w*speed,w+cw*2)-cw;
      draw(name,x,ny*h,cw,cw*.7,0,alpha);
    }
    const portrait=w/h<.8;
    draw('plane',w*(.5+(p-.5)*(portrait?.06:.13)),h*.5+Math.sin(p*12)*8,
      w*(portrait?.91:.58),h*(portrait?.42:.62),Math.sin(p*6)*.012);
  }
  function boat(p) {
    const portrait=w/h<.8;
    draw('boat',w*(.5+(p-.5)*(portrait?.05:.11)),h*.51+Math.sin(p*12)*10,
      w*(portrait?.91:.57),h*(portrait?.42:.6),Math.sin(p*10)*.012);
  }
  function rocket(p) {
    draw('ring',w*.16,h*(.72-p*.38),Math.min(w*.24,200),Math.min(h*.18,130));
    draw('crater',w*.82,h*(.28+p*.28),Math.min(w*.18,150),Math.min(h*.14,110));
    const portrait=w/h<.8;
    draw('rocket',w*(.49+(p-.5)*(portrait?.06:.13)),h*(.52-p*.08)+Math.sin(p*12)*4,
      w*(portrait?.63:.32),h*(portrait?.46:.67),Math.sin(p*6)*.01);
  }
  function paint() {
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    const t=video.currentTime||0;
    if(t<12.6){
      const index=Math.min(2,Math.floor(t/4.2));
      const p=Math.max(0,Math.min(1,(t-index*4.2)/4.2));
      [plane,boat,rocket][index](p);
      const white=Math.max(0,(p-.94)/.06,(.04-p)/.04);
      if(white>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,white)})`;ctx.fillRect(0,0,w,h);}
    }else if(t>=30.2) drawCards(t-30.2);
    requestAnimationFrame(paint);
  }
  video.addEventListener('timeupdate',()=>{
    if(video.currentTime>=12.6&&video.currentTime<30.2)video.currentTime=30.2;
  });
  requestAnimationFrame(paint);
  sound.addEventListener('click',async()=>{
    if(video.muted){
      video.muted=false;video.currentTime=0;sound.textContent='sound off';sound.setAttribute('aria-label','Turn sound off');
      try{await video.play();}catch(_){video.muted=true;sound.textContent='sound on';sound.setAttribute('aria-label','Turn sound on');}
    }else{video.muted=true;sound.textContent='sound on';sound.setAttribute('aria-label','Turn sound on');}
  });
})();
