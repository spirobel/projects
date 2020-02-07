import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  init() {
    if(this.datetime){
      this.setProperties({
        buttonLabel: this.datetimeLabel +": " + moment(this.datetime).format("D.M.Y, h:mm a")
      });
    }
    else{
      this.setProperties({
        buttonLabel: "set "+this.datetimeLabel+" date!"
      });
    }
    return this._super(...arguments);
  },


  actions: {
    updateButtonLabel(dt){
      this.set("buttonLabel",this.datetimeLabel+": " + dt.format("D.M.Y, h:mm a"));
    }
}
});
