import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  init() {
    this.setProperties({
      buttonLabel: moment.duration(this.duration*1000).humanize()
    });
    return this._super(...arguments);
  },


  actions: {
    updateButtonLabel(dt){
      this.set("buttonLabel", dt);
    }
}
});
