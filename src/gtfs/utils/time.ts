export function getArrivalDate(arrivalTime: string) {
    const date = new Date();
    const [hours, minutes, seconds] = arrivalTime.split(':').map(Number);

    // GTFS arrival_time can exceed 24:00:00 for trips that span across midnight
    if (hours >= 24) {
        date.setHours(hours - 24, minutes, seconds);
        date.setDate(date.getDate() + 1);
    } else {
        date.setHours(hours, minutes, seconds);
    }

    return date;
}
