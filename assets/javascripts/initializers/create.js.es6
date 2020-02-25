import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
function initializeComposer(api) {
  //DRAFT
  Composer.serializeToDraft('projects_task');
  Composer.reopen({
    manageLocked(){
      if (this.projects_task.locked === "begin") {
        this.set('begindisabled', true)
        this.set('durationdisabled', false)
        this.set('enddisabled', false)
      } else if (this.projects_task.locked === "end") {
        this.set('begindisabled', false)
        this.set('durationdisabled', false)
        this.set('enddisabled', true)
      } else {
        this.set('begindisabled', false)
        this.set('durationdisabled', true)
        this.set('enddisabled', false)
      }
  },
    save_projects_task(){
           const noteRecord = this.store.createRecord('note', this.projects_task);
           noteRecord.save().then(function(result) {
           //attach the new object to the topic here
              const body = "this is a test dry run" + JSON.stringify(result.payload)
              result.target.appEvents.trigger("composer-messages:create", {
                extraClass: "custom-body",
                templateName: "custom-body",
                body
              });
              console.log(result.payload)
          }).catch(console.error);
      },


    });

  //CREATE
//we can work with this: second arg gives us begin,time pr_t_att etc
//          this.appEvents.trigger("topic:created", createdPost, composer);
  api.onAppEvent('topic:created', function(createdPost,composer){
       console.log('a topic was created');
       this.projects_task.set('id',createdPost.topic_id);
       this.projects_task.set('dry',false);
       composer.save_projects_task();
     });
//UPDATE
//this.begin time pr_t_att etc is all there
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
 api.composerBeforeSave(function() {
   console.log("Before saving, do something!");
   if (this.action == 'edit') {
     this.projects_task.set('id',this.topic.id);
     this.projects_task.set('dry',false);

     this.save_projects_task();
//  return Promise.reject(new Error("asdasd"));

// actually we should return  a promise that always resolves because the save should not be aborted
    }
    return Promise.resolve();
 });


  api.modifyClass("controller:composer", {
//DRAFT observe fields that should be saved periodically to draft
//TODO do datachange on the composer.reopen (MODEL) and shouldsavedraft on CONTROLLER (here)
  @observes("model.begin", "model.time")
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
