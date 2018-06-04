/**
 * Created by gkyuchukov on 15.12.17.
 */


function parseScript(script) {
    var functionExecutor = new Function("api", script);
    return functionExecutor;
}

function executeScript(script) {
    try {
        var result = script(api, context);
        return {resultType: "SUCCESS"};
    } catch (error) {
        return {resultType: "ERROR"};
    }
}

var SYSTEM_MODULES_BY_ID = {};

var stopWorker = false;
var running = false;
var userScript = null;

function processIncommingMessage(msg) {
    if (msg != null && msg != undefined) {
        if (msg.type == "SCRIPT") {
            if (userScript  == null || userScript == undefined) {
                userScript = parseScript(msg.value);
                running = true;
            }
        } else if (msg.type == "SYNC_IN_DATA") {

            SYSTEM_MODULES_BY_ID = msg.data.SYSTEM_MODULES_BY_ID;

            if (running == true) {
                apiCache = [];
                executeScript(userScript);
                postMessage({type: "SCRIPT_SYNC_OUT_DATA", data: apiCache});

                api.quit();

                if (stopWorker == true) {
                    stopWorker = false;
                    postMessage({type: "STOP_WORKER"});
                }
            }
        }
    }
}




self.addEventListener('message', function(e) {
    processIncommingMessage(e.data);
});


var apiCache = [];

var api = {


    setDataFieldValue: function(elementId, fieldName, value) {
        apiCache.push({
            command: "setDataFieldValue",
            elementId: elementId,
            fieldName: fieldName,
            value: value
        })
    },

    getDataFieldValue: function(elementId, fieldName) {


        var element = SYSTEM_MODULES_BY_ID[elementId];
        if (element != null && element != undefined) {
            var field = element.dataFields[fieldName];
            var result = {resultType: "SUCCESS", value: field.value};
            console.consoleLog(JSON.stringify(result));
            return result;
        }

        return null;
    },

    setContext: function(name, data) {
        context[name] = data;
    },

    getContext: function(name, data) {
        return context[name];
    },

    quit: function() {
        running = false;
        stopWorker = true;
    }
}

function checkValueType(dataGroup, value) {
    if (dataGroup != null && dataGroup != undefined) {
        if (dataGroup.type == "BOOLEAN") {
            if (value == "true" || value == "false" ||
                value == true || value == false) {
                return true;
            }
        } else if (dataGroup.type == "INTEGER") {
            if (isNaN(value) == false) {
                return true;
            }
        } else if (dataGroup.type == "STRING") {
            return true;
        } else if (dataGroup.type == "OPTION") {
            for (var option in dataGroup.options) {
                if (option == value) {
                    return true;
                }
            }
        }
    }

    return false;
}

var context = {
    state: null
}