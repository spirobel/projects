import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
function initializeComposer(api) {
  Composer.serializeToDraft('date');
  Composer.serializeToDraft('time');
  //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6
  api.modifyClass("controller:composer", {

  actions: {
    showTaskModal() {
      showModal("task-ui-builder").set("toolbarEvent", this.toolbarEvent);
    }
  }
});
  api.addToolbarPopupMenuOptionsCallback(() => {
     return {
       action: "showTaskModal",
       icon: "chart-bar",
       label: "bla"
     };
   });

}

export default {
  name: "composerChanges",

  initialize() {


    withPluginApi("0.8.31", initializeComposer);
  }
};
