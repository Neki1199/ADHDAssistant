import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { collection, onSnapshot, query, where } from '@firebase/firestore';
import { db, auth } from "../../firebaseConfig";
import { Calendar } from 'react-native-calendars';
import moment from "moment";

const mostUsedEmoji = (emotions) => {
    const count = {}; // count each emoji
    emotions.forEach((emotion) => count[emotion.emoji] = (count[emotion.emoji] || 0) + 1); // increment by 1 if exists, initialise 1 if doesnt

    const maxCount = Math.max(...Object.values(count));
    // get the keys of count (emojis), get highest count of emoji
    const mostUsed = Object.keys(count).filter((emoji) => count[emoji] === maxCount);
    return mostUsed.length === 1 ? mostUsed[0] : "...";
    // get mostUsed, if there is a tie, return dots
};

// add the data for the month the user is viewing
const getEmotionsMonth = (month, year, setAllEmotions) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    // get the whole month, start date till last day of month
    const startDate = moment(`01-${month}-${year}`, "DD-MM-YYYY").format("DD-MM-YYYY");
    const endDate = moment(startDate, "DD-MM-YYYY").endOf("month").format("DD-MM-YYYY");

    const emotionsRef = collection(db, "users", userID, "emotionsTrack");
    const resultQuery = query(emotionsRef);

    // to listen for changes in the month
    const unsuscribe = onSnapshot(resultQuery, (snapshot) => {
        const allData = {};
        snapshot.docs.forEach((doc) => {
            const date = doc.id;
            const emotions = doc.data().emotionsTrack || [];
            const formattedDate = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
            if (moment(date).isBetween(startDate, endDate, null, '[]') &&
                emotions.length > 0) {
                // get most used emoji and create an array to customise the calendar and all the emotions for that day
                const emojiMostUsed = mostUsedEmoji(emotions);
                allData[formattedDate] = {
                    customStyles: {
                        container: {
                            backgroundColor: emojiMostUsed === "🟢" ? "#6ED25A" :
                                emojiMostUsed === "🟠" ? "#FF9933" :
                                    emojiMostUsed === "🔴" ? "#DF2D2D" : "#838383",
                            borderRadius: 10
                        },
                        text: { color: "#FFFFFF", fontWeight: "bold" }
                    },
                    emotionsDay: emotions,
                };
            }
        })
        setAllEmotions(allData);
    });
    return unsuscribe;
}

const EmotionsProgress = () => {
    const [allEmotions, setAllEmotions] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [visibleModal, setVisibleModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment().format("MM-YYYY"));
    const [unsuscribe, setUnsuscribe] = useState(null);

    // listen for any changes
    useEffect(() => {
        // stop listening to updates of the previous month when changed (cleanup)
        if (unsuscribe) unsuscribe();
        const [month, year] = currentMonth.split("-");
        const newUnsuscribe = getEmotionsMonth(month, year, setAllEmotions);

        setUnsuscribe(() => newUnsuscribe);  // set the new listening
        // clean up when unmont
        return () => {
            if (newUnsuscribe) newUnsuscribe();
        };
    }, [currentMonth]);

    return (
        <View style={styles.container}>
            <View style={styles.containerCalendar}>
                <Text style={styles.titleEmotions}>Emotions Tacking</Text>
                <Calendar
                    firstDay={1}
                    markingType={"custom"}
                    markedDates={allEmotions}
                    onMonthChange={(monthData) => {
                        // get the new month and set
                        const newMonth = moment(monthData.dateString).format("MM-YYYY");
                        setCurrentMonth(newMonth);
                    }}
                    onDayPress={(day) => {
                        const date = day.dateString;
                        if (allEmotions[date]) {
                            setSelectedDate(date);
                            setVisibleModal(true);
                        }
                    }}
                    style={{
                        width: 350,
                    }}
                />
            </View>

            <Modal visible={visibleModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        {allEmotions[selectedDate] && allEmotions[selectedDate].emotionsDay ? (
                            <>
                                <Text style={styles.modalTitle}>Emotions on {selectedDate}</Text>
                                <FlatList
                                    style={{ width: "100%", marginBottom: 20 }}
                                    data={allEmotions[selectedDate].emotionsDay}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View key={index} style={[styles.viewModalEmotion, {
                                            backgroundColor:
                                                item.name === "green" ? "#6ED25A" :
                                                    item.name === "orange" ? "#FF9933" :
                                                        item.name === "red" ? "#EE8383" : "#838383"
                                        }]}>
                                            <Text style={styles.textTime}>{moment(item.time, "HH:mm:ss a").format("HH:mm a")}:  </Text>
                                            <Text style={styles.textNote}>{item.note || "..."}</Text>
                                        </View>
                                    )}
                                />
                                <TouchableOpacity style={styles.buttons} onPress={() => {
                                    setVisibleModal(false);
                                    setSelectedDate(null);
                                }}>
                                    <Text style={styles.btnText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={styles.modalTitle}>No emotions recorded</Text>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start"
    },
    titleEmotions: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        color: "#4B4697",
    },
    containerCalendar: {
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "50%",
        borderRadius: 20
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "90%",
        height: "40%",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: "#000000",
        textAlign: "center"
    },
    viewModalEmotion: {
        marginBottom: 10,
        padding: 10,
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        borderRadius: 20
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
    buttons: {
        width: 100,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#B90000",
    },
    btnText: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
});

export default EmotionsProgress;