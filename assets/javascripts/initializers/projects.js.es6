import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
function initializeComposer(api) {
  //DRAFT
  Composer.serializeToDraft('date');
  Composer.serializeToDraft('time');
  Composer.serializeToDraft('projects_task_attributes');
  //CREATE
//we can work with this: second arg gives us date,time pr_t_att etc
//          this.appEvents.trigger("topic:created", createdPost, composer);
  api.onAppEvent('topic:created', function(createdPost,composer){
       console.log('a topic was created');
       //getting this part to run: https://kleinfreund.de/how-to-create-a-discourse-plugin/#sending-data
       //http://0.0.0.0:9292/notes/1580254055373
            const noteRecord = this.store.createRecord('note', {
              id: createdPost.topic_id,
              date: composer.date
            });

          noteRecord.save()  .then(result => {
            //attach the new object to the topic here

                 this.notes.pushObject(result.target);
               })
               .catch(console.error);

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
       id: this.topic.id,
       date: this.date
     });

   noteRecord.save()  .then(result => {
     //attach the new object to the topic here

          this.notes.pushObject(result.target);
        })
        .catch(console.error);
}
// actually we should return  a promise that always resolves because the save should not be aborted

    return Promise.resolve();
 });


  api.modifyClass("controller:composer", {
//DRAFT observe fields that should be saved periodically to draft
  @observes("model.date", "model.time")
  __shouldSaveDraft() {
    //dataChanged() {
    if (this.model && this.model.draftStatus && !this.model._clearingStatus) {
      const m = this.model;
      const draftStatus = m.draftStatus;
      m._clearingStatus = later(
        m,
        () => {
          m.setProperties({ draftStatus: null, draftConflictUser: null });
          m._clearingStatus = null;
          m.setProperties({ draftSaving: false, draftSaved: false });
        },
        Ember.Test ? 0 : 1000
      );
    }

  debounce(this, this._saveDraft, 2000);
  },

  });
}
export default {
  name: "composerChanges",

  initialize() {


    withPluginApi("0.8.31", initializeComposer);
  }
};
