// class MentorUtils {

// }
// module.exports = new MentorUtils()

const formatter = new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
});
const formatTime = (time, formatter) => {
    return formatter.format(new Date(time)).replace(/\//g, "-");
}
const calculateAverageRating = (feedbacks) => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return parseFloat((sum / feedbacks.length).toFixed(1));
  };

module.exports = { formatter, formatTime, calculateAverageRating };
