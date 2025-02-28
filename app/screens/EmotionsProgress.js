import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { collection, onSnapshot, query, where } from '@firebase/firestore';
import { db, auth } from "../../firebaseConfig";
import { Calendar } from "react-native-calendars";
import EmotionsTabs from "./EmotionsTabs";
import dayjs from "dayjs";

const mostUsedEmoji = (emotions) => {
    const count = {}; // count each emoji
    emotions.forEach((emotion) => count[emotion.emoji] = (count[emotion.emoji] || 0) + 1); // increment by 1 if exists, initialise 1 if doesnt

    const maxCount = Math.max(...Object.values(count));
    // get the keys of count (emojis), get highest count of emoji
    const mostUsed = Object.keys(count).filter((emoji) => count[emoji] === maxCount);
    return mostUsed[0];
    // get mostUsed, if there is a tie, return also the [0]
};

// add the data for the month the user is viewing
const getEmotionsMonth = (month, year, setAllEmotions, cachedData) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    // get the whole month, start date till last day of month
    const startDate = dayjs(`${year}-${month}-01`).format("YYYY-MM-DD");
    const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");

    // to retrieve the emotions from cachedData from previous months to not retrieve again
    const cacheTime = `${year}-${month}`;
    const currentDate = dayjs().format("YYYY-MM");
    if (cacheTime !== currentDate &&
        // only previous months
        dayjs(cacheTime).isBefore(currentDate, "month") &&
        cachedData.current[cacheTime]) {
        setAllEmotions(cachedData.current[cacheTime]);
        return;
    }

    const emotionsRef = collection(db, "users", userID, "emotionsTrack");
    const resultQuery = query(emotionsRef, where("__name__", ">=", startDate), where("__name__", "<=", endDate));

    // to listen for changes in the month
    const unsuscribe = onSnapshot(resultQuery, (snapshot) => {
        const allData = {};
        try {
            snapshot.docs.forEach((doc) => {
                const date = doc.id;
                const emotions = doc.data().emotionsTrack || [];
                if (emotions.length > 0) {
                    // get most used emoji and create an array to customise the calendar and all the emotions for that day
                    const emojiMostUsed = mostUsedEmoji(emotions);
                    allData[date] = {
                        customStyles: {
                            container: {
                                backgroundColor: emojiMostUsed === "🟢" ? "#6ED25A" :
                                    emojiMostUsed === "🟠" ? "#FF9933" :
                                        emojiMostUsed === "🔴" ? "#DF2D2D" : "#838383",
                                borderRadius: 5
                            },
                            text: { color: "#FFFFFF", fontWeight: "bold" }
                        },
                        emotionsDay: emotions,
                    };
                }
            })
            setAllEmotions(allData);
            if (dayjs(cacheTime).isBefore(currentDate, "month")) {
                cachedData.current[cacheTime] = allData; // set cached for first time if does not exist (only previous months)
            }
        } catch (error) {
            Alert.alert(
                "⚠️ Ups!",
                "Error fetching emotions",
                [{ text: "Try Again", style: "default" }]
            );
        }
    });
    return unsuscribe;
}

const EmotionsProgress = () => {
    const [allEmotions, setAllEmotions] = useState({});
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
    const [unsuscribe, setUnsuscribe] = useState(null);
    const cachedData = useRef({}); // useRef to not reset data on re-renders

    // useCallback caches a function on first re-render to not change unless dependencies change
    const monthChange = useCallback((monthData) => {
        const newMonth = dayjs(monthData.dateString).format("YYYY-MM");
        setCurrentMonth(newMonth);
    }, []);

    const dayChange = useCallback((day) => {
        setSelectedDate(day.dateString);

    }, []);

    // listen for any changes
    useEffect(() => {
        // stop listening to updates of the previous month when changed (cleanup)
        if (unsuscribe) unsuscribe();
        const [year, month] = currentMonth.split("-");
        const newUnsuscribe = getEmotionsMonth(month, year, setAllEmotions, cachedData);

        setUnsuscribe(() => newUnsuscribe);  // set the new listening
        // clean up when unmont
        return () => { if (newUnsuscribe) newUnsuscribe(); };
    }, [currentMonth]);

    const markedDates = useMemo(() => {
        const dates = {};
        Object.keys(allEmotions).forEach(date => {
            dates[date] = {
                customStyles: allEmotions[date].customStyles,
            };
        });
        return dates;
    }, [allEmotions]); // only re-run when allEmotions change

    return (
        <View style={styles.container}>
            <View style={styles.containerEmotions}>
                <View style={styles.containerCalendar}>
                    <Calendar
                        firstDay={1}
                        day
                        markingType={"custom"}
                        markedDates={markedDates}
                        onMonthChange={monthChange}
                        onDayPress={dayChange}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 20
                        }}
                        theme={{
                            todayBackgroundColor: "#EAE8FF",
                            textSectionTitleColor: "#B6C1CD",
                            arrowColor: "#4B4697",
                            monthTextColor: "#4B4697",
                            textDayFontFamily: "Zain-Regular",
                            textMonthFontFamily: "Zain-Regular",
                            textDayHeaderFontFamily: "Zain-Regular",
                            textDayFontSize: 16,
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
    titleEmotions: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        color: "#4B4697",
    },
    containerEmotions: {
        backgroundColor: "#F5F5F5",
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
    },
    textTime: {
        fontFamily: "monospace",
        fontSize: 14,
        color: "#000000",
    },
    textNote: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#000000",

    },

});

export default EmotionsProgress;