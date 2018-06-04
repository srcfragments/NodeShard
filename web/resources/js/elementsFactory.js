/**
 * Created by gkyuchukov on 04.10.17.
 */

var elementsFactory = {

    createElementFactory: function (elementType) {

        var elementModelGenerator = _LIBRARY_OF_ELEMENTS_[elementType];
        var result = null;

        if (typeof elementModelGenerator !== 'undefined' && elementModelGenerator !== null) {
            var modelId = this.modelIdGenerator();

            var elementObject = this.baseElementGenerator();
            var deltaObject = elementModelGenerator();

            //merge base object with predefined deltas
            Object.assign(elementObject, deltaObject);
            elementObject.modelId = modelId;

            //get object view based on type
            var viewOfElement = this.viewObjectGenerator(elementObject);
            viewOfElement.modelId = modelId;

            result = {
                model: elementObject,
                view: viewOfElement
            }

        }

        return result;
    },

    baseElementGenerator: function () {
        var object = {
            "type":"none",
            "name":"none",
            "tags": ["none"],
            "deploy_tags": ["none"],

            "properties": {
            },

            "view" : {
                "display_layer":3,
                "sizex": 100,
                "sizey": 50,
                "view_type": "normal",
                "resizeable": false
            },

            "parentNodeId": null,
            "childrenNodesId": [],

            "handlers" : {
                "test" : function () {},
                "renderPropertiesHTML" : function (element) {
                    return defaultHTMLRender.renderHTMLProperties(element);
                },
                "renderDataPortPropertiesHTML" : function (element, portName, port) {
                    return defaultHTMLRender.renderDataPortPropertiesHTML(element, portName, port);
                },
            }
        }

        return object;
    },


    viewObjectGenerator: function (element) {

        var elementViewGenerator = _LIBRARY_OF_VIEWS_[element.view.view_type];

        if (elementViewGenerator == null || elementViewGenerator == undefined) {
            elementViewGenerator = _LIBRARY_OF_VIEWS_["DEFAULT"];
        }

        var m = elementViewGenerator(element);

        m.set('z',element.view.display_layer);

        return m;
    },

    modelId: 0,

    modelIdGenerator: function() {
        var modelId = this.modelId;
        this.modelId++;
        return modelId;
    }
}
