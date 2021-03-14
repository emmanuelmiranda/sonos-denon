# sonos-denon
Switch denon input to the right thing when sonos starts playing

### Dependencies

* node
* npm

### Installation

``` 
git clone https://github.com/emmanuelmiranda/sonos-denon.git
cd sonos-denon
npm install
```

### Usage

Swap out the IP addresses to those from your network.

You may optionally override the interval (in milliseconds) at which the script is executed.

```
SONOS_HOST=192.168.X.XX DENON_HOST=192.168.X.XX INTERVAL=10000 node switchAvrOnSonosPlay.js
```
