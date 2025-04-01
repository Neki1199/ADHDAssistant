import { Alert } from 'react-native';
import { db, auth } from "../../firebaseConfig";
import {
    collection, query, where,
    onSnapshot
} from '@firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';


const mostUsedEmoji = (emotions) => {
    const count = {}; // count each emoji
    emotions.forEach((emotion) => count[emotion.emoji] = (count[emotion.emoji] || 0) + 1); // increment by 1 if exists, initialise 1 if doesnt

    const maxCount = Math.max(...Object.values(count));
    // get the keys of count (emojis), get highest count of emoji
    const mostUsed = Object.keys(count).filter((emoji) => count[emoji] === maxCount);
    return mostUsed[0];
    // get mostUsed, if there is a tie, return also the [0]
};


// get emotions from firestore and cache (prev months)
export const getEmotionsDB = async (startDate, endDate, setAllEmotions, cacheTime) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return () => { };

    const emotionsRef = collection(db, "users", userID, "emotionsTrack");
    const resultQuery = query(emotionsRef, where("__name__", ">=", startDate), where("__name__", "<=", endDate));

    // to listen for changes in the month
    const unsubscribe = onSnapshot(resultQuery, async (snapshot) => {
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
                                backgroundColor: emojiMostUsed === "🟢" ? "#B4F0A8" :
                                    emojiMostUsed === "🟠" ? "#FFC68B" :
                                        emojiMostUsed === "🔴" ? "#FA9999" : "#838383",
                                justifyContent: "center",
                                alignItems: "center",
                            },
                            text: {
                                color: date === dayjs().format("YYYY-MM-DD") ? "#330066" : "#000000",
                                fontWeight: date === dayjs().format("YYYY-MM-DD") ? "bold" : "normal"
                            }
                        },
                        emotionsDay: emotions,
                    };
                }
            });
            setAllEmotions(allData);
            // cache data for previous months
            if (dayjs(cacheTime).isBefore(dayjs().format("YYYY-MM"), "month")) {
                await AsyncStorage.setItem(cacheTime, JSON.stringify(allData));
            }

        } catch (error) {
            Alert.alert(
                "⚠️ Ups!",
                "Error fetching emotions",
                [{ text: "Try Again", style: "default" }]
            );
        }
    }, error => {
        console.error("Error in getEmotionsDB:", error);
    });
    return unsubscribe;
};
