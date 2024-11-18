const { exCludeArea, dbStaff, dbStaffLeave } = require("./data");
const writeXlsxFile = require("write-excel-file/node");
const moment = require("moment");
const { getStaffName, getAreaName } = require("./helper");

module.exports = async (results) => {
  if (!results || results?.length === 0) return;
  const data = results.flatMap((a) =>
    a.staffWork.map((b) => {
      return {
        date: a.date,
        staffId: b.staffId,
        areaId: b.areaId,
      };
    })
  );

  const objects = exCludeArea.map((_, idx) => {
    const date = moment()
      .startOf("months")
      .add(idx, "days")
      .format("YYYY-MM-DD");

    const item = dbStaff.map((staff) => {
      const areaId =
        data.find((s) => s.date === date && s.staffId === staff.id)?.areaId ||
        null;

      const isAnnualLeave = dbStaffLeave.find(
        (staffLeave) =>
          staffLeave.date === date &&
          staffLeave.staffId === staff.id &&
          staffLeave.leaveType === "ANNUAL LEAVE"
      );

      return {
        [staff.vid]: areaId
          ? getAreaName?.(areaId)
          : isAnnualLeave
          ? "ANNUAL LEAVE"
          : "STOP",
      };

      // return {
      //   [staff.vid]: areaId ? getAreaName?.(areaId) : "STOP",
      // };
    });
    const result = {};

    Object.entries(item).forEach(([key, value]) => {
      if (key !== "date") {
        const [innerKey, innerValue] = Object.entries(value)[0];
        result[innerKey] = innerValue;
      }
    });
    return {
      date,
      ...result,
    };
  });

  const schema = [
    {
      column: "",
      type: String,
      value: (data) => data.date,
    },
    ...dbStaff.map((staff) => {
      return {
        column: staff.vid,
        type: String,
        value: (data) => data?.[staff.vid],
      };
    }),
  ];

  await writeXlsxFile(objects, {
    schema,
    // filePath: `file-${Date.now()}.xlsx`,
    filePath: `file.xlsx`,
  });
};
