/*
 * frameworkContext.js
 */

var resourcesModel = require('../resourcesModel.js');

var binaryStubDriver = require('./BinaryStubDriver.js');

var factoryMap = {};

factoryMap[binaryStubDriver.type] = binaryStubDriver;

function createModule(moduleResource, isOnLocalMachine) {
    var moduleType = moduleResource.type;
    var moduleHandler = null;


    if (isOnLocalMachine == false) {
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
