import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({


  actions: {
   openpicker() {
     showModal("dependencies-modal",{  modalClass: "dependencies-modal",}).setProperties({ depbyTopics: this.depbyTopics,
                                                    deponTopics: this.deponTopics,
                                                    submit: this.submit
                                                                    });
   },
}
});
