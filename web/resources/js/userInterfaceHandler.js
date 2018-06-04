/**
 * Created by gkyuchukov on 04.10.17.
 */


document.onmousemove = function(event) {handleMouseMovement(event)};

var portClickedX = 0;
var portClickedY = 0;

var tempMouseX = 0;
var tempMouseY = 0;

var tempSelectedElementPort = null;
var translationMode = false;

var graphScale = 1.0;
var graphPositionX = 0;
var graphPositionY = 0;



var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#work-field'),
    width: '100%' , height: window.innerHeight - 200, gridSize: 10,
    model: graph,
    defaultLink: new joint.dia.Link({
        attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
    }),
    


    interactive: function(cellView) {
        var cell = cellView.model;
        if (cell.isLabelForValue == true) {
            return true;
        } else if (cell.isLink()) {

            var linkId = cell.id;
            userInterfaceHandler.selectLink(linkId);


            return {
                vertexAdd: false,
                vertexRemove: false,
                arrowheadMove: false,
                vertexMove: false,
                useLinkTools: false
            }
        } else {
            return false;
        }
    },

    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      return true;
    },
    // Enable link snapping within 75px lookup radius
    snapLinks: { radius: 25 },
    linkPinning: false,
    markAvailable: true
});



//https://stackoverflow.com/questions/26883503/jointjs-event-onconnect-link
graph.on('change:source change:target', function(link) {

})

//https://stackoverflow.com/questions/30108783/jointjs-handling-a-link-delete-click
graph.on('remove', function(cell, collection, opt) {

})





///////////////////////////////////////////////////

// First, unembed the cell that has just been grabbed by the user.
paper.on('cell:pointerdown', function(cellView, evt, x, y) {
    var cell = cellView.model;
    if (cell.isLabelForValue == true) {
        return;
    }

    translationMode = true;
   // userInterfaceHandler.unembedElement(cellView);
});


paper.on('cell:pointerup', function(cellView, evt, x, y) {
    translationMode = false;

    //
    // var cell = cellView.model;
    // var cellId = cell.id;
    //
    // if (userInterfaceHandler.checkElementExists(cell.id)) {
    //
    //     var cellViewsBelow = paper.findViewsFromPoint(cell.getBBox().center());
    //     if (cellViewsBelow.length) {
    //         // Note that the findViewsFromPoint() returns the view for the `cell` itself.
    //         var targetCell = _.find(cellViewsBelow, function(c) { return c.model.id !== cellId });
    //
    //         if (targetCell !== undefined && targetCell !== null) {
    //             var targetCellId = targetCell.model.id;
    //
    //             if (userInterfaceHandler.checkElementExists(targetCellId)) {
    //
    //                 var isEmbeddingAllowed = userInterfaceHandler.isEmbeddingAllowed(cellId, targetCellId);
    //
    //                 // Prevent recursive embedding.
    //                 if (targetCell && targetCell.model.get('parent') !== cellId &&  isEmbeddingAllowed) {
    //                     targetCell.model.embed(cell);
    //
    //                     userInterfaceHandler.embedElement(cellId, targetCellId);
    //                 }
    //             }
    //         }
    //
    //     }
    // }
});


paper.on('cell:pointerclick', function(cellView, evt, x, y) {

    var cell = cellView.model;
    if (cell !== undefined && cell !== null) {
        if (cell.isLabelForValue != null && cell.isLabelForValue != undefined) {

            var elementId = cell.linkedGraphElementId;
            var portName = cell.linkedElementPort;
            userInterfaceHandler.selectPort(elementId, portName);

        } else if (userInterfaceHandler.checkElementExists(cell.id)) {
            if (tempSelectedElementPort == null) {
                userInterfaceHandler.selectElement(cell.id);
            } else {
                userInterfaceHandler.selectPort(cell.id, tempSelectedElementPort);
                tempSelectedElementPort = null;
                portClickedX = x;
                portClickedY = y;
            }

        }
    }
});


paper.on('link:options', function (evt, cellView, x, y) {
    var cell = evt.model;
    if (cell.isLink()) {
        var linkId = cell.id;
        userInterfaceHandler.selectLink(linkId);
    }
});


paper.on('cell:mousewheel', function(cellView, evt, x, y, delta) {
    scaleGraph(delta, x, y);
});
paper.on('blank:mousewheel', function(evt, x, y, delta) {
    scaleGraph(delta, x, y);
});

paper.on('blank:pointerdown', function(evt, x, y) {
    translationMode = true;
});

paper.on('blank:pointerup', function(evt, x, y) {
    translationMode = false;
});


function handleMouseMovement(e) {
    var x = e.clientX;
    var y = e.clientY;

    var deltaX = x - tempMouseX;
    var deltaY = y - tempMouseY;

    tempMouseX = x;
    tempMouseY = y;

    if (translationMode == true) {
        graphPositionX = graphPositionX + deltaX;
        graphPositionY = graphPositionY + deltaY;
        graphTransform();
    }

}


///////////////////////////////////////////////////

//var ACTIVE_OBJECTS = {};

//if (typeof _LIBRARY_OF_ELEMENTS_ === 'undefined') {
//    _LIBRARY_OF_ELEMENTS_ = {};
//}
//
//
//var selectElementView = document.getElementById("module-library");
//
//for (var key in _LIBRARY_OF_ELEMENTS_) {
//    var option = document.createElement("option");
//    option.text = key;
//    selectElementView.add(option);
//}

function destroyElement(elementId) {
    userInterfaceHandler.destroyElement(elementId);
}

function selectedPort(element) {
    tempSelectedElementPort = element.attributes.port.nodeValue;

}

function selectedLabelPort(element) {
    tempSelectedElementPort = element.textContent;

}

///////////////////////////////////////////////////
function scaleGraph(delta, x, y) {
    var newGraphScale = graphScale + delta * delta * delta * 0.1;

    if (newGraphScale > 0.2 && newGraphScale < 2.0) {
        graphScale = newGraphScale;

        var width = paper.options.width;
        var height = paper.options.height;
        // fix compensation get fom mid of paper
        graphPositionX = graphPositionX - (x) * delta * delta * delta * 0.1;
        graphPositionY = graphPositionY - (y) * delta * delta * delta * 0.1;
        graphTransform();
    }
}

function moveLeft() {
    graphPositionX = graphPositionX - 10;
    graphTransform();
}

function moveRight() {
    graphPositionX = graphPositionX + 10;
    graphTransform();
}

function moveUp() {
    graphPositionY = graphPositionY - 10;
    graphTransform();
}

function moveDown() {
    graphPositionY = graphPositionY + 10;
    graphTransform();
}


function scaleUp() {
    graphScale = graphScale + 0.2;
    graphTransform();
}

function scaleDown() {
    graphScale = graphScale - 0.2;
    graphTransform();
}

function reset() {
    graphPositionX = 0;
    graphPositionY = 0;
    graphScale = 1.0;
    graphTransform();
}


function graphTransform() {
    paper.setOrigin(graphPositionX,graphPositionY);
    paper.scale(graphScale, graphScale);
}


function renderModal(htmlData) {
    document.getElementById("element-properties").innerHTML = htmlData;
}


function loadDocument() {
    var data = frontEnd;

    graphScale = data.graphScale;
    graphPositionX = data.graphPositionX;
    graphPositionY = data.graphPositionY;

    var graphData = data.graphModel;
    var graphToSystemMapping = data.graphToSystemMapping;

    graph.fromJSON(graphData);
    graphTransform();
    userInterfaceHandler.setGraphToSystemMapping(graphToSystemMapping);
}




function updateSelectedElementsVisual(affectedElements, selectedStyle, otherStyle) {
    updateLinksVisual(affectedElements.linkIds, selectedStyle, otherStyle, false);
    updateElementsVisual(affectedElements.elementIds, selectedStyle, otherStyle);
}


function updateLinksVisual(linkIds, selectedStyle, otherStyle, custom) {

    var selectedLinksParam = selectedStyle;
    var otherLinksParam = otherStyle;

    if (custom != true) {
        var styleInfo = styles[selectedStyle];
        selectedLinksParam = styleInfo.link;

        styleInfo = styles[otherStyle];
        otherLinksParam = styleInfo.link;
    }

    var links = graph.getLinks();
    for (var i = 0; i < links.length; i++){
        if (linkIds.indexOf(links[i].id) != -1) {
            updateLinkVisual(links[i], selectedLinksParam);

        } else {
            if (otherLinksParam != null || otherLinksParam != undefined) {
                updateLinkVisual(links[i], otherLinksParam);
            }
        }
    }
}

function updateElementsVisual(elementIds, selectedElementsParam, otherElementsParam) {

    var elements =  graph.getElements();

    for (var i = 0; i < elements.length; i++){
        var element = elements[i];
        if (elementIds.indexOf(element.id) != -1) {

            var selectedStyle = calculateBlockStyle(element, selectedElementsParam);
            updateElementVisual(element, selectedStyle);

        } else {
            if (otherElementsParam != null || otherElementsParam != undefined) {

                var othersStyle = calculateBlockStyle(element, otherElementsParam);
                updateElementVisual(element, othersStyle);
            }
        }
    }
}

function calculateBlockStyle(element, params) {
    if (element.blockCategory != null && element.blockCategory != undefined &&
        styles.category[element.blockCategory] != null &&
        styles.category[element.blockCategory] != undefined)
    {
        var styleCategory = styles.category[element.blockCategory];
        if (styleCategory[params] != null && styleCategory[params] != undefined) {
            return styleCategory[params];
        }

    }

    if (styles[params] != null && styles[params] != undefined &&
        styles[params].element != null && styles[params].element != undefined) {
        return styles[params].element;
    }

    return styles.none.element;
}

function updateLinkVisual(link, style) {
    if (style == null || style == undefined) {
        return;
    }

    if (link.styling == null || link.styling == undefined) {
        link.styling = {};
    }

    if (style.sourcePointer != undefined) {
        link.styling.sourcePointer = style.sourcePointer;
    }

    if (style.sourcePointer != undefined) {
        link.styling.targetPointer = style.targetPointer;
    }

    link.styling.color = style.color;


    var sd = '';
    if (link.styling.sourcePointer != null && link.styling.sourcePointer != undefined) {
        if (link.styling.sourcePointer == "arrow") {
            sd = 'M 10 0 L 0 5 L 10 10 z';
        }
    }

    var td = '';
    if (link.styling.targetPointer != null && link.styling.targetPointer != undefined) {
        if (link.styling.targetPointer == "arrow") {
            td = 'M 10 0 L 0 5 L 10 10 z';
        }
    }

    var color = link.styling.color;


    //link.attr({
    //    '.connection': linkConnection,
    //    '.marker-source': linkSource,
    //    '.marker-target': linkTarget
    //});

    link.attr({
        '.connection': { stroke: color, 'stroke-width': 3 },
        '.marker-source': { stroke: color, fill: color, d: sd },
        '.marker-target': { stroke: color, fill: color, d: td }
    });
}


function updateElementVisual(element, style) {
    if (style == null || style == undefined) {
        return;
    }

    if (element.styling == null || element.styling == undefined) {
        element.styling = {};
    }

    element.styling.color = style.color;
    var color = element.styling.color;

    element.attr('rect/fill', color);
}





var userInterfaceHandler = {

    checkElementExists: function (elementId) {
        return modelHandler.checkElementByGraphIdExists(elementId);
    },


    selectElement: function (elementId) {
        this.displayAllErrors();
        this.displayAllLabels();

        var affectedElements = {
            elementIds: [elementId],
            linkIds: []
        };
       // updateSelectedElementsVisual(affectedElements, 'highlight', 'none');

        var result = modelHandler.modelSelectElement(elementId);
        renderModal(result);
    },

    selectLink: function(linkId) {
        this.displayAllErrors();
        this.displayAllLabels();

        var affectedElements = {
            elementIds: [],
            linkIds: [linkId]
        };
       // updateSelectedElementsVisual(affectedElements, 'highlight', 'none');

        var result = modelHandler.modelSelectLink(linkId);
        renderModal(result);
    },

    selectPort: function(elementId, portName) {
        var result = modelHandler.modelSelectPort(elementId, portName);
        renderModal(result);
    },

    redrawPort: function(elementId, portName) {
        var result = modelHandler.redrawPort(elementId, portName);
        renderModal(result);
    },

    getGraphIdBySystemId: function(elementId) {
        return modelHandler.getGraphIdBySystemId(elementId);
    },

    setDataPortForMonitoring: function(elementId, portName) {

        //create new label element
        var element = elementsFactory.createElementFactory("LABEL_ELEMENT");
        var viewNode = element.view;
        viewNode.isLabelForValue = true;

        var graphElementId = userInterfaceHandler.getGraphIdBySystemId(elementId);
        viewNode.linkedGraphElementId = graphElementId;
        viewNode.linkedElementPort = portName;
        viewNode.blockCategory = "COSMETIC";

        graph.addCells([viewNode]);
        portClickedX = portClickedX;
        portClickedY = portClickedY;

        viewNode.translate(portClickedX - 80, portClickedY - 35);

        var labelId = viewNode.get('id');
        this.displayAllLabels();

        modelHandler.setDataPortForMonitoring(elementId, portName, labelId);

    },

    removeDataPortForMonitoring: function(elementId, portName) {
        var labelId = modelHandler.getLabelIdForPort(elementId, portName);
        if (labelId != null && labelId != undefined) {
            graph.getCell(labelId).remove();
            modelHandler.removeDataPortForMonitoring(elementId, portName);
        }

    },

    updateMonitoredLabels: function(data) {
        for (var entry in data) {
            var labelId = entry;
            var value = data[labelId];

            var label = graph.getCell(labelId);
            if (label != null && label != undefined) {
                label.attr('.label/text', value);
            }
        }
    },

    setGraphModel: function(modelData) {
        modelHandler.setGraphModel(modelData);
    },

    setGraphToSystemMapping: function(graphToSystemMapping) {
        modelHandler.setGraphToSystemMapping(graphToSystemMapping);
    },

    displayAllLabels: function() {
        var affectedElements = {
            elementIds: [],
            linkIds: []
        };

        var elements =  graph.getElements();
        for (var i = 0; i < elements.length; i++){
            if (elements[i].isLabelForValue == true) {
                affectedElements.elementIds.push(elements[i].id);
            }
        }
        updateSelectedElementsVisual(affectedElements, 'normal', 'none');

    },

    displayAllErrors: function() {
        //var errors = modelHandler.getErrors();

        var affectedElements = {
            elementIds: [],
            linkIds: []
        };

        //for (var errorIndex in errors) {
        //    var error = errors[errorIndex];

        //    affectedElements.elementIds = affectedElements.elementIds.concat(error.affectedElements.elementIds);
        //    affectedElements.linkIds = affectedElements.linkIds.concat(error.affectedElements.linkIds);
        //}

       // updateSelectedElementsVisual(affectedElements, 'errorHighlight', 'normal');
    },
}


function openConsoleFunction() {
    webDataRenderer.webControllerDispatcher('openConsole');
    consoleRefresh();
}


loadDocument();