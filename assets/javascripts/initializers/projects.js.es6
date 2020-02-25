import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import Composer from 'discourse/models/composer';
import { debounce } from "@ember/runloop";
import Topic from 'discourse/models/topic';
import TopicList from 'discourse/models/topic-list';
import { ajax } from "discourse/lib/ajax";
import { replaceEmoji } from "discourse/widgets/emoji";
import { iconNode } from "discourse-common/lib/icon-library";
import { h } from "virtual-dom";
function initializeComposer(api) {
  TopicList.reopenClass({
      topics_array(topic_ids) {
      const store = Discourse.__container__.lookup("service:store");
      const url = `${Discourse.getURL("/topics/topics_array")}.json?topic_ids=${topic_ids.join(",")}`;
      return ajax({ url}).then(results => {
        const topicMap = [];
        results.topic_list.topics.forEach(t => (topicMap.push(store.createRecord("topic", t))));
        return topicMap;
      });
    }
  });

  //READ
  api.includePostAttributes('projects_task');
  api.decorateWidget('post-menu:before', function(helper){
    //functions to display the links below topic
    const linkHtml =function(link) {
       const linkBody = replaceEmoji(link.title);
       return h(
         "li",
         h(
           "a.track-link",
           {
             className: "inbound",
             attributes: { href: link.url }
           },
           [iconNode("link"), linkBody]
         )
       );
     }
     const linkList = function(topics){
    //   if ((!helper.attrs.projects_task.depon_topics || helper.attrs.projects_task.depon_topics.length === 0)&&
    //       (!helper.attrs.projects_task.depby_topics || helper.attrs.projects_task.depby_topics.length === 0) ) {
      if(!topics || topics.length ===0){
           // shortcut all work
           return;
         }
         const store = Discourse.__container__.lookup("service:store");
         const topicsMap = [];
         topics.forEach(t => (topicsMap.push(store.createRecord("topic", t))));
         const result = [];
         topicsMap.forEach(l => result.push(linkHtml(l)));
         return result;
     }
     //START of decoration
     if(!helper.attrs.firstPost || !helper.attrs.projects_task){
       return;
     }
     const endresult = [];
     const depons = linkList(helper.attrs.projects_task.depon_topics);
     if (depons){
      endresult.push(h('span',{ className:"test"},'this task depends on these tasks to finish first:'));
      endresult.push(h("ul.post-links", depons));
    }
    const depbys = linkList(helper.attrs.projects_task.depby_topics);
    if (depbys){
     endresult.push(h('span',{ className:"test"},'these tasks depend on this task to finish first:'));
     endresult.push(h("ul.post-links", depbys));
   }
    if (endresult.length) {
      return h('div',endresult);
    }



});
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
