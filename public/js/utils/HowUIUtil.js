
var $ = require('jquery');

var myScrollers = [];

function fxTap(){
    // console.log('fxTap called');
    enableScrollerY();
    scroller();
    touchStart();
    // coverTitle();
}

function paddingTop(top){
    $('.container').css('padding-top',top)
}

function listTitle(){
    $(".list").each(function(){
        if($(this).attr("title")!=""){
            if($(this).hasClass("marginTop")){
                $(this).before("<div class='listTitle marginTop'>"+$(this).attr("title")+"</div>");
            }else{
                $(this).before("<div class='listTitle'>"+$(this).attr("title")+"</div>");}
        }
    });
}

function disableScrollerY() {

    $(".container").attr("data-scrollable","x");
}

function enableScrollerY(){
    // console.log('findthings called');
    $(".container").attr("data-scrollable","y");
}

function squareBox(){
    $stageWidth=document.documentElement.clientWidth
    $(".one-item.square-box .grid-item").css("height",$stageWidth);
    $(".two-item.square-box .grid-item").css("height",$stageWidth/2);
    $(".three-item.square-box .grid-item").css("height",$stageWidth/3);
    $(".four-item.square-box .grid-item").css("height",$stageWidth/4);
    $(".five-item.square-box .grid-item").css("height",$stageWidth/5);
}

function pageTap(){
    $(".next-page").bind("tap",function(){
        $("#"+$(this).parents(".page-current").attr("id")).addClass("page-prev fadeOutLeft").removeClass("page-current");
        $("#"+$(this).attr("data-content"))
            .addClass("page-current fadeInRight")
            .css("height",$stageHeight)
        fxTap()
        setTimeout(function(){
            $(".page").removeClass("fadeInRight");
            $(".page-prev").removeClass("fadeOutLeft fadeOutRight page-prev")
        },500)
    })
    $(".prev-page").bind("tap",function(){
        $("#"+$(this).parents(".page-current").attr("id")).addClass("page-prev fadeOutRight").removeClass("page-current");
        $("#"+$(this).attr("data-content"))
            .addClass("page-current fadeInLeft")
            .css("height",$stageHeight);
        fxTap()
        setTimeout(function(){
            $(".page").removeClass("fadeInLeft");
            $(".page-prev").removeClass("fadeOutLeft fadeOutRight page-prev")
        },500)
    })
    $(".page").each(function(){
        if($(this).attr("data-content")!=null){
            $(this).bind("swipeRight",function(){
                if($(this).parents(".book-current").attr("data-content")!=null){
                    $that=this;
                    $($that).parents(".book-current").toggleClass("take-up")
                    setTimeout(function(){
                        $($that).parents(".book-current").toggleClass("take-up")
                    },500)
                }
                $(this).addClass("page-prev fadeOutRight").removeClass("page-current");
                $("#"+$(this).attr("data-content"))
                    .addClass("page-current fadeInLeft")
                    .css("height",$stageHeight);
                fxTap()
                setTimeout(function(){
                    $(".page").removeClass("fadeInLeft");
                    $(".page-prev").removeClass("fadeOutLeft fadeOutRight page-prev")
                },500)
            })
        }
    })
}

function bookTap(){
    $(".next-book").bind("tap",function(){
            $("#" + $(".book-current").attr("id")).addClass("book-prev fadeOutLeft").removeClass("book-current");
            $("#" + $(this).attr("data-content"))
                .addClass("book-current fadeInRight")
                .css("height", $stageHeight)
        fxTap()
        setTimeout(function () {
           $(".book").removeClass("fadeInRight");
            $(".book-prev").removeClass("fadeOutLeft fadeOutRight book-prev")
        }, 500)
    })
    $(".prev-book").bind("tap",function(){
        $("#" + $(".book-current").attr("id")).addClass("book-prev fadeOutRight").removeClass("book-current");
        $("#" + $(this).attr("data-content"))
            .addClass("book-current fadeInLeft")
            .css("height", $stageHeight)
        fxTap()
        setTimeout(function () {
            $(".book").removeClass("fadeInLeft");
            $(".book-prev").removeClass("fadeOutLeft fadeOutRight book-prev")
        }, 500)
    })
    $(".book").each(function(){
        if($(this).attr("data-content")!=null){
            $(this).bind("swipeRight",function(){
                if(!$(this).hasClass("take-up")){
                    $(this).addClass("book-prev fadeOutRight").removeClass("book-current");
                    $("#" + $(this).attr("data-content"))
                        .addClass("book-current fadeInLeft")
                        .css("height", $stageHeight)
                    fxTap()
                    setTimeout(function () {
                        $(".book").removeClass("fadeInLeft");
                        $(".book-prev").removeClass("fadeOutLeft fadeOutRight book-prev")
                    }, 500)
                }
            })
        }
    })
}

function tabTap(){
    $(".tab-current").each(function(){
        $("#"+$(this).attr("data-tabsection")).addClass("section-current").css("height",$stageHeight)
        if($("#"+$(this).attr("data-tabsection")).parents(".book-current").length>0){
            if($("#"+$(this).attr("data-tabsection")).parents(".page-current").length>0){
                $("#"+$(this).attr("data-tabsection")).find(".container").attr("data-scrollable","y");
            }
        }
    })
    $(".tab-bar ul li").bind("tap",function(){
        $that="#"+$("#"+$(this).attr("data-tabsection")).parents(".page").attr("id")
        tabcontent(this,$(this).attr("data-tabsection"),$that);
        // coverTitle();
    });
}

function tabcontent(e,content,page){
    $(page+" section ul li").removeClass("tab-current");
    $(e).addClass("tab-current");
    $(page+" section").removeClass("section-current");
    $("#"+content).addClass("section-current").css("height",$stageHeight);
    $("#"+content).find(".container").attr("data-scrollable","y");
    scroller()
}

var isPullerReady = false;
var pullerHeight= 0;
var pullerStartY = 0;
var pullerEndY = 0;

function hasPuller() {

    // console.log('hasPuller called')

    if ($(".project-content").find(".puller").length == 0) {
        return;
    }

    var puller = $(".book-current .page-current").find(".puller")[0];
    pullerHeight = puller.clientHeight;

    $(".project-content").bind("touchstart",function(e){

        console.log('touch start  puller display = ' + $('.puller').css('display'));
        if ($('.puller').css('display') == 'none') {
            return;
        }

        pullerStartY = e.originalEvent.changedTouches[0].clientY;
        // console.log('pullerStartY = ' + pullerStartY);
    });

    $(".project-content").bind("touchend",function(e){

        console.log('touch end  puller display = ' + $('.puller').css('display'));
        if ($('.puller').css('display') == 'none') {
            return;
        }
        
        pullerEndY = e.originalEvent.changedTouches[0].clientY;
        // console.log('pullerEndY = ' + pullerEndY);

        var offsetTop = puller.offsetTop;

        
        var clientOffsetTop = parseInt(document.documentElement.clientHeight) + scrollTop - 80;
        var element = document.getElementById('planContainer');
        if (element) {
            console.log(element.style['-webkit-transform']);
            var translate3d = element.style['-webkit-transform'];
            if (translate3d) {

                var clientHeight = clientOffsetTop;
                clientOffsetTop = parseInt(translate3d.substring(17, 23).replace(/px/, '').replace(/p/, '').replace(/-/, '').replace(/,/, ''));
                console.log('clientHeight = ' + clientHeight);
                console.log('clientOffsetTop = ' + clientOffsetTop);
                clientOffsetTop = clientHeight + clientOffsetTop;
                console.log('page height = ' + clientOffsetTop);
            }
        }
        
        // console.log('offsetTop = ' + offsetTop);
        // console.log('clientOffsetTop = ' + clientOffsetTop);

        console.log('clientOffsetTop = ' + clientOffsetTop);
        console.log('offsetTop = ' + offsetTop);
        console.log('pullerStartY = ' + pullerStartY);
        console.log('pullerEndY = ' + pullerEndY);
        console.log('pullerHeight = ' + pullerHeight);

        if (clientOffsetTop > offsetTop) {
            if ((pullerStartY - pullerEndY) > pullerHeight) {

                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("onPull", false, false);
                puller.dispatchEvent(evt);
                
                isPullerReady = false;
            }
        }
    })
}

function hasfixBar(bottom){
    var container = $('.container');
    var frontCover = parseInt($(".front-cover").css("height")) || 0;
    var backCover = parseInt($(".back-cover").css("height"))+parseInt(container.css('margin-top')) || container.css('margin-top');
    container.css("padding-top",frontCover).css("padding-bottom",backCover)
}


function touchStart(){
    // console.log('touchstart called');
    $(".next-page,.prev-page,.next-book,.prev-book").bind("touchstart",function(){
        if($(this).parents(".cover").length>0){
            $(this).addClass("betapped-font");
        }else{
            $(this).addClass("betapped");
        }
    }).bind("touchend touchcancel",function(){
        if($(this).parents(".cover").length>0){
            $(this).removeClass("betapped-font");
        }else{
            $(this).removeClass("betapped");
        }
    })
}



function scroller(){
    // console.log('scroller called');
    var elements = $("[data-scrollable]"), element;
    for (var i = 0; i < elements.length; i++) {
        // console.log(getheight())
        element = elements[i];
        if ($(element).css("-webkit-transform") == "none") {
            var scrollable = element.dataset.scrollable;
            var scroller = new EasyScroller(element, {
                scrollingX: scrollable === 'true' || scrollable === 'x',
                scrollingY: scrollable === 'true' || scrollable === 'y'
            });

            if (element.id == 'planContainer') {
                myScrollers['content'] = scroller;
            }
            else {
                myScrollers['filter'] = scroller;
            }
        }
    }
}

module.exports = {

  init: function(){

    console.debug('HowUIUtil init');

    $stageHeight = document.documentElement.clientHeight;
    $(".book-current,.page-current").css("height",$stageHeight);
  },

  tabTap: function() {
    tabTap();
  },

  hasfixBar: function() {
    hasfixBar();
  },

  tabcontent: function() {
    tabcontent();
  },
  
  fxTap: function() {
    fxTap();
  },

  scroller: function() {
    scroller();
  },

  scrollToTop: function(name) {
    myScrollers[name].scrollToTop();
  },

  pageTap: function() {
    pageTap();
  },

  touchStart: function() {
    touchStart();
  },

  hasPuller: function() {
    hasPuller();
  },

  enableScrollerY: function() {
    enableScrollerY();
    scroller();
  },

  disableScrollerY: function() {
    disableScrollerY();
    scroller();
  }
}