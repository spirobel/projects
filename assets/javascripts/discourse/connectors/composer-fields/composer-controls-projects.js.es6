import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
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
},
  actions: {
   lockedChange(name){
     this.model.set('projects_task.locked', name );
   },
   begin(begin) {
     this.model.set('projects_task.begin', begin );
     this.model.set('projects_task.modified', "begin" );
     this.model.set('projects_task.dry', true );
     this.model.save_projects_task()
   },
   end(end) {
      this.set("model.projects_task.end",end);
      this.set("model.projects_task.modified","end")
      this.model.set('projects_task.dry', true );
      this.model.save_projects_task()
   },
   duration(duration) {
      this.set("model.projects_task.duration",duration);
      this.set("model.projects_task.modified","duration")
      this.model.set('projects_task.dry', true );
      this.model.save_projects_task()
   },
   dependencies(depon, depby){
     this.set("model.projects_task.depon",depon)
     this.set("model.projects_task.depby",depby)
     this.model.set('projects_task.dry', true );
     this.model.save_projects_task()
   },
   disallow(){
    if (this.model.projects_task.disallow){
      this.set('model.projects_task.disallow', false)

    }else{
      this.set('model.projects_task.disallow', true)

    }
   }


 }
}
