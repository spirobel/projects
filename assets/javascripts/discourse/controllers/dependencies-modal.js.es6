export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
    this.set("depon",true)
  },
  actions: {
    selectdepon(){
      this.set("depby",false)
      this.set("depon",true)
    },
    selectdepby(){
      this.set("depby",true)
      this.set("depon",false)

    },
    closeDuration() {
      //do dry run in backend and warn if deponTopics.includes(depbyTopics)
      this.submit(this.deponTopics, this.depbyTopics);
      this.send("closeModal");
    }
  }
});
