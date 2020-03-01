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
    //no draft
if(!this.model.projects_task){
  let draft_projects_task = {}
  if(!this.model.topic) { //CREATE
    console.log(this)
    draft_projects_task.id = "drycreate"
    draft_projects_task.dry = true
    draft_projects_task.locked = "duration"
    draft_projects_task.begin = ""
    draft_projects_task.duration = ""
    draft_projects_task.end = ""
    draft_projects_task.modified = "duration"
    draft_projects_task.depon = []
    draft_projects_task.depby = []

  } else { //EDIT
    draft_projects_task = Object.assign({}, this.model.topic.projects_task);
    draft_projects_task.id = this.model.topic.id;
  }
  this.model.set('projects_task',draft_projects_task)
  }
//shoot dry on composer open to display messages
this.model.set('projects_task.dry', true );
this.model.save_projects_task()
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
     this.model.set('projects_task.modified', "dependencies" );
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
