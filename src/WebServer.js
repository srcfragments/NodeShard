/**
 * Created by gkyuchukov on 14.10.17.
 */
var frameworkContext = require('./frameworkContext');

var resourceInterface = require('./ResourceInterface.js');

//
//
//  web server part
//

var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var staticBasePath = './web';

var serve = serveStatic(staticBasePath, {'index': ['index.html', 'index.htm']});

var server = http.createServer(function(req, res){
    var done = finalhandler(req, res);
    serve(req, res, done);
})


//
//  includes and global vars for web socket communication
//

var webSocketTickTimer = null;
var monitoredIds = [];


var WebSocketServer = require('ws').Server;
var wss = null;

var IPaddress = 'localhost';
var port = 8000;
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

    if (type == 'updateFieldsData') {
        processUpdateFieldsDataMessage(data);
    } else if (type == 'markDataForMonitoring') {
        processMarkDataForMonitoringMessage(data);
    }
}

function processUpdateFieldsDataMessage(data) {
    resourceInterface.updateDataFieldsValues(data);
}


function processMarkDataForMonitoringMessage(data) {
    for (var i=0; i < data.length; i++) {
        var id = data[i];
        if (monitoredIds.indexOf(id) == -1) {
            monitoredIds.push(id);
        }
    }
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
    generateDataMessageflag:false,
    generateDataMessageCooldown: 0,
    generateDataMessageCooldownBase: 3,

    generateStructMessageflag:false,
    generateStructMessageCooldown: 0,
    generateStructMessageCooldownBase: 10
}

function webSocketTickFunction() {
    if (webSocket == null || webSocket == undefined) {
        return;
    }

    if (messageFLags.generateDataMessageflag == true) {
        messageFLags.generateDataMessageflag = false;

        var message = generateDataMessage();
        sendMessage(message);

    } else if (messageFLags.generateStructMessageflag == true) {
        messageFLags.generateStructMessageflag = false;

        var message = generateStructMessage();
        sendMessage(message);
    }


    messageFLags.generateDataMessageCooldown--;
    if (messageFLags.generateDataMessageCooldown <= 0) {
        messageFLags.generateDataMessageCooldown = messageFLags.generateDataMessageCooldownBase;
        messageFLags.generateDataMessageflag = true;
    }

    messageFLags.generateStructMessageCooldown--;
    if (messageFLags.generateStructMessageCooldown <= 0) {
        messageFLags.generateStructMessageCooldown = messageFLags.generateStructMessageCooldownBase;
        messageFLags.generateStructMessageflag = true;
    }
}

function generateDataMessage() {
    var message = {
        type: "dataFieldsValues",
        data: resourceInterface.getMonitoredData(monitoredIds)
    }

    return JSON.stringify(message);
}

function generateStructMessage() {
    var message = {
        type: "resourceStructure",
        data: resourceInterface.getResourcesStructure()
    }

    return JSON.stringify(message);
}



module.exports = {


    init: function(serviceNode) {
        frameworkContext.setContext("webServer", this);

    },

    start: function() {
        server.listen(8080);
        initWebSocketListener()
        webSocketTickTimer = setInterval(webSocketTickFunction, 100);
    },

    stop: function() {
        clearInterval(webSocketTickTimer);
        closeWebSocket();
        closeWebSocketListener();
        server.close();
    }
}