function initSpire(){
    
    var Spire = require('./spire.io.js');
    var spire = new Spire();
    
    
    spire.start(ACCOUNT_SECRET_GOES_HERE, function (error) {
        
        if (!error) {
            
            window.spire=spire;
            
            spire.session.subscribe(["Juke"], {min_timestamp:'now'}, function(messages) {
                
                console.log(messages);
                
                for(var i in messages){
                    var content=messages[i].content;
                    
                    
                    if(content.action){
                        switch(content.action){
                            case 'skip':  jukebox.next();  break;
                            case 'play':  Rdo.rdio.rdio_play();  break;
                            case 'pause': Rdo.rdio.rdio_pause(); break;
//                            case 'prev':  Rdio.rdio.rdio_previous(); break;
//                            case 'next': Rdio.rdio.rdio_next(); break;
                            case 'sendState': Rdo.rdio.rdio_sendState(); break;
                            case 'setVolume': Rdo.rdio.rdio_setVolume(content.value); break;
                        }
                        
                    }
                    
                }
            
            });
            
            //spire.session.publish("juke",{action:'pause'});
        }
    });
}
