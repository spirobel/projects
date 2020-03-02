import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
import { bed_block_format } from '../discourse/lib/utils'
function initializeComposer(api) {
  //DRAFT
  //TODO on composer open also fire dry to get messages
  Composer.serializeToDraft('projects_task');
  Composer.reopen({
    //https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/models/composer.js.es6#L1165
    @observes('projects_task.begin',
              'projects_task.end',
              'projects_task.duration','projects_task.locked',
              'projects_task.modified','projects_task.depon.[]',
              'projects_task.depby.[]','projects_task.dry','projects_task.disallow')
    ptdataChanged() {
      const draftStatus = this.draftStatus;
      if (draftStatus && !this._clearingStatus) {
        this._clearingStatus = later(
          this,
          () => {
            this.setProperties({ draftStatus: null, draftConflictUser: null });
            this._clearingStatus = null;
            this.setProperties({ draftSaving: false, draftSaved: false });
          },
          Ember.Test ? 0 : 1000
        );
      }
    },
    @computed('projects_task.disallow')
    disallow_classes(disallow) {
     if (this.projects_task.disallow){
       return "locked-btn small-btn btn-primary"
     } else {
       return "small-btn btn-primary"
     }
    },
    @computed('projects_task.locked')
    closed(locked) {
      if (this.projects_task.locked === "begin" &&
          this.projects_task.duration &&
          this.projects_task.end ) {
            return "begin"
      } else if (this.projects_task.locked === "end" &&
                 this.projects_task.duration &&
                 this.projects_task.begin ) {
            return "end"
      } else if (this.projects_task.locked === "duration" &&
                 this.projects_task.begin  &&
                 this.projects_task.end  ) {
            return "duration"
      } else {
            return ""
      }
    },
    async save_projects_task(){
           const noteRecord = this.store.createRecord('note', this.projects_task);
           const   result = await noteRecord.save().then(function(result) {
           //attach the new object to the topic here
           let mhtml = ""
           const messis = result.payload.messages
           Object.keys(messis).forEach((i) => {
             mhtml += `<div><h4><a href=${messis[i][0].url}>${messis[i][0].title}</a>
             ${bed_block_format(messis[i][0].begin,messis[i][0].duration,messis[i][0].end)}
             </h4><ul class="pt_messages">`
             messis[i].forEach((m, i) => {
               mhtml+=`<li class="${m.message_type}">${m.message}</li>`
             });
             mhtml +="</ul></div>"
           });

              const body = mhtml
              result.target.appEvents.trigger("composer-messages:create", {
                extraClass: "custom-body",
                templateName: "custom-body",
                body
              });
              return result.payload
          }).catch(console.error);
          if(!result){
            const body = "an error has occured. please retry"
            this.appEvents.trigger("composer-messages:create",
             {extraClass: "custom-body",templateName: "custom-body", body});
            return
          }
          this.set("projects_task", result);
          if(!this.projects_task.begin){this.set("projects_task.begin",  "") }
          if(!this.projects_task.duration){this.set("projects_task.duration",  "") }
          if(!this.projects_task.end){this.set("projects_task.end",  "") }
      },


    });

  //CREATE
//we can work with this: second arg gives us begin,time pr_t_att etc
//          this.appEvents.trigger("topic:created", createdPost, composer);
  api.onAppEvent('topic:created', function(createdPost,composer){
       console.log('a topic was created');
       composer.projects_task.id = createdPost.topic_id;
       composer.projects_task.dry=false;
       console.log(composer);
       composer.save_projects_task();
     });
//UPDATE
//this.begin time pr_t_att etc is all there
//also:this.action: "edit" and this.topic.id
//topic.currentPost: 1
 api.composerBeforeSave(function() {
   console.log("Before saving, do something!");
   if (this.action == 'edit') {
     this.set('projects_task.id',this.topic.id);
     this.set('projects_task.dry',false);

     this.save_projects_task();
//  return Promise.reject(new Error("asdasd"));

// actually we should return  a promise that always resolves because the save should not be aborted
    }
    return Promise.resolve();
 });


  api.modifyClass("controller:composer", {
//https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/controllers/composer.js.es6#L1075
  @observes('model.projects_task.begin',
            'model.projects_task.end',
            'model.projects_task.duration','model.projects_task.locked',
            'model.projects_task.modified','model.projects_task.depon.[]',
            'model.projects_task.depby.[]','model.projects_task.dry','model.projects_task.disallow')
  _ptshouldSaveDraft() {
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
