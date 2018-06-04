/**
 * Created by gkyuchukov on 14.10.17.
 */

var CircularBuffer = require('./CircularBuffer.js');

const CONSTANTS = {
    COMM_START_BYTE:100,
    COMM_HEADER_SIZE:5,

    COMM_START_BYTE_INDEX:0,
    COMM_MSG_TYPE_INDEX:1,
    COMM_DATA_SIZE_INDEX:2,
    COMM_DATA_CHECKSUM_INDEX:3,
    COMM_HEADER_CHECKSUM_INDEX:4,

    COMM_MSG_TYPE_IDENTIFY:1,

    COMM_MSG_TYPE_SYNC_IN_VECTOR_DATA:4,
    COMM_MSG_TYPE_SYNC_OUT_VECTOR_DATA:5
}


function generateMessage(messageType, messageData) {
    var message = CircularBuffer(200);
    message.addByte(CONSTANTS.COMM_START_BYTE); // start byte
    message.addByte(messageType);  // message type
    message.addByte(messageData.length); //data size
    message.addByte(getDataChecksum(messageData)); // data checksum
    message.addByte(getChecksum(message)); // header checksum

    // cicle to write data
    var dataSize = messageData.length;
    for (var i = 0; i < dataSize; i++) {
        var byte = messageData[i];
        message.addByte(byte);
    }

    message = message.getDataAsArray();
    return message;
}


function getDataChecksum(messageData) {
    var result = 0;
    var dataSize = messageData.length;

    for (var i = 0; i < dataSize; i++) {
        var byte = messageData[i];
        result = result + byte;
        result = result % 256;
    }

    return result;

}

function getChecksum(buff) {
    var result = 0;
    var dataSize = buff.usedSpace();

    for (var i = 0; i < dataSize; i++) {
        var byte = buff.peekData(i);
        result = result + byte;
        result = result % 256;
    }

    return result;

}


module.exports = {
    CONSTANTS: CONSTANTS,
    generateMessage: generateMessage
}