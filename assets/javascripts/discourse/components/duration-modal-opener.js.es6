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
     if(this.duration){
       this.setProperties({
         durationString: moment.duration(this.duration*1000).toISOString()
       });
   }

     showModal("duration-modal").setProperties({ updateButtonLabel: this.updateButtonLabel,
                                                    submit: this.submit,
                                                    durationString: this.durationString});
   },
}
});
