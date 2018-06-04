/**
 * Created by gkyuchukov on 04.10.17.
 */

var utils = {
    //validate model/graph

    //serialize model/graph

    //load model/graph
    getLabelName: function(dataPort) {
        var label = dataPort.name;

        if (dataPort.labelName != null && dataPort.labelName != undefined) {
            label = dataPort.labelName;
        }  else {
            label = dataPort.name;
        }

        return label;
    },

    getLabelText: function(dataPort) {
        var value = "unknown";

        if (dataPort.value != null && dataPort.value != undefined) {
            value = dataPort.value;

        }

        return  utils.getLabelName(dataPort) + " : " + value;
    }
}
