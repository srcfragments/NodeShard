/**
 * Created by gkyuchukov on 06.12.17.
 */


var loc = window.location, new_uri;

if (loc.protocol === "https:") {
    new_uri = "wss:";
} else {
    new_uri = "ws:";
}
new_uri += "//localhost:7999/";


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
// process received data handlers
//

function processRecievedData(received_msg) {
    var msg = JSON.parse(received_msg);

    var type =msg.type;
    var data = msg.data;

    if (type == "ExposedFieldsValue") {
        processExposedFieldsValueMessage(data);
    }
}

function processExposedFieldsValueMessage(data) {
    var workElement = document.getElementById('work-field');
    var stringData = JSON.stringify(data, null, 2);
    workElement.innerHTML = '<pre><code>' + stringData + '</code></pre>';
    console.log(stringData);
}






function generateGetExposedFieldsDataMessage() {
    var message = {
        type: 'getExposedInterfacesData',
        data: ''
    }

    ws.send(JSON.stringify(message));
}


function setValueToServo(val) {
    var message = {
        type: 'setValueToExposedInterface',
        data: {'controlChannel': 'true', 'controlValue': val}
    }

    ws.send(JSON.stringify(message));
}



//
// tick functions
//
var interval = setInterval(generateGetExposedFieldsDataMessage, 1000);