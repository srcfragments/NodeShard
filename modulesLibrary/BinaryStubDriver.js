var resourcesModel = require('../src/resourcesModel.js');
var CircularBuffer = require('../src/CircularBuffer.js');
var dataUtils = require('../src/dataUtils');

var BINARY_STUB_MODULE_TYPE = "ARDUINO_UNO";



//////////////////////////////////////////////////////////////////////////////////////////////



function BinaryStubModule(moduleResource){
    this.moduleResource = moduleResource;
    this.id = this.moduleResource.id;

    this.stubType = true;
    this.commDriver = null;
    this.commChannel = null;
    this.attached = false;

    this.init();
}

//////////////////////////////////////////////////////////////////////////////////////////////


BinaryStubModule.prototype={
    init: function() {
        this.initModuleResources();
    },

    initModuleResources: function () {
    },

    start: function() {
        this.moduleResource.active = true;
    },

    processTick: function() {
    },

    getType: function() {
        return BINARY_STUB_MODULE_TYPE;
    }

};

module.exports={
    create: function(moduleResource) {
        return new BinaryStubModule(moduleResource);
    },

    type: BINARY_STUB_MODULE_TYPE
};


