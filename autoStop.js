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
const mapping = require("./helper");

module.exports = () => {
  const showLog = true;
  const nowPeriod = moment().format("YYYY-MM");

  // query database
  let staffLists = [...dbStaff];
  // staffLists = lodash.shuffle(staffLists);

  const results = [];

  let staffOffYesterDay = [];
  let staffWorkHistory = [];
  let staffOffHistory = [];

  const duplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) !== index);

  const shuffleStaff = (candidateStaff, nextCandidateStaff, msg) => {
    if (nextCandidateStaff.length > 0) {
      showLog &&
        console.log(`🟢 ~ [เลือกพนักงาน] => ${msg} :::`, nextCandidateStaff);
      return lodash.shuffle(nextCandidateStaff)[0];
    } else {
      showLog &&
        console.log(
          `🔴 ~ [เลือกพนักงาน] => ต้องใช้พนักงานทุกคนที่สามารถทำได้ :::`,
          candidateStaff
        );
      return lodash.shuffle(candidateStaff)[0];
    }
  };

  const pickStaff = (days, candidateStaff) => {
    let staffOutOfQuotaStop = duplicates([...staffOffHistory]);
    showLog &&
      console.log(
        `🍻 ~ พนักงานที่ได้หยุดครบ 2 วันแล้ว:::`,
        staffOutOfQuotaStop
      );

    showLog &&
      console.log(
        `🍻 ~ พนักงานที่ได้ทำงานในวันที่ผ่านมา :::`,
        staffWorkHistory
      );
    let staffPickFirst = lodash.uniq([
      ...staffWorkHistory,
      ...staffOutOfQuotaStop,
    ]);
    showLog &&
      console.log(
        `🍻 ~ ไอดีที่ต้องเลือกพนักงานกลุ่มนี้ก่อน:::`,
        staffPickFirst
      );

    if (staffPickFirst.length > 0) {
      const nextCandidateStaff = candidateStaff.filter((staff) =>
        staffPickFirst.includes(staff)
      );
      const msg =
        "พนักงานที่สามารถทำงานต่อเนื่องได้ หรือ พนักงานที่หยุดเกิน 2 วัน";
      const resultPick = shuffleStaff(candidateStaff, nextCandidateStaff, msg);
      staffWorkHistory = staffWorkHistory.filter(
        (staff) => staff !== resultPick
      );
      return resultPick;
    } else if (staffOutOfQuotaStop.length > 0) {
      const nextCandidateStaff = candidateStaff.filter((staff) =>
        staffOutOfQuotaStop.includes(staff)
      );
      const msg = "พนักงานที่ได้หยุดครบ 2 วันแล้ว";
      const resultPick = shuffleStaff(candidateStaff, nextCandidateStaff, msg);
      staffOffHistory = staffOffHistory.filter((staff) => staff !== resultPick);
      return resultPick;
    } else {
      const nextCandidateStaff = candidateStaff.filter(
        (staff) => !staffOffYesterDay.includes(staff)
      );
      const msg = "พยายามไม่เลือกใช้พนักงานที่ได้หยุดเมืื่อวาน คงเหลือ";
      return shuffleStaff(candidateStaff, nextCandidateStaff, msg);
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
      const tomorrowDate = moment()
        .startOf("months")
        .add(days + 1, "days")
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
            `📍  พนักงานที่เลือกพื้นที่นี้ไว้ ${dbStaffArea
              .filter(
                (staff) =>
                  staff.areaId === areaOpen && staff.period === nowPeriod
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

        const theChosenOne = pickStaff(days, candidateStaff);
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
      staffOffYesterDay = staffStop;
      staffOffHistory = [...staffOffHistory, ...staffStop];
      staffWorkHistory = [...staffWorkHistory, ...workListsStaffIds];
    });

  // !showLog &&
  //   console.log(`🎁 ~ ผลลัพธ์ ::: ${JSON.stringify(results, null, 2)}`);

  return results;
};
