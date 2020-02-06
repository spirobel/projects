import showModal from 'discourse/lib/show-modal';
import computed from "discourse-common/utils/decorators";
export default Ember.Component.extend({
  @computed('durationInput')
  inputResult(durationInput) {
     //(omitting "P" and lower case also possible)
    let argstri = "" + this.get('durationInput')
    let momstring = "";
    if(!(argstri.startsWith("p") || argstri.startsWith("P")))momstring += "P";
    momstring += durationInput;
    let mom = moment.duration(momstring.toUpperCase());
    let retstri = "";
    if(mom.years() != 0) retstri += mom.years() + " years";
    if(mom.months() != 0) retstri += mom.months() + " months";
    //if(mom.weeks() != 0) retstri += mom.weeks() + " weeks";
    //TODOdays and weeks dont work together
    if(mom.days() != 0) retstri += mom.days() + " days";
    if(mom.hours() != 0) retstri += mom.hours() + " hours";
    if(mom.minutes() != 0) retstri += mom.minutes() + " minutes";
    if(mom.seconds() != 0) retstri += mom.seconds() + " seconds";
    return retstri;
  },


});
