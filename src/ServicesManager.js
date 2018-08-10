/**
 * Created by gkyuchukov on 14.10.17.
 */


var frameworkContext = require('./frameworkContext');
var serialComHandler = require('./SerialComHandler');
var webServer = require('./WebServer.js');
var exposedInterface = require('./ExposedInterface.js');

var activeServices = {};

function serviceInitializer(serviceNode) {

    if (activeServices[serviceNode.id] != null && activeServices[serviceNode.id] != undefined) {
        return null;
    }

    if (serviceNode.id == "SERIAL_COMM_HUB") {
        serialComHandler.init(serviceNode);
        return serialComHandler;
    }

    if (serviceNode.id == "WEB_SERVER") {
        webServer.init(serviceNode);
        return webServer;
    }

    if (serviceNode.id == "EXPOSED_INTERFACE") {
        exposedInterface.init(serviceNode);
        return exposedInterface;
    }

    return null;
}



module.exports = {

    initService: function(serviceNode) {

        var workingService = serviceInitializer(serviceNode);

        if (workingService != null && workingService != undefined) {
            activeServices[serviceNode.id] = workingService;
            workingService.serviceNode = serviceNode;
        }
    },

    start: function() {
        for (var serviceId in activeServices) {
            var service = activeServices[serviceId];
            service.start();
        }
    },

    stop: function() {
        for (var serviceId in activeServices) {
            var service = activeServices[serviceId];
            service.stop();
        }
    },

    getService: function(serviceId) {
        return activeServices[serviceId];
    }


}