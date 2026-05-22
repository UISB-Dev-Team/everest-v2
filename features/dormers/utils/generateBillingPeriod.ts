export const generateMaboloBillingPeriods = (semester: string, ) => {
    if(semester === "1st"){
        return [
            "August 2026",
            "September 2026",
            "October 2026",
            "November 2026",
            "December 2026",
        ]
    }
    if(semester === "2nd"){
        return [
            "January 2027",
            "February 2027",
            "March 2027",
            "April 2027",
            "May 2027",
        ]
    }
}

export const generateSampaguitaBillingPeriods = (semester: string, ) => {
    if(semester === "1st"){
        return [
            "August - December 2026",
        ]
    }
    if(semester === "2nd"){
        return [
            "January - May 2027",
        ]
    }
}