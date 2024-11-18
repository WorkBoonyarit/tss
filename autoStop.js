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
  const showLog = false;
  const nowPeriod = moment().format("YYYY-MM");

  const results = [];

  let staffLeaveYesterDayIds = []; // สำหรับ ได้หยุดต่อเนื่อง 2 วัน ไม่เอาพนักงานที่หยุดในเมื่อวานมาทำ (ยกเว้นไม่มีคนจริงๆ)
  let staffNotWorkExceedQuotaIds = []; //สำหรับเงื่อนไข ทำงานไม่เกิน 5 วัน / 1 รอบการทำงาน (เอา staff ที่เกิน 5 วันออกทุกกรณี)
  let workStaffIds = []; //สำหรับเงื่อนไข ทำงานขั้นต่ำ 2 วัน / 1 รอบการทำงาน (จับมาเลือกก่อน)
  let leaveStaffIds = []; // สำหรับควรหยุดไม่เกิน 2 วัน (จับมาเลือกก่อน)
  const historyAllStop = {};

  const findExceedQuotaWork = (arr, threshold = 4) => {
    // 5 days
    const frequencyMap = new Map();

    arr.forEach((num) => {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    });

    const result = Array.from(frequencyMap.entries())
      .filter(([num, count]) => count > threshold)
      .map(([num]) => num);

    return result;
  };

  const duplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) !== index);

  const shuffleStaff = (
    candidateStaff,
    nextCandidateStaff,
    msg,
    shuffle = true,
    icon
  ) => {
    if (nextCandidateStaff.length > 0) {
      showLog &&
        console.log(
          `${icon} ~ [เลือกพนักงาน] => ${msg} :::`,
          nextCandidateStaff
        );
      return shuffle
        ? lodash.shuffle(nextCandidateStaff)[0]
        : nextCandidateStaff[0];
    } else {
      showLog &&
        console.log(
          `🔴 ~ [เลือกพนักงาน] => ต้องใช้พนักงานทุกคนที่สามารถทำได้ :::`,
          candidateStaff
        );
      return lodash.shuffle(candidateStaff)[0];
    }
  };

  const getOverTwoDaysLeave = () => {
    return lodash.uniq(duplicates([...leaveStaffIds]));
  };

  const pickStaff = (days, candidateStaff) => {
    let staffOverLeave = getOverTwoDaysLeave();
    const staffExceedWorkQuota = findExceedQuotaWork(
      staffNotWorkExceedQuotaIds
    );
    let staffInQuota = candidateStaff.filter(
      (staff) => !staffExceedWorkQuota.includes(staff)
    );
    let staffPickFirst = lodash.uniq([...staffOverLeave, ...workStaffIds]);

    showLog &&
      console.log(`🍻 ~ พนักงานที่ทำงานเกิน 5 วัน:::`, staffExceedWorkQuota);
    showLog &&
      console.log(`🍻 ~ พนักงานที่ได้หยุดครบ 2 วันแล้ว:::`, staffOverLeave);
    showLog &&
      console.log(`🍻 ~ พนักงานที่ได้ทำงานในวันที่ผ่านมา :::`, workStaffIds);
    showLog &&
      console.log(`🍻 ~ ต้องเลือกพนักงานกลุ่มนี้ก่อน:::`, staffPickFirst);

    if (staffPickFirst.length > 0) {
      const nextCandidateStaff = staffPickFirst.filter((staff) =>
        staffInQuota.includes(staff)
      );
      const msg =
        "พนักงานที่สามารถทำงานต่อเนื่องได้ หรือ พนักงานที่หยุดเกิน 2 วัน";
      const resultPick = shuffleStaff(
        staffInQuota,
        nextCandidateStaff,
        msg,
        false,
        "🔵"
      );
      workStaffIds = workStaffIds.filter((staff) => staff !== resultPick);
      leaveStaffIds = leaveStaffIds.filter((staff) => staff !== resultPick);
      return resultPick;
    } else {
      const nextCandidateStaff = staffInQuota.filter(
        (staff) => !staffLeaveYesterDayIds.includes(staff)
      );
      const msg = "พยายามไม่เลือกใช้พนักงานที่ได้หยุดเมืื่อวาน คงเหลือ";
      return shuffleStaff(staffInQuota, nextCandidateStaff, msg, true, "🟢");
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

      const tempStaffWorkIds = [];

      areaOpenLists.forEach((areaOpen) => {
        showLog &&
          console.log(
            `🍻 ~ ^^^^^^^^^^^^^^^^^^ พื้นที่ ::: ${areaOpen}  ::: ^^^^^^^^^^^^^^^^^^`
          );
        const todayStaffWorkIds = tempStaffWorkIds.map((wl) => wl.staffId);
        showLog &&
          console.log(`🍻 ~ พนักงานที่ได้พื้นที่ไปแล้ว:::`, todayStaffWorkIds);
        showLog &&
          console.log(
            `📍  พนักงานที่เลือกพื้นที่นี้ไว้ `,
            dbStaffArea
              .filter(
                (staff) =>
                  staff.areaId === areaOpen && staff.period === nowPeriod
              )
              .map((staff) => staff.staffId)
          );

        const areaTime = dbArea.find((area) => area.id === areaOpen)?.areaTime;
        showLog && console.log(`🍻 ~ เวลาเข้าเวรของพื้นที่นี้:::`, areaTime);

        const staffNotAvailable = staffLeaveList
          .filter((staffLeave) => {
            const isLeaveAnnual = staffLeave.leaveType === "ANNUAL LEAVE";
            const isLeaveMeeting = staffLeave.leaveType === "MEETING";
            const isLeaveInAreaTime =
              staffLeave.leaveTime[1] > areaTime[0] &&
              staffLeave.leaveTime[0] < areaTime[1];

            const isLeaveEqualAreaTime =
              staffLeave.leaveTime[0] === areaTime[0] &&
              staffLeave.leaveTime[1] === areaTime[1];
            return (
              isLeaveAnnual ||
              (isLeaveMeeting && (isLeaveInAreaTime || isLeaveEqualAreaTime))
            );
          })
          .map((staffLeave) => staffLeave.staffId);

        showLog &&
          console.log(
            `💤 ~ พนักงานที่ไม่สามารถทำงานในพื้นที่นี้ได้:::`,
            staffNotAvailable
          );

        const candidateStaff = dbStaffArea
          .filter(
            (staffArea) =>
              staffArea.areaId === areaOpen &&
              staffArea.period === nowPeriod &&
              !todayStaffWorkIds.includes(staffArea.staffId) &&
              !staffNotAvailable.includes(staffArea.staffId)
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
            `❌ ในวันที่ :: ${nowDate} :: พื้นที่ :: (${areaOpen}) :: ไม่สามารถจัดพนักงานลงได้ ::`
          );
        }

        showLog && console.log(`🚙 ~ พนักงานที่โดนเลือก :::`, theChosenOne);
        tempStaffWorkIds.push({ areaId: areaOpen, staffId: theChosenOne });
      });

      const todayStaffWorkIds = tempStaffWorkIds.map((wl) => wl.staffId);

      const staffIds = dbStaff.map((staff) => staff.id);
      const staffStop = lodash.difference(staffIds, todayStaffWorkIds);

      showLog &&
        console.log(
          `🍻 ~ ผลลัพธ์::: ${JSON.stringify(tempStaffWorkIds, null, 2)}`
        );
      showLog && console.log(`🎁 ~ พนักงานที่ได้หยุด ::: ${staffStop}`);

      staffLeaveYesterDayIds = staffStop;
      workStaffIds = workStaffIds.filter((staff) => !staffStop.includes(staff));
      staffNotWorkExceedQuotaIds = staffNotWorkExceedQuotaIds.filter(
        (staff) => !staffStop.includes(staff)
      );

      leaveStaffIds = [...leaveStaffIds, ...staffStop];
      workStaffIds = [...workStaffIds, ...todayStaffWorkIds];
      staffNotWorkExceedQuotaIds = [
        ...staffNotWorkExceedQuotaIds,
        ...todayStaffWorkIds,
      ];

      // reports
      results.push({ date: nowDate, staffWork: tempStaffWorkIds, staffStop });

      staffStop?.forEach?.((staff) => {
        historyAllStop[staff] = {
          staffId: staff,
          count: (historyAllStop?.[staff]?.count || 0) + 1,
        };
      });
    });

  // !showLog &&
  //   console.log(`🎁 ~ ผลลัพธ์ ::: ${JSON.stringify(results, null, 2)}`);
  return { results, historyAllStop };
};
