const {
  dbArea,
  dbAreaOpens,
  exCludeArea,
  dbStaffLeave,
  dbStaffArea,
  dbStaff,
} = require("./data");
const moment = require("moment");
const lodash = require("lodash");

module.exports = () => {
  const showLog = true;
  const nowPeriod = moment().format("YYYY-MM");

  // query database
  let staffLists = [...dbStaff];
  // staffLists = lodash.shuffle(staffLists);

  const results = [];

  Array(7)
    .fill("")
    .forEach((_, days) => {
      showLog &&
        console.log(`🍻 ~ =================================================:`);

      const nowDate = moment()
        .startOf("months")
        .add(days, "days")
        .format("YYYY-MM-DD");

      showLog && console.log(`🍻 ~ nowDate:::`, nowDate);
      const areaOpenLists = dbAreaOpens.find(
        (areaOpen) => areaOpen.date === nowDate
      ).areaIds;

      showLog && console.log(`🍻 ~ พื้นที่ที่เปิด::: ${areaOpenLists}`);

      const staffLeaveList = dbStaffLeave.filter(
        (staff) => staff.date === nowDate
      );
      const staffListsIds = staffLists.map((staff) => staff.id);
      const staffAnnualLeave = staffLeaveList
        .filter((staffLeave) => staffLeave.leaveType === "ANNUAL LEAVE")
        .map((staff) => staff.staffId);

      const staffDoNotTakeLeave = lodash.difference(
        staffListsIds,
        staffAnnualLeave
      );

      const workLists = [];

      areaOpenLists.forEach((area) => {
        showLog && console.log(`🍻 ~ ++++++++++++++`);
        showLog && console.log(`🍻 ~ area:::`, area);
        const workListsStaffIds = workLists.map((wl) => wl.staffId);
        console.log(`🍻 ~ พนักงานที่ได้พื้นที่ไปแล้ว:::`, workListsStaffIds);
        showLog &&
          console.log(
            `STAFF CAN WORK IN AREA ${dbStaffArea
              .filter(
                (staff) =>
                  staff.areaId === area &&
                  staff.period === nowPeriod &&
                  staffDoNotTakeLeave.includes(staff.staffId)
              )
              .map((staff) => staff.staffId)}`
          );
        const candidateStaff = dbStaffArea
          .filter(
            (staffArea) =>
              staffArea.areaId === area &&
              staffArea.period === nowPeriod &&
              staffDoNotTakeLeave.includes(staffArea.staffId) &&
              !workListsStaffIds.includes(staffArea.staffId)
          )
          .map((staff) => staff.staffId);
        showLog && console.log(`🍻 ~ candidateStaff:::`, candidateStaff);
        const pickStaff = lodash.shuffle(candidateStaff)[0];
        if (!pickStaff) {
          console.error(
            `❌ IN :: ${nowDate} :: AREA :: ${area} :: STAFF NOT ENOUGH ::`
          );
        }
        workLists.push({ areaId: area, staffId: pickStaff });
      });

      const workListsStaffIds = workLists.map((wl) => wl.staffId);
      const staffStop = lodash.difference(
        staffDoNotTakeLeave,
        workListsStaffIds
      );

      showLog &&
        console.log(`🍻 ~ workLists::: ${JSON.stringify(workLists, null, 1)}`);
      showLog && console.log(`🎁 ~ staffStop::: ${staffStop}`);
      results.push({ date: nowDate, staffWork: workLists, staffStop });
    });

  return results;
};
