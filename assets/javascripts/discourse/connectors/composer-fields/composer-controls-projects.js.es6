import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";

export default {
setupComponent(attrs, component) {
  this.setProperties({
    dropdowncontent:[
    { id: 0, name: "duration" },
    { id: 1, name: "begin" },
    { id: 2, name: "end" }
    ]
  });
    if(this.model.topic && this.model.topic.projects_task){
      this.model.setProperties({
        projects_task_begin:this.model.topic.projects_task.begin,
        projects_task_end:this.model.topic.projects_task.end,
        projects_task_duration:this.model.topic.projects_task.duration,
        projects_task_locked: this.model.topic.projects_task.locked
      });
      //TODO feed this back into dropdown value
      console.log(this.model.topic.projects_task.locked);
    }
    else{
      this.model.setProperties({
      projects_task_locked: 'duration'  });
    }

console.log("composerffieldssss")
},
  actions: {
   lockedChange(id,elm){
     this.model.setProperties({
     projects_task_locked: elm.name  });
   },
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
