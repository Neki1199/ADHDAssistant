import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getUncompletedMonth } from './TasksDB';
import { ListsContext } from "../../contexts/ListsContext";
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from "react-native-calendars";
import { AntDesign } from '@expo/vector-icons';
import { sortTasks } from './TabLists';
import TaskItem from './TaskItem';
import dayjs from "dayjs";

const ListUpcoming = ({ route, navigation }) => {
    const { listID } = route.params;
    const { allLists } = useContext(ListsContext);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showNoDueDate, setShowNoDueDate] = useState(false);

    const [tasks, setTasks] = useState({}); // store all tasks for current month
    const [undatedTasks, setUndatedTasks] = useState([]); // store undated tasks
    const [selectedDateTasks, setSelectedDateTasks] = useState([]); // task of selected date
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

    const markedDates = useRef({});
    const cachedData = useRef({}); // use same data if there is no change

    const colours = ["#CC0000", "#FF8000", "#FFD546", "#66CC00", "#0080FF", "#7F00FF", "#3399FF", "#F253A3"]
    const getColour = (index) => colours[index % colours.length];
    // add a colour to each list
    const listColours = allLists
        .filter(list => list.id !== "Upcoming")
        .reduce((all, list, index) => {
            all[list.id] = getColour(index);
            return all;
        }, {});

    const getMonthTasks = async (month, year) => {
        const dateCache = `${year}-${month}`;

        if (cachedData.current[dateCache]) {
            // use ref data
            setTasks(cachedData.current[dateCache]);
            setIsLoading(false);
            return;
        }

        try {
            // get month data if not cached
            const lists = allLists.filter(list => list.id !== "Upcoming");
            const unsuscribeAll = [];

            // get all tasks from each list
            lists.forEach(eachList => {
                const unsuscribe = getUncompletedMonth(eachList.id, year, month, (resultTasks) => {
                    setTasks(prevTasks => {
                        const newTasks = { ...prevTasks, [eachList.id]: resultTasks };
                        cachedData.current[dateCache] = newTasks; // store on ref
                        return newTasks;
                    });
                });
                unsuscribeAll.push(unsuscribe); // add all unsuscribe
            });

            // clean up
            return () => {
                unsuscribeAll.forEach(unsuscribe => {
                    if (unsuscribe && typeof unsuscribe === "function") {
                        unsuscribe();
                    }
                });
            };
        } catch (error) {
            console.log("Error getting month data: ", error);
        }
    };

    // get tasks when month changes
    useEffect(() => {
        const [year, month] = currentMonth.split("-");
        getMonthTasks(month, year);
    }, [currentMonth]);

    // set tasks to show on flatlist
    useEffect(() => {
        const newUndatedTasks = [];
        const uncompletedTasks = [];
        Object.values(tasks).forEach((tasksList) => {
            // sort tasks on each list
            const sortedUncompleted = sortTasks([...tasksList]);

            sortedUncompleted.forEach(task => {
                if (task.date == "") {
                    newUndatedTasks.push(task);
                    return;
                } else if (task.date === selectedDate) {
                    uncompletedTasks.push(task);
                }
            });
        });


        markedDates.current = getMarkedDates;
        // add undated tasks, and set tasks for the selected date
        setUndatedTasks(undatedTasks);
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

    // make dots for dates
    const getMarkedDates = useMemo(() => {
        const dates = {};

        Object.entries(tasks).forEach(([listName, taskList]) => {
            taskList.forEach(task => {
                if (task.date !== "") {
                    if (!dates[task.date]) {
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
    }, [tasks]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#7D79C0", "#EBEAF6"]}
                style={styles.gradient}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerCalendar}>
                        {showCalendar ? (
                            <Calendar
                                firstDay={1}
                                markedDates={{
                                    ...markedDates.current,
                                    [selectedDate]: {
                                        ...markedDates.current[selectedDate],
                                        selected: true
                                    }
                                }}
                                markingType="multi-dot"
                                onDayPress={(day) => dayPress(day.dateString)}
                                onMonthChange={(month) => onMonthChange(month)}
                                hideExtraDays={true}
                                theme={{
                                    todayTextColor: "#3526FF",
                                    textSectionTitleColor: "#B6C1CD",
                                    arrowColor: "#4B4697",
                                    selectedDayBackgroundColor: "#CCCCFF",
                                    selectedDayTextColor: "#000000",
                                    monthTextColor: "#4B4697",
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
                            <AntDesign name="minus" size={40} color={"#4B4697"} />
                        </TouchableOpacity>
                    </View>

                    {/* flatlist showing tasks without date and selected date tasks */}
                    <View style={styles.tasksContainer}>
                        {/* no due date tasks */}
                        {/* hide or show no due date tasks */}
                        <TouchableOpacity onPress={changeShowDue} style={styles.touchShowComplete}>
                            <Text style={styles.sectionTitle}>Tasks without date {undatedTasks.length > 0 && `   ${undatedTasks.length}`}</Text>
                            <AntDesign style={{ right: 10 }} name={showNoDueDate ? "up" : "down"} size={22} color="#404040" />
                        </TouchableOpacity>

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
                                        source={require("../../../assets/images/empty.jpg")}
                                        style={[styles.img, { width: 250, height: 200 }]} />
                                }
                            />
                        )}

                        {/* need this view??? */}
                        <View style={[styles.touchShowComplete, { right: 10 }]}>
                            <Text style={styles.sectionTitle}>Tasks for {dayjs(selectedDate).format("dddd MMM YYYY")}</Text>
                        </View>

                        <FlatList
                            style={styles.flatlist}
                            data={selectedDateTasks}
                            keyExtractor={item => `${item.name}-${item.date}`}
                            renderItem={({ item }) => (
                                <TaskItem item={item} navigation={navigation} colour={listColours[item.list]} />
                            )}
                            ListEmptyComponent={
                                <Image
                                    source={require("../../../assets/images/tasksCompleted.png")} // cambiar a vacio imagen
                                    style={styles.img} />
                            }
                            scrollEnabled={false}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
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
        backgroundColor: "#FFFFFF",
        alignSelf: "center",
        borderRadius: 20,
        marginTop: 10,
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
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 65
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Zain-Regular",
        color: "#4B6976",
        marginVertical: 10,
        paddingHorizontal: 10,
        width: "100%"
    },
    touchShowComplete: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
        paddingHorizontal: 10,
        width: "100%"
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
        color: "#4B4697"
    },
    coloursContainer: {
        width: "90%",
        flexDirection: "row",
        marginTop: 10,
        justifyContent: "space-evenly",
        flexWrap: "wrap",
    },
    insideColours: {
        alignItems: "center",
        padding: 5,
        borderRadius: 20,
        width: 130
    },
    listName: {
        textAlign: "center",
        fontFamily: "Zain-Regular",
        fontSize: 16
    }
});

export default ListUpcoming;