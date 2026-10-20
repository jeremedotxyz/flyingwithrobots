(() => {
  const canvas = document.querySelector('#journey-canvas');
  const ctx = canvas.getContext('2d');
  const video = document.querySelector('#journey');
  const sound = document.querySelector('#sound');
  const files = {
    plane:'robot-pilot-wheels-repaired.webp',
    boat:'robot-ship.webp', narwhal:'narwhal-cameo.png',
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
    w=canvas.clientWidth; h=canvas.clientHeight;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize',resize);
  new ResizeObserver(resize).observe(canvas);
  resize();
  const wrap=(v,max)=>((v%max)+max)%max;
  function draw(name,x,y,maxW,maxH,rotation=0,alpha=1,flip=1) {
    const image=art[name]; if(!image)return;
    const scale=Math.min(maxW/image.width,maxH/image.height);
    const iw=image.width*scale, ih=image.height*scale;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(flip,1);
    ctx.drawImage(image,-iw/2,-ih/2,iw,ih);ctx.restore();
  }
  function fade(t,a,b,c,d){if(t<a||t>=d)return 0;if(t<b)return(t-a)/(b-a);if(t<=c)return 1;return(d-t)/(d-c);}
  function drawCards(t) {
    const cards=[
      ['robinson has found a new home.',fade(t,.3,1.05,2.45,3),52,400],
      ['christmas 2026',fade(t,3.25,3.9,5.2,5.7),52,400],
      ['fw/r',fade(t,5.95,6.65,7.85,8.3),84,600]
    ];
    for(const [copy,alpha,size,weight] of cards){
      if(alpha<=0)continue;
      ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#111';
      let fontSize=size*h/600;
      ctx.font=`${weight} ${fontSize}px Helvetica, Arial, sans-serif`;
      const measuredCopy=weight===400?'robinson has found a new home.':copy;
      ctx.font=`${weight} ${fontSize}px Helvetica, Arial, sans-serif`;
      fontSize=Math.min(fontSize,fontSize*(w-48)/ctx.measureText(measuredCopy).width);
      ctx.font=`${weight} ${fontSize}px Helvetica, Arial, sans-serif`;
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
    const waterline=h*(portrait?.60:.69);
    function wavePath(y,offset) {
      const span=Math.max(100,Math.min(w*.18,190));
      const shift=wrap(offset,span);
      ctx.beginPath();ctx.moveTo(-span-shift,y);
      for(let x=-span-shift,i=0;x<w+span;x+=span,i++){
        const crest=13+10*(.5+.5*Math.sin(i*2.3+1.1));
        ctx.quadraticCurveTo(x+span*.23,y+3,x+span*.49,y-crest);
        ctx.quadraticCurveTo(x+span*.68,y+5,x+span,y);
      }
    }
    // A brief foreground cameo: surface, splash, turn, and dive the other way.
    const ease=v=>v*v*(3-2*v);
    const rise=p<.15?0:p<.36?ease((p-.15)/.21):p<.58?1:p<.86?1-ease((p-.58)/.28):0;
    draw('boat',w*(.5+(p-.5)*(portrait?.05:.11)),h*.51+Math.sin(p*12)*10,
      w*(portrait?.91:.57),h*(portrait?.42:.6),Math.sin(p*10)*.012);
    ctx.save();
    wavePath(waterline,p*w*.25);
    ctx.lineTo(w+200,h+20);ctx.lineTo(-200,h+20);ctx.closePath();
    ctx.fillStyle='#f8f8f8';ctx.fill();
    wavePath(waterline,p*w*.25);
    ctx.strokeStyle='#151515';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    ctx.strokeStyle='#777';ctx.lineWidth=1.8;
    for(let i=0;i<4;i++){
      const x=wrap(w*(.1+i*.27)-p*w*.19,w+100)-50;
      const y=waterline+h*(.095+(i%2)*.09);
      ctx.beginPath();ctx.moveTo(x,y);
      ctx.quadraticCurveTo(x+18,y-7,x+36,y-2);
      ctx.quadraticCurveTo(x+48,y+2,x+64,y-2);
      ctx.stroke();
    }
    if(rise>0){
      const narwhalWidth=w*(portrait?.49:.21);
      const narwhalHeight=Math.min(narwhalWidth*800/1170,h*.25);
      const surface=h*(portrait?.84:.9);
      const enter=ease(Math.max(0,Math.min(1,(p-.15)/.32)));
      const leave=ease(Math.max(0,Math.min(1,(p-.58)/.28)));
      const nx=w*(.53-.07*enter+.2*leave);
      const ny=surface+narwhalHeight*(.55-rise);
      const facing=1-2*ease(Math.max(0,Math.min(1,(p-.53)/.15)));
      ctx.save();ctx.beginPath();ctx.rect(0,0,w,surface);ctx.clip();
      draw('narwhal',nx,ny,narwhalWidth,narwhalHeight,(p-.5)*.11,1,facing);
      ctx.restore();
      const ripple=narwhalWidth*(.28+.2*rise);
      ctx.strokeStyle='#222';ctx.lineWidth=1.8;ctx.globalAlpha=.75;
      for(const side of [-1,1]){
        ctx.beginPath();ctx.moveTo(nx+side*narwhalWidth*.23,surface+2);
        ctx.quadraticCurveTo(nx+side*ripple,surface-6,nx+side*(ripple+18),surface+2);
        ctx.stroke();
      }
      const splash=Math.max(0,1-Math.abs(p-.32)/.15)+Math.max(0,1-Math.abs(p-.72)/.13);
      ctx.globalAlpha=Math.min(1,splash);
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const sx=nx+side*(narwhalWidth*(.26+i*.1));
        const sy=surface-10-i*9-splash*13;
        const tipX=sx+side*(15+i*5),tipY=sy-18-i*5;
        ctx.beginPath();ctx.moveTo(sx,sy+9);
        ctx.quadraticCurveTo(sx+side*6,sy-9,tipX,tipY);
        ctx.stroke();
        ctx.beginPath();ctx.arc(tipX+side*2,tipY-5,2.3,0,Math.PI*2);ctx.fillStyle='#d8e400';ctx.fill();
      }
    }
    ctx.restore();
  }
  function rocket(p) {
    draw('ring',w*.16,h*(.72-p*.38),Math.min(w*.24,200),Math.min(h*.18,130));
    draw('crater',w*.82,h*(.28+p*.28),Math.min(w*.18,150),Math.min(h*.14,110));
    draw('ring',w*.73,h*(.78-p*.24),Math.min(w*.15,125),Math.min(h*.11,85),0,.78);
    draw('crater',w*.29,h*(.18+p*.18),Math.min(w*.13,105),Math.min(h*.09,70),0,.8);
    draw('ring',w*.91,h*(.11+p*.13),Math.min(w*.1,90),Math.min(h*.07,55),0,.65);
    const portrait=w/h<.8;
    draw('rocket',w*(.49+(p-.5)*(portrait?.06:.13)),h*(.52-p*.08)+Math.sin(p*12)*4,
      w*(portrait?.75:.32),h*(portrait?.53:.67),Math.sin(p*6)*.01);
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
      video.muted=false;video.currentTime=0;sound.setAttribute('aria-label','Turn sound off');sound.setAttribute('aria-pressed','true');
      try{await video.play();}catch(_){video.muted=true;sound.setAttribute('aria-label','Turn sound on');sound.setAttribute('aria-pressed','false');}
    }else{video.muted=true;sound.setAttribute('aria-label','Turn sound on');sound.setAttribute('aria-pressed','false');}
  });
})();
