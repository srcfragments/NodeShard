var commonHandlers = {

}




var defaultHTMLRender = {

    renderHTMLProperties: function (element) {
        var selectedDataPort = null;
        var classNames = "col-xs-11 property";

        var html = [];

        var elementModelProperties = this.getPropertiesForElement(element);

        if (elementModelProperties != null && elementModelProperties != undefined) {

            for (var propertyName in elementModelProperties) {
                var property = elementModelProperties[propertyName];

                var name = propertyName;
                var type = property.type;
                var value = property.value;
                var selector = "DATAFIELD:" + element.id + ":" + propertyName;

                var enabled = true;
                var htmlTemp = this.renderProperty(selector, type, name, value, enabled, classNames);
                html.push(htmlTemp);
                html.push("<br>");
            }
        }


        var htmlCode = html.join(" ");
        return htmlCode;
    },

    getPropertiesForElement: function(element) {
        var properties = {};

        for (var fieldId in element.dataFields) {
            var field = element.dataFields[fieldId];

            if (element.left_ports.indexOf(field.id) == -1 &&
                element.right_ports.indexOf(field.id) == -1 &&
                element.top_ports.indexOf(field.id) == -1 &&
                element.bottom_ports.indexOf(field.id) == -1) {
                properties[field.id] = field;
            }
        }
    },

    renderDataPortPropertiesHTML: function (element, fieldName, field) {
        var selectedDataPort = field;
        var classNames = "col-xs-11 property";

        var html = [];
        html.push('port name: ' + fieldName + '<br>');
        html.push("<br>");
        html.push("<br>");

        html.push(this.renderMonitoringCheckBox(element, field));
        html.push("<br>");
        html.push("<br>");

        html.push(this.renderPortLabelConfigHTML(element, field));
        html.push("<br>");
        html.push("<br>");

        html.push(this.renderPortValueHTML(element, field));
        html.push("<br>");
        html.push("<br>")

        var htmlCode = html.join(" ");
        return htmlCode;
    },


    renderPortLabelConfigHTML: function(element, field) {
        var classNames = "col-xs-11 property";

        var type = "STRING";

        var value = utils.getLabelName(field);

        var selector = "PORT_LABEL:" + element.id + ":" + field.name;
        var enabled = true;

        return this.renderProperty(selector, type, "label id", value, enabled, classNames);
    },

    renderPortValueHTML: function(element, field) {
        var classNames = "col-xs-11 property";

        var type = field.type;
        var value = field.value;
        var selector = "DATAFIELD:" + element.id + ":" + field.name;
        var enabled = field.controllable;

        return this.renderProperty(selector, type, "port value", value, enabled, classNames);
    },

    renderHTMLButton: function(selector, name, description) {
        var html = description + '<br>';
        var html = '<button class="col-xs-11 btn btn-primary module-button" id="' + selector + '" type="button" onclick="defaultHTMLRender.buttonClicked(this)">' + name + '</button>';
        return html;
    },


    renderProperty: function(selector, type, name, value, enabled, className) {
        var renderFunction;

        switch (type) {
            case "BOOLEAN":
                renderFunction = this.renderHTMLboolean;
                break;
            case  "INTEGER":
                renderFunction = this.renderHTMLinteger;
                break;
            case  "STRING":
                renderFunction = this.renderHTMLstring;
                break;
            case  "OPTION":
                renderFunction = this.renderHTMLOptionType;
                break;
        }

        if (renderFunction != null && renderFunction != undefined) {
            return `<div class="${className}"><label>${name}: </label>${renderFunction(selector, type, name, value, enabled, className)}</div>`;
        } else {
            return "NO VALUE";
        }

    },


    renderMonitoringCheckBox: function(element, port) {
        var disabled = "";
        var checked = "";
        if (port.monitoredLabelId != null && port.monitoredLabelId != undefined) {
            checked = " checked ";
        }

        var html = '<input id="' + element.id + '" +  type="checkbox" ' + disabled + ' ' + checked + ' onchange="defaultHTMLRender.processSelectionForMonitoring(this, \'' + element.id +  '\', \'' + port.name + '\')"> ';
        return html;
    },

    renderHTMLboolean: function (selector, type, name, value, enabled) {
        var html = null;
        var disabled = "";
        if (enabled != true) {
            disabled = " disabled ";
        }

        var checked = '';
        if (value == 'true') {
            checked = 'checked';
        }

        var html = '<input id="' + selector + '" +  type="checkbox" ' + disabled + ' ' + checked + ' onchange="defaultHTMLRender.updateBooleanValue(this)"> ';

        return html;
    },


    renderHTMLinteger: function(selector, type, name, value, enabled, className)  {
        return defaultHTMLRender.renderInput(
            selector,
            type,
            value,
            enabled,
            "number",
            "defaultHTMLRender.updateIntegerValue(this)"
        );
    },

    renderHTMLstring: function (selector, type, name, value, enabled, className) {
        return defaultHTMLRender.renderInput(
            selector,
            type,
            value,
            enabled,
            "text",
            "defaultHTMLRender.updateString(this)"
        );
    },

    renderInput:function (selector, type, value, enabled, inputType, onChange) {
        var disabled = enabled ? "":"disabled";

        var html = `<input id="${selector}" type="${inputType}" value="${value}" ` + disabled + ` onchange="${onChange}">`;
        return html;
    },


    // renderHTMLinteger: function (selector, type, name, value, enabled) {
    //     var disabled = "";
    //     if (enabled != true) {
    //         disabled = " disabled ";
    //     }
    //
    //     var html = '<input id="' + selector + '"  ' + disabled + '  type="number" value="' + value + '" onchange="defaultHTMLRender.updateIntegerValue(this)">' + name;
    //     return html;
    // },
    //
    // renderHTMLstring: function (selector, type, name, value, enabled) {
    //     var disabled = "";
    //     if (enabled != true) {
    //         disabled = " disabled ";
    //
    //      }
    //     var html = '<input id="' + selector + '"  ' + disabled + '  type="text" value="' + value + '" onchange="defaultHTMLRender.updateString(this)">' + name;
    //     return html;
    // },

    renderHTMLOptionType: function (selector, type, name, value, readOnly) {
        var processedSelector = defaultHTMLRender.processSelector(selector);
        var optionGroup = processedSelector.dataField;
        var disabled = readOnly ? "disabled":"";

        if (optionGroup != null && optionGroup != undefined) {
            var tempHtml = "";
            tempHtml = tempHtml + name;
            tempHtml = tempHtml + '<select id="' + selector + '" name="' + name + '" ' + disabled + ' onchange="defaultHTMLRender.updateHTMLOptionType(this)">';

            for (var option in optionGroup.options) {
                if (option == value) {
                    tempHtml = tempHtml + '<option selected value="' + option + '">' + option + '</option>';
                } else {
                    tempHtml = tempHtml + '<option value="' + option + '">' + option + '</option>';
                }
            }

            tempHtml = tempHtml + '</select>';
            return tempHtml;
        } else {
            return '';
        }

    },

    renderHTMLOptionType: function (selector, type, name, value, enabled) {
        var disabled = "";
        if (enabled != true) {
            disabled = " disabled ";

        }
        var processedSelector = defaultHTMLRender.processSelector(selector);
        var optionGroup = processedSelector.dataField;

        if (optionGroup != null && optionGroup != undefined) {
            var tempHtml = "";
           // tempHtml = tempHtml + name + '<br>';
            tempHtml = tempHtml + '<select id="' + selector + '" ' + disabled + '  name="' + name + '" onchange="defaultHTMLRender.updateHTMLOptionType(this)">';

            for (var option in optionGroup.options) {
                if (option == value) {
                    tempHtml = tempHtml + '<option selected value="' + option + '">' + option + '</option>';
                } else {
                    tempHtml = tempHtml + '<option value="' + option + '">' + option + '</option>';
                }
            }

            tempHtml = tempHtml + '</select>';
            return tempHtml;
        } else {
            return '';
        }

    },


    processSelector: function(selector) {
        var type = null;
        var element = null;
        var dataFieldName = null;
        var dataField = null;
        var dataGroup = null;

        var tokens = selector.split(':');
        var type = tokens[0];

        if (type == "DATAFIELD") {
            var elementId = tokens[1];
            element = modelHandler.modelGetElement(elementId);

            dataFieldName = tokens[2];
            dataField = element.dataFields[dataFieldName];

            dataGroup = dataField;

        } else if (type == "PORT_LABEL") {
            var elementId = tokens[1];
            element = modelHandler.modelGetElement(elementId);

            dataFieldName = tokens[2];
            dataField = element.dataFields[dataFieldName];

            dataGroup = dataField;
        }

        var rez = {
            type: type,
            element: element,
            dataField: dataField,
            dataFieldName: dataFieldName,
            dataGroup: dataGroup,
        }

        return rez;
    },

    updateBooleanValue: function (htmlElement) {
        var selector = htmlElement.id;
        selector = this.processSelector(selector);
        var value = (htmlElement.checked == true) ? 'true' : 'false';
        this.process(selector, value);
    },

    updateIntegerValue: function (htmlElement) {
        var selector = htmlElement.id;
        selector = this.processSelector(selector);

        var intvalue = htmlElement.value;
        if (isNaN(intvalue) == false) {
            var value = intvalue.toString();
            this.process(selector, value);
        }
    },


    updateString: function (htmlElement) {
        var selector = htmlElement.id;
        selector = this.processSelector(selector);

        var value = htmlElement.value;

        selector.dataGroup.value = value;
        this.process(selector, value);
    },



    updateHTMLOptionType: function (htmlElement) {
        var selector = htmlElement.id;
        selector = this.processSelector(selector);

        var selectedOption = htmlElement.value;

        var value = htmlElement.value;
        this.process(selector, value);

    },

    buttonClicked: function (htmlElement) {
        var selector = htmlElement.id;
        selector = this.processSelector(selector);
        this.process(selector, null);
    },

    process: function(selector, value) {
        if (selector.type == "DATAFIELD") {
            api.setDataFieldValue(selector.element.id, selector.dataFieldName, value);
        } else if (selector.type == "PORT_LABEL") {
            selector.dataField.labelName = value;
        }
    },

    processSelectionForMonitoring: function (element, elementId, portName) {
        var selected = (element.checked == true) ? true : false;

        if (selected) {
            userInterfaceHandler.setDataPortForMonitoring(elementId, portName);
        } else {
            userInterfaceHandler.removeDataPortForMonitoring(elementId, portName);
        }
    }
}
