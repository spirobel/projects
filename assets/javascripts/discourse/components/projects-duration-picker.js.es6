import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({

  init() {
    if(this.duration){
      this.setProperties({
        buttonLabel: this.Label+": " +moment.duration(this.duration*1000).humanize()
      });
    }
    else{
      this.setProperties({
        buttonLabel: "set "+this.Label+"!"
      });
    }
    return this._super(...arguments);
  },


  actions: {
    updateButtonLabel(dt){
      this.set("buttonLabel",this.Label+": " +  dt);
    }
}
});
