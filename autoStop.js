const {
  dbArea,
  dbAreaOpens,
  exCludeArea,
  dbStaffLeave,
  dbStaffArea,
  dbStaff,
} = require("./data");
const moment = require("moment");
const _ = require("lodash");

module.exports = () => {
  const nowPeriod = moment().format("YYYY-MM");

  // query database
  let staffLists = [...dbStaff];
  // staffLists = _.shuffle(staffLists);

  staffLists.forEach((staff) => {
    console.log(`🍻 ~ staff:::`, staff);
    // query datbase
    const staffAreaWork = dbStaffArea
      .filter(
        (staffArea) =>
          staffArea.period === nowPeriod && staffArea.staffId === staff.id
      )
      .map((staff) => staff.areaId);

    console.log(`🍻 ~ staffAreaWork:::`, staffAreaWork);
  });
};
