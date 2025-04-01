import React, { useState, useContext, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from "react-native-calendars";
import { ThemeContext } from '../../contexts/ThemeContext';
import EmotionsTabs from "../Emotions/Components/EmotionsTabs";
import { getEmotionsDB } from '../../contexts/EmotionsDB';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from "dayjs";

// set cached data if exists
const getCachedEmotions = async (cacheTime, setAllEmotions) => {
    try {
        const cached = await AsyncStorage.getItem(cacheTime);
        if (cached) {
            setAllEmotions(JSON.parse(cached));
            return true;
        }
        return false;
    } catch (error) {
        console.log("Could not get emotions data: ", error);
        return false;
    }
};

// retrieve the data for the month the user is viewing
const getEmotionsMonth = async (month, year, setAllEmotions) => {
    // get the whole month, start date till last day of month
    const startDate = dayjs(`${year}-${month}-01`).format("YYYY-MM-DD");
    const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
    // to retrieve the emotions from cachedData from previous months to not retrieve again
    const cacheTime = `${year}-${month}`;

    // set stored emotions if there is
    const cacheFound = await getCachedEmotions(cacheTime, setAllEmotions);
    if (cacheFound) return () => { };

    // return emotions from current month from firestore
    return getEmotionsDB(startDate, endDate, setAllEmotions, cacheTime);
};

const EmotionsProgress = () => {
    const [allEmotions, setAllEmotions] = useState({});
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [calendarKey, setCalendarKey] = useState(0); // to re render the calendar when theme canges

    // listen for changes in actual month
    useEffect(() => {
        const [year, month] = currentMonth.split("-");

        const unsubscribe = getEmotionsMonth(month, year, setAllEmotions);
        // clean up when unmont
        return () => {
            if (unsubscribe && typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [currentMonth]);

    // update calendar theme when theme changes
    useEffect(() => {
        setCalendarKey((prev) => prev + 1);
    }, [theme]);

    // set style for marked dates
    const markedDates = useMemo(() => {
        const dates = {};
        const [year, month] = currentMonth.split("-");
        const daysMonth = dayjs(`${year}-${month}`).daysInMonth(); // get all days in the month
        // add empty days
        for (let day = 1; day <= daysMonth; day++) {
            const date = `${year}-${month}-${day}`;
            dates[date] = { customStyles: [] };
        }

        Object.keys(allEmotions).forEach(date => {
            if (allEmotions[date] && allEmotions[date].customStyles) {
                dates[date] = {
                    customStyles: allEmotions[date].customStyles,
                };
            }
        });
        return dates;
    }, [allEmotions]); // only re-run when allEmotions change

    return (
        <View style={styles.container}>
            <View style={styles.containerEmotions}>
                <View style={styles.containerCalendar}>
                    <Calendar
                        key={calendarKey}
                        firstDay={1}
                        markingType={"custom"}
                        displayLoadingIndicator={true}
                        markedDates={{
                            ...markedDates,
                            [selectedDate]: { selected: true, disableTouchEvent: true }
                        }}
                        onMonthChange={(monthData) => {
                            const newMonth = dayjs(monthData.dateString).format("YYYY-MM");
                            setCurrentMonth(newMonth);
                        }}
                        onDayPress={(day) =>
                            setSelectedDate(day.dateString)
                        }
                        hideExtraDays={true}
                        theme={{
                            calendarBackground: theme.container,
                            todayBackgroundColor: "#4B4697",
                            todayTextColor: "#FFFFFF",
                            textSectionTitleColor: "#B6C1CD",
                            arrowColor: theme.tabText,
                            selectedDayBackgroundColor: "#847FC7",
                            monthTextColor: theme.tabText,
                            dayTextColor: theme.text,
                            textDayFontFamily: "monospace",
                            textMonthFontFamily: "Zain-Regular",
                            textDayHeaderFontFamily: "Zain-Regular",
                            textDayFontSize: 14,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14
                        }}
                    />
                </View>
                <EmotionsTabs allEmotions={allEmotions} selectedDate={selectedDate} currentMonth={currentMonth} />
            </View>
        </View>
    );
};

const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    containerEmotions: {
        backgroundColor: "transparent",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "90%",
        height: "96%",
        borderRadius: 20,
    },
    containerCalendar: {
        width: "100%",
        padding: 10,
        borderRadius: 20,
        // android
        elevation: 2,
        shadowColor: '#000000',
        // ios
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        backgroundColor: theme.container,
        alignSelf: "center",
        marginTop: 10
    }
});

export default EmotionsProgress;