import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";

export default {
//TODO set begin/ end values etc to default/ topic model in setupComponent
// right now we get 400 because params will be nil if we dont change them
  actions: {
   begin(begin) {
      this.set("model.projects_task_begin",begin);
   },
   end(end) {
      this.set("model.projects_task_end",end);
   },


 }
}
