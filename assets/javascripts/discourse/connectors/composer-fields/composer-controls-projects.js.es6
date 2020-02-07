import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";

export default {
//TODO set begin/ end values etc to default/ topic model in setupComponent
// right now we get 400 because params will be nil if we dont change them
setupComponent(attrs, component) {
    if(this.model.topic.projects_task){
      this.model.setProperties({
        projects_task_begin:this.model.topic.projects_task.begin,
        projects_task_end:this.model.topic.projects_task.end,
        projects_task_duration:this.model.topic.projects_task.duration
      });
    }
console.log("composerffieldssss")
},
  actions: {
   begin(begin) {
      this.set("model.projects_task_begin",begin);
   },
   end(end) {
      this.set("model.projects_task_end",end);
   },
   duration(duration) {
      this.set("model.projects_task_duration",duration);
   },


 }
}
