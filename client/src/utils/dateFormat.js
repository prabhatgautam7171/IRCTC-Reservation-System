// 🧠 Step 1 — format function
export const formatDate = (dateString) => {
    if (!dateString) return "Select Date";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short" }; // e.g. 9 Oct
    const formattedDate = date.toLocaleDateString("en-GB", options);
    const year = String(date.getFullYear()).slice(-2); // '25
    return `${formattedDate} '${year}`;
  };
