export default Ember.Controller.extend({
  actions: {
    resetDatetime(){
      this.submit("");
      this.send("closeModal");
    },
    closeDatetime() {
      let dt = moment(
        this.date + " " + this.time,
        "YYYY-MM-DD HH:mm"
      );
      this.submit(dt.toISOString());
      this.send("closeModal");
    }
  }
});
