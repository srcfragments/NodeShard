var WebInfoHandler = {
    showModal: function(modalData) {

        document.getElementById("modalTitlePlaceholder").innerHTML = modalData.title;
        document.getElementById("modalDataPlaceholder").innerHTML = modalData.data;

        $('#myModal').modal('show');
    }
}



var webDataRenderer = {

    webControllerDispatcher : function(path) {
        var tokens = path.split(':');
        var command = tokens[0];

        var modalData = null;
        if (command == "showHelpPage") {
            modalData = this.showLandingPage();
        } else if (command == "showErrors") {
            modalData = this.showErrors();
        } else if (command == "openConsole") {
            modalData = this.openConsole();
        }

        if (modalData != null && modalData != undefined) {
            WebInfoHandler.showModal(modalData);
        }
    },

    showHelpPage : function() {
        var modalData = {};

        modalData.title = 'landing page';
        modalData.data =
            '<p>landing page test</p>' +
            '<p>you just come to our evil site ... </p>' +
            '<p>since you are fucked anyway ... why not check our getting started tutorials in the meantime</p>';

        return modalData;
    },

    showErrors: function() {
        var modalData = {};
        modalData.title = "Errors:";
        modalData.data = "errors page";

        //var errors = modelHandler.getErrors();
        //for (var errorIndex in errors) {
         //   var error = errors[errorIndex];

        //    modalData.data += '<br>';
       //     modalData.data += '<a href="#" onclick="userInterfaceHandler.showError(' + errorIndex + ')">' + error.message + '</a>';
//        }

        return modalData;
    },

    openConsole: function() {
        var modalData = {};
        modalData.title = "Console:";
        modalData.data =
            '<div class="container">' +
            '<div class="row">' +
            '<div class="work-field-container col-xs-9">' +
            '<textarea id="console_output" rows="20" cols="50"></textarea>' +
            '<textarea id="console_input" rows="20" cols="50"></textarea>' +
            '<input type="button" id="startScript" onclick="executeScript()" value="execute script">' +
            //'<input type="button" id="stopScript" onclick="stopScript()" value="stop script">' +
            '</div>' +
            '</div>' +
            '</div>';

        return modalData;
    }

}
