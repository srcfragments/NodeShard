/**
 * Created by gkyuchukov on 14.10.17.
 */
var frameworkContext = require('./frameworkContext');

var CircularBuffer = require('./CircularBuffer.js');
var SerialPort = require('serialport');
var comUtilities = require('./ComUtilities.js');
var modulesManager = require('./ModulesManager');
var resourceInterface = require('./ResourceInterface.js');
var dataUtils = require('./dataUtils.js');

var messageHandlers = {};
var activeSerialPorts = {};

var ScanTimer = null;
var baudRate = 9600;

// callback approach
function SerialPortScan(scanPattern) {
    SerialPort.list(function (err, ports) {
        ports.forEach(function(port) {

            if (port.comName.indexOf('/dev/ttyACM') != -1) {
                if (activeSerialPorts[port.comName] == null ||
                    activeSerialPorts[port.comName] == undefined) {

                    var portHandler = new PortHandler(port);
                    portHandler.openPort(baudRate);
                }
            }


            //console.log(port.comName);
            //console.log(port.pnpId);
            //console.log(port.manufacturer);
        });
    });
}

function PortHandler(portIdentity){

    this.portName = portIdentity.comName;
    this.receiverBuffer = new CircularBuffer(1000);
    this.sendMessageQueue = [];
    this.inactivityTimer = 0;
    this.transmitDelay = 30;
    this.busyWritting = false;
    this.boardId = null;
    this.port = null;
}

PortHandler.prototype={
    openPort: function(baudRate) {
        var handler = this;
        var port = new SerialPort(handler.portName, {baudRate: baudRate}, function (err) {
            if (err) {
                console.log('Error: ', err.message);
                return null;
            }

            handler.port = port;

            // Switches the port into "flowing mode"
            port.on('data', function (data) {
                handler.receiverGetData(data);
            });

            console.log('PORT OPENED');

            activeSerialPorts[handler.portName] = handler;

            sendMessage(handler.portName, comUtilities.CONSTANTS.COMM_MSG_TYPE_IDENTIFY, []);
        });
    },

    isAvailableForWrite: function() {
        return this.busyWritting == false && this.transmitDelay == 0;
    },

    writeToPort: function(message) {
        this.busyWritting = true;
        var handler = this;
        handler.port.write(message, function(err) {
            if (err) {
                handler.busyWritting = false;
                console.log('Error on write: ', err.message);
                return null;
            }
            handler.busyWritting = false;
            //console.log('message written');
            return true;
        });


       // handler.port.drain(function() {

       // })

    },

    receiverGetData: function(data) {
        for (var i = 0; i < data.length; i++) {
            var byte = data[i];

            if (this.receiverBuffer.freeSpace() > 1) {
                this.receiverBuffer.addByte(byte);
            }
        }

        this.processRecievedData();
    },


    processRecievedData: function() {
        var unprocessedData = this.receiverBuffer.usedSpace();

        while (unprocessedData > 0) {
            var skipped = false;
            var token = this.receiverBuffer.peekData(comUtilities.CONSTANTS.COMM_START_BYTE_INDEX);

            if (token == comUtilities.CONSTANTS.COMM_START_BYTE) {

                if (unprocessedData >= comUtilities.CONSTANTS.COMM_HEADER_SIZE) {
                    var type = this.receiverBuffer.peekData(comUtilities.CONSTANTS.COMM_MSG_TYPE_INDEX);
                    var msgSize = this.receiverBuffer.peekData(comUtilities.CONSTANTS.COMM_DATA_SIZE_INDEX);
                    var checksumData = this.receiverBuffer.peekData(comUtilities.CONSTANTS.COMM_DATA_CHECKSUM_INDEX);
                    var checksumHeader = this.receiverBuffer.peekData(comUtilities.CONSTANTS.COMM_HEADER_CHECKSUM_INDEX);

                    var temp = (comUtilities.CONSTANTS.COMM_START_BYTE + type + msgSize + checksumData) % 256;

                    //valid header
                    if (temp == checksumHeader) {
                        if (unprocessedData >= comUtilities.CONSTANTS.COMM_HEADER_SIZE + msgSize) {
                            // skip header
                            this.receiverBuffer.skipData(comUtilities.CONSTANTS.COMM_HEADER_SIZE);

                            // calcolate data checksum
                            temp = 0;
                            var dt = this.receiverBuffer.peekDataArray(0, msgSize);
                            for (var indx = 0; indx < msgSize; indx++) {
                                temp = (temp + dt[indx]) % 256;
                            }

                            //valid package
                            if (temp == checksumData) {

                                processPackage(this, type, dt);

                                //skip message
                                this.receiverBuffer.skipData(msgSize);
                                return;
                            }
                        } else {
                            return;
                        }
                    }
                } else {
                    return;
                }

            }// else {
             //   token = this.receiverBuffer.readByte();
             //   unprocessedData--;
             //   skipped = true;
            //}

           // if (skipped == false) {
                token = this.receiverBuffer.readByte();
                unprocessedData--;
           // }

        }
    },

    peekDataArray: function(indexAhead, dataSize) {
        var result =  new Array(dataSize);

        for (var i = 0 ;i < dataSize; i++) {
            result[i] = this.peekData(indexAhead + i);
        }

        return result;
    },

    skipData: function(dataSize) {
        this._readIndex = (this._readIndex + dataSize) % this._size;
    },

    close: function () {
        this.port.close();
    }

};


function processPackage(channel, type, dt) {
    channel.inactivityTimer = 0;

    var messageHandler = messageHandlers[type];
    if (messageHandler != null && messageHandler != undefined) {
        messageHandler(channel, "serialComHandler", dt);
    }
}


var tickTmer = null;

function SerialComHandlerTick() {
    syncOutVectors();
    portsProcess();
}

function portsProcess() {
    for (var key in activeSerialPorts) {
        var serialPortHandler = activeSerialPorts[key];

        if (serialPortHandler == null) {
            var t = 2;
        }
        var isAvailableForWrite = serialPortHandler.isAvailableForWrite();
        if ((serialPortHandler.sendMessageQueue.length > 0) && (isAvailableForWrite == true)) {
            var message = serialPortHandler.sendMessageQueue.pop();
            serialPortHandler.writeToPort(message);
        }

        serialPortHandler.inactivityTimer++;
        if (serialPortHandler.inactivityTimer > 600) {
            serialPortHandler.close();
            activeSerialPorts[key] = null;
        }

        if (serialPortHandler.transmitDelay > 0) {
            serialPortHandler.transmitDelay--;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

var comChannelToDeviceId = {};
var deviceIdToCommVectors = {};
var syncOutVectorsTimeout = 0;


function syncOutVectors() {


    if (syncOutVectorsTimeout > 0) {
        syncOutVectorsTimeout--;
        return;
    }
    syncOutVectorsTimeout = 1;


    for (var commChannel in comChannelToDeviceId) {
        var deviceId = comChannelToDeviceId[commChannel];

        if (deviceId != null && deviceId != undefined) {
            var commVectors = deviceIdToCommVectors[deviceId];

            if (commVectors != null && commVectors != undefined &&
                commVectors.commVectorOutbound != null && commVectors.commVectorOutbound != undefined)
            {
                    var message = generateSyncOutVectorMessage(commVectors.commVectorOutbound);
                    sendMessage(commChannel, comUtilities.CONSTANTS.COMM_MSG_TYPE_SYNC_IN_VECTOR_DATA, message);
            }
        }
    }
}



function generateSyncOutVectorMessage(commVector) {
    var dataVector =  new CircularBuffer(400);

    for (var i = 0; i < commVector.length; i++) {
        var vectorElement = commVector[i];
        var portId = vectorElement.portId;

        var dataField = resourceInterface.getResourcesById(portId);
        if (dataField != null && dataField != undefined) {
            dataUtils.writeLowLevelVal(dataField, dataVector);
        }
    }

    return dataVector.getDataAsArray();
}

////////////////////////////////////////////////////////////////////////////////


function handleIdentificationMessage(channel, driver, data) {
    var buff = new CircularBuffer(data);

    var boardId = buff.readShort();
    channel.boardId = boardId;

    //map channel to moduleid
    comChannelToDeviceId[channel.portName] = boardId;
    deviceIdToCommVectors[boardId] = resourceInterface.getCommVectorsForDevice(boardId);

}


function handleSyncInMessage(channel, driver, data) {
    var buff = new CircularBuffer(data);
    var deviceId = comChannelToDeviceId[channel.portName];

    if (deviceId != null && deviceId != undefined) {
        var commVectors = deviceIdToCommVectors[deviceId];

        if (commVectors != null && commVectors != undefined &&
            commVectors.commVectorInbound != null && commVectors.commVectorInbound != undefined)
        {
           var syncInVector = commVectors.commVectorInbound;

           for (var vectorElementIn in syncInVector) {
               var vectorElement = syncInVector[vectorElementIn];
               var portId = vectorElement.portId;

               var dataField = resourceInterface.getResourcesById(portId);
               if (dataField != null && dataField != undefined) {

                   var value = dataUtils.readLowLevelVal(dataField, buff);

                   if (dataField.controllable != true && dataField.control != "SYNC_OUT") {
                       dataField.setValue(value);
                   }
               }
           }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////


function isChannelAvailableToSend(channel) {
    var handler = activeSerialPorts[channel];

    if (handler != null && handler != undefined) {
        if (handler.sendMessageQueue.length < 3) {
            return true;
        }
    }

    return false;

}

function sendMessage (channel, type, data) {
    var handler = activeSerialPorts[channel];

    if (isChannelAvailableToSend(channel) == true) {
        var message = comUtilities.generateMessage(type, data);

        handler.sendMessageQueue.push(message);
    }

    return false;
}



messageHandlers[comUtilities.CONSTANTS.COMM_MSG_TYPE_IDENTIFY] = handleIdentificationMessage;
messageHandlers[comUtilities.CONSTANTS.COMM_MSG_TYPE_SYNC_OUT_VECTOR_DATA] = handleSyncInMessage;

module.exports = {
    addMessageHandler: function (type, handler) {
        messageHandlers[type] = hanlder;
    },

    sendMessage: sendMessage,

    isChannelAvailableToSend: isChannelAvailableToSend,

    init: function(serviceNode) {
        frameworkContext.setContext("serialComHandler", this);

        var baudRateTemp = serviceNode.dataFields.com.value;
        if (parseInt(baudRateTemp) != NaN) {
            baudRate = parseInt(baudRateTemp);
        }
    },

    start: function() {
        var ScanTimer = setInterval(SerialPortScan, 1000);
        var tickTmer = setInterval(SerialComHandlerTick, 100);
    },

    stop: function() {
        clearInterval(ScanTimer);
        clearInterval(tickTmer);

        for (key in activeSerialPorts) {
            var portHandler = activeSerialPorts[key];
            portHandler.close();
        }
    }

}