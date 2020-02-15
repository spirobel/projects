import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
import Topic from 'discourse/models/topic';
import TopicList from 'discourse/models/topic-list';
import { ajax } from "discourse/lib/ajax";
function initializeComposer(api) {
  TopicList.reopenClass({
      topics_array(topic_ids) {
      const url = `${Discourse.getURL("/topics/topics_array")}.json?topic_ids=${topic_ids.join(",")}`;
      return ajax({ url});
    }
  });

  //READ
  Topic.reopen({
  @computed('projects_task.begin')
  projectsTaskBeginPretty(begin) {
    if(!begin)return;
    return "Begin: "+moment(begin).format("D.M.Y, h:mm a");
  },
  @computed('projects_task.end')
  projectsTaskEndPretty(end) {
    if(!end)return;
    return "End: "+moment(end).format("D.M.Y, h:mm a");
  },
  @computed('projects_task.duration')
  projectsTaskDurationPretty(duration) {
    if(!duration)return;
    return "Duration: "+moment.duration(duration*1000).humanize();
  }
});
  //DRAFT
  Composer.serializeToDraft('projects_task_duration');
  Composer.serializeToDraft('projects_task_begin');
  Composer.serializeToDraft('projects_task_end');
  Composer.serializeToDraft('projects_task_locked');
  Composer.serializeToDraft('projects_task_modified');


  Composer.reopen({
    save_projects_task(topic_id){
           const noteRecord = this.store.createRecord('note', {
             id: topic_id,
             begin: this.projects_task_begin,
             end: this.projects_task_end,
             duration: this.projects_task_duration,
             locked: this.projects_task_locked,
             modified: this.projects_task_modified
           });

         noteRecord.save()  .then(function(result) {
           //attach the new object to the topic here


                const body = I18n.t("composer.duplicate_link", {
  domain: "info.domain",
  username: "info.username",
  post_url: "topic.urlForPostNumber(info.post_number)",
  ago: "shortDate(info.posted_at)"
});
result.target.appEvents.trigger("composer-messages:create", {
  extraClass: "custom-body",
  templateName: "custom-body",
  body
});
                this.notes.pushObject(result.target);
              })
              .catch(console.error);
      },


    });

  //CREATE
//we can work with this: second arg gives us begin,time pr_t_att etc
//          this.appEvents.trigger("topic:created", createdPost, composer);
  api.onAppEvent('topic:created', function(createdPost,composer){
       console.log('a topic was created');
       composer.save_projects_task(createdPost.topic_id);
     });
//UPDATE
//this.begin time pr_t_att etc is all there
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
 api.composerBeforeSave(function() {
   console.log("Before saving, do something!");
   if (this.action == 'edit') {

  this.save_projects_task(this.topic.id);
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
