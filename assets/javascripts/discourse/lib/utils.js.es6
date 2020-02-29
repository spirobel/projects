import { iconHTML } from "discourse-common/lib/icon-library";

let durationFormat =function(durationInput, isoString){
    let years = " years "
    let months = " months "
    let days = " days "
    let hours = " hours "
    let minutes = " minutes "
    let seconds = " seconds "




    if(isoString){
       years = "y"
       months = "m"
       days = "d"
       hours = "h"
       minutes = "m"
       seconds = "s"
    }
     //(omitting "P" and lower case also possible)
    let argstri = "" + durationInput
    let momstring = "";
    if(!(argstri.startsWith("p") || argstri.startsWith("P")))momstring += "P";
    momstring += durationInput;
    let mom = moment.duration(momstring.toUpperCase());
    let retstri = "";
    if(mom.years() != 0) retstri += mom.years() + years;
    if(mom.months() != 0) retstri += mom.months() + months;
    if(mom.days() != 0) retstri += mom.days() + days;
    if(isoString) retstri += 't';
    if(mom.hours() != 0) retstri += mom.hours() + hours;
    if(mom.minutes() != 0) retstri += mom.minutes() + minutes;
    if(mom.seconds() != 0) retstri += mom.seconds() + seconds;
    return retstri;
  };
let bed_block_format = function(begin, duration, end){
  let beginIcon = iconHTML('play');
  let endIcon = iconHTML('step-forward')
  let durationIcon = iconHTML('hourglass');
  return `${begin?beginIcon+moment(begin).format("D.M.Y, h:mm a"):''}
  ${duration?durationIcon+durationFormat(moment.duration(duration*1000).toISOString()):''}
  ${end?endIcon+moment(end).format("D.M.Y, h:mm a"):''}`
};


export { durationFormat, bed_block_format};
