function RootResource(){
    this.nodes = {};
    this.localNode = {};
}

RootResource.prototype={
    getNode: function(nodeId) {
        return this.nodes[id];
    },

    addNode: function(node) {
        if (validateNode(node) == true) {
            this.nodes[node.id] = node;
        }
    },

    getLocalNode: function() {
        return this.localNode;
    },

    setLocalNode: function(node) {
        if (validateNode(node) == true) {
            this.localNode = node;
        }
    }
};


////////////////////////////////////////////////////////////////////////////////////////////

function NodeResource(){
    this.id = null;
    this.name = null;
    this.master = false;
    this.services = {};
    this.modules = {};
}

NodeResource.prototype={

    getService: function(serviceId) {
        return this.services[serviceId];
    },

    addService: function(service) {
        if (validateService(service) == true) {
            this.services[service.id] = service;
        }
    },

    getModule: function(moduleId) {
        return this.modules[moduleId];
    },

    addModule: function(module) {
        if (validateModule(module) == true) {
            this.modules[module.id] = module;
        }
    }
};

function validateNode(node) {
    if (node == null || node == undefined) {
        return false;
    }

    if (node.id == null || node.id == undefined) {
        return false;
    }

    if (node.name == null || node.name == undefined) {
        return false;
    }

    return true;
}

function validateNodeDeep(node) {
    if (validateNode(node) == false) {
        return false;
    }

    for (var key in node.services) {
        var service = node.services[key];

        if (validateService(service) == false) {
            return false;
        }
    }

    for (var key in node.modules) {
        var module = node.modules[key];

        if (validateModule(module) == false) {
            return false;
        }
    }

    return true;
}
////////////////////////////////////////////////////////////////////////////////////////////

function ServiceResource(){
    this.id = null;
    this.name = null;
    this.type = null;
    this.dataFields = {};
    this.configurationVersion = 0;
    this.parentId = 0;
}

ServiceResource.prototype={
};

function validateService(service) {
    if (service == null || service == undefined) {
        return false;
    }

    if (service.id == null || service.id == undefined) {
        return false;
    }

    if (service.name == null || service.name == undefined) {
        return false;
    }

    if (service.type == null || service.type == undefined) {
        return false;
    }

    return true;
}


////////////////////////////////////////////////////////////////////////////////////////////


function ModuleResource(){
    this.id = null;
    this.type = null;
    this.name = null;
    this.active = false;
    this.dataFields = {};
    this.configurationVersion = 0;
    this.parentId = 0;

}

ModuleResource.prototype={

    getDataField: function(portId) {
        return this.dataPorts[portId];
    },

    addDataField: function(dataField) {
        if (validateDataField(dataField) == true) {
            this.dataFields[dataField.name] = dataField;
        }
    },

    executeCommand: function (command) {
        this.isBusy = true;
        this.command = command;
    }
};


function validateModule(module) {
    if (module == null || module == undefined) {
        return false;
    }

    if (module.id == null || module.id == undefined) {
        return false;
    }

    if (module.name == null || module.name == undefined) {
        return false;
    }

    if (module.type == null || module.type == undefined) {
        return false;
    }

    return true;
}


function validateModuleDeep(node) {
    if (validateModule(node) == false) {
        return false;
    }

    for (var key in node.dataFields) {
        var dataField = node.dataFields[key];

        if (validateDataField(dataField) == false) {
            return false;
        }
    }

    return true;
}





function initModuleFromModel(module, model) {

    for (var fieldName in model.dataFields) {
        var dataFieldConfig = model.dataFields[fieldName];
        var dataField = initDataField(module, dataFieldConfig);
        module.addDataField(dataField);
    }
}



function initDataField(moduleResource, dataFieldConfigs) {
    var dataField = new DataFieldResource();

    dataField.id = dataFieldConfigs.id;
    dataField.parentId = moduleResource.id;
    dataField.name = dataFieldConfigs.name;
    dataField.type = dataFieldConfigs.type;
    dataField.dataSizeClass = dataFieldConfigs.dataSizeClass;
    dataField.value = dataFieldConfigs.value;
    dataField.group = 0;
    dataField.link = dataFieldConfigs.link;
    dataField.control = dataFieldConfigs.control;
    dataField.readOnly = dataFieldConfigs.readOnly;
    dataField.resourceName = dataFieldConfigs.resourceName;
    dataField.resourceCode = dataFieldConfigs.resourceCode;

    dataField.calcolateIsControllable();
    return dataField;
}



//////////////////////////////////////////////////////////////////////////////////////



function DataFieldResource(){
    this.id = null;
    this.parentId = null;
    this.name = null;
    this.type = null;
    this.dataSizeClass = null;
    this.value = null;
    this.group = null;//input/outputs
    this.link = null; // data source in case of input get data from output
    this.control = null;
    this.readOnly = null;
    this.resourceName = null;
    this.resourceCode = null;

}

DataFieldResource.prototype={

    getValue: function(portId) {
        return this.value;
    },

    setValue: function(data) {
        this.value = data;
    },


    calcolateIsControllable: function() {
        if (this.type == "RESOURCE_PROVIDER" || this.type == "RESOURCE_CONSUMER") {
            this.controllable = false;
        } else if (this.readOnly != true && (this.control == null || this.control == undefined)) {
            this.controllable = true;
        } else {
            this.controllable = false;
        }
    },

};

function validateDataField(dataField) {
    if (dataField == null || dataField == undefined) {
        return false;
    }

    if (dataField.id == null || dataField.id == undefined) {
        return false;
    }

    if (dataField.parentId == null || dataField.parentId == undefined) {
        return false;
    }

    if (dataField.name == null || dataField.name == undefined) {
        return false;
    }

    if (dataField.type == null || dataField.type == undefined) {
        return false;
    }

    if (dataField.type == "NONE") {
        return true;
    }

    if (dataField.type == "INTEGER") {
        return true;
    }

    if (dataField.type == "BOOLEAN") {
        return true;
    }

    if (dataField.type == "STRING") {
        return true;
    }

    if (dataField.type == "OPTION") {
        return true;
    }

    if (dataField.type == "RESOURCE_CONSUMER") {
        return true;
    }

    if (dataField.type == "RESOURCE_PROVIDER") {
        return true;
    }

    return false;
}


function getSelectedBinaryOption(dataField) {
    var selected = dataField.value;
    var selectedOption = dataField.options[selected];

    if (selectedOption != null && selectedOption != undefined) {
        return selectedOption.binaryCode;
    }

    return null;

}
////////////////////////////////////////////////////////////////////////////////////////////

module.exports= {
    RootResource: RootResource,
    NodeResource: NodeResource,
    validateNode: validateNode,
    validateNodeDeep: validateNodeDeep,
    ServiceResource: ServiceResource,
    validateService: validateService,
    ModuleResource: ModuleResource,
    validateModule: validateModule,
    validateModuleDeep: validateModuleDeep,
    initModuleFromModel: initModuleFromModel,
    DataFieldResource: DataFieldResource,
    validateDataField: validateDataField,
    getSelectedBinaryOption:getSelectedBinaryOption
};


