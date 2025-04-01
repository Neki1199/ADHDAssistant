import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, FlatList, ScrollView, Image, TouchableOpacity } from 'react-native';
import { getUncompletedMonth } from '../../../contexts/TasksDB';
import { ListsContext } from "../../../contexts/ListsContext";
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from "react-native-calendars";
import { AntDesign } from '@expo/vector-icons';
import { sortTasks, TasksContext } from '../../../contexts/TasksContext';
import TaskItem from "../Components/TaskItem";
import dayjs from "dayjs";
import { ThemeContext } from '../../../contexts/ThemeContext';


export const setColour = (allLists) => {
    const colours = ["#CC0000", "#FF8000", "#FFD546", "#66CC00", "#0080FF", "#7F00FF", "#3399FF", "#F253A3"]
    const getColour = (index) => colours[index % colours.length];
    // add a colour to each list
    const listColours = allLists
        .reduce((all, list, index) => {
            all[list.id] = getColour(index);
            return all;
        }, {});
    return listColours;
};

const ListUpcoming = ({ navigation }) => {
    const { allLists } = useContext(ListsContext);
    const { theme } = useContext(ThemeContext);
    const listColours = setColour(allLists);

    const styles = useStyles(theme);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showNoDueDate, setShowNoDueDate] = useState(false);
    const [showDate, setShowDate] = useState(false);

    const [tasks, setTasks] = useState({}); // store all tasks for current month
    const [undatedTasks, setUndatedTasks] = useState([]); // store undated tasks
    const [selectedDateTasks, setSelectedDateTasks] = useState([]); // task of selected date
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
    const [calendarKey, setCalendarKey] = useState(0);
    const [markedDates, setMarkedDates] = useState({});

    // update calendar theme when theme changes
    useEffect(() => {
        setCalendarKey((prev) => prev + 1);
    }, [theme]);

    // get tasks when month changes
    useEffect(() => {
        const [year, month] = currentMonth.split("-");
        try {
            // get month data if not cached
            const unsubscribeAll = [];

            // execute all promises before continuing
            allLists.forEach(eachList => {
                const unsubscribe = getUncompletedMonth(eachList.id, year, month,
                    // get dated tasks
                    (newDatedTasks) => {
                        setTasks(prevTasks => ({
                            ...prevTasks, // keep existing lists
                            [eachList.id]: [
                                ...newDatedTasks, // update with new dated tasks
                                // keep undated as they are
                                ...(prevTasks[eachList.id]?.filter(task => task.date === "") || [])
                            ]
                        }));
                    },
                    // get undated tasks
                    (newUndatedTasks) => {
                        setTasks(prevTasks => ({
                            ...prevTasks,
                            [eachList.id]: [
                                ...(prevTasks[eachList.id]?.filter(task => task.date !== "") || []),
                                ...newUndatedTasks
                            ]
                        }));
                    }
                );
                unsubscribeAll.push(unsubscribe);
            });

            // clean up
            return () => {
                unsubscribeAll.forEach(unsubscribe => {
                    if (unsubscribe && typeof unsubscribe === "function") {
                        unsubscribe();
                    }
                });
            };
        } catch (error) {
            console.log("Error getting month data: ", error);
        }
    }, [currentMonth]);

    // recalculate marked dates when tasks change
    useEffect(() => {
        setMarkedDates(getMarkedDates());
    }, [tasks]);

    // set tasks to show on flatlist
    useEffect(() => {
        const newUndatedTasks = [];
        const uncompletedTasks = [];
        Object.values(tasks).forEach((tasksList) => {
            // sort tasks on each list
            const sortedUncompleted = sortTasks([...tasksList]);

            sortedUncompleted.forEach(task => {
                if (task.date === "") {
                    newUndatedTasks.push(task);
                } else if (task.date === selectedDate) {
                    uncompletedTasks.push(task);
                }
            });
        });
        // add undated tasks, and set tasks for the selected date
        setUndatedTasks(newUndatedTasks);
        setSelectedDateTasks(uncompletedTasks);

    }, [tasks, selectedDate]);

    const dayPress = useCallback((day) => {
        setSelectedDate(day);
    }, [tasks]);

    // change show of undated tasks flatlist
    const changeShowDue = () => {
        setShowNoDueDate(prev => !prev);
    };

    // change calendar show
    const changeShowCalendar = () => {
        setShowCalendar(prev => !prev);
    };

    const onMonthChange = (month) => {
        setCurrentMonth(`${month.year}-${String(month.month).padStart(2, "0")}`); // only get YYYY-MM
    };

    // make dots for dates and empty dates [] for the loading to work
    const getMarkedDates = () => {
        const dates = {};
        const [year, month] = currentMonth.split("-");
        const daysMonth = dayjs(`${year}-${month}`).daysInMonth(); // get all days in the month
        // add empty days
        for (let day = 1; day <= daysMonth; day++) {
            const date = `${year}-${month}-${day}`;
            dates[date] = { dots: [] };
        }

        Object.entries(tasks).forEach(([listName, taskList]) => {
            taskList.forEach(task => {
                if (task.date !== "") {
                    if (!dates[task.date]) { // if date list does not exist
                        dates[task.date] = { dots: [] };
                    }

                    // check if that dot has been already added
                    if (!dates[task.date].dots.some(dot => dot.key === listName)) {
                        dates[task.date].dots.push({
                            key: listName, // only one dot per list! 
                            color: listColours[listName] || "#000000"
                        });
                    }
                }
            });
        });
        return dates;
    };

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.containerCalendar}>
                    {showCalendar ? (
                        <Calendar
                            key={calendarKey}
                            firstDay={1}
                            displayLoadingIndicator={true}
                            markedDates={{
                                ...markedDates,
                                [selectedDate]: {
                                    ...markedDates[selectedDate],
                                    selected: true
                                }
                            }}
                            markingType="multi-dot"
                            onDayPress={(day) => dayPress(day.dateString)}
                            onMonthChange={(month) => onMonthChange(month)}
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
                    ) : (
                        <Text style={styles.selectedDate}>{dayjs(selectedDate).format("DD MMMM YYYY")}</Text>
                    )}
                    <TouchableOpacity style={{ alignItems: "center" }} onPress={changeShowCalendar}>
                        <AntDesign name="minus" size={40} color={theme.name === "light" ? "#4B4697" : "#FFFfff"} />
                    </TouchableOpacity>
                </View>


                {/* flatlist showing tasks without date and selected date tasks */}
                <View style={styles.tasksContainer}>
                    {/* no due date tasks */}
                    {/* hide or show no due date tasks */}
                    <View style={styles.touchShowComplete}>
                        <Text style={styles.sectionTitle}>Tasks without date</Text>
                        <TouchableOpacity onPress={changeShowDue} style={{ flexDirection: "row" }}>
                            <View style={styles.number}>
                                <Text style={{ fontSize: 12, color: theme.text }}>
                                    {undatedTasks.length}
                                </Text>
                            </View>
                            <AntDesign style={{ right: 10 }} name={showNoDueDate ? "up" : "down"} size={22} color={theme.name === "light" ? "#404040" : "#FFFFFF"} />
                        </TouchableOpacity>
                    </View>

                    {showNoDueDate && (
                        <FlatList
                            style={styles.flatlist}
                            data={undatedTasks}
                            keyExtractor={item => `${item.name}-${item.date}`}
                            renderItem={({ item }) => (
                                <TaskItem item={item} navigation={navigation} colour={listColours[item.list]} />
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <Image
                                    source={require("../../../../assets/images/empty.png")}
                                    style={[styles.img, { width: 250, height: 200 }]} />
                            }
                        />
                    )}

                    {/* hide or show dated tasks */}
                    <View style={styles.touchShowComplete}>
                        <Text style={styles.sectionTitle}>Tasks {
                            dayjs(selectedDate).isSame(currentMonth, "month")
                                ? `${dayjs(selectedDate).format("DD MMMM YYYY")}` : `${dayjs(currentMonth).format("MMMM YYYY")}`
                        }</Text>
                        <TouchableOpacity onPress={() => setShowDate(!showDate)} style={{ flexDirection: "row" }}>
                            <View style={styles.number}>
                                <Text style={{ fontSize: 12, color: theme.text }}>
                                    {selectedDateTasks.length}
                                </Text>
                            </View>
                            <AntDesign style={{ right: 10 }} name={showDate ? "up" : "down"} size={22} color={theme.name === "light" ? "#404040" : "#FFFFFF"} />
                        </TouchableOpacity>
                    </View>

                    {showDate && (
                        <FlatList
                            style={styles.flatlist}
                            data={selectedDateTasks}
                            keyExtractor={item => `${item.name}-${item.date}`}
                            renderItem={({ item }) => (
                                <TaskItem item={item} navigation={navigation} colour={listColours[item.list]} />
                            )}
                            ListEmptyComponent={
                                <Image
                                    source={require("../../../../assets/images/tasksCompleted.png")} // cambiar a vacio imagen
                                    style={styles.img} />
                            }
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
};


const useStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "center"
    },
    scrollViewContent: {
        padding: 10,
        width: "100%",
    },
    containerCalendar: {
        width: "100%",
        backgroundColor: theme.container,
        alignSelf: "center",
        borderRadius: 20,
        // android
        elevation: 2,
        shadowColor: '#000000',
        // ios
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        padding: 10
    },
    tasksContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: theme.container,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 65
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Zain-Regular",
        color: theme.tabText,
        marginVertical: 10,
        paddingHorizontal: 10
    },
    touchShowComplete: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 10,
        width: 350
    },
    img: {
        margin: 20,
        alignSelf: "center",
        width: 250,
        height: 250
    },
    selectedDate: {
        textAlign: "center",
        fontFamily: "monospace",
        fontSize: 18,
        marginTop: 10,
        color: theme.tabText
    },
    number: {
        backgroundColor: theme.numberTasks,
        width: 25,
        height: 25,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        right: 20
    }
});

export default ListUpcoming;