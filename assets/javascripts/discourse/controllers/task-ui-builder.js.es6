export default Ember.Controller.extend({

  init() {
    this._super(...arguments);

  },



  actions: {
    closeDatetime() {
      let dt = moment(
        this.date + " " + this.time,
        "YYYY-MM-DD HH:mm"
      ).toISOString();
      this.submit(dt);
      /*
      this.setProperties({
        datetime: moment(
          this.date + " " + this.time,
          "YYYY-MM-DD HH:mm"
        ).toISOString()
        });
        */
      this.send("closeModal");
    }
  }
});
