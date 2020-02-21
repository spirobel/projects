export default Ember.Controller.extend({

  init() {
    this._super(...arguments);

  },



  actions: {
    resetDatetime(){
      this.updateButtonLabel(false);
      this.submit("");
      this.send("closeModal");
    },
    closeDatetime() {
      let dt = moment(
        this.date + " " + this.time,
        "YYYY-MM-DD HH:mm"
      );
      this.updateButtonLabel(dt);
      this.submit(dt.toISOString());
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
