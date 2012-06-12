function Jukebox() {
    var t = this, canvas, playlist;

    this.rdio = new Rdio();
    this.rdio.addSongOverCallback(function () {
        t.next();
    });

    this.slider = new Slider();

    this.rdio.addSongStepCallback(function (elapsed) {
        t.updateRemaining(elapsed);
    });

    this.playlist = [];

    function poll() {
        API.poll(function(json) {
            t.poll(json);
        });
    }

    setInterval(poll, 2000);
    poll();


    playlist = $('.playlist');
    playlist.height(playlist.closest('.view').height);

    canvas = $('#bars');
    canvas.attr({
        width: Math.floor(canvas.parent().width() * 0.8),
        height: canvas.parent().height()
    });

    vizBars.init(canvas[0], this.rdio, true);


    this.activePage = null;
    this.pageOrder = [0, 1, 0, 2, 0, 3, 0, 4];

    t.switchPage();
    
    initSpire();
}

Jukebox.prototype.switchPage = function (elapsed) {
    var pages = $('.page'),
        pageId,
        t = this,
        active = $('.active'),
        INTERVAL = 5000;

    function fadeIn() {
        setTimeout(function () {
            $(pages[pageId]).addClass('active').fadeIn(1000);

            setTimeout(function () {
                t.switchPage();
            }, INTERVAL);
        }, 3000);
    }

    this.activePage = (this.activePage == null) ? 0 : ++this.activePage  % this.pageOrder.length;

    pageId = this.pageOrder[this.activePage];

    // Exception to skip vote if there are less than 3 songs
    if ($(pages[pageId]).is('.votePage') && this.playlist.length < 3) {
        this.switchPage();
        return;
    }

    if ($(pages[pageId]).is('.votePage'))
        this.updateVoting();

    if (active.length !== 0) {
        active.fadeOut(1000, function () {
            $('.active').removeClass('active');
            fadeIn();
        });
    } else
        fadeIn();

};

Jukebox.prototype.updateRemaining = function (elapsed) {
    var container = $('#playing'),
        dummySong = {},
        song = this.playing;

    if (song == null)
        return;

    dummySong = {
        trackName: song.trackName,
        artistName: song.artistName,
        duration: song.duration - elapsed
    }

    if (dummySong.duration < 0)
        dummySong.duration = 0;

    this.renderSong(container, dummySong);
};

Jukebox.prototype.renderSong = function (container, song) {
    var minutes, duration, seconds;

    container.find('.title .resizer').text(song.trackName.toUpperCase());
    container.find('.artist .resizer').text(song.artistName);

    duration = song.duration;
    minutes = Math.floor(duration / 60);
    seconds = duration % 60;
    container.find('.remaining').text(minutes + ':' + ((seconds >= 10) ? seconds : '0' + seconds));

    return container;
};

Jukebox.prototype.renderPlaylist = function () {
    var i, song,
        template = $('#templates div.song'),
        LIMIT = 5,
        message = $('.message'),
        playlist = $('.playlist');

    playlist.find('.song').remove();

    for (i = 0; i < LIMIT && i < this.playlist.length; i++) {
        song = this.playlist[i];
        message.before(this.renderSong(template.clone(), song));
    }

    if (this.playlist.length > LIMIT) {
        message.show();
        message.find('.count').text(this.playlist.length - LIMIT);
    } else
        message.hide();
};

Jukebox.prototype.updateVoting = function () {
    var songsLength = this.playlist.length,
        votePage = $('.votePage'),
        MINIMUM = 3,
        song,
        songIndex;

    if (songsLength < MINIMUM)
        return;

    songIndex = MINIMUM + Math.floor(Math.random() * (songsLength - MINIMUM));
    song = this.playlist[songIndex];
    votePage.find('#songId').text(song.id);
    votePage.find('#songName').html(song.trackName);
    votePage.find('#artistName').text(song.artistName);
};

Jukebox.prototype.next = function () {
    var song;

    if (this.playlist.length > 0) {
        song = this.playlist.splice(0, 1);
        this.play(song[0]);
    } else
        this.play(null);
};

Jukebox.prototype.play = function (song) {
    var resizer;

    function scale (target) {
        var css,
            targetWidth = target.parent().width();

        target.css({
            fontSize: '',
            marginTop: ''
        });

        while(target.width() > targetWidth && parseInt(target.css('fontSize')) > 0) {

            target.css({
                fontSize: parseInt(target.css('fontSize')) - 1,
                marginTop: '+=1px'
            });
        }
    }

    this.playing = song;

    if (song == null)
        return;

    this.playing.started = new Date().getTime();

    this.rdio.play(song.rdioKey);
    API.play(song.id);

    resizer = $('#playing div.title .resizer');

    this.renderSong($('#playing'), song);
    this.renderPlaylist();
    scale($('#playing div.title .resizer'));
};

Jukebox.prototype.poll = function (json) {

    this.playlist = json.queue;
    this.renderPlaylist();

    if (this.playing == null)
        this.next();
};

$(function() {
    window.jukebox = new Jukebox();
});