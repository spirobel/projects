import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({


  actions: {
   openpicker() {
     //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6

     if(this.datetime == ""){
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
     //TODO: set time and date with momentjs here
     showModal("task-ui-builder").setProperties({ updateButtonLabel: this.updateButtonLabel,
                                                    submit: this.submit,
                                                    date: this.date,
                                                    time: this.time});
   },
}
});
