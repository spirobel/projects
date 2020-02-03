import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  init() {
    this.setProperties({
      buttonLabel: this.datetimeLabel + this.datetime
    });
    return this._super(...arguments);
  },


  actions: {
    updateButtonLabel(dt){
      this.set("buttonLabel",this.datetimeLabel + dt);
    }
}
});
