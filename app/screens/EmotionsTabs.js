import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import SegmentedControlTab from "react-native-segmented-control-tab";
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { PieChart } from 'react-native-chart-kit';

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);

const pieChart = (countedEmotions) => {
    return [
        {
            name: "Good",
            population: countedEmotions["🟢"] || 0,
            color: "#4CAF50",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "Neutral",
            population: countedEmotions["🟠"] || 0,
            color: "#FF9800",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "Bad",
            population: countedEmotions["🔴"] || 0,
            color: "#F44336",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        }
    ];
};

const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
};

// memo prevents unnecessary re-renders (only re-renders when data change)
const EmotionsTabs = React.memo(({ allEmotions, selectedDate, currentMonth }) => {
    const [selectedIndex, setSelectedIndex] = useState(0); // start at days

    // get range of week for week view
    const getWeek = (date) => {
        const startWeek = dayjs(date).startOf("isoWeek").format("YYYY-MM-DD");
        const endWeek = dayjs(date).endOf("isoWeek").format("YYYY-MM-DD");
        return { startWeek, endWeek };
    }

    // useMemo to only change data when dependencies change. Filter data for days
    const filteredDayData = useMemo(() => {
        return allEmotions[selectedDate]?.emotionsDay || [];
    }, [selectedDate]);

    // filter data for week
    const filteredWeekData = useMemo(() => {
        const { startWeek, endWeek } = getWeek(selectedDate);
        // use the dates (keys) to filter the emotions between the week
        const weekData = {};
        for (const date in allEmotions) {
            if (date >= startWeek && date <= endWeek) {
                weekData[date] = allEmotions[date];
            }
        }
        return weekData;
    }, [selectedDate]);

    // filter data for month
    const filteredMonthData = useMemo(() => {
        return countEmotions(allEmotions);
    }, [allEmotions]);

    const month = dayjs(currentMonth).format("MMMM");
    return (
        <View style={styles.container}>
            <SegmentedControlTab
                values={["Day", "Week", selectedIndex == 2 ? month : "Month"]}
                selectedIndex={selectedIndex}
                onTabPress={setSelectedIndex}
                tabsContainerStyle={styles.tabsContainer}
                tabStyle={styles.tab}
                activeTabStyle={styles.activeTab}
                tabTextStyle={styles.tabText}
                activeTabTextStyle={styles.activeTabText}
            />
            <Text style={styles.dateText}>{dayjs(selectedDate).format("dddd DD MMMM YYYY")}</Text>

            {selectedIndex === 0 && <DayView allEmotions={filteredDayData} />}
            {selectedIndex === 1 && <WeekView allEmotions={filteredWeekData} />}
            {selectedIndex === 2 && <MonthView allEmotionsCount={filteredMonthData} />}
        </View>
    );
});

const EmotionItem = React.memo(({ item, isLast }) => {
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

const DayView = ({ allEmotions, selectedDate }) => {
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
                    keyExtractor={(item, index) => item.time}
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

const countEmotions = (dataEmotions) => {
    const count = {};
    // for each date, get the emotionsDay data, and then get for each one the emoji
    Object.values(dataEmotions).forEach((emotionDay) => {
        emotionDay.emotionsDay.forEach((emotion) => {
            count[emotion.emoji] = (count[emotion.emoji] || 0) + 1;
        });
    });
    return count;
};

const WeekView = ({ allEmotions }) => {
    const countedEmotions = countEmotions(allEmotions);

    return (
        <View style={styles.dataContainer}>
            {Object.keys(allEmotions).length > 0 ? (
                <PieChart
                    data={pieChart(countedEmotions)}
                    width={320}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"30"}
                    center={[0, 0]}
                    absolute
                />
            ) : (
                <Text style={styles.text}>No emotions found for this week!</Text>
            )}
        </View >
    );
};

const MonthView = ({ allEmotionsCount }) => {
    const totalSum = Object.values(allEmotionsCount).reduce((sum, count) => sum + count, 0);


    return (
        <View style={styles.dataContainer}>
            {totalSum > 0 ? (
                <PieChart
                    data={pieChart(allEmotionsCount)}
                    width={320}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"30"}
                    center={[0, 0]}
                    absolute
                />
            ) : (
                <Text style={styles.text}>No emotions found for this month!</Text>
            )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    dataContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        height: "70%",
        elevation: 1,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.88,
        shadowRadius: 2,
        marginTop: 10
    },
    tabsContainer: {
        width: "90%",
        marginBottom: 10
    },
    tab: {
        borderColor: "transparent",
    },
    activeTab: {
        backgroundColor: "#4B4697",
        borderRadius: 5
    },
    tabText: {
        color: "#4B4697",
        fontSize: 16,
        fontFamily: "Zain-Regular"
    },
    activeTabText: {
        color: "#FFFFFF"
    },
    text: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: "#4B4697"
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
        color: "#4B4697"
    },
    emoji: {
        fontSize: 20
    },
    note: {
        fontFamily: "Zain-Regular",
        fontSize: 17
    },
    weekContainer: {
        alignItems: "center",
        justifyContent: "center",

    },
    dateText: {
        color: "#4B4697",
        fontSize: 16,
        fontFamily: "Zain-Regular",
        marginHorizontal: 20,
    },
});

export default EmotionsTabs;