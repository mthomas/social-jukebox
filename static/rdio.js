

// scope? our global namespace
var Rdo={
    frequencyDataCallbacks:[],

    init: function(playerElementName,playbackToken,playbackDomain){
        
        Rdo.playerElementName=playerElementName;
        
        
        swfobject.embedSWF(
            'http://www.rdio.com/api/swf/', // swfUrl
            playerElementName, // id
            '1',       // width
            '1',       // height
            //'9.0.0',        // version
            '10.0.0',        // version
            false,// expressInstallSwfurl
            {           // flashvars:
                playbackToken:playbackToken,
                domain:playbackDomain,
                listener:'Rdo'
            },
            {           // params
                'allowScriptAccess': 'always'
            }
        );
    },
    
    /// RDIO CALLBACKS ///
    ready: function(userInfo){
        Rdo.rdio=document.getElementById(Rdo.playerElementName);
        
        if(Rdo.waiting)
            Rdo.rdio.rdio_play(Rdo.waiting);
            
        if(Rdo.waitingFrequencyParams){
            Rdo.rdio.rdio_startFrequencyAnalyzer(Rdo.waitingFrequencyParams);
        }
    },   // Rdio is ready to go
    playStateChanged: function(playState){
        var playStates=['paused','playing','stopped','buffering','paused'];

        //getEl('playState').innerHTML=playStates[playState];
        
        if(spire)
            spire.session.publish("Juke",{playState:playStates[playState]});
    },
    playingTrackChanged: function(playingTrack, sourcePosition){
        if(spire)
            spire.session.publish("Juke",{playingTrack:playingTrack});
    },
    playingSourceChanged: function(playingSource){
        if(playingSource==null)
            if(Rdo.songOverCallback)
                Rdo.songOverCallback();
    },
    volumeChanged: function(volume){},
    muteChanged: function(mute){},
    positionChanged: function(position){
        if(Rdo.songStepCallback)
            Rdo.songStepCallback(position);
    },
    queueChanged: function(newQueue){},
    shuffleChanged: function(shuffle){},
    repeatChanged: function(repeat){},
    updateFrequencyData: function(frequencyData){
        if(Rdo.frequencyDataCallbacks.length)
            for(var f in Rdo.frequencyDataCallbacks)
                Rdo.frequencyDataCallbacks[f](frequencyData)
    },
    playingSomewhereElse: function(){},
    freeRemainingChanged: function(freeRemaining){},// the play quota, for free users
}

// interface for Vahur
function Rdio() {
    API.getPlaybackToken(function(token){
        Rdo.init('playerBox',token.token,'hhd-juke.herokuapp.com');
    });
};
Rdio.prototype.addSongOverCallback = function (func) {
    Rdo.songOverCallback=func;
};
Rdio.prototype.play = function (id) {
    if(Rdo.rdio){
        Rdo.rdio.rdio_play(id);
    }else{
        Rdo.waiting=id;
    }
};
Rdio.prototype.addSongStepCallback = function (func) {
    Rdo.songStepCallback= function(elapsed) {
        func(Math.ceil(elapsed));
    };
};

Rdio.prototype.addFrequencyDataCallback = function (func) {
    Rdo.frequencyDataCallbacks.push(func);
}

Rdio.prototype.startFrequencyAnalyzer=function(period,frequencies){
    var params={period:period,frequencies:frequencies};
    
    if(Rdo.rdio){
        Rdo.rdio.rdio_startFrequencyAnalyzer(params);
    }else{
        Rdo.waitingFrequencyParams=params;
    }
}
