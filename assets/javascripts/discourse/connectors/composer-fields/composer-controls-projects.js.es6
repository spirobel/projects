import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";
import { later } from "@ember/runloop";

export default {
  setupComponent(attrs, component) {
    this.setProperties({
      dropdowncontent:[
        "duration",
        "begin",
        "end"
      ],
      deponTopics:[1,2,8],
      depbyTopics:[1,2,4],


    });
    if(this.model.topic && this.model.topic.projects_task){
      this.model.setProperties({
        projects_task_begin:this.model.topic.projects_task.begin,
        projects_task_end:this.model.topic.projects_task.end,
        projects_task_duration:this.model.topic.projects_task.duration,
        projects_task_locked: this.model.topic.projects_task.locked
      });
      this.setProperties({
        value: this.model.topic.projects_task.locked
      })
    }
    else{
      this.model.setProperties({
      projects_task_locked: 'duration'  });
    }

 //manageLocked();
 if (this.model.projects_task_locked === "begin") {
   this.set('begindisabled', true)
   this.set('durationdisabled', false)
   this.set('enddisabled', false)
 } else if (this.model.projects_task_locked === "end") {
   this.set('begindisabled', false)
   this.set('durationdisabled', false)
   this.set('enddisabled', true)
 } else {
   this.set('begindisabled', false)
   this.set('durationdisabled', true)
   this.set('enddisabled', false)
 }
},
  actions: {
   lockedChange(name){
     this.model.setProperties({
     projects_task_locked: name  });
     //manageLocked();
     if (this.model.projects_task_locked === "begin") {
       this.set('begindisabled', true)
       this.set('durationdisabled', false)
       this.set('enddisabled', false)
     } else if (this.model.projects_task_locked === "end") {
       this.set('begindisabled', false)
       this.set('durationdisabled', false)
       this.set('enddisabled', true)
     } else {
       this.set('begindisabled', false)
       this.set('durationdisabled', true)
       this.set('enddisabled', false)
     }
   },
   //TODO compute non locked field
   begin(begin) {
      this.set("model.projects_task_begin",begin);
      this.set("model.projects_task_modified","begin")
      //two cases: end or duration locked
      //locked end
      //locked duration
   },
   end(end) {
      this.set("model.projects_task_end",end);
      this.set("model.projects_task_modified","end")

      //two cases: begin or duration locked
      //locked begin
      //locked duration
   },
   duration(duration) {
      this.set("model.projects_task_duration",duration);
      this.set("model.projects_task_modified","duration")

      //two cases: end or begin locked
      //locked end
      //locked begin
   },
   dependencies(deponTopics, depbyTopics){
     console.log(deponTopics)
     console.log(depbyTopics)
   },


 }
}
