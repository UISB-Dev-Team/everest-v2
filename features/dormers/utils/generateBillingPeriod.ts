export const generateBillingPeriods = (semester: string, academicYear: string) => {
    if(!semester || !academicYear) return [];
    const [startYear, endYear] = academicYear.split("-");
    if(semester === "1st"){
        return [
            "August " + startYear,
            "September " + startYear,
            "October " + startYear,
            "November " + startYear,
            "December " + startYear,
            "August - December " + startYear,
        ]
    }
    if(semester === "2nd"){
        return [
            "January " + endYear,
            "February " + endYear,
            "March " + endYear,
            "April " + endYear,
            "May " + endYear,
            "January - May " + endYear,
        ]
    }
    if(semester == "Summer") {
        return [
            "June " + endYear,
            "July " + endYear,
            "June - July " + endYear,
        ]
    }
    return [];
}
