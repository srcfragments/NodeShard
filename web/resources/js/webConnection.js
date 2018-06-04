/**
 * Created by gkyuchukov on 06.12.17.
 */


var loc = window.location, new_uri;

if (loc.protocol === "https:") {
    new_uri = "wss:";
} else {
    new_uri = "ws:";
}
new_uri += "//localhost:8000/";


console.log(new_uri);
var ws = new WebSocket(new_uri);

ws.onopen = function() {
};

ws.onmessage = function (evt) {
    var received_msg = evt.data;
    processRecievedData(received_msg);
};

ws.onclose = function() {
};


//
// main model variables
//

var monitoredDataPorts = {};
var updateDataFieldValues = {};


//
// process received data handlers
//

function processRecievedData(received_msg) {
    var msg = JSON.parse(received_msg);

    var type =msg.type;
    var data = msg.data;

    if (type == "resourceStructure") {
        processResourceStructureMessage(data);
    } else if (type == "dataFieldsValues") {
        processDataFieldsValuesMessage(data);

    }
}

function processResourceStructureMessage(data) {
    modelHandler.updateSystemStructure(data);
}


function processDataFieldsValuesMessage(data) {
    modelHandler.updateFieldsValues(data);
}

//
// tick functions
//

var interval = setInterval(webSocketTickFunction, 100);

var messageFLags = {
    markForMonitoringMessageFlag: false,
    updateDataFieldsValuesMessageFlag: false,
}

function webSocketTickFunction() {
    if (messageFLags.markForMonitoringMessageFlag == true) {
        messageFLags.markForMonitoringMessageFlag = false;

        var message = generateMarkForMonitoringMessage();
        ws.send(message);
    } else if (messageFLags.updateDataFieldsValuesMessageFlag == true) {
        messageFLags.updateDataFieldsValuesMessageFlag = false;

        var message = generateUpdateFieldsValuesMessage();
        ws.send(message);
    }
}

function generateMarkForMonitoringMessage() {
    var monitoredIds = modelHandler.getAllMonitoredIds();
    monitoredDataPorts = monitoredIds;

    var message = {
        type: 'markDataForMonitoring',
        data: monitoredDataPorts
    }

    return JSON.stringify(message);
}

function generateUpdateFieldsValuesMessage() {
    var message = {
        type: 'updateFieldsData',
        data: updateDataFieldValues
    }

    updateDataPortValues = {};
    return JSON.stringify(message);
}