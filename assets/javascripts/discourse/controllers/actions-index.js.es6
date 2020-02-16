import Topic from "discourse/models/topic";
export default Ember.Controller.extend({
  init() {
    this._super(...arguments);

    Topic.find(6,{}).then(results => {
    console.log(results)
    //this.set('topics',[results])
    console.log(this.topics)
    })
  },
  selectedTopics: [


  ],
  content: [
  { id: 1, name: "foo" },
  { id: 2, name: "bar" },
  { id: 3, name: "baz" }
],
  actions: {
    lockedChange(){
      console.log("this");
    },
  }
});
