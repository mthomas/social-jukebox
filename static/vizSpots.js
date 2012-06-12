// rand range
function rr(min,max){
    return min+Math.random()*(max-min);
}
var PI=Math.PI;

var vizSpots={

    // settings //
    speedFactor:.2,
    brightFactor:.6,
    radFactor:0,
    //nSpots:100,
    nSpots:15,
    //nSpots:1,
    dHue:.05,      // hue-cycle speed
    sensitivity:1,  // sound level scaling
    
    
    // spot size
    spotRadMean:.06,
    spotRadVar:.01,
//    spotRadMean:.01,
//    spotRadVar:.002,
    
    speed:.2,
    
    spotHueVar:15,
    
    width:300, // these will be changed in init
    height:400,
    
    sizeOffs:0, // an absolute offset for ball radius.
    curBright:0,
    curHue:0,

    interval:1000/40,

    intervalID:0,

    valFilt:0,

    spots:[]
};

vizSpots.init=function(canvas,hue){
    var vs=vizSpots;
    
    if(isFinite(hue)){
        vs.curHue=hue;
        vs.dHue=0;
    }
    
   // vizSpots.canvas=document.getElementById('vizCanv');
    vs.ctx=canvas.getContext('2d');
    vs.width=canvas.width;
    vs.height=canvas.height;
    
    for(var i=0;i<vs.nSpots;i++){
        vs.spots[i]=new vs.Spot();
    }
    
    vs.ctx.fillStyle='black';
    vs.ctx.fillRect(0,0,vs.width,vs.height);
    
    vs.start();
}
vizSpots.stepDraw=function(){
    var vs=vizSpots;
    
    vs.curHue+=vs.dHue;
    
    vs.ctx.fillStyle='rgba(0,0,0,1)';
    //vs.ctx.globalAlpha=1;
    vs.ctx.fillRect(0,0,vs.width,vs.height);
    
    vs.ctx.globalAlpha=1;
    
    for(var i=0;i<vs.nSpots;i++){
        vs.spots[i].step();
        vs.spots[i].draw();
    }
}

vizSpots.newVal=function(frequencyData){
    var vs=vizSpots;
    var freqs=frequencyData.split(',');

//    var val=0;
//    for(var i in freqs){
//        val+=freqs[i]*1;
//    }
//    
//    val/=freqs.length;

    var val=
        freqs[Math.round(freqs.length*.2)]*1; // a lower freq
//        freqs[Math.round(freqs.length*.7)]*.5+ // a high-ish freq
//        freqs[Math.round(freqs.length*.2)]*.5; // a lower freq


    // a one-direction low-pass
    if(val>vs.valFilt){
        vs.valFilt=val;
    }else{
        vs.valFilt=vs.valFilt*.8+val*.2;
    }
    
    vs.curBright=vs.valFilt*vs.brightFactor;
    vs.speed=vs.valFilt*vs.speedFactor;
}

vizSpots.start=function(){
    vizSpots.intervalID=setInterval(vizSpots.stepDraw,vizSpots.interval);
}
vizSpots.stop=function(){
    clearInterval(vizSpots.intervalID);
}


vizSpots.Spot=function(){ // the Spot constructor

    var vs=vizSpots;
    
    var s=this.s={}; // let's put everything in here

    // 4 things are cycling:
    //  ax and ay both oscillate across the x and y axis and create a center axis
    //  a1 and a2 rotate around this axis
    
    s.ax=rr(-PI,PI);
    s.dax=rr(.05,.3);

    s.ay=rr(-PI,PI);
    s.day=rr(.05,.3);
    
    s.r1=rr(.05,.2)*vs.width;
    s.a1=rr(-PI,PI);      // initial angle
    s.da1=rr(.02,.3);     // delta (how fast it'll turn)
    
    s.r2=rr(.05,.2)*vs.width;
    s.a2=rr(-PI,PI);
    s.da2=-rr(.05,.3);
    
    s.siz=rr(vs.spotRadMean-vs.spotRadVar,vs.spotRadMean+vs.spotRadVar)*vs.width;
    s.hOff=rr(-vs.spotHueVar,vs.spotHueVar);
}

vizSpots.Spot.prototype.step=function(){
    var s=this.s;
    var vs=vizSpots;
    
    s.a1+=s.da1*vs.speed;
    s.a2+=s.da2*vs.speed;
    
    s.ax+=s.dax*vs.speed;
    s.ay+=s.day*vs.speed;
}

vizSpots.Spot.prototype.draw=function(){
    var s=this.s;
    var vs=vizSpots;
    
    //vs.ctx.noStroke();
    
    vs.ctx.fillStyle=
        'hsla('+(((vs.curHue+s.hOff+255)%255)/255*360)+
        ',100%,50%,'+(vs.curBright)+')';
    
    var x=vs.width/2 +.2*vs.width *Math.cos(s.ax)+s.r1*Math.cos(s.a1)+s.r2*Math.cos(s.a2);
    var y=vs.height/2+.2*vs.height*Math.sin(s.ay)+s.r1*Math.sin(s.a1)+s.r2*Math.sin(s.a2);
    
    vs.ctx.beginPath();
    vs.ctx.arc(x,y,s.siz+vs.sizeOffs,0, PI*2);
    vs.ctx.fill();
}
