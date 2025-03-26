import React, { useState, useMemo, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SegmentedControlTab from "react-native-segmented-control-tab";
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { ThemeContext } from '../../../contexts/ThemeContext';
import { MonthView } from './MonthTab';
import { WeekView } from './WeekTab';
import { DayView } from './DayTab';

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
            {selectedIndex === 1 && <WeekView allEmotions={filteredWeekData} countEmotions={countEmotions} chartConfig={chartConfig} pieChart={pieChart} />}
            {selectedIndex === 2 && <MonthView allEmotionsCount={filteredMonthData} pieChart={pieChart} chartConfig={chartConfig} />}
        </View>
    );
};


const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
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
    dateText: {
        color: theme.textDate,
        fontSize: 18,
        fontFamily: "Zain-Regular",
        marginHorizontal: 20,
        marginVertical: 18
    }
});

export default EmotionsTabs;