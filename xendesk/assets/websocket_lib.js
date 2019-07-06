var { EventEmitter } = require('events');
var interval = 0;
var reconn_interval = 0;

//var url = "wss://socket.ajrgroup.in/ws-api/voice/";
//var url = document.socket_url;
//var pushd_url = document.pushd_url; //https://pushd.ajrgroup.in/subscribe?events=
var pushd_url = "https://pushd.ajrgroup.in/subscribe?events=";
//produrl
// var pushd_url = "https://pushd.xenvoice.com/subscribe?events=";

var localhost = "0.0.0.0";
const domainName = location.origin.includes(localhost) ? 'xenvoice' : location.origin.split('.')[1];
var filexmlhttp;
var eventEmitter = new EventEmitter();
var reconnect = true;
const retryTime = 15000; //retry to handshake if lost socket connection for 15 sec
var wsarray = [];

function Socket() {
  this.socket = null;
}

Socket.prototype.logs = function (operation, websocketstat, info) {
  console.log('sender' + operation + '*****' + websocketstat + '******' + info);
}

//send message to socket server
Socket.prototype.send = function (obj) {
  var data = typeof obj == "object" ? JSON.stringify(obj) : obj;
  var readyState = window.socket.readyState;
  if (!(window.socket.CLOSED == readyState || window.socket.CLOSING == readyState)) {
    this.logs(obj.event_name, readyState, data)
    window.socket.send(data);
  }
}



//socket handshake happens here
Socket.prototype.connect = function (params, callback) {
  var self = this;
  try {

    if (wsarray.length > 0) {
      var socketCount = wsarray.length;

      while (socketCount--) {
        console.log("Status:", wsarray[socketCount].readyState, wsarray[socketCount].url, wsarray[socketCount]);
        wsarray[socketCount].close();
        wsarray.splice(socketCount, 1);
      }

    }
    // Ensures only one connection is open at a time
    if (window.socket !== undefined && window.socket.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket is already opened.", window.socket.url);
      return;
    }

    // var xurl = url + domainName + '/' + localStorage[domainName] + '/' + Math.floor(100000 + Math.random() * 900000);
    var push_url = pushd_url + params;
    var es = new EventSource(push_url);
    es.addEventListener('open', function (e) {
      console.log("pushd connected", e);
    });
    es.addEventListener('error', function (e) {
      console.log("pushd error", e);
    });
    es.addEventListener('message', function (e) {
      console.log("pushd message", e);
      if (e.data) {
        var temp = JSON.parse(e.data).message.default;
        var data = typeof temp == "string" ? JSON.parse(temp) : temp;
        if (data.event_name) {
          console.log(data.event_name, "ON MESSAGE inside socket");
          eventEmitter.emit(data.event_name, data);
        }
        else {
          console.log("missing event_name or invalid event_name :: " + data.event_name);
        }
      }
    });


    /* var ws = new WebSocket(xurl);
     wsarray.push(ws);
     //socket handling on open
     ws.onopen = function(event) {
         console.log('****************************opened****************************************')
         window.socket = ws;
         window.socket.onmessage = function(e) { //receive socket messages from server
             if (e.data) {
                 var data = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
                 if (data.event_name)
                 {
                     console.log(data.event_name, "ON MESSAGE inside socket");
                     eventEmitter.emit(data.event_name, data);
                 }
                 else {
                     console.log("missing event_name or invalid event_name :: " + data.event_name);
                 }
             }
         }
         //socket handling on close
         window.socket.onclose = function(e) {
             var readyState = window.socket.readyState;
             reconnect = true;
             clearInterval(interval);
             reconn_interval = setInterval(function() {
                 if (window.socket)
                     self.reconnect();
             }, retryTime);
             if (e.code == '1006') {
                 console.log('something went wrong at chat server, trying to reconnect...');
             } else {
                 console.log("chat server down, try after some time");
             }
         }
         //socket handling on error
         window.socket.onerror = function(e) {
             console.log("***********socket error**************", e.reason, e)
         }
         callback({ "status": "connected", "success": true })
     }; */

  } catch (ex) {

    console.log('exception in socket connection', ex);
  }
}

//to keep tcp connection active do ping pong
Socket.prototype.startPinging = function () {
  var message = {
    event_name: "ping",
  };
  var self = this;
  interval = setInterval(function () {
    if (window.socket)
      self.send(message);
  }, 20000);
}

//stop when network disconnect or some thing goes wroung at server
Socket.prototype.stopPinging = function () {
  clearInterval(interval);
}


Socket.prototype.listen = function (cb) {
  var self = this;
  try {
    eventEmitter.on('incoming_notification', function (data) {
      self.logs('in listen method********* ', 'incoming_notification', JSON.stringify(data))
      cb('incoming_notification', data);
    });
    eventEmitter.on('incoming_sms_notification', function (data) {
      self.logs('in listen method********* ', 'incoming_sms_notification', JSON.stringify(data))
      cb('incoming_sms_notification', data);
    });
    eventEmitter.on('incoming_fax_notification', function (data) {
      self.logs('in listen method********* ', 'incoming_fax_notification', JSON.stringify(data))
      cb('incoming_fax_notification', data);
    });
    eventEmitter.on('outgoing_notification', function (data) {
      self.logs('in listen method********* ', 'outgoing_notification', JSON.stringify(data))
      cb('outgoing_notification', data);
    });
    eventEmitter.on('pong', function (data) {
      self.logs('in listen method********* ', 'pong', JSON.stringify(data))
      cb('pong', data);
    });
    eventEmitter.on('stop_ring', function (data) {
      console.log(data, "inside socket stop ring method");
      self.logs('in listen method********* ', 'stop_ring', JSON.stringify(data))
      cb('stop_ring', data);
    });
  } catch (e) { console.error("[WebRtcLib:listen] excep ", e); }
}



Socket.prototype.disconnect = function () {
  if (window.socket) {
    var obj = {};
    obj.status = 'logout';
    window.socket.close(4000, JSON.stringify(obj));
  }
}

//reconnect when lost connection or socket server is down
Socket.prototype.reconnect = function (data) {
  var self = this;
  if (reconnect) {
    this.connect(function (res) {
      reconnect = false;
      self.startPinging();
      clearInterval(reconn_interval);
    });
  }
}

Socket.prototype.accepted = function (userid, notification_id) {
  // var self = this;
  var message = {
    event_name: "answer",
    userid: userid,
    notification_id: notification_id
  };
  this.send(message);
}

Socket.prototype.rejected = function (userid, notification_id) {
  //   var self = this;
  var message = {
    event_name: "reject",
    userid: userid,
    notification_id: notification_id
  };
  this.send(message);
}

//Socket.prototype.outgoing = function (from_number) {
//  //   var self = this;
//  var message = {
//    from_number: from_number,
//    event_name: "outgoing",
//    userid: localStorage[domainName]
//  };
//  this.send(message);
//}

Socket.prototype.stopRing = function (notification_id) {
  //   var self = this;
  var message = {
    event_name: "stop_ring",
    notification_id: notification_id
  };
  this.send(message);
  console.log("Stop Ring sent to socket");
}
