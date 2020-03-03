import { withPluginApi } from "discourse/lib/plugin-api";
import { default as computed, observes, on } from 'ember-addons/ember-computed-decorators';
import Topic from 'discourse/models/topic';
import TopicList from 'discourse/models/topic-list';
import { ajax } from "discourse/lib/ajax";
import { replaceEmoji } from "discourse/widgets/emoji";
import { iconNode } from "discourse-common/lib/icon-library";
import { h } from "virtual-dom";
import { durationFormat } from '../discourse/lib/utils'
import { iconHTML } from "discourse-common/lib/icon-library";
function initializeTopic(api) {
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
      let icon = iconHTML('step-backward');
      return Ember.String.htmlSafe(""+icon+moment(begin).format("D.M.Y, h:mm a"));
    },
    @computed('projects_task.end')
    projectsTaskEndPretty(end) {
      if(!end)return;
      let icon = iconHTML('step-forward');
      return Ember.String.htmlSafe(""+icon+moment(end).format("D.M.Y, h:mm a"));
    },
    @computed('projects_task.duration')
    projectsTaskDurationPretty(duration) {
      if(!duration)return;
      let icon = iconHTML('hourglass');
      return Ember.String.htmlSafe(""+icon+durationFormat(moment.duration(duration*1000).toISOString()));
    }
  });
}
export default {
  name: "topicChanges",

  initialize() {


    withPluginApi("0.8.31", initializeTopic);
  }
};
