/**
 * Created by gkyuchukov on 14.10.17.
 */
var frameworkContext = require('./frameworkContext');

var resourceInterface = require('./ResourceInterface.js');


//
//  includes and global vars for web socket communication
//

var webSocketTickTimer = null;

var WebSocketServer = require('ws').Server;
var wss = null;

var IPaddress = resourceInterface.getPropertyFromLocalNodeConfig('localMachineNetAddress');
var port = 7999;
var webSocket = null;
var webSocketInactivity = 0;


//
//  service functions for web socket communication
//



function initWebSocketListener() {
    wss = new WebSocketServer({host: IPaddress, port: port});
    wss.on('connection', function(ws, req) {

        // clean up old web socket
        closeWebSocket();

        ws.remoteAddress = req.connection.remoteAddress;
        ws.lastAlive = 0;
        ws.isAlive = true;
        //ws.on('pong', heartbeat);

        console.log('New connection');

        ws.on('message', function(message) {
            var received_msg = message;
            console.log("message got " + received_msg);
            processRecievedData(received_msg, ws);

        });

        ws.on('close',function() {
        });

        webSocket = ws;
    });
}

function closeWebSocket() {
    if (webSocket != null) {
        try {
            webSocket.terminate();
        } catch (err) {}

        webSocket = null;
    }
}

function closeWebSocketListener() {

    if (wss != null) {
        try {
            wss.close();
        } catch (err) {
        }
        wss = null;
    }
}

//
//  includes and global vars for web socket communication
//

function processRecievedData(resp, ws) {

    var respObj = JSON.parse(resp);

    var type = respObj.type;
    var data = respObj.data;

    console.log("received message: type " + type + " data " + JSON.stringify(data));

    if (type == 'getExposedInterfacesData') {
        processGetExposedInterfacesData(data);
    } else if (type == 'setValueToExposedInterface') {
        processSetValueToExposedInterface(data);
    }
}

function processGetExposedInterfacesData(data) {
    messageFLags.generateExposedInterfacesDataMessageflag = true;
}


function processSetValueToExposedInterface(data) {
    resourceInterface.setValueToExportInterfaces(data);

}


function sendMessage(message) {
    if (webSocket != null && webSocket != undefined) {
        webSocket.send(message, function ack(error) {
            if (error != null && error != undefined) {
                console.log("send message error " + error);
                closeWebSocket();
            }
        });
    }
}


var messageFLags = {
    generateExposedInterfacesDataMessageflag:false,
}



function webSocketTickFunction() {
    if (webSocket == null || webSocket == undefined) {
        return;
    }

    if (messageFLags.generateExposedInterfacesDataMessageflag == true) {
        messageFLags.generateExposedInterfacesDataMessageflag = false;

        var message = generateDataMessage();
        sendMessage(message);

    }
}



function generateDataMessage() {
    var message = {
        type: "ExposedFieldsValue",
        data: resourceInterface.getExposedInterfacesData()
    }

    return JSON.stringify(message);
}



module.exports = {


    init: function(serviceNode) {
        frameworkContext.setContext("Exposed_Interfaces", this);

    },

    start: function() {
        initWebSocketListener()
        webSocketTickTimer = setInterval(webSocketTickFunction, 100);
    },

    stop: function() {
        clearInterval(webSocketTickTimer);
        closeWebSocket();
        closeWebSocketListener();
    }
}