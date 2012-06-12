
vizBars={
    scaling:.6,
    noMirror:false
}



vizBars.draw=function(frequencyData){
    var vb=vizBars;
    
    var freqs=frequencyData.split(',');
    
    var sum=0;
    for(var i=0;i<vb.nBars;i++){
        sum+=(freqs[i]*1.);
    }
    if(sum==0)
        return;
    
    
    //vb.ctx.fillStyle='black';
    vb.ctx.clearRect(0,0,vb.width,vb.height);
    
    //vb.ctx.fillStyle='#33B5E5';
    vb.ctx.fillStyle=vb.color;
    
    var barWidth=vb.width/vb.nBars*.8;
    
    for(var i=0;i<vb.nBars;i++){
        
        if(vb.noMirror){
            
            var cOff=Math.round(vb.width*(i/vb.nBars)+barWidth/2+5); //offset from center
            
            //console.log(cOff);
            
            var barHeight=Math.round(-vb.height*freqs[i]*vb.scaling*(1-(Math.random()-.5)*.2));

            if(barHeight>-15)barHeight=-1;

            // left 
            vb.ctx.fillRect(
                Math.round(cOff-barWidth/2),
                Math.round(vb.height*.5-barHeight/2),
                barWidth,
                barHeight);
                            
        }else{
            
            var cOff=Math.round(vb.width/2*(i/vb.nBars)*.9+barWidth/2+5); //offset from center
            
            //console.log(cOff);
            
            var barHeight=Math.round(-vb.height*freqs[i]*vb.scaling);
            
            // right
            vb.ctx.fillRect(
                Math.round(vb.width/2+cOff-barWidth/2),
                Math.round(vb.height*.5-barHeight/2),
                barWidth,
                barHeight);
            
            // left 
            vb.ctx.fillRect(
                Math.round(vb.width/2-cOff-barWidth/2),
                Math.round(vb.height*.5-barHeight/2),
                barWidth,
                barHeight);
        }
    }

}

vizBars.init=function(canvas,rdio,noMirror,color){
    var vb=vizBars;
    
    vb.color=color||'#33B5E5';
    
    vb.noMirror=noMirror;
    
    vb.nBars=noMirror?20:10;
    
    vb.ctx=canvas.getContext('2d');
    vb.width=canvas.width;
    vb.height=canvas.height;
    
    //vb.ctx.fillStyle='black';
    //vb.ctx.fillRect(0,0,vb.width,vb.height);
    
    rdio.startFrequencyAnalyzer(1000/60,noMirror?'26-band':'10-band');
    rdio.addFrequencyDataCallback(vizBars.draw);
    
}
