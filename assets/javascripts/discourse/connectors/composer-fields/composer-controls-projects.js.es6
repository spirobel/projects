import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";
import { later } from "@ember/runloop";

export default {
  setupComponent(attrs, component) {
    console.log(this.model)
    this.setProperties({
      dropdowncontent:[
        "duration",
        "begin",
        "end"
      ],
    });

    //SET ON MODEL  when creating    this.model.setProperties({projects_task_locked: 'duration'  });
 this.model.manageLocked();

 this.set('disallow_classes', "small-btn btn-primary")
if (this.model.projects_task.disallow){
  this.set('disallow_classes', "locked-btn small-btn btn-primary")
}
},
  actions: {
   lockedChange(name){
     this.model.set('projects_task.locked', name );
     this.model.manageLocked();
   },
   //TODO do dry runs in the backend and show error messages
   //TODO dont actually disable buttons, just turn locked button grey
   //TODO fix duration fill in with display function and also pretty duration
   //TODO fix titles
   begin(begin) {
     this.model.set('projects_task.begin', begin );
     this.model.set('projects_task.modifed', "begin" );
     this.model.set('projects_task.dry', true );
      this.model.save_projects_task()
   },
   end(end) {
      this.set("model.projects_task.end",end);
      this.set("model.projects_task.modified","end")
   },
   duration(duration) {
      this.set("model.projects_task.duration",duration);
      this.set("model.projects_task.modified","duration")
   },
   dependencies(depon, depby){
     this.set("model.projects_task.depon",depon)
     this.set("model.projects_task.depby",depby)
     this.set("model.projects_task.modified","dependencies")
   },
   disallow(){
    if (this.model.projects_task.disallow){
      this.set('disallow_classes', "small-btn btn-primary")
      this.set('model.projects_task_disallow', false)

    }else{
      this.set('disallow_classes', "locked-btn small-btn btn-primary")
      this.set('model.projects_task_disallow', true)

    }
   }


 }
}
