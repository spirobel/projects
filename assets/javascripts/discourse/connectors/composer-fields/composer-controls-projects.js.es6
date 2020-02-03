import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";

export default {
  setupComponent(attrs, component) {
    //we will set the props here. attrs.model
    /*let closeDate = moment(
        date + " " + time,
        "YYYY-MM-DD HH:mm"
      ).toISOString();

    //model.topic.projects_task.begin
    this.model.setProperties({
      projects_task_attributes:{duration:1},
      begin: moment()
        .add(1, "day")
        .format("YYYY-MM-DD"),
      time: moment()
        .add(1, "hour")
        .format("HH:mm")
    });
      */
console.log("composerffieldssss")
  },
  actions: {
   bla(begin) {
     //imitating poll plugin https://github.com/discourse/discourse/blob/master/plugins/poll/assets/javascripts/initializers/add-poll-ui-builder.js.es6
      console.log("bla")
      this.set("model.topic.projects_task.begin",begin);
   },


 }
}
