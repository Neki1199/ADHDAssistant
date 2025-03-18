import React, { useState, useContext, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from "react-native-calendars";
import { ThemeContext } from '../../contexts/ThemeContext';
import EmotionsTabs from "../Emotions/EmotionsTabs";
import { getEmotionsDB } from './EmotionsDB';
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
    const [unsuscribe, setUnsuscribe] = useState(null);
    const { theme } = useContext(ThemeContext);
    const [calendarKey, setCalendarKey] = useState(0); // to re render the calendar when theme canges

    // listen for changes in actual month
    useEffect(() => {
        // stop listening to updates of the previous month when changed (cleanup)
        if (unsuscribe === typeof ("function")) { unsuscribe() };
        const [year, month] = currentMonth.split("-");
        const newUnsuscribe = getEmotionsMonth(month, year, setAllEmotions);

        setUnsuscribe(() => newUnsuscribe);  // set the new listening
        // clean up when unmont
        return () => {
            if (newUnsuscribe && typeof newUnsuscribe === "function") newUnsuscribe();

        };
    }, [currentMonth]);

    // update calendar theme when theme changes
    useEffect(() => {
        setCalendarKey((prev) => prev + 1);
    }, [theme]);

    // set style for marked dates
    const markedDates = useMemo(() => {
        const dates = {};
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
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 15
                        }}
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

const styles = StyleSheet.create({
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
        height: "54%",
        borderRadius: 20,
        // android
        elevation: 2,
        shadowColor: '#000000',
        // ios
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    }
});

export default EmotionsProgress;