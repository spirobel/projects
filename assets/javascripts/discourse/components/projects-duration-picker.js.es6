import { durationFormat } from '../lib/utils'
import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({
  @computed('duration')
  buttonLabel(dt){
    if(!dt) {
      return "set duration!"
    } else {
      return durationFormat(moment.duration(dt*1000).toISOString());
    }
  },
  @computed('locked','disabled')
  classes(locked,disabled) {
    if(locked === "duration"){
      if(disabled){return "btn-danger btn-primary"}
      return "locked-btn btn-primary";
    } else {
      return "btn-primary";
    }
  },
  @computed('closed')
  disabled(closed) {
    if(closed === "duration"){
      return true;
    } else {
      return false;
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
