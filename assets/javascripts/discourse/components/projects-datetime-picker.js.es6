import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  @computed('datetime')
  buttonLabel(dt){
    if(!dt) {
      return "set "+this.label+" date!"
    } else {
      return moment(dt).format("D.M.Y, h:mm a");
    }
  },
  @computed('label')
  icon(label){
    if(label=="begin"){return 'play'}
    else{return 'step-forward'}
  },
  @computed('locked')
  classes(locked) {
    if(locked === this.label){
      if(this.disabled){return "btn-danger btn-primary"}
      return "locked-btn btn-primary";
    } else {
      return "btn-primary";
    }
  },
  @computed('closed')
  disabled(closed) {
    if(closed === this.label){
      return true;
    } else {
      return false;
    }
  },

  actions: {
  openpicker() {
    if(this.datetime == "" || !this.datetime){
    this.setProperties({
      date: moment()
        .add(1, "day")
        .format("YYYY-MM-DD"),
      time: moment()
        .add(1, "hour")
        .format("HH:mm")
    });
  }
  else{
    this.setProperties({
      date: moment(this.datetime)
        .format("YYYY-MM-DD"),
      time: moment(this.datetime)
        .format("HH:mm")
    });
  }
    showModal("datetime-modal").setProperties({submit: this.submit,date: this.date,time: this.time, label: this.label});
  },
}
});
