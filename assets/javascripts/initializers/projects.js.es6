import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
function initializeComposer(api) {
  Composer.serializeToDraft('date');
  Composer.serializeToDraft('time');

  //DRAFT
  Composer.serializeToDraft('projects_task_attributes');
  //CREATE
//we can work with this: second arg gives us date,time pr_t_att etc
  api.onAppEvent('topic:created', () => {
       console.log('a topic was created');
     });
//UPDATE
//this.date time pr_t_att etc is all there
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
 api.composerBeforeSave(function() {
   console.log("Before saving, do something!");
   if (this.action == 'edit') {


//getting this part to run: https://kleinfreund.de/how-to-create-a-discourse-plugin/#sending-data
//http://0.0.0.0:9292/notes/1580254055373
     const noteRecord = this.store.createRecord('note', {
       id: Date.now(),
       date: this.date
     });

   noteRecord.save()  .then(result => {
          this.notes.pushObject(result.target);
        })
        .catch(console.error);
}
// actually we should return  a promise that always resolves because the save should not be aborted 

    return Promise.resolve();
 });


  //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6
  api.modifyClass("controller:composer", {
//DRAFT observe fields that should be saved periodically to draft
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
