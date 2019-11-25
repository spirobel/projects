export default Ember.Controller.extend({

  init() {
    this._super(...arguments);
    this._setupPoll();
  },

  _comboboxOptions(start_index, end_index) {
    return _.range(start_index, end_index).map(number => {
      return { value: number, name: number };
    });
  },

  _setupPoll() {
    this.setProperties({
      date: moment()
        .add(1, "day")
        .format("YYYY-MM-DD"),
      time: moment()
        .add(1, "hour")
        .format("HH:mm")
    });
  },

  actions: {
    insertPoll() {
      this.toolbarEvent.addText(this.pollOutput);
      this.send("closeModal");
      this._setupPoll();
    }
  }
});
