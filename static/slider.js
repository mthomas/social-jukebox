function Slider() {
    var t = this,
        headerHeight = $('.header').outerHeight(),
        availableHeight = (document.height || document.body.clientHeight) - headerHeight,
        contentWidth = (document.width || document.body.clientWidth) * 0.95,
        views = $('.view');

    this.width = contentWidth / 3;
    this.margin = (document.width - contentWidth) / 4;
    this.availableWidth = this.width * 3 + this.margin * 2;

    views.css({
        height: availableHeight * 0.92
    });

    views.each(function (i, elem) {
        elem = $(elem);
        elem.css({
            marginTop: headerHeight * 1.1,
        });

        elem.find('.viewContent').css({
            height: availableHeight * 0.95
        });
    });

    this.currentlyActive = null;

    //setInterval(function() {
    //        t.next();
    //    }, 10000);
}

Slider.prototype.next = function () {
    var t = this;

    function expand() {
        t.currentlyActive = (t.currentlyActive == null) ? 0 : ++t.currentlyActive  % 3;
        setTimeout(function () {
            t.expandActive(function () {

            });
        }, 1000);
    }

    if (!this.collapseActive(expand))
        expand();
};

Slider.prototype.collapseActive = function (callback) {
    var active = this.currentlyActive,
        left;
    if (active == null)
        return false;

    left = this.margin + ((this.margin + this.width) * this.currentlyActive)

    $('.view:eq(' + active + ')').css({zIndex: 50}).animate({width: this.width, left: left }, 1000,
        function() {
            $(this).css({zIndex: ''});
            callback();
        }).find('.viewContent').animate({left: -left + this.margin}, 1000);

    return true;
};

Slider.prototype.expandActive = function (callback) {
    var active = this.currentlyActive;

    if (active == null)
        return false;

    $('.view:eq(' + active + ')').css({zIndex: 50}).animate({width: this.availableWidth, left: this.margin}, 1000, callback
        ).find('.viewContent').animate({left: 0}, 1000);

    return true;
};