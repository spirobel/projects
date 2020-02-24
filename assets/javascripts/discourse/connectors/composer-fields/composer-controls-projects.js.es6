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
    });
    if(this.model.topic && this.model.topic.projects_task){

      //SET ON MODEL
      this.model.setProperties({
        projects_task_begin:this.model.topic.projects_task.begin,
        projects_task_end:this.model.topic.projects_task.end,
        projects_task_duration:this.model.topic.projects_task.duration,
        projects_task_locked: this.model.topic.projects_task.locked,
        projects_task_depon: this.model.topic.projects_task.depon,
        projects_task_depby: this.model.topic.projects_task.depby,
        projects_task_disallow: this.model.topic.projects_task.disallow
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
 } else {
   this.set('begindisabled', false)
   this.set('durationdisabled', true)
   this.set('enddisabled', false)
 }
 this.set('disallow_classes', "btn-primary")
if (this.model.projects_task_disallow){
  this.set('disallow_classes', "locked-button btn-primary")
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
   //TODO do dry runs in the backend and show error messages
   //TODO dont actually disable buttons, just turn locked button grey
   //TODO fix duration fill in with display function and also pretty duration
   //TODO fix titles
   //TODO add unset button for b e d
   begin(begin) {
      this.set("model.projects_task_begin",begin);
      this.set("model.projects_task_modified","begin")
      const noteRecord = this.store.createRecord('note', {
        id: this.model.topic.id,
        begin: this.model.projects_task_begin,
        end: this.model.projects_task_end,
        duration: this.model.projects_task_duration,
        locked: this.model.projects_task_locked,
        modified: this.model.projects_task_modified,
        depon: this.model.projects_task_depon,
        depby: this.model.projects_task_depby,
        dry: true,
        disallow: this.projects_task_disallow
      });

    noteRecord.save()  .then(function(result) {
      //attach the new object to the topic here


           const body = "this is a test dry run"
result.target.appEvents.trigger("composer-messages:create", {
extraClass: "custom-body",
templateName: "custom-body",
body
});
           console.log(result.payload)
         })
         .catch(console.error);
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
     this.set("model.projects_task_modified","dependencies")
   },
   disallow(){
    if (this.model.projects_task_disallow){
      this.set('disallow_classes', "btn-primary")
      this.set('model.projects_task_disallow', false)

    }else{
      this.set('disallow_classes', "locked-button btn-primary")
      this.set('model.projects_task_disallow', true)

    }
   }


 }
}
