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
      ]
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
