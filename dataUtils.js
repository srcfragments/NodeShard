function getPortNumberFromPortDescriptor(portDescriptor) {
    return (portDescriptor & 0xFC) >> 2;
}

function getDataSizeClassFromPortDescriptor(portDescriptor) {
    return portDescriptor & 0x03;
}

function createPortDescriptor(portNumber, dataSizeCLass) {
    var portDescriptor = (portNumber & 0x3F) << 2;
    portDescriptor = portDescriptor + (dataSizeCLass & 0x03);

    return portDescriptor;
}

function dataToByte(data) {
    return data & 0xFF;
}

function dataToShort(data) {
    return data & 0x0000ffff;
}

function dataToInt(data) {
    return data & 0xffffffff;
}

function readLowLevelValToDataGroup(dataPort, dataBuffer) {

    var value = readLowLevelVal(dataPort, dataBuffer);
    dataPort.value = value;
}

function readLowLevelVal(dataPort, dataBuffer) {

    if (dataPort.type == "BOOLEAN" && dataPort.dataSizeClass == 0) {
        var val = dataBuffer.readByte();

        if (val != 0) {
            return "true";
        } else {
            return "false";
        }
    }

    if (dataPort.type == "INTEGER") {
        if (dataPort.dataSizeClass == 0) {

            var val = dataBuffer.readByte();
            return val;
        } else if (dataPort.dataSizeClass == 1)  {

            var val = dataBuffer.readShort();
            return val;
        } else if (dataPort.dataSizeClass == 2)  {

            var val = dataBuffer.readInt();
            return val;
        }
    }

    if (dataPort.type == "STRING") {

        var stringSize = dataBuffer.readByte();
        var strCodes = [];
        for (var indx = 0; indx < stringSize; indx++) {
            strCodes.push(dataBuffer.readByte());
        }

        return bin2String(strCodes);
    }
}

function bin2String(array) {
    return String.fromCharCode.apply(String, array);
}

function writeLowLevelVal(dataGroup, dataBuffer) {

    if (dataGroup.type == "BOOLEAN" && dataGroup.dataSizeClass == 0) {
        if (dataGroup.value == "true") {
            dataBuffer.addByte(1);
        } else {
            dataBuffer.addByte(0);
        }
    }

    if (dataGroup.type == "INTEGER") {
        if (dataGroup.dataSizeClass == 0) {
            dataBuffer.addByte(dataGroup.value);
        } else if (dataGroup.dataSizeClass == 1)  {
            dataBuffer.addShort(dataGroup.value);
        } else if (dataGroup.dataSizeClass == 2)  {
            dataBuffer.addInt(dataGroup.value);
        }
    }

    if (dataGroup.type == "STRING") {
        var value = dataGroup.value;
        var stringSize = value.length;

        dataBuffer.addByte(stringSize);

        for (var indx = 0; indx < stringSize; indx++) {
            var char = value.charCodeAt(indx);
            dataBuffer.addByte(char);
        }

    }
}


module.exports={
    getPortNumberFromPortDescriptor:getPortNumberFromPortDescriptor,
    getDataSizeClassFromPortDescriptor:getDataSizeClassFromPortDescriptor,
    createPortDescriptor:createPortDescriptor,
    dataToByte:dataToByte,
    dataToShort:dataToShort,
    dataToInt:dataToInt,

    readLowLevelVal:readLowLevelVal,
    writeLowLevelVal:writeLowLevelVal,
}