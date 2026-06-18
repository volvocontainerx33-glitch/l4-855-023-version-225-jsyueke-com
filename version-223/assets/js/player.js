
(function(){
  var wrap=document.querySelector('[data-player]');
  if(!wrap)return;
  var video=wrap.querySelector('video');
  var layer=wrap.querySelector('.play-layer');
  var src=wrap.getAttribute('data-stream');
  var started=false;
  function start(){
    if(started){video.play();return}
    started=true;
    if(layer)layer.style.display='none';
    if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;video.play()}
    else if(window.Hls&&Hls.isSupported()){var hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,function(){video.play()})}
    else{video.src=src;video.play()}
  }
  if(layer)layer.addEventListener('click',start);
  video.addEventListener('click',function(){if(video.paused)start()});
})();
