const { dbStaffArea, dbAreaOpens, dbStaffLeave, dbArea } = require("./data");
const moment = require("moment");

module.exports = () => {
  const bodyReq = {
    staffId: "3",
    staffVid: "5215",
    leaveDate: "2024-11-03",
    leaveTime: ["09:00", "12:00"],
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
    throw new Error(`❌ CAN NOT LEAVE :: REPEAT `);
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

  const areaOpenLists = dbAreaOpens.find(
    (area) => area.date === bodyReq.leaveDate
  );

  const areaValidate = areaOpenLists.areaIds.filter((areaOpen) =>
    staffCanWorkInArea.includes(areaOpen)
  );

  if (areaValidate.length > 0) {
    let staffInAreaValidate = [];

    areaValidate.forEach((area) => {
      const { areaTime } = dbArea.find((areaData) => areaData.id === area);

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

      const staffInArea = staffInPeriod
        .filter(
          (staff) =>
            staff.areaId === area &&
            staff.staffId !== bodyReq.staffId &&
            !staffNotAvailable.includes(staff.staffId)
        )
        .map((staff) => staff.staffId);

      if (staffInArea.length === 0) {
        throw new Error(`❌ CAN NOT LEAVE :: STAFF NOT ENOUGH AREA (${area}) `);
      }
      staffInAreaValidate.push({
        areaId: area,
        staffInArea,
      });
    });

    console.log("✅ CAN LEAVE");
  } else {
    //สามารถลาได้เลย
    console.log("✅ CAN LEAVE");
  }
};
