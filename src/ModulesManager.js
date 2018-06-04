/**
 * Created by gkyuchukov on 14.10.17.
 */
var frameworkContext = require('./frameworkContext.js');
var resourceModel = require('./resourcesModel.js');
var comUtilities = require('./ComUtilities.js');
var resourceInterface = require('./ResourceInterface.js');

var modules = {};
var modulesTickTimer = null;


function modulesTickFunction() {
    var a = 1;

    for (var key in modules) {
        var module = modules[key];

         if (module.moduleResource.active == true) {
             processLinksForModule(module);

             module.processTick();
         }
    }
}

function processLinksForModule(module) {
    for (var dataFieldName in module.moduleResource.dataFields) {
        var dataField = module.moduleResource.dataFields[dataFieldName];

        if (dataField.link != null && dataField.link != undefined) {
            if (dataField.sourcePortId == null || dataField.sourcePortId == undefined) {
                var sourcePortId = resourceInterface.getDataPortIdBasedOnLink(dataField.link);
                dataField.sourcePortId = sourcePortId;
            }

            var sourceDataPort = resourceInterface.getResourcesById(dataField.sourcePortId);
            if (sourceDataPort != null && sourceDataPort != undefined) {
                dataField.value = sourceDataPort.value;
            }
        }
    }
}





module.exports = {
    addModule: function (module) {
        if (resourceModel.validateModuleDeep(module.moduleResource) == true) {
            modules[module.id] = module;
        }
    },

    getModule: function (moduleId) {
        return modules[moduleId];
    },

    init: function() {

    },

    start: function() {
        modulesTickTimer = setInterval(modulesTickFunction, 100);
    },

    stop: function() {
        clearInterval(modulesTickTimer);
    },


    attach: function(moduleId, driver, channel) {
        var module = modules[moduleId];

        if (module != null && module != undefined) {
            if (module.stubType == true) {
                module.commDriver = driver;
                module.commChannel = channel.portName;
                module.attached = true;
            }
        }
    }

}