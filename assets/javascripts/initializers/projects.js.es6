import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
function initializeComposer(api) {
  Composer.serializeToDraft('date');
  Composer.serializeToDraft('time');
  Composer.serializeOnCreate('date');
  Composer.serializeOnCreate('time');
  Composer.serializeToTopic('date');
  Composer.serializeToTopic('time');
  Composer.serializeToTopic('projects_task_attributes')
  Composer.serializeOnCreate('projects_task_attributes')
  Composer.serializeToDraft('projects_task_attributes')



  //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6
  api.modifyClass("controller:composer", {

  @observes("model.date", "model.time")
  __shouldSaveDraft() {
  this.get('model').dataChanged();
  debounce(this, this._saveDraft, 2000);
},
  actions: {
    showTaskModal() {
      const composermodel = this.get('model')
      //TODO: set time and date with momentjs here
      showModal("task-ui-builder", {model:
        composermodel
        }).set("toolbarEvent", this.toolbarEvent);
      this.set("model.date", "test");
      this.set("model.time", "test");
      this.set("model.projects_task_attributes",{duration:1})
      composermodel.setProperties({
        date: moment()
          .add(1, "day")
          .format("YYYY-MM-DD"),
        time: moment()
          .add(1, "hour")
          .format("HH:mm")
      });
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
