var resourcesModel = require('../resourcesModel.js');
var constantRepeaterModel = require('./ConstantRepeaterModel.js');
var CircularBuffer = require('../CircularBuffer.js');

var CONSTANT_REPEATER_DRIVER_MODULE_TYPE = "CONSTANT_REPEATER";


//
// move different arduinos condigurations in different files
//

function getModel () {

    return constantRepeaterModel.getModel();
}

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

        outPort.type = inPort.type;
        outPort.value = inPort.value;
        outPort.properties['pin mode'].value = inPort.properties['pin mode'].value;
    },



    getType: function() {
        return CONSTANT_REPEATER_DRIVER_MODULE_TYPE;
    }

};

module.exports={
    create: function(moduleResource) {
        return new ConstantRepeaterDriver(moduleResource);
    },

    getModel: getModel,

    type: CONSTANT_REPEATER_DRIVER_MODULE_TYPE
};


