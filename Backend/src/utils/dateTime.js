const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const isValidTimeString = (value) => TIME_PATTERN.test(value || "");

export const combineDateAndTime = (dateValue, timeValue) => {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
        throw new Error("Invalid date value");
    }

    if (!isValidTimeString(timeValue)) {
        throw new Error("Invalid time format");
    }

    const [hours, minutes] = timeValue.split(":").map(Number);
    const combined = new Date(dateValue);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
};

export const formatDateTime = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
