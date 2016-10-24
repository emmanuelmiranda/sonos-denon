var Sonos = require('../sonos/').Sonos
var Denon = require('../denon-avr/')

var sonos = new Sonos(process.env.SONOS_HOST || '192.168.1.16', process.env.SONOS_PORT || 1400)

var currentAvrSource = null;
var currentAvrInputMode = null;

var avr = new Denon(new Denon.transports.telnet({
  host: '192.168.1.101',     // IP address or hostname 
  debug: false   // Debug enabled 
}));

avr.connect();

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
        setTimeout(beginLoop,1000);
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
    if(currentAvrInputMode == "AUTO")
    {
      console.log("playing, switching to sonos");
      SetInputToSonos();
    }
  }
  else
  {
    if(currentAvrInputMode != "AUTO")
    {
      console.log("not playing, swithing away from sonos");
      SetInputToNotSonos(getCurrentSonosStateCallback);
    }
  }
}



function callback(myparam,param2,param3)
{
  console.log('callback switchero', myparam, param2,param3);

}


function SetInputToSonos()
{
  var targetInputCommandMode = "SDDIGITAL" //xbox

  if(currentAvrSource == null || currentAvrSource == "SAT/CBL")
  {
    targetInputCommandMode = "SDANALOG"
  }

  avr.send(targetInputCommandMode,callback, "Unable to switch input to digital");
}


function SetInputToNotSonos()
{
  console.log("currentSource",currentAvrSource);
  avr.send("SDAUTO",callback, "mistery");
}


function SetInputToPC()
{
avr.send("SISAT/CBL",callback, "Unable to switch input to digital");
avr.send("SDAUTO",callback, "Unable to switch input to digital");
}