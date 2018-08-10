/*
 * frameworkContext.js
 */

var binaryStubDriver = require('./BinaryStubDriver.js');
var constantRepeaterDriver = require('./ConstantRepeaterDriver');

var factoryMap = {};

factoryMap[binaryStubDriver.type] = binaryStubDriver;
factoryMap[constantRepeaterDriver.type] = constantRepeaterDriver;

function createModule(moduleResource, isOnLocalMachine) {
    var moduleType = moduleResource.type;
    var moduleHandler = null;


    if (isOnLocalMachine == false || moduleResource.type == "EXPOSED_MONITOR" || moduleResource.type == "EXPOSED_CONTROLLER") {
        moduleHandler = binaryStubDriver;
    } else {
        moduleHandler = factoryMap[moduleType];
    }

    if (moduleHandler != null && moduleHandler != undefined) {

        var module = moduleHandler.create(moduleResource);
        module.init();

        return module;
    } else {
        return null;
    }
}

// Public
module.exports = {
    createModule: createModule
};
