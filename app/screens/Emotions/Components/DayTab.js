import React, { useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { ThemeContext } from '../../../contexts/ThemeContext';

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);

const EmotionItem = React.memo(({ item, isLast }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <View style={isLast ? [styles.emotionData, { borderBottomWidth: 0 }] : styles.emotionData}>
            <View style={styles.timeEmoji}>
                <Text style={styles.time}>{dayjs(item.time, "HH:mm:ss").format("HH:mm")}</Text>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            {item.note === "" ? null : <Text style={styles.note}>{item.note}</Text>}
        </View>
    );
});

export const DayView = ({ allEmotions }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    // to improve performance, do not change data on re-renders unless dep. changed
    const renderEmotionItem = useCallback(({ item, index }) => (
        <EmotionItem
            item={item}
            isLast={index === allEmotions.length - 1}
        />
    ), [allEmotions]);

    return (
        <View style={styles.dataContainer}>
            {allEmotions.length > 0 ? (
                <FlatList
                    style={{ width: "100%", height: "100%", margin: 10, paddingHorizontal: 30, paddingVertical: 5 }}
                    data={allEmotions}
                    keyExtractor={(item) => item.time}
                    renderItem={renderEmotionItem}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={3}
                />
            ) : (
                <Text style={styles.text}>No emotions found!</Text>
            )}

        </View >
    );
};


const useStyles = (theme) => StyleSheet.create({
    dataContainer: {
        backgroundColor: theme.container,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "70%",
        elevation: 1,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.88,
        shadowRadius: 2,
    },
    text: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: theme.tabText
    },
    emotionData: {
        padding: 10,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#E1E1E1",
        justifyContent: "center"
    },
    timeEmoji: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    time: {
        fontFamily: "monospace",
        fontSize: 14,
        color: theme.tabText
    },
    note: {
        color: theme.text,
        fontFamily: "Zain-Regular",
        fontSize: 17
    },
    emoji: {
        fontSize: 20
    },
});