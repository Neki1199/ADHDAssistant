import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SegmentedControlTab from "react-native-segmented-control-tab";
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { PieChart } from 'react-native-chart-kit';
import { ThemeContext } from '../../contexts/ThemeContext';

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
const EmotionsTabs = ({ allEmotions, selectedDate, currentMonth }) => {
    const [selectedIndex, setSelectedIndex] = useState(0); // start at days
    const [filteredDayData, setFilteredDayData] = useState([]);
    const [filteredWeekData, setFilteredWeekData] = useState({});
    const [allEmotionsPrev, setAllEmotionsPrev] = useState({});
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    // get range of week for week view
    const getWeek = (date) => {
        const startWeek = dayjs(date).startOf("isoWeek").format("YYYY-MM-DD");
        const endWeek = dayjs(date).endOf("isoWeek").format("YYYY-MM-DD");
        return { startWeek, endWeek };
    }

    const setData = (emotionsData) => {
        // data for the day
        const dayData = emotionsData[selectedDate]?.emotionsDay || [];
        setFilteredDayData(dayData);

        // data for the week
        const { startWeek, endWeek } = getWeek(selectedDate);
        const weekData = {};
        for (const date in emotionsData) {
            if (date >= startWeek && date <= endWeek) {
                weekData[date] = emotionsData[date];
            }
        }
        setFilteredWeekData(weekData);
    }

    // filter day and week data
    useEffect(() => {
        // check that the dates are same, to upload
        if (currentMonth === dayjs(selectedDate).format("YYYY-MM")) {
            setData(allEmotions);
            setAllEmotionsPrev(allEmotions);
            // if changed month, then it will store the previous data, to not change when month changes
        } else {
            setData(allEmotionsPrev);
        }

    }, [selectedDate, allEmotions]);


    // filter data for month
    const filteredMonthData = useMemo(() => {
        return countEmotions(allEmotions);
    }, [allEmotions]);

    const month = dayjs(currentMonth).format("MMMM");

    return (
        <View style={styles.container}>
            <Text style={styles.dateText}>{dayjs(selectedDate).format("dddd DD MMMM YYYY")}</Text>
            <SegmentedControlTab
                values={["Day", "Week", selectedIndex == 2 ? month : "Month"]}
                selectedIndex={selectedIndex}
                onTabPress={setSelectedIndex}
                firstTabStyle={{
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 0
                }}
                lastTabStyle={{
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 0
                }}
                tabStyle={[styles.tab, { backgroundColor: theme.name === "light" ? "#FFFFFF" : "#808080" }]}
                activeTabStyle={{ backgroundColor: theme.name === "light" ? "#0F0A51" : "#000000" }}
                tabTextStyle={[styles.tabText, { color: theme.name === "light" ? "#4B4697" : "#FFFFFF" }]}
                activeTabTextStyle={styles.activeTabText}
            />
            {selectedIndex === 0 && <DayView allEmotions={filteredDayData} />}
            {selectedIndex === 1 && <WeekView allEmotions={filteredWeekData} />}
            {selectedIndex === 2 && <MonthView allEmotionsCount={filteredMonthData} />}
        </View>
    );
};

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

const DayView = ({ allEmotions }) => {
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
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
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
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
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

const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
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
    tab: {
        borderColor: "transparent"
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
    emoji: {
        fontSize: 20
    },
    note: {
        color: theme.text,
        fontFamily: "Zain-Regular",
        fontSize: 17
    },
    weekContainer: {
        alignItems: "center",
        justifyContent: "center"
    },
    dateText: {
        color: theme.textDate,
        fontSize: 18,
        fontFamily: "Zain-Regular",
        marginHorizontal: 20,
        marginVertical: 18
    },
});

export default EmotionsTabs;