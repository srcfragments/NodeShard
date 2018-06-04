var frameworkContext = require('./src/frameworkContext');
var schemaParser = require('./src/SchemaParser');
var modulesManager = require('./src/ModulesManager');
var servicesManager = require('./src/ServicesManager');


function init() {

    var schema = schemaParser.readJsonFromFile("./configuration/schema.json");
    var localMachineConfig = schemaParser.readJsonFromFile("./configuration/machineConfig.json");
    schemaParser.parseSchema(schema, localMachineConfig);

    modulesManager.init();
}

function start() {
    servicesManager.start();
    modulesManager.start();

}

function stop() {
    servicesManager.stop();
    modulesManager.stop();

}


function mainAppTick() {
    if (frameworkContext.getContext("running") != true) {
        stop();
    }
}





frameworkContext.setContext("running", true);
init();
start();
setInterval(mainAppTick, 10000);
