import { getOwner } from 'discourse-common/lib/get-owner';
import showModal from "discourse/lib/show-modal";
import computed from "discourse-common/utils/decorators";

export default {
  actions: {
   begin(begin) {
      this.set("model.topic.projects_task.begin",begin);
   },
   end(end) {
      this.set("model.topic.projects_task.end",end);
   },


 }
}
