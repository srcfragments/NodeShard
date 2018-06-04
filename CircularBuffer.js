function CircularBuffer(capacity){
    if(!(this instanceof CircularBuffer))return new CircularBuffer(capacity);

    if(Array.isArray(capacity) == true) {
        this._buffer = capacity;
        this._size = capacity.length;
        this._readIndex = 0;
        this._writeIndex = capacity.length;

        return;

    } else if(typeof capacity!="number"||capacity%1!=0||capacity<1)
            throw new TypeError("Invalid capacity");

    this._buffer = new Array(capacity);
    this._size = capacity;
    this._readIndex = 0;
    this._writeIndex = 0;

    return;
}

CircularBuffer.prototype={
    freeSpace: function() {
        if (this._readIndex > this._writeIndex) {
            return this._readIndex - this._writeIndex;
        } else {
            return this._size - this._writeIndex + this._readIndex;
        }
    },

    usedSpace: function() {
        if (this._writeIndex >= this._readIndex) {
            return this._writeIndex - this._readIndex;
        } else {
            return this._size - this._readIndex + this._writeIndex;
        }
    },

    addByte: function(byte) {
        var byte = (byte & 0x000000ff);

        this._buffer[this._writeIndex] = byte;
        this._writeIndex++;
        if (this._writeIndex >= this._size) {
            this._writeIndex = 0;
        }
    },

    addShort: function(short) {
        var dataHi = (short & 0x0000ff00) >> 8;
        var dataLow = (short & 0x000000ff);

        this.addByte(dataHi);
        this.addByte(dataLow);
    },

    addInt: function(int) {

        var data = (int & 0xff000000) >> 24;
        this.addByte(data);

        data = (int & 0x00ff0000) >> 16;
        this.addByte(data);

        data = (int & 0x0000ff00) >> 8;
        this.addByte(data);

        data = (int & 0x000000ff);
        this.addByte(data);
    },

    readByte: function() {
        var data = this._buffer[this._readIndex];

        this._readIndex++;
        if (this._readIndex >= this._size) {
            this._readIndex = 0;
        }

        return data;
    },

    readShort: function() {
        var dataHi = this.readByte();
        var dataLow = this.readByte();

        var val =  ((dataHi & 0xFF) << 8) | (dataLow & 0xFF);

        return val;
    },

    readInt: function() {
        var data3 = this.readByte();
        var data2 = this.readByte();
        var data1 = this.readByte();
        var data0 = this.readByte();

        var val =  ((data3 & 0xFF) << 24) | ((data2 & 0xFF) << 16) |
                   ((data1 & 0xFF) << 8) | (data0 & 0xFF);

        return val;
    },


    peekData: function(indexAhead) {
        var index = (this._readIndex + indexAhead) % this._size;
        var data = this._buffer[index];

        return data;
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

    getDataAsArray: function () {
        return this.peekDataArray(0, this.usedSpace());
    }

};

module.exports=CircularBuffer;