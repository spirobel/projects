import { durationFormat } from '../lib/utils'
import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({
  @computed('duration')
  buttonLabel(dt){
    if(!dt) {
      return "set "+this.label+"!"
    } else {
      return durationFormat(moment.duration(dt*1000).toISOString());
    }
  },
  @computed('disabled')
  classes(disabled) {
    if(disabled){
      return "locked-btn btn-primary";
    } else {
      return "btn-primary";
    }
  },
  actions: {
  openpicker() {
    if(this.duration){
      this.setProperties({
        durationString: durationFormat(moment.duration(this.duration*1000).toISOString(),true)
      });
  }

    showModal("duration-modal").setProperties({ submit: this.submit, durationString: this.durationString});
  },
}
});
