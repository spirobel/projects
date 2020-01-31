import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";

export default {
  setupComponent(attrs, component) {
    //we will set the props here. attrs.model
    this.model.setProperties({
      projects_task_attributes:{duration:1},
      date: moment()
        .add(1, "day")
        .format("YYYY-MM-DD"),
      time: moment()
        .add(1, "hour")
        .format("HH:mm")
    });
    const controller = getOwner(this).lookup('controller:composer');
    component.set('eventValidation', controller.get('eventValidation'));
    controller.addObserver('eventValidation', () => {
      if (this._state === 'destroying') return;
      component.set('eventValidation', controller.get('eventValidation'));
    })
  },
  actions: {
   bla() {
     //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6

     const composermodel = this.get('model')
     //TODO: set time and date with momentjs here
     showModal("task-ui-builder", {model:
       composermodel
       }).set("toolbarEvent", this.toolbarEvent);
   },


 }
}
