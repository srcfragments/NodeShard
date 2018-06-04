/**
 * Created by gkyuchukov on 06.12.17.
 */

var consoleLogData = "";

function consoleLog(message) {
    consoleLogData = consoleLogData + message + String.fromCharCode(13, 10);

    consoleRefresh();

}

function consoleRefresh() {
    var console = document.getElementById('console_output');
    if (console != null && console != undefined) {
        console.value = consoleLogData;
    }
}

function executeScript() {
    var htmlConsoleArea = document.getElementById("console_input");
    var command = htmlConsoleArea.value;

    startWorker(command);
}

function stopScript() {
    stopWorker();
}




var scriptWorker = null;

function startWorker(scriptCode) {
    if(typeof(Worker) !== "undefined") {
        if(scriptWorker == null) {
            initWorker(scriptCode);
        } else {
            consoleLog("a previous script is still running...");
        }

    } else {
        consoleLog("Sorry, your browser does not support Web Workers...");
        scriptWorker = null;
    }
}

function initWorker(scriptCode) {
    scriptWorker = new Worker("resources/js/executingEnv.js");

    scriptWorker.onmessage = function(event) {
        processWorkerMessage(event.data);
    };

    scriptWorker.postMessage({type:"SCRIPT", value: scriptCode});
}

function stopWorker() {
    if (scriptWorker != null && scriptWorker != undefined) {
        scriptWorker.terminate();
        scriptWorker = null;
    }

}



function syncDataToScript() {
    if (scriptWorker != null) {
        var systemModulesById = JSON.parse(JSON.stringify(modelHandler.SYSTEM_MODULES_BY_ID));

        var message = {
            type:"SYNC_IN_DATA",
            data: {
                SYSTEM_MODULES_BY_ID: systemModulesById,
                COMMAND_RESULTS_BY_MODULE_ID: commandResultsById
            }
        }
        scriptWorker.postMessage(message);
    }
}

var scriptTimer = setInterval(syncDataToScript, 1000);


function processWorkerMessage(msg) {
    //consoleLog(JSON.stringify(msg));

    if (msg != null && msg != undefined) {
        if (msg.type == "SCRIPT_SYNC_OUT_DATA") {
            var commandQueue = msg.data;
            if (commandQueue != null && commandQueue != undefined) {
                executeCommandQueue(commandQueue);
            }
        } else if (msg.type == "STOP_WORKER") {
            stopWorker();
        }
    }
}


function executeCommandQueue(commandQueue) {
    for (var commandIndex in commandQueue) {
        var command = commandQueue[commandIndex];


        if (command.command == "setDataFieldValue") {
            api.setDataFieldValue(
                command.elementId,
                command.fieldName,
                command.value
            );

        }
    }
}


