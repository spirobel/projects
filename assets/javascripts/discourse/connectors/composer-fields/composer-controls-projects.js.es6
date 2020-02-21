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
        "end",
        "totally"
      ],
    });
    if(this.model.topic && this.model.topic.projects_task){

      //SET ON MODEL
      this.model.setProperties({
        projects_task_begin:this.model.topic.projects_task.begin,
        projects_task_end:this.model.topic.projects_task.end,
        projects_task_duration:this.model.topic.projects_task.duration,
        projects_task_locked: this.model.topic.projects_task.locked,
        projects_task_depon: this.model.topic.projects_task.depon,
        projects_task_depby: this.model.topic.projects_task.depby
      });


      //SET ON COMPONTENT
      this.setProperties({
        value: this.model.topic.projects_task.locked
      })
    }
    else{
      //SET ON MODEL
      this.model.setProperties({
      projects_task_locked: 'duration'  });
    }
//be sure to make deps arrays: SET ON MODEL
if(!this.model.projects_task_depon){this.model.set("projects_task_depon",[])}
if(!this.model.projects_task_depby){this.model.set("projects_task_depby",[])}

 //manageLocked();
 if (this.model.projects_task_locked === "begin") {
   this.set('begindisabled', true)
   this.set('durationdisabled', false)
   this.set('enddisabled', false)
 } else if (this.model.projects_task_locked === "end") {
   this.set('begindisabled', false)
   this.set('durationdisabled', false)
   this.set('enddisabled', true)
 } else if (this.model.projects_task_locked === "totally") {
   this.set('begindisabled', true)
   this.set('durationdisabled', true)
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
     } else if (this.model.projects_task_locked === "totally") {
       this.set('begindisabled', true)
       this.set('durationdisabled', true)
       this.set('enddisabled', true)
     } else {
       this.set('begindisabled', false)
       this.set('durationdisabled', true)
       this.set('enddisabled', false)
     }
   },
   //TODO do dry runs in the backend and show error messages
   //TODO dont actually disable buttons, just turn locked button grey
   //TODO fix duration fill in with display function and also pretty duration
   //TODO fix titles
   //TODO add unset button for b e d
   begin(begin) {
      this.set("model.projects_task_begin",begin);
      this.set("model.projects_task_modified","begin")
   },
   end(end) {
      this.set("model.projects_task_end",end);
      this.set("model.projects_task_modified","end")
   },
   duration(duration) {
      this.set("model.projects_task_duration",duration);
      this.set("model.projects_task_modified","duration")
   },
   dependencies(depon, depby){
     console.log("NEW SUBMIT BEGIN:")
     console.log("depon:")
     console.log(depon)
     console.log("depby:")
     console.log(depby)
     console.log("NEW SUBMIT END:")

     this.set("model.projects_task_depon",depon)
     this.set("model.projects_task_depby",depby)
   },


 }
}
