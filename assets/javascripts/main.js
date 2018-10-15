if (typeof(navigator.mediaDevices) !== 'undefined') {
  console.log('getUserMedia supported.');
  let analyser = newAnalyzer();
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: { width: 1280, height: 720 } })
    .then(analyser.run)
    .catch(function (err) {
      if(err == 'NotFoundError: Requested device not found'){
        document.write('Sorry, this application only works if your webcam is plugged in and accessible.');
      }else{
        document.write('The following ("gUM") error occured: ' + err);
      }
    });
} else {
    document.write('The function "getUserMedia" not supported on your browser!');
}

function newAnalyzer() {
  let video = document.querySelector('#video');
  let videoWrapper = document.querySelector('#video-wrapper');
  let audioCtx = new AudioContext();
  let analyser = audioCtx.createAnalyser();
  let stream = null;

  function run(streamArgument){
    stream = streamArgument;
    initVideo();
    configureAnalyser();
    connectAnalyser();
    stylingLoop();
    document.addEventListener('keydown', adjustAnalyserSettings);
  }

  function initVideo(){
    video.srcObject = stream;
    video.onloadedmetadata = function (e) {
        video.play();
        video.muted = true;
    };
  }

  function configureAnalyser(){
    analyser.fftSize = 32;
    analyser.minDecibels = -90;
    analyser.smoothingTimeConstant = 0.09;
  }

  function connectAnalyser(){
    let vcaVideo = audioCtx.createGain();
    let source = audioCtx.createMediaStreamSource(stream);
    
    vcaVideo.gain.value = 10;
  
    source.connect(vcaVideo);
    vcaVideo.connect(analyser);
    source.connect(audioCtx.destination);
  }

  let loopSpeed = 115.385;
  let currentStyleIndex = 0;
  function videoStyles(){
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    return [
      {
        wrapper: {},
        video: {
          filter: "contrast(" + dataArray[1] + "%) brightness(" + dataArray[7] / 2 + "%) hue-rotate(" + dataArray[14] + "deg)  saturate(422%)",
          transform: "rotateY(" + dataArray[2] + 5 + "deg)"
        }
      },
      {
        wrapper: {},
        video: {
          filter: "contrast(" + dataArray[1] + "%) brightness(" + dataArray[7] / 2 + "%) hue-rotate(" + dataArray[14] + "deg)  saturate(422%)",
          transform: "rotateX(" + dataArray[14] + 50 + "deg)"
        }
      },
      {
        wrapper: {},
        video: {
          filter: "contrast(" + dataArray[1] + "%) brightness(" + dataArray[7] / 2 + "%) hue-rotate(" + dataArray[14] + "deg)  saturate(422%)",
          transform: "rotateY(" + dataArray[2] + 5 + "deg)"
        }
      },
      {
        wrapper: {
          perspective: dataArray[4] * 2 + "px"
        },
        video: {
          filter: "contrast(" + dataArray[1] + "%) brightness(" + dataArray[7] / 2 + "%) hue-rotate(" + dataArray[14] + "deg)  saturate(422%)"
        }
      },
      {
        wrapper: {
          perspective: dataArray[4] * 2 + "px"
        },
        video: {
          filter: "contrast(" + dataArray[1] + "%) brightness(" + dataArray[14] / 2 + "%) hue-rotate(" + dataArray[6] + "deg)  saturate(422%)",
          transform: "scale(" + dataArray[10] / 300 + ")"
        }
      }
    ];
  }

  function stylingLoop() {
    allStyles = videoStyles();
    currentStyles = allStyles[currentStyleIndex];
    applyStyles(currentStyles);
    setTimeout(stylingLoop, loopSpeed);
  }

  function applyStyles(styles) {
    for(let wrapperStyleName in styles.wrapper){
      videoWrapper[wrapperStyleName] = styles.wrapper[wrapperStyleName];
    }
    for(let videoStyleName in styles.video){
      videos[videoStyleName] = styles.video[videoStyleName];
    }
  }

  function adjustAnalyserSettings(event) {
    switch(event.keyCode){
      // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code#Code_values_on_Windows
      // Change to event.code for better readability
      case 50:
        loopSpeed = loopSpeed * 2;
      case 49:
        loopSpeed = loopSpeed / 2;
      case 48:
        currentStyleIndex = Math.min(currentStyleIndex + 1, videoStyles().length - 1);
      case 57:
        currentStyleIndex = Math.max(currentStyleIndex - 1, 0)
    }
  }

  return {
    run: run
  };
}