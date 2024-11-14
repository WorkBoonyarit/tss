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

  let staffOffBfYesterDay = [];

  const pickStaff = (candidateStaff) => {
    const nextCandidateStaff = candidateStaff.filter(
      (staff) => !staffOffBfYesterDay.includes(staff)
    );
    if (nextCandidateStaff.length > 0) {
      console.log(
        `🟢 ~ [เลือกพนักงาน] => พยายามไม่เลือกใช้พนักงานที่ได้หยุดเมืื่อวาน :::`,
        nextCandidateStaff
      );
      return lodash.shuffle(nextCandidateStaff)[0];
    } else {
      console.log(
        `🔴 ~ [เลือกพนักงาน] => ต้องใช้พนักงานทุกคนที่สามารถทำได้ :::`,
        candidateStaff
      );
      return lodash.shuffle(candidateStaff)[0];
    }
  };

  Array(exCludeArea.length)
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

      areaOpenLists.forEach((areaOpen) => {
        showLog &&
          console.log(
            `🍻 ~ ^^^^^^^^^^^^^^^^^^ พื้นที่ ::: ${areaOpen}  ::: ^^^^^^^^^^^^^^^^^^`
          );
        const workListsStaffIds = workLists.map((wl) => wl.staffId);
        showLog &&
          console.log(`🍻 ~ พนักงานที่ได้พื้นที่ไปแล้ว:::`, workListsStaffIds);
        showLog &&
          console.log(
            `🙋🏻‍♂️  พนักงานที่เลือกพื้นที่นี้ไว้ ${dbStaffArea
              .filter(
                (staff) =>
                  staff.areaId === areaOpen &&
                  staff.period === nowPeriod &&
                  staffDoNotTakeLeave.includes(staff.staffId)
              )
              .map((staff) => staff.staffId)}`
          );

        const areaTime = dbArea.find((area) => area.id === areaOpen)?.areaTime;
        showLog && console.log(`🍻 ~ เวลาเข้าเวรของพื้นที่นี้:::`, areaTime);

        const staffLeaveMeeting = staffLeaveList
          .filter((staffLeave) => staffLeave.leaveType === "MEETING")
          .filter((staffLeave) => {
            const isLeaveInAreaTime =
              staffLeave.leaveTime[1] > areaTime[0] &&
              staffLeave.leaveTime[0] < areaTime[1];

            const isLeaveEqualAreaTime =
              staffLeave.leaveTime[0] === areaTime[0] &&
              staffLeave.leaveTime[1] === areaTime[1];
            return isLeaveInAreaTime || isLeaveEqualAreaTime;
          })
          .map((staffLeave) => staffLeave.staffId);

        showLog &&
          console.log(
            `💤 ~ พนักงานที่ลาในช่วงเวลาของพื้นที่นั้นๆ:::`,
            staffLeaveMeeting
          );

        const candidateStaff = dbStaffArea
          .filter(
            (staffArea) =>
              staffArea.areaId === areaOpen &&
              staffArea.period === nowPeriod &&
              staffDoNotTakeLeave.includes(staffArea.staffId) &&
              !workListsStaffIds.includes(staffArea.staffId) &&
              !staffLeaveMeeting.includes(staffArea.staffId)
          )
          .map((staff) => staff.staffId);

        showLog &&
          console.log(
            `✅ ~ พนักงานที่ว่างและสามารถลงพื้นที่นี้ได้ :::`,
            candidateStaff
          );

        const theChosenOne = pickStaff(candidateStaff);
        if (!theChosenOne) {
          throw new Error(
            `❌ ในวันที่ :: ${nowDate} :: พื้นที่ :: ${areaOpen} :: พนักงานไม่เพียงพอกับพื้นที่ ::`
          );
        }

        showLog && console.log(`🚙 ~ พนักงานที่โดนเลือก :::`, theChosenOne);
        workLists.push({ areaId: areaOpen, staffId: theChosenOne });
      });

      const workListsStaffIds = workLists.map((wl) => wl.staffId);
      const staffStop = lodash.difference(
        staffDoNotTakeLeave,
        workListsStaffIds
      );

      showLog &&
        console.log(`🍻 ~ ผลลัพธ์::: ${JSON.stringify(workLists, null, 2)}`);
      showLog && console.log(`🎁 ~ พนักงานที่ได้หยุด ::: ${staffStop}`);
      results.push({ date: nowDate, staffWork: workLists, staffStop });
      staffOffBfYesterDay = staffStop;
    });

  !showLog &&
    console.log(`🎁 ~ ผลลัพธ์ ::: ${JSON.stringify(results, null, 2)}`);

  return results;
};
