import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  init() {
    // our custom code
    //we will set the props here. attrs.model
    /*let closeDate = moment(
        date + " " + time,
        "YYYY-MM-DD HH:mm"
      ).toISOString();
      */
    //model.topic.projects_task.begin
    //set datetimeLabel
    this.setProperties({
      buttonLabel: this.datetimeLabel + this.datetime
    });
    return this._super(...arguments);
  },


  actions: {
    updateButtonLabel(dt){
      console.log(dt)
      this.set("buttonLabel",this.datetimeLabel + dt);
    }
}
});
