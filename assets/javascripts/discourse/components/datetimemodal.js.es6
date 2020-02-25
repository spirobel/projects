import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({
  @computed('disabled')
  classes(disabled) {
    if(disabled){
    return "locked-btn btn-primary";
  }
  else{
    return "btn-primary";
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
     showModal("task-ui-builder").setProperties({ updateButtonLabel: this.updateButtonLabel,
                                                    submit: this.submit,
                                                    date: this.date,
                                                    time: this.time});
   },
}
});
