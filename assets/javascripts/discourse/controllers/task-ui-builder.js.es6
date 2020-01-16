export default Ember.Controller.extend({

  init() {
    this._super(...arguments);
  },



  actions: {
    insertPoll() {
      this.send("closeModal");
    }
  }
});
