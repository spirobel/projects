import computed from "discourse-common/utils/decorators";
import { durationFormat } from '../lib/utils'

import { iconHTML } from "discourse-common/lib/icon-library";

export default Ember.Component.extend({
    @computed("category.earliest_begin")
    projectsTaskBeginPretty(begin) {
      if(!begin)return;
      let icon = iconHTML('fast-backward');
      return Ember.String.htmlSafe(""+icon+" "+moment(begin).format("D.M.Y, h:mm a"));
    },
    @computed("category.latest_end")
    projectsTaskEndPretty(end) {
      if(!end)return;
      let icon = iconHTML('fast-forward');
      return Ember.String.htmlSafe(""+icon+" "+moment(end).format("D.M.Y, h:mm a"));
    },
    @computed("category.longest_duration")
    projectsTaskDurationPretty(duration) {
      if(!duration)return;
      let icon = iconHTML('hourglass');
      return Ember.String.htmlSafe(""+icon+" "+durationFormat(moment.duration(duration*1000).toISOString()));
    }


});
