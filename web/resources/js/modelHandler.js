/**
 * Created by gkyuchukov on 04.10.17.
 */


var modelHandler = {
    GRAPH_ID_TO_SYSTEM_ID: {},
    SYSTEM_MODULES_BY_ID: {},
    DATA_FIELDS_BY_ID: {},
    MODEL_ACTIVE_LINKS: {},

    setGraphToSystemMapping: function(graphToSystemMapping) {
        this.GRAPH_ID_TO_SYSTEM_ID = graphToSystemMapping;
    },


    updateSystemStructure: function(systemStructure) {
        for (var idx in systemStructure) {
            var module = systemStructure[idx];

            if (this.SYSTEM_MODULES_BY_ID[idx] == null || this.SYSTEM_MODULES_BY_ID[idx] == undefined) {
                this.SYSTEM_MODULES_BY_ID[idx] = module;

                module.handlers = {};
                module.handlers.renderPropertiesHTML = function (element) {
                    return defaultHTMLRender.renderHTMLProperties(element);
                };

                module.handlers.renderDataPortPropertiesHTML = function (element, portName, port) {
                    return defaultHTMLRender.renderDataPortPropertiesHTML(element, portName, port);
                }

                module.handlers.renderCommandHTML = function (element, commandName, command) {
                    return defaultHTMLRender.renderCommandHTML(element, commandName, command);
                }
            } else {
                var existingModule = this.SYSTEM_MODULES_BY_ID[idx];
                existingModule.isBusy = module.isBusy;
            }

            var dataFields = module.dataFields;
            for (var fieldName in dataFields) {
                var dataField = dataFields[fieldName];

                if (this.DATA_FIELDS_BY_ID[dataField.id] == null || this.DATA_FIELDS_BY_ID[dataField.id] == undefined) {
                    this.DATA_FIELDS_BY_ID[dataField.id] = dataField;
                    dataField.monitored = true;
                } else {
                    var existingDataField = this.DATA_FIELDS_BY_ID[dataField.id];
                    existingDataField.type = dataField.type;
                    existingDataField.value = dataField.value;
                    existingDataField.controllable = dataField.controllable;
                }
            }

        }

        messageFLags.markForMonitoringMessageFlag = true;
    },

    updateFieldsValues: function(dataFieldValues) {
        var monitoredLabelsData = {};

        for (var id in dataFieldValues) {
            var value = dataFieldValues[id];

            var dataField = this.DATA_FIELDS_BY_ID[id];
            if (dataField != null && dataField != undefined) {
                dataField.value = value;
                if (dataField.monitoredLabelId != null && dataField.monitoredLabelId != undefined) {
                    monitoredLabelsData[dataField.monitoredLabelId] = utils.getLabelText(dataField);
                }
            }
        }

        userInterfaceHandler.updateMonitoredLabels(monitoredLabelsData);
    },

    modelGetElement: function (elementId) {
        return this.SYSTEM_MODULES_BY_ID[elementId];
    },

    checkElementExists: function (elementId) {
        if (this.SYSTEM_MODULES_BY_ID[elementId] != null && this.SYSTEM_MODULES_BY_ID[elementId] != undefined) {
            return true;
        } else {
            return false;
        }
    },

    getAllMonitoredIds: function() {
        var monitoredIds = [];

        for (var id in this.DATA_FIELDS_BY_ID) {
            var dataField = this.DATA_FIELDS_BY_ID[id];

            if (dataField != null || dataField != undefined) {
                if (dataField.monitored == true) {
                    monitoredIds.push(dataField.id);
                }
            }
        }

        return monitoredIds;
    },



    checkElementByGraphIdExists: function (graphElementId) {
        var element = this.modelGetElementByGraphId(graphElementId);
        if (element != null && element != undefined) {
            return true;
        } else {
            return false;
        }
    },

    modelGetElementByGraphId: function (graphElementId) {
        var elementId = this.GRAPH_ID_TO_SYSTEM_ID[graphElementId];
        if (elementId != null && elementId != undefined) {
            return this.SYSTEM_MODULES_BY_ID[elementId];
        } else {
            return null;
        }
    },

    getGraphIdBySystemId: function(elementId) {
        for (var id in this.GRAPH_ID_TO_SYSTEM_ID) {
            var systemId = this.GRAPH_ID_TO_SYSTEM_ID[id];

            if (elementId == systemId) {
                return id;
            }
        }

        return null;
    },

    modelSelectElement: function (graphElementId) {
        var element = this.modelGetElementByGraphId(graphElementId);
        var result = element.handlers.renderPropertiesHTML(element);
        return result;
    },

    modelSelectLink: function(graphLinkId) {
        var link = this.MODEL_ACTIVE_LINKS[graphLinkId];
        return JSON.stringify(link);
    },

    modelSelectPort: function(graphElementId, fieldName) {
        var element = this.modelGetElementByGraphId(graphElementId);
        var port = element.dataFields[fieldName];
        var result = element.handlers.renderDataPortPropertiesHTML(element, fieldName, port);
        return result;
    },

    redrawPort: function(elementId, fieldName) {
        var element = this.modelGetElement(elementId);
        var port = element.dataFields[fieldName];
        var result = element.handlers.renderDataPortPropertiesHTML(element, fieldName, port);
        return result;
    },


    setDataPortForMonitoring: function(elementId, fieldName, labelId) {
        var element = this.modelGetElement(elementId);
        var field = element.dataFields[fieldName];
        field.monitoredLabelId = labelId;

    },

    removeDataPortForMonitoring: function(elementId, fieldName) {
        var element = this.modelGetElement(elementId);
        var field = element.dataFields[fieldName];
        field.monitoredLabelId = null;
    },

    getLabelIdForPort: function(elementId, fieldName) {
        var element = this.modelGetElement(elementId);
        var field = element.dataFields[fieldName];
        return field.monitoredLabelId;
    },

    getGraphIdByElementId: function(elementId) {
        for (var graphId in this.GRAPH_ID_TO_SYSTEM_ID) {
            if (this.GRAPH_ID_TO_SYSTEM_ID[graphId] == elementId) {
                return graphId;
            }
        }

        return null;

    }

}