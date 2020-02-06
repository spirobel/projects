import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({


  actions: {
   openpicker() {
     if(this.duration){
       this.setProperties({
         durationString: moment.duration(duration*1000).toISOString()
       });
   }
   else{

   }
     showModal("duration-modal").setProperties({ updateButtonLabel: this.updateButtonLabel,
                                                    submit: this.submit,
                                                    durationString: this.durationString});
   },
}
});
