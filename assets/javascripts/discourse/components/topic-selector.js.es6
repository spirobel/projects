import { isEmpty } from "@ember/utils";
import { next } from "@ember/runloop";
import Component from "@ember/component";
import discourseDebounce from "discourse/lib/debounce";
import { searchForTerm } from "discourse/lib/search";
import { observes } from "discourse-common/utils/decorators";
import discourseComputed from "discourse-common/utils/decorators";
import Topic from "discourse/models/topic";
import TopicList from 'discourse/models/topic-list';


export default Component.extend({
  loading: null,
  noResults: null,
  topics: null,
  selectedTopicId: null,
  currentTopicId: null,
  additionalFilters: null,
  topicTitle: null,
  label: null,
  loadOnInit: false,
  topicChangedCallback: null,

  init() {
    this._super(...arguments);
    if(!this.selectedTopics){this.set('selectedTopics',[])}
    if(!this.selectedTopicsID){this.set('selectedTopicsID',[])}
    const selectedTopics = this.selectedTopics
    //eat topics as ids
    TopicList.topics_array(this.selectedTopicsID).then(results => selectedTopics.pushObjects(results))
    //TODO set category
    this.set('additionalFilters','#'+this.cat)
  },

  @observes("topicTitle")
  topicTitleChanged() {
    this.setProperties({
      loading: true,
      noResults: true,
      selectedTopicId: null
    });

    this.search(this.topicTitle);
  },

  @discourseComputed("label")
  labelText(label) {
    return label || "choose_topic.title.search";
  },

  @observes("topics")
  topicsChanged() {
    if (this.topics) {
      this.set("noResults", this.topics.length === 0);
    }

    this.set("loading", false);
  },

  search: discourseDebounce(function(title) {
    if (!this.element || this.isDestroying || this.isDestroyed || isEmpty(title)) {
      return;
    }

    if (isEmpty(title) && isEmpty(this.additionalFilters)) {
      this.setProperties({ topics: null, loading: false });
      return;
    }

    const currentTopicId = this.currentTopicId;
    const selectedTopics = this.selectedTopics;
    const titleWithFilters = `${title} ${this.additionalFilters}`;
    let searchParams = {};

    if (!isEmpty(title)) {
      searchParams.typeFilter = "topic";
      searchParams.restrictToArchetype = "regular";
      searchParams.searchForId = true;
    }

    searchForTerm(titleWithFilters, searchParams).then(results => {
      if (results && results.posts && results.posts.length > 0) {
        this.set(
          "topics",
          results.posts.mapBy("topic").filter(t => t.id !== currentTopicId)
          .filter(t =>selectedTopics.every(st => t.id !== st.id))
        );
      } else {
        this.setProperties({ topics: null, loading: false });
      }
    });
  }, 300),

  actions: {
    //TODO output as ids in action
    unselectTopic(topic){
      this.selectedTopics.removeObject(topic)
      this.selectedTopicsID.removeObject(topic.id)
      //refresh search
      this.topicTitleChanged()

    },
    chooseTopic(topic) {
      this.set("selectedTopicId", topic.id);
      next(() => {
        this.selectedTopics.pushObject(topic)
        this.selectedTopicsID.pushObject(topic.id)
        this.topics.removeObject(topic)
      });
      if (this.topicChangedCallback) this.topicChangedCallback(topic);
    }
  }
});
