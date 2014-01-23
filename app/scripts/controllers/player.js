'use strict';
ld.controller('PlayerCtrl', function ($scope, $stateParams, sharedObjects, $location, $rootScope){

    // var un = $rootScope.$on('$stateChangeStart', function (event) {
    //     event.preventDefault();
    //     un();
    // });
    // $scope.$on('$viewContentLoaded', function() {

    // });

    var channelId = $stateParams.channelId;
    var episodeId = $stateParams.episodeId;
    var channel = sharedObjects.get("channel") || new nn.model.Channel(channelId);
    var episodes = sharedObjects.get("episodes");
    var episode;
    var programs;
    var episodeIndex = 0;

    sharedObjects.set('channel', channel);

    var init = function(){
          
          loadApi();
          player  = new nn.Player("ytplayer-1", true);

          //if(episodes){
          if(false){

              episode = episodes.findByAttr("id", episodeId);
              episodeIndex = episodes.index;
              programs = new nn.utils.NnArray(episode.programs, false);

              $scope.safeApply(update);
              startPlay();
          }else{
              channel.get().then(function(){
                channel.loadEpisodes().then(function(){

                      episodes = channel.episodes;
                      sharedObjects.set('episodes', episodes);
                      episode = episodes.first();
                      episodeIndex = 0;
                      programs = new nn.utils.NnArray(episode.programs, false);

                      $scope.safeApply(update);
                      startPlay();
                });
              });
          }
    }

    var loadApi = function(){
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    var update = function(){
        $scope.channel = channel;
        $scope.episodes = channel.episodes;
        $scope.episodeIndex = episodeIndex;
    }

    var onVideoEnd = function(){

        var rs = programs.next();
        if(rs !== false){
            startPlay();
        }
    }

    var startPlay = function(){

       player.ready().then(function(){
          console.log("ready");
          player.cueVideoById(programs.current().videoId);
       });

       $(player).on("ended", onVideoEnd);
    }

    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    $scope.onEpisodeClick = function(eid){
        var path = base + '/' + channelId + '/' + eid;
        $location.path(path);
    }

    init();

  })
.directive("episodeList", function($document){
  return function($scope, ele, attrs){
      // properties

      //Draggable.create(".episode-list", {type:"x", edgeResistance:0.65, bounds:".episode-list-wrap", throwProps:true});

      return;
      var bool = false;
      var ox = 0;
      var mouseX = 0;
      var x = 0;
      var startX = 0;
      var lastX;
      var friction = 0.9;
      var vx;
      var frameRate = 1000 / 20;
      var tx;
      var minLeft;
      var onMouseUp = function(){
        bool = false;
        $document.unbind('mousemove', onMouseMove);
        $document.unbind('mouseup', onMouseUp);
        //clearInterval(interval);
      }

      var onMouseMove = function(e){
          x = mouseX - startX;
          vx = (lastX - x) * 10;

          x = x > 0 ? 0 : x;
          x = x < minLeft ? minLeft : x;
          lastX = x;
          ele.css({
            left:  x + 'px'
          });
      }

      var onInterval = function(){

          if(bool){
            //console.log(vx);
          }else{

            //console.log(vx, x);
            if(Math.abs(vx) > 1){
                console.log(vx);
                vx *= friction;
                tx = x + vx;
                if(tx > 10){
                  //v = -v;
                  // x = 0;
                  // v = -v;
                }else if(tx < minLeft){
                  //console.log(2, tx);
                  // x = -$(ele).width();
                  // v = -v;
                }
                ele.css({
                  left: tx + 'px'
                });
            }else{
              vx = 0;
              clearInterval(interval);
            }
          }
      }

      var initMouseDetect = function(){
        $(document).mousemove(function(e){
            mouseX = e.pageX;
         }); 
      }

      initMouseDetect();

      var interval;

      ele.on('mousedown', function(e) {
        // Prevent default dragging of selected content
        minLeft = -$(ele).width() + $(".episode-list-wrap").width()
        bool = true;
        e.preventDefault();
        startX = e.pageX - x;
        interval = setInterval(onInterval, frameRate);
        // console.log(e.pageX);
        // console.log(x);
        // console.log(startX);

        $document.on('mousemove', onMouseMove);
        $document.on('mouseup', onMouseUp);
      });
  }
});
