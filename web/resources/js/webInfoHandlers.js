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
        if (command == "showAboutPage") {
            modalData = this.showAboutPage();
        } else if (command == "showHelpPage") {
            modalData = this.showHelpPage();
        } else if (command == "showErrors") {
            modalData = this.showErrors();
        } else if (command == "openConsole") {
            modalData = this.openConsole();
        }

        if (modalData != null && modalData != undefined) {
            WebInfoHandler.showModal(modalData);
        }
    },

    showAboutPage: function() {
        var modalData = {};

        modalData.title = "About us";
        modalData.data =
            "<p>Hi all,</p>" +
            "<p>My name is Georgi Kyuchukov. A person with passion to make computers and people communicate easier with each other.</p>" +
            "<p>How I plan to do that? By employing technologies like code generators, visual editors, domain specific languages and more, all in hope that one day we reach a stage where we can just tell the computer what we want, and leave it figure out how to do it." +
            "<p>This project was started to prove that no code solutions can be used in the development of Internet of Things</p>" +
            "<br><br>" +
            "<p>I would be happy to answer any question at: <a href='mailto:srcfragments@gmail.com' target='_top'>srcfragments@gmail.com</a></p>" +
            "<p>Please check my web site: <a href='#'>..... not available yet .....</a> </p>";

        return modalData;
    },

    showHelpPage : function() {
        var modalData = {};

        modalData.title = 'Need Help?';
        modalData.data =
            "<p>This is the web monitoring and control interface for the project you created using our code generator: <a href='www.sourcefragments.com'>www.sourcefragments.com</a></p>" +
            "<p>The web interface use the exact model graph you created, but with the difference its in read only mode</p>" +
            "<p>Once your system is up and running, you can monitor each data port value, by clicking on the port and check the 'monitor' checkbox. A yellow label element will appear below the port containing its name and value.</p>" +
            "<p>The value will change at real time as the signals in your system change. To make monitoring easier, you can give name to the label, by editing the 'label id' parameter of the port.</p>" +
            "<p>(Hint: you can drag and drop the monitoring labels to make the interface customized to your wishes)</p>";

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
