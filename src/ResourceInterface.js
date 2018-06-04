/**
 * Created by gkyuchukov on 14.10.17.
 */
var frameworkContext = require('./frameworkContext.js');
var resourceModel = require('./resourcesModel.js');

var rootNode = {
    localNode: null,
    remoteNodes: {}
};
var resourcesById = {};
var configurationVersion = 0;
var controllableDataPortsForDevice = {};


// update the structure of the machines resources
// on second update, check the differences and remove unneded and add new
function updateLocalNodeResources(node) {
    if (resourceModel.validateNodeDeep(node) == true) {
        mapResourcesIds(node);
        rootNode.localNode = node;
        configurationVersion++;
    }
}

function updateRemoteNodeResources(node) {
    if (resourceModel.validateNodeDeep(node) == true) {
        mapResourcesIds(node);
        rootNode.remoteNodes[node.id] = node;
        configurationVersion++;
    }
}

function mapResourcesIds(node) {
    resourcesById[node.id] = node;

    for (var key in node.modules) {
        var module = node.modules[key];
        resourcesById[module.id] = module;

        for (var i in module.dataFields) {
            var dataField = module.dataFields[i];
            resourcesById[dataField.id] = dataField;
        }
    }
}

function getCommVectorsForDevice(deviceId) {
    var device = resourcesById[deviceId];

    if (device != null && device != undefined && device instanceof resourceModel.NodeResource) {
        return device.commVectors;
    }

    return null;
}

// interfaces to update modules and ports configs and data
//

function updateDataFieldsValues(values) {
    for (var portId in values) {
        var data = values[portId];
        var dataField = resourcesById[portId];

        if (dataField != null && dataField != undefined && dataField instanceof resourceModel.DataFieldResource) {
            dataField.setValue(data);
        }
    }
}



//[{id:id, config:newCOnfig}]
function updateModulesConfigs(configs) {

    for (var moduleId in configs) {
        var moduleConfig = configs[moduleId];
        var module = resourcesById[moduleId];

        if (module != null && module != undefined && module instanceof resourceModel.ModuleResource) {
            module.reconfigure(moduleConfig);
        }
    }

    configurationVersion++;
}


// interfaces to get data from the resources interface
//
function getResourcesById(id) {
    return resourcesById[id];
}


function getDataPortIdBasedOnLink(link) {
    var temp = link.split('.');
    var sourceModuleId = temp[0];
    var sourceModulePort = temp[1];

    var sourceModule = getResourcesById(sourceModuleId);
    if (sourceModule != null && sourceModule != undefined) {
        var sourcePort = sourceModule.dataFields[sourceModulePort];

        if (sourcePort != null && sourcePort != undefined) {
            return sourcePort.id;
        }
    }

    return null;
}

function getResourcesByPath(path) {
    if (path != null && path != undefined) {
        var path = path.split(".");

        if (path != null && path != undefined) {
            var res = rootNode;

            for (var i = 0; i < path.length; i++) {
                res = res[path[i]];
                if (res == null && res == undefined) {
                    return null;
                }
            }

            return res;
        }
    }

    return null;
}

function getResourcesStructure() {
    var structure = {};

    var localModules = rootNode.localNode.modules;
    for (var idx in localModules) {
        var module = localModules[idx];

        structure[module.id] = module;
    }

    var remoteNodes = rootNode.remoteNodes;
    for (var id in remoteNodes) {
        var remoteNode = remoteNodes[id];
        var remoteModules = remoteNode.modules;

        for (var idx in remoteModules) {
            var module = remoteModules[idx];

            structure[module.id] = module;
        }
    }

    return structure;
}

function getMonitoredData(elementIds) {
    var res = {};

    for (var idx in elementIds) {
        var dataField = resourcesById[elementIds[idx]];

        if (dataField != null && dataField != undefined && dataField instanceof resourceModel.DataFieldResource) {
            res[elementIds[idx]] = dataField.getValue();
        }
    }

    return res;
}


///////////////////////////////////////////////////////////////////////////////////


function getConfigurationVersion() {
    return configurationVersion
}



module.exports = {
    updateLocalNodeResources: updateLocalNodeResources,
    updateRemoteNodeResources: updateRemoteNodeResources,

    updateDataFieldsValues: updateDataFieldsValues,
    updateModulesConfigs: updateModulesConfigs,

    getResourcesById: getResourcesById,
    getResourcesByPath: getResourcesByPath,
    getDataPortIdBasedOnLink: getDataPortIdBasedOnLink,
    getCommVectorsForDevice: getCommVectorsForDevice,

    getResourcesStructure: getResourcesStructure,
    getMonitoredData: getMonitoredData,

    getConfigurationVersion:getConfigurationVersion
}