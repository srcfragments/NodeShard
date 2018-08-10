var resourcesModel = require('../src/resourcesModel.js');

var CONSTANT_REPEATER_DRIVER_MODULE_TYPE = "CONSTANT_REPEATER";



//////////////////////////////////////////////////////////////////////////////////////////////

function ConstantRepeaterDriver(moduleResource){
    this.moduleResource = moduleResource;
    this.id = this.moduleResource.id;

    this.init();
}

//////////////////////////////////////////////////////////////////////////////////////////////


ConstantRepeaterDriver.prototype={
    init: function() {
    },

    start: function() {
        this.moduleResource.active = true;
    },

    processTick: function() {
        var inPort =  this.moduleResource.dataPorts['IN_CONSTANT'];
        var outPort =  this.moduleResource.dataPorts['OUT_CONSTANT'];

        outPort.value = inPort.value;
    },



    getType: function() {
        return CONSTANT_REPEATER_DRIVER_MODULE_TYPE;
    }

};

module.exports={
    create: function(moduleResource) {
        return new ConstantRepeaterDriver(moduleResource);
    },

    type: CONSTANT_REPEATER_DRIVER_MODULE_TYPE
};


