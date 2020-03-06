import showModal from 'discourse/lib/show-modal';
export default Ember.Component.extend({


  actions: {
   openpicker() {
     showModal("dependencies-modal",{  modalClass: "dependencies-modal",}).setProperties({ depbyTopics: this.depbyTopics,
                                                    deponTopics: this.deponTopics,
                                                    curtop: this.curtop,
                                                    cat: this.cat,
                                                    submit: this.submit
                                                                    });
   },
}
});
