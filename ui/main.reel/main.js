
var Component = require("montage/ui/component").Component,
    sharedRottenTomatoService = require("core/tmdb-service").shared,
    sharedYoutubeService = require("core/youtube-service").shared;

//TODO use details in toggle buttons
//TODO do not use matte toggle buttons
exports.Main = Component.specialize({

    /*
     *整个Montage App的入口。
     *
     */
    constructor: {
        value: function Main () {
            //监听打开预览页事件
            this.application.addEventListener( "openTrailer", this, false);

            //刻意控制一下App的draw方法在数据第一次获取完成之后再执行，通常不需要做这件事。
            this.canDrawGate.setField("moviesLoaded", false);
            //开始从themoviedb API获取影片信息
            this._initialDataLoad = this.rottenTomato.load();
        }
    },

    rottenTomato: {
        value: sharedRottenTomatoService
    },

    _initialDataLoad: {
        value: null
    },

    /*
     *在html模版被初始化完成后执行，在enterDocument以及draw之前
     *
     */
    templateDidLoad: {
        value: function () {
            var self = this;
            self._initialDataLoad.then(function () {
                //这个时候设置canDraw，允许draw
                self.canDrawGate.setField("moviesLoaded", true);
            }).done();
        }
    },

    /*
     *响应openTrailer事件，montage的事件遵循camelCase,规则handleXXXXX可以自动响应事件。
     *
     */
    handleOpenTrailer: {
        value: function (event) {
            var title = event.detail.title,
            player = this.templateObjects.player;
            sharedYoutubeService.searchYoutubeTrailer(title).then(function (id) {
                player.openTrailer(id);
            }).done();
        }
    },

    /**
        iOS 7.0.x iPhone/iPod Touch workaround. After switching from portrait to landscape
        mode, Safari shows the content full screen. If the top or bottom of the content is
        clicked, navigation bars appear hiding content. This workaround reduces the height
        of the content.
    */
    _windowScroll: {
        value: function (self) {
            if ((window.innerHeight === window.outerHeight) || (window.innerHeight !== this._element.offsetHeight)) {
                window.scrollTo(0, 0);
                self.templateObjects.moviestrip.movieFlow.handleResize();
                window.clearTimeout(self._windowScrollTimeout);
                self._windowScrollTimeout = window.setTimeout(function () {
                    self._windowScroll(self);
                }, 700);
            }
        }
    },

    /**
        iOS 7.0.x iPhone/iPod Touch workaround
    */
    _windowScrollTimeout: {
        value: null
    },

    handleOrientationchange: {
        value: function () {
            var self = this;

            window.scrollTo(0, 0);
            // iOS 7.0.x iPhone/iPod Touch workaround
            if (navigator.userAgent.match(/(iPhone|iPod touch);.*CPU.*OS 7_0_\d/i)) {
                window.clearTimeout(this._windowScrollTimeout);
                if (Math.abs(window.orientation) === 90) {
                    self._windowScrollTimeout = window.setTimeout(function () {
                        self._windowScroll(self);
                    }, 1000);
                }
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                window.addEventListener("orientationchange", this, false);
            }
        }
    }

});
