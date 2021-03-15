var Sonos = require('./node_modules/sonos/').Sonos
var Denon = require('./node_modules/denon-avr/')

var sonos = new Sonos(process.env.SONOS_HOST || '192.168.1.223', process.env.SONOS_PORT || 1400);
var denonHost = process.env.DENON_HOST ||'192.168.1.198';

var sonosAvrSource = process.env.SONOS_AVR_SOURCE || "CD";
var sonosAvrInputMode = process.env.SONOS_AVR_INPUT || "AUTO";
var interval = process.env.INTERVAL || 5000;

var currentAvrSource = null;
var currentAvrInputMode = null;

var originalAvrSource = null;
var originalAvrInputMode = null;

var avr = new Denon(new Denon.transports.telnet({
    host: denonHost,     // IP address or hostname
    debug: false   // Debug enabled
}));

console.log('Before connect');

avr.connect();

console.log('after connect');

avr.on('connect', function() {
  console.log('Connected');
  beginLoop();
});

function beginLoop()
{
  console.log('Begining avr loop');

  getAvrState(function()
  {
    getAvrInputMode(function(){
      sonos.getCurrentState(getCurrentSonosStateCallback);
        setTimeout(beginLoop, interval);
    });
  });




}


function getAvrInputMode(callback)
{
 avr.send('SD?', 'SD', function(err,Source)
 {
   if(err==null)
   {
    currentAvrInputMode = Source;
    console.log("Current input mod", currentAvrInputMode);
    if (null === originalAvrInputMode) originalAvrInputMode = Source;
   }
   if(callback!=null)
   {
     callback();
   }
 }
 , 'Unable to query current inputMode');
}


function getAvrState(callback)
{
  function getSourceCallback(err, currentSource)
  {
    if(err==null)
    {
      currentAvrSource = currentSource;
      if (null === originalAvrSource) originalAvrSource = currentSource;
    }
    console.log("Current Source", currentAvrSource);
    if(callback!=null)
    {
      callback();
    }
  }
  avr.getSource(getSourceCallback)
}


function getCurrentSonosStateCallback(err,track)
{
  console.log("Current Sonos state: "+track);
  if(track=="playing")
  {
    if ( !isAvrInput(sonosAvrInputMode) || !isAvrSource(sonosAvrSource))
    {
      playSonosOnAVR();
    }
  }
  else if (isAvrSource(sonosAvrSource)) //only switch input back if we're on the sonos input
  {
    if ( !isAvrInput(originalAvrInputMode) || !isAvrSource(originalAvrSource))
    {
      SetInputBackToOriginal(getCurrentSonosStateCallback);
    }
  }
}


function isAvrSource(source)
{
    return currentAvrSource == source;
}

function isAvrInput(input)
{
    return currentAvrInputMode == input || currentAvrInputMode == "AUTO";
}


function callback(myparam,param2,param3)
{
  console.log('callback switchero', myparam, param2,param3);

}


function playSonosOnAVR() {
    console.log("playing, switching to sonos");
    var inputModeCommand = toAvrInputMode(sonosAvrInputMode);
    var sourceCommand = toAvrSource(sonosAvrSource);
    avr.send(inputModeCommand, callback, "Unable to switch input to digital");
    avr.send(sourceCommand, callback, "Unable to switch input to digital");
}


function SetInputBackToOriginal() {
    var inputModeCommand = toAvrInputMode(originalAvrInputMode);
    var sourceCommand = toAvrSource(originalAvrSource);
    avr.send(inputModeCommand, callback, "Unable to switch input to digital");
    avr.send(sourceCommand, callback, "Unable to switch input to digital");
}


function SetInputToPC()
{
avr.send("SISAT/CBL",callback, "Unable to switch input to digital");
avr.send("SDAUTO",callback, "Unable to switch input to digital");
}


function toAvrInputMode(inputMode)
{
    return "SD" + inputMode;
}

function toAvrSource(source)
{
    return "SI" + source;
}
