/*
 * frameworkContext.js
 */

var fs = require('fs');
var resourceModel = require('./resourcesModel.js');
var modulesFactory = require('./modulesLibrary/ModulesFactory.js');
var modulesManager = require('./ModulesManager.js');
var resourceInterface = require('./ResourceInterface.js');
var servicesManager = require('./ServicesManager');

function readJsonFromFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}


function parseSchema(schema, localMachineConfig) {
    var localMachineId = localMachineConfig.localMachineId;

    for (var machineId in schema) {
        var machine = schema[machineId];
        var isLocalMachine = false;

        if (machine.id == localMachineId) {
            isLocalMachine = true;
        }

        if (machine != null && machine != undefined) {
            var node = new resourceModel.NodeResource();

            node.id = machine.id;
            node.name = machine.name;
            node.master = machine.master;

            if (resourceModel.validateNode(node) != true) {
                throw "wrong schema node";
            }

            node.commVectors = {
                commVectorInbound: machine.commVectorInbound,
                commVectorOutbound: machine.commVectorOutbound
            }

            var servicesSchema = machine.services;
            for (key in servicesSchema) {
                var serviceSchema = servicesSchema[key];

                var service = parseService(serviceSchema, isLocalMachine);
                if (resourceModel.validateService(service) != true) {
                    throw "wrong schema service";
                }

                node.addService(service);
            }



            var modulesSchema = machine.modules;
            for (key in modulesSchema) {
                var moduleSchema = modulesSchema[key];

                var module = parseModule(moduleSchema, isLocalMachine);
                if (resourceModel.validateModule(module) != true) {
                    throw "wrong schema module";
                }

                node.addModule(module);

                module.active = true;
            }

            if (isLocalMachine == true) {
                resourceInterface.updateLocalNodeResources(node);
            } else {
                resourceInterface.updateRemoteNodeResources(node);
            }

        }
    }


}

//if local machine services ... create them and add them in context... init, config, start
//resource interface add get module by id -- module ids when update
// connect rosource interface to FE
// FE run

function parseService(serviceSchema, isOnLocalMachine) {
    var service = new resourceModel.ServiceResource();
    service.id = serviceSchema.type;
    service.name = serviceSchema.name;
    service.type = serviceSchema.type;
    service.dataFields = serviceSchema.dataFields;
    service.blockCategory = serviceSchema.blockCategory;

    if (isOnLocalMachine == true) {
        servicesManager.initService(service);
    }

    return service;
}


function parseModule(moduleSchema, isOnLocalMachine) {
    var module = new resourceModel.ModuleResource();
    module.id = moduleSchema.id;
    module.name = moduleSchema.name;
    module.type = moduleSchema.type;
    module.parentId = moduleSchema.parentId;
    module.blockCategory = moduleSchema.blockCategory;
    module.active = false;

    if (resourceModel.validateModule(module) != true) {
        throw "wrong schema module";
    }

    resourceModel.initModuleFromModel(module, moduleSchema);

    var workingModule = modulesFactory.createModule(module, isOnLocalMachine);
    if (workingModule != null && workingModule != undefined) {
        workingModule.init();
        workingModule.start();
        modulesManager.addModule(workingModule);
    }


    if (resourceModel.validateModule(module) != true) {
        throw "wrong schema module could not create real module";
    }

    return module;
}

// Public
module.exports = {
    parseSchema: parseSchema,
    readJsonFromFile: readJsonFromFile

};
