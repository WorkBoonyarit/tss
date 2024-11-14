const { dbStaffArea, dbAreaOpens, dbStaffLeave, dbArea } = require("./data");
const moment = require("moment");

module.exports = () => {
  const showLog = false;
  // const bodyReq = {
  //   staffId: "3",
  //   staffVid: "5215",
  //   leaveDate: "2024-11-03",
  //   leaveTime: ["05:00", "09:00"],
  //   leaveType: "MEETING",
  // };

  const bodyReq = {
    staffId: "3",
    staffVid: "5215",
    leaveDate: "2024-11-03",
    leaveTime: ["12:00", "15:00"],
    leaveType: "MEETING",
  };

  const staffLeaveList = dbStaffLeave.filter(
    (staff) => staff.date === bodyReq.leaveDate
  );

  const cannotLeave = staffLeaveList.find((staffLeave) => {
    const isMySelf = staffLeave.staffId === bodyReq.staffId;
    const isAnnual = staffLeave.leaveType === "ANNUAL LEAVE";
    const isMeet = staffLeave.leaveType === "MEETING";
    const isInRageTime =
      staffLeave.leaveTime[1] > bodyReq.leaveTime[0] &&
      staffLeave.leaveTime[0] < bodyReq.leaveTime[1];
    const isEqualTime =
      staffLeave.leaveTime[0] === bodyReq.leaveTime[0] &&
      staffLeave.leaveTime[1] === bodyReq.leaveTime[1];

    return (
      (isMySelf && isAnnual) ||
      (isMySelf && isMeet && (isInRageTime || isEqualTime))
    );
  });

  if (cannotLeave) {
    throw new Error(`❌ ไม่สามารถลาซ้ำได้ `);
  }

  const periodLeave = moment(bodyReq.leaveDate).format("YYYY-MM");
  const staffInPeriod = dbStaffArea.filter(
    (area) => area.period === periodLeave
  );
  const staffCanWorkInArea = dbStaffArea
    .filter(
      (area) => area.period === periodLeave && area.staffId === bodyReq.staffId
    )
    .map((area) => area.areaId);

  showLog &&
    console.log(
      `🍻 ~ พนักงาน  ID :=> ${bodyReq.staffId} สามารถทำในพื้นที่ไหนบ้าง:::`,
      staffCanWorkInArea
    );
  const areaOpenLists = dbAreaOpens.find(
    (area) => area.date === bodyReq.leaveDate
  );
  showLog &&
    console.log(
      `🍻 ~ พื้นที่ที่เปิดในวันที่ลา ${bodyReq.leaveDate} :::`,
      areaOpenLists.areaIds
    );

  const areaValidate = areaOpenLists.areaIds.filter((areaOpen) =>
    staffCanWorkInArea.includes(areaOpen)
  );

  showLog && console.log(`🍻 ~ พื้นที่ที่ต้องตรวจสอบ:::`, areaValidate);
  if (areaValidate.length > 0) {
    let staffInAreaValidate = [];

    areaValidate.forEach((area) => {
      showLog && console.log("=====================================");
      showLog && console.log(`🍻 ~ พื้นที่:::`, area);
      const { areaTime } = dbArea.find((areaData) => areaData.id === area);
      showLog && console.log(`🍻 ~ เวลาเข้าเวร:::`, areaTime);

      const staffNotAvailable = staffLeaveList
        .filter(
          (staffLeave) =>
            staffLeave.leaveType === "ANNUAL LEAVE" ||
            (staffLeave.leaveType === "MEETING" &&
              staffLeave.leaveTime[1] > areaTime[0] &&
              staffLeave.leaveTime[0] < areaTime[1]) ||
            (staffLeave.leaveTime[0] === areaTime[0] &&
              staffLeave.leaveTime[1] === areaTime[1])
        )
        .map((staff) => staff.staffId);
      showLog && console.log(`🍻 ~ พนักงานที่ลา:::`, staffNotAvailable);
      const staffInArea = staffInPeriod
        .filter((staff) => {
          const isStaffInArea = staff.areaId === area;
          const isStaffAvailable = !staffNotAvailable.includes(staff.staffId);
          const isMySelf = staff.staffId === bodyReq.staffId;
          const isNotLeaveInAreaTime = !(
            (bodyReq.leaveTime[1] > areaTime[0] &&
              bodyReq.leaveTime[0] < areaTime[1]) ||
            (bodyReq.leaveTime[0] === areaTime[0] &&
              bodyReq.leaveTime[1] === areaTime[1])
          );

          return (
            isStaffInArea &&
            isStaffAvailable &&
            (!isMySelf || (isMySelf && isNotLeaveInAreaTime))
          );
        })
        .map((staff) => staff.staffId);

      showLog &&
        console.log(
          `🍻 ~ staffInArea:::`,
          staffInPeriod
            .filter(
              (staff) =>
                staff.areaId === area &&
                !staffNotAvailable.includes(staff.staffId)
            )
            .map((staff) => staff.staffId)
        );
      if (staffInArea.length === 0) {
        throw new Error(
          `❌ ไม่สามารถลางานได้ เนื่องจากมีพนักงานไม่เพียงพอในพื้นที่ (${area}) `
        );
      }
      staffInAreaValidate.push({
        areaId: area,
        staffInArea,
      });
    });
    showLog &&
      console.log(`🍻 ~ พนักงานที่เหลือในแต่ละพื้นที่:::`, staffInAreaValidate);

    console.log("✅ CAN LEAVE");
  } else {
    showLog &&
      console.log(`🍻 ~ พนักงานที่เหลือในแต่ละพื้นที่:::`, staffInAreaValidate);
    //สามารถลาได้เลย
    console.log("✅ CAN LEAVE");
  }
};
