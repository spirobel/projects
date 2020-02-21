export default Ember.Controller.extend({

  init() {
    this._super(...arguments);

  },



  actions: {
    resetDuration(){
      this.updateButtonLabel(false);
      this.submit("");
      this.send("closeModal");
    },
    closeDuration() {
      //(omitting "P" and lower case also possible)
     let argstri = "" + this.get('durationString')
     let momstring = "";
     if(!(argstri.startsWith("p") || argstri.startsWith("P")))momstring += "P";
     momstring += this.get('durationString');
      let dt = moment.duration(momstring.toUpperCase());

      this.updateButtonLabel(dt.humanize());
      this.submit(dt.asSeconds());
      this.send("closeModal");
    }
  }
});
