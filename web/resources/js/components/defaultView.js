////////////////////////////////////////
//        visual style library
////////////////////////////////////////

if (typeof _LIBRARY_OF_VIEWS_ === 'undefined') {
    _LIBRARY_OF_VIEWS_ = {};
}

if (typeof _LIBRARY_OF_PORT_VIEWS_ === 'undefined') {
    _LIBRARY_OF_PORT_VIEWS_ = {};
}



const GET_DEFAULT_PORT = function (name, group) {
    var port = {
        id: name,
        group: group,
        attrs: { text: { text: name } },
    };

    return port;
}

_LIBRARY_OF_PORT_VIEWS_["DEFAULT"] = function (name, group) {
    return GET_DEFAULT_PORT(name, group);
}


const GET_DEFAULT_NODE = ({positionName, portLabelFill, portBodyFill, portBodyStroke, portBodyR})=> {
    return {
        position: {
            name: positionName
        },
        attrs: {
            '.port-label': {
                fill: portLabelFill || '#7c68fc'
            },
            '.port-body': {
                fill: portBodyFill || '#7c68fc',
                stroke: portBodyStroke || '#000',
                r: portBodyR || 8,
                magnet: true
            }
        },
        label: {
            position: {
                name: 'insideOriented',
                args: {
                    y: 10
                }
            }
        }
    }
};

_LIBRARY_OF_VIEWS_["DEFAULT"] = function(element) {
    // default view
    let m = new joint.shapes.devs.ModelTEST({
        position: {x: 50, y: 50},
        size: {width: element.view.sizex, height: element.view.sizey},
        left: element.left_ports,
        right: element.right_ports,
        top: element.top_ports,
        bottom: element.bottom_ports,


        attrs: {
            '.label': {text: element.name, 'ref-x': 0.5, 'ref-y': 5},
            rect: {fill: '#e4f8ff'},
            '.inPorts circle': {fill: '#8045a0', magnet: 'passive', type: 'input'},
            '.outPorts circle': {fill: '#302490', type: 'output'}
        }
    });

    return m;
};

joint.shapes.devs.ModelTEST = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><rect class="body"/><text class="label"/></g>',
    portMarkup: '<circle class="port-body" onclick="selectedPort(this)" />',
    portLabelMarkup: '<text class="port-label" onclick="selectedLabelPort(this)" />',
    defaults: _.defaultsDeep({

        type: 'devs.ModelTEST',
        leftPorts: [],
        rightPorts: [],
        topPorts: [],
        bottomPorts: [],
        size: {
            width: 80,
            height: 80
        },
        attrs: {
            '.': {
                magnet: false
            },
            '.label': {
                text: 'Model',
                'ref-x': .5,
                'ref-y': 10,
                'font-size': 18,
                'text-anchor': 'middle',
                fill: '#000'
            },
            '.body': {
                'ref-width': '100%',
                'ref-height': '100%',
                stroke: '#358382'
            }
        },
        ports: {
            groups: {
                'left': GET_DEFAULT_NODE({positionName: 'left'}),
                'right': GET_DEFAULT_NODE({positionName: 'right'}),
                'top': GET_DEFAULT_NODE({positionName: 'top'}),
                'bottom': GET_DEFAULT_NODE({positionName: 'bottom'}),
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);

        this.on('change:leftPorts change:rightPorts change:topPorts change:bottomPorts', this.updatePortItems, this);
        this.updatePortItems();
    },

    updatePortItems: function(model, changed, opt) {

        // Make sure all ports are unique.
        //var inPorts = _.uniq(this.get('inPorts'));
        //var outPorts = _.difference(_.uniq(this.get('outPorts')), inPorts);

        var leftPorts = this.get('left');
        var rightPorts = this.get('right');
        var topPorts = this.get('top');
        var bottomPorts = this.get('bottom');

        var leftPortItems = this.createPortItems('left', leftPorts);
        var rightPortItems = this.createPortItems('right', rightPorts);
        var topPortItems = this.createPortItems('top', topPorts);
        var bottomPortItems = this.createPortItems('bottom', bottomPorts);

        var allPortItems = leftPortItems.concat(rightPortItems).concat(topPortItems).concat(bottomPortItems);
        this.prop('ports/items', allPortItems, _.extend({ rewrite: true }, opt));
    },

    createPortItem: function(group, port) {

        return {
            id: port,
            group: group,
            attrs: {
                '.port-label': {
                    text: port
                }
            }
        };
    },

    createPortItems: function(group, ports) {

        return _.map(ports, _.bind(this.createPortItem, this, group));
    },

    _addGroupPort: function(port, group, opt) {

        var ports = this.get(group);
        return this.set(group, _.isArray(ports) ? ports.concat(port) : [port], opt);
    },

    addLeftPort: function(port, opt) {

        return this._addGroupPort(port, 'left', opt);
    },

    addRightPort: function(port, opt) {

        return this._addGroupPort(port, 'right', opt);
    },

    addTopPort: function(port, opt) {

        return this._addGroupPort(port, 'top', opt);
    },

    addBottomPort: function(port, opt) {

        return this._addGroupPort(port, 'bottom', opt);
    },

    _removeGroupPort: function(port, group, opt) {

        return this.set(group, _.without(this.get(group), port), opt);
    },

    removeLeftPort: function(port, opt) {

        return this._removeGroupPort(port, 'left', opt);
    },

    removeRightPort: function(port, opt) {

        return this._removeGroupPort(port, 'right', opt);
    },

    removeTopPort: function(port, opt) {

        return this._removeGroupPort(port, 'top', opt);
    },

    removeBottomPort: function(port, opt) {

        return this._removeGroupPort(port, 'bottom', opt);
    },

    _changeGroup: function(group, properties, opt) {

        return this.prop('ports/groups/' + group, _.isObject(properties) ? properties : {}, opt);
    },

    changeLeftGroup: function(properties, opt) {

        return this._changeGroup('left', properties, opt);
    },

    changeRightGroup: function(properties, opt) {

        return this._changeGroup('right', properties, opt);
    },

    changeTopGroup: function(properties, opt) {

        return this._changeGroup('top', properties, opt);
    },

    changeBottomGroup: function(properties, opt) {

        return this._changeGroup('bottom', properties, opt);
    },
});