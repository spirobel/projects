import { durationFormat } from '../lib/utils'
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({
  @computed('durationInput')
  inputResult(durationInput) {
    return durationFormat(durationInput)
  },


});
