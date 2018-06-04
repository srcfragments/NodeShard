/**
 * Created by gkyuchukov on 04.10.17.
 */

var api = {

    setDataFieldValue: function(elementId, dataFieldName, value) {

        var logCommand = "api.setDataFieldValue(\"" + elementId +
            "\", \"" + dataFieldName + "\", \"" + value + "\");";
        consoleLog(logCommand);

        var element = modelHandler.modelGetElement(elementId);
        var dataField = element.dataFields[dataFieldName];

        if (this.checkValueType(dataField, value) == true) {
            dataField.value = value;

            var labelsData = {};
            if (dataField.monitoredLabelId != null && dataField.monitoredLabelId != undefined) {
                labelsData[dataField.monitoredLabelId] = utils.getLabelText(dataField);
                userInterfaceHandler.updateMonitoredLabels(labelsData);
            }



            // update configuration to send to server
            updateDataFieldValues[dataField.id] = dataField.value;
            messageFLags.updateDataFieldsValuesMessageFlag = true;

            var result = {resultType: "SUCCESS"};
            consoleLog(JSON.stringify(result));
            return result;
        }

        var result = {resultType: "ERROR"};
        consoleLog(JSON.stringify(result));
        return result;

    },

    getDataFieldValue: function(elementId, dataFieldName) {
        var logCommand = "api.getDataFieldValue(\"" + elementId + "\", \"" +
            "\", \"" + dataFieldName + "\");";
        consoleLog(logCommand);

        var element = modelHandler.modelGetElement(elementId);
        var dataField = element.dataFields[dataFieldName];

        var result = {resultType: "SUCCESS", value: dataField.value};
        consoleLog(JSON.stringify(result));
        return result;
    },


    checkValueType: function(dataGroup, value) {
        if (dataGroup != null && dataGroup != undefined) {
            if (dataGroup.type == "BOOLEAN") {
                if (value == "true" || value == "false" ||
                    value == true || value == false) {
                    return true;
                }
            } else if (dataGroup.type == "INTEGER") {
                if (isNaN(value) == false) {
                    return true;
                }
            } else if (dataGroup.type == "STRING") {
                return true;
            } else if (dataGroup.type == "OPTION") {
                for (var option in dataGroup.options) {
                    if (option == value) {
                        return true;
                    }
                }
            }
        }

        return false;
    },


}

