import React, { useState, useContext, useEffect } from "react";
import { Alert, View, ActivityIndicator, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { addTask, deleteTask, deleteRepeatedTasks, changeTask } from "../TasksDB"
import { ListsContext } from "../../../contexts/ListsContext";
import { AntDesign } from "@expo/vector-icons";
import { TimerPickerModal } from "react-native-timer-picker";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskDetails from "../Components/TaskDetails";
import RepeatSelection from "../Components/RepeatSelection";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { removeNotification, removeRepeatNotifications, scheduleNotification } from "../Components/Notifications";


// get dates from repeat field, date is the starts field in repeat, not date from task
export const getDatesRepeat = (date, repeat) => {
    const datesRepeat = [];
    const startDate = dayjs(date);
    let currentDate = startDate;
    const maxTasks = 30; // limit of tasks for never
    const days = repeat.days;

    const dayMap = {
        "Mon": 0,
        "Tue": 1,
        "Wed": 2,
        "Thu": 3,
        "Fri": 4,
        "Sat": 5,
        "Sun": 6
    };

    // add intervals from starts
    while (true) {
        if (repeat.type === "Daily") {
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(repeat.every, "day");
        } else if (repeat.type === "Weekly") {
            days.forEach(day => {
                const dayIndex = dayMap[day]; // get day index
                // add one more day (so its exact)
                const oneDayMore = currentDate.day(dayIndex).add(1, "day");
                const dateDay = oneDayMore.format("YYYY-MM-DD");
                if (dayjs(dateDay).isAfter(startDate) || dayjs(dateDay).isSame(startDate)) {
                    datesRepeat.push(dateDay);
                }
            });
            currentDate = currentDate.add(repeat.every, "week");
        } else if (repeat.type === "Monthly") {
            // handle 30-31
            if (repeat.dayMonth === "Last") {
                currentDate = currentDate.endOf("month");
            } else {
                // get smaller day (if 31, get 28, or 30)
                const daysInMonth = currentDate.daysInMonth();
                const smallerDay = Math.min(repeat.dayMonth, daysInMonth);
                currentDate = currentDate.date(smallerDay);
            }
            // break beforehand if its after
            if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
                break;
            }
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));

            currentDate = currentDate.add(repeat.every, "month");
        } else if (repeat.type === "Yearly") {
            // break beforehand if year is after
            if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
                break;
            }
            datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(repeat.every, "year");
        }

        if (repeat.ends === "Never") {
            if (datesRepeat.length >= maxTasks) break;
        } else if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
            break;
        }
    }
    return datesRepeat;
};

// task = null, when long press the task to change or delete
// if null, is a new task, if not null, is being edited
const ModalNewTask = ({ modalVisible, setModalVisible, list, task = null }) => {
    const { allLists } = useContext(ListsContext);
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [loading, setLoading] = useState(false);
    // calendar, time
    const [modalDateTime, setModalDateTime] = useState(false);
    const [pickerField, setPickerField] = useState("");
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [timeSelected, setTimeSelected] = useState("Set Time");
    const [hour, mins] = TaskDetails.Time?.value?.split(":") || ["0", "0"];
    const initialTime = { hours: parseInt(hour, 10), minutes: parseInt(mins, 10) };

    // time picker for duration
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    // open repeat modal
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    // open modal delete when there is repeated tasks
    const [modalDelete, setModalDelete] = useState(false);
    // open list selection
    const [showLists, setShowLists] = useState(false);
    const [listsItems, setListsItems] = useState([]);
    const [calendarKey, setCalendarKey] = useState(0);

    // when editing, it sets the current data, if new, all clear
    const [name, setName] = useState(task ? task.name : ""); // task name
    const [time, setTime] = useState(task ? task.time : "");
    const [repeat, setRepeat] = useState(task ? task.repeat : { type: "Once" });
    const [otherList, setOtherList] = useState(task ? task.list : list);
    const completed = (task ? task.completed : false);
    const completedDate = (task ? task.completedDate : "");

    // also fields, but have the cancel icon to reset
    const [taskDetails, setTaskDetails] = useState({ // !! makes null false, if data true
        Date: { value: task?.date || "", cancel: !!task?.date },
        Reminder: { value: task?.reminder || "", cancel: !!task?.reminder },
        Duration: { value: task?.duration || "", cancel: !!task?.duration },
    });

    // set lists
    useEffect(() => {
        setListsItems(getLists());
    }, [allLists]);

    // update calendar theme when theme changes
    useEffect(() => {
        setCalendarKey((prev) => prev + 1);
    }, [theme]);


    const clearAll = () => {
        setName("");
        setOtherList(list);
        setRepeat({ type: "Once" });;
        setSelectedDate(dayjs().format("YYYY-MM-DD"));
        setTimeSelected("Set Time");
        setTime("");
        setTaskDetails({
            Date: { value: "", cancel: false },
            Reminder: { value: "", cancel: false },
            Duration: { value: "", cancel: false },
        })
    };

    const closeModal = () => {
        setModalVisible(false);
        if (task) {
            // reset task to what it was if closed
            setName(task.name);
            setOtherList(task.list);
            setRepeat(task.repeat);
            setTime(task.time);
            setSelectedDate(task.date);
            setTimeSelected(task?.time || "Set Time");
            setTaskDetails({
                Date: { value: task?.date || "", cancel: !!task?.date },
                Reminder: { value: task?.reminder || "", cancel: !!task?.reminder },
                Duration: { value: task?.duration || "", cancel: !!task?.duration },
            });
        } else {
            // clear all for new task
            clearAll();
        }
    };

    const isTaskChanged = (prevTask, newData) => {
        return prevTask.name !== newData.name ||
            prevTask.date !== newData.date ||
            prevTask.time !== newData.time ||
            prevTask.reminder !== newData.reminder ||
            prevTask.repeat !== newData.repeat ||
            prevTask.duration !== newData.duration ||
            prevTask.list !== newData.list;
    };

    const addNotification = async (date, parentID, taskID) => {
        // only if there is a date and reminder time set
        if (taskDetails.Reminder.value && taskDetails.Date.value) {
            const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate(); // values: date and time
            scheduleNotification(reminderTime, `Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID, taskID);
        }
    };

    // store the last repeat
    const storeLastRepeat = async (lastRepeat) => {
        try {
            await AsyncStorage.setItem(`repeat_${lastRepeat.parentID}`, JSON.stringify(lastRepeat));
        } catch (error) {
            console.log("Could not store last repeat: ", error);
        }
    };

    // change a task
    const change = async () => {
        if (name.trim() === "") {
            Alert.alert(
                "⚠️ Ups!",
                "Enter Task Name",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }

        setLoading(true); // loading indicator

        try {
            // if its a parent task, get task.id, if its a repeated task, get its parent id
            let parentID = task.parentID || task.id;

            const newData = {
                name,
                date: taskDetails.Date.value,
                time,
                reminder: taskDetails.Reminder.value,
                repeat,
                duration: taskDetails.Duration.value,
                list: otherList
            };

            // if there is no change
            if (!isTaskChanged(task, newData)) {
                closeModal();
                setLoading(false);
                return;
            }

            if (newData.repeat.type === "Once" && task.repeat.type === "Once") {
                // if type is still once, change task
                await changeTask(task, newData);
                await removeNotification(task.id);
                await addNotification(newData.date, parentID, task.id);
            } else {
                // remove all repeated tasks and notif
                await deleteRepeatedTasks(task);
                await removeRepeatNotifications(parentID);
                // remove main task
                if (task.parentID === null) {
                    deleteTask(task);
                } else {
                    deleteTask(task, parentID);
                }
                // if now is once, and it wasnt
                if (newData.repeat.type === "Once" && task.repeat.type !== "Once") {
                    const newTask = await addTask(newData); // add new task
                    await addNotification(newData.date, newTask.id, newTask.id);
                } else { // add new repeated
                    await saveTask();
                }
            }
            setLoading(false);
            setModalVisible(false);
        } catch (error) {
            Alert.alert(
                "⚠️ Error",
                "Could not change the task. Please try again."
                [{ text: "Try Again", style: "default" }]
            );
            console.log("Error changing task: ", error);
            setLoading(false);
        }
    };

    // save new task
    const saveTask = async () => {
        if (name.trim() === "") {
            Alert.alert(
                "⚠️ Ups!",
                "Enter Task Name",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }
        setLoading(true);

        try {
            const newTask = await addTask(name, taskDetails.Date.value, time, taskDetails.Reminder.value,
                repeat, taskDetails.Duration.value, completed,
                otherList, completedDate); // create new

            const parentID = newTask.id;

            // add reminder for the main task (the add notification already handles if there is date and reminder set)
            await addNotification(taskDetails.Date.value, parentID, parentID);
            if (repeat.type !== "Once") {
                let dateValue = repeat.starts;
                let datesRepeat = getDatesRepeat(dateValue, repeat);

                const repeated = [];
                for (const dateRepeat of datesRepeat) {
                    // add repeated tasks, but if starts is == to task date, do not add (to not create same task twice)
                    if (dateRepeat !== taskDetails.Date.value) {
                        const newTask = await addTask(name, dateRepeat, time, taskDetails.Reminder.value,
                            repeat, taskDetails.Duration.value, completed,
                            otherList, completedDate, parentID);

                        repeated.push(newTask.data);
                        // add notification
                        await addNotification(dateRepeat, parentID, newTask.id);
                    }
                }
                // store last task, if there is, to add more repeated tasks when the task date arrived
                const lastTask = repeated[repeated.length - 1];
                if ((lastTask.repeat.ends !== "Never" && dayjs(lastTask.date).isBefore(lastTask.repeat.ends))
                    || lastTask.repeat.ends === "Never") {
                    await storeLastRepeat(lastTask);
                }
            }
            setLoading(false);
            setModalVisible(false);
            clearAll();
        } catch (error) {
            console.log("Error saving new task: ", error);
            setLoading(false);
        }
    };

    // calendar and time pickers
    const showDatePicker = () => {
        setModalDateTime(true);
        setPickerField("Time");
    };

    const closeDateTime = () => {
        setModalDateTime(false);
        setPickerField("");
        if (task) {
            updateTaskDetails("Date", task.date);
            setTime(task.time);
        } else {
            if (!taskDetails.Date.value) {
                resetTaskDetail("Date");
            } else {
                updateTaskDetails("Date", taskDetails.Date.value || "");
            }
            setTime(time);
        }
    };

    // set date and time
    const changeDateTime = () => {
        updateTaskDetails("Date", selectedDate);
        if (timeSelected !== "Set Time") {
            setTime(timeSelected);
        }

        setModalDateTime(false);
        setPickerField("");
    };

    const resetTime = () => {
        resetTaskDetail("Date");
        setSelectedDate(dayjs().format("YYYY-MM-DD"));
        setTimeSelected("Set Time");
        setTime("");
    };

    const showDuration = () => {
        setPickerField("Duration")
        setShowDurationPicker(true);
    };

    const openReminder = () => {
        setPickerField("Reminder");
        setShowDurationPicker(true);
    };

    const openRepeat = () => {
        setShowRepeatModal(true);
    };

    const setDuration = (newValue) => {
        updateTaskDetails("Duration", newValue)
    };

    const setRepetition = (newValue) => {
        setRepeat(newValue);
    };

    // lists for the list details
    const getLists = () => {
        const listsNoUpcoming = allLists.filter(list => list.id !== "Upcoming");
        return listsNoUpcoming;
    };

    const openList = () => {
        setShowLists(true);
    };

    const updateTaskDetails = (field, value) => {
        setTaskDetails((prev) => ({
            ...prev,
            [field]: { value, cancel: true } // when value is set, cancel will appear
        }));
    };

    // to reset the field when cancel is set to true
    const resetTaskDetail = (field) => {
        setTaskDetails((prev) => ({
            ...prev,
            [field]: { value: "", cancel: false }
        }));
    };

    const modalInputs = [
        {
            nameInput: "Date/Time", icon: "calendar", inputFunction: showDatePicker, setValue: taskDetails.Date.value ?
                `${dayjs(taskDetails.Date.value).format("DD MMMM")} ${time}` : "None"
        },
        {
            nameInput: "Reminder", icon: "bells", inputFunction: openReminder,
            setValue: taskDetails.Reminder.value ? `At ${taskDetails.Reminder.value}` : "None"
        }, // if time is set, choose minutes/hours before. If no time, set reminder as hh:mm
        { nameInput: "Repeat", icon: "retweet", inputFunction: openRepeat, setValue: repeat?.type || "Once" },
        {
            nameInput: "Duration", icon: "hourglass", inputFunction: showDuration,
            setValue: taskDetails.Duration.value ? `${taskDetails.Duration.value.split(":")[0]} h ${taskDetails.Duration.value.split(":")[1]} min`
                :
                "None"
        },
        { nameInput: "List", icon: "bars", inputFunction: openList, setValue: otherList }
    ];

    return (
        <Modal visible={modalVisible} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalInside, task && { height: "84%" }]}>
                        {!loading ? (
                            // close / done modal
                            <>
                                <View style={styles.topModal}>
                                    <TouchableOpacity onPress={() => closeModal()}>
                                        <AntDesign name="close" size={30} color={theme.tabText} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>
                                        {task ? "Edit Task" : "New Task"}
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        if (task) {
                                            change();
                                        } else {
                                            saveTask();
                                        }
                                    }}>
                                        <AntDesign name="checkcircle" size={30} color={theme.tabText} />
                                    </TouchableOpacity>
                                </View>

                                {/* task name */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Task Name"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={theme.name === "light" ? "#808080" : "#FFFFFF"}
                                />

                                {/* task details */}
                                <TaskDetails {...{
                                    modalInputs, taskDetails, showLists, listsItems,
                                    setShowLists, resetTaskDetail, otherList, setOtherList, resetTime
                                }} />

                                {/* delete button if editing */}
                                {task && (
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => {
                                            if (task.repeat.type === "Once") {
                                                // remove the task and notification
                                                deleteTask(task);
                                                if (task.reminder) {
                                                    removeNotification(task.id);
                                                }
                                            } else {
                                                setModalDelete(true);
                                            }
                                        }}>
                                        <AntDesign name="delete" size={24} color={"#FFFFFF"} />
                                    </TouchableOpacity>
                                )}

                                {/* show modal delete if there are repeated tasks */}
                                {modalDelete && (
                                    <Modal visible={modalDelete} transparent={true} animationType="fade">
                                        <View style={[styles.modalContainer, { justifyContent: "center" }]}>
                                            <View style={[styles.modalInside, { height: "20%", width: "55%", borderRadius: 30 }]}>
                                                {/* delete only task selected */}
                                                <TouchableOpacity style={[styles.btn, { marginTop: 0 }]} onPress={() => {
                                                    deleteTask(task);
                                                    removeNotification(task.id);
                                                    setModalDelete(false);
                                                }}>
                                                    <Text style={styles.textModal}>Delete Task</Text>
                                                </TouchableOpacity>
                                                {/* delete all tasks, including repeated */}
                                                <TouchableOpacity style={styles.btn} onPress={() => {
                                                    // remove all repeated tasks and notifications
                                                    const parentID = task.parentID ? task.parentID : task.id;
                                                    deleteRepeatedTasks(task);
                                                    removeRepeatNotifications(parentID);
                                                    if (task.parentID === null) {
                                                        deleteTask(task);
                                                    } else {
                                                        deleteTask(task, parentID);
                                                    }
                                                    setModalDelete(false);
                                                }}>
                                                    <Text style={styles.textModal}>Delete All Tasks</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.textModalBottom}>Included repeated tasks</Text>

                                            </View>
                                        </View>
                                    </Modal>
                                )}

                                {/* datetime picker */}
                                {modalDateTime && (
                                    <Modal visible={modalDateTime} transparent={true} animationType="fade">
                                        <View style={[styles.modalContainer, { justifyContent: "center" }]}>
                                            <View style={[styles.modalInside, { height: 540, borderRadius: 30 }]}>
                                                <View style={styles.topModal}>
                                                    <TouchableOpacity onPress={() => closeDateTime()}>
                                                        <AntDesign name="close" size={30} color={theme.tabText} />
                                                    </TouchableOpacity>
                                                    <Text style={styles.modalTitle}>
                                                        Date and Time
                                                    </Text>
                                                    <TouchableOpacity onPress={() => changeDateTime()}>
                                                        <AntDesign name="checkcircle" size={30} color={theme.tabText} />
                                                    </TouchableOpacity>
                                                </View>
                                                <Calendar
                                                    key={calendarKey}
                                                    firstDay={1}
                                                    markedDates={{
                                                        [selectedDate]: {
                                                            selected: true
                                                        }
                                                    }}
                                                    onDayPress={(day) => setSelectedDate(day.dateString)}
                                                    hideExtraDays={true}
                                                    style={{
                                                        width: 350,
                                                        height: 370,
                                                        borderBottomWidth: 1,
                                                        borderColor: "#C0C0C0"
                                                    }}
                                                    theme={{
                                                        calendarBackground: theme.name === "light" ? "#EBEAF6" : "#444444",
                                                        todayTextColor: "#847FC7",
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
                                                <View style={{ flexDirection: "row" }}>
                                                    <TouchableOpacity
                                                        onPress={() => setShowDurationPicker(true)}>
                                                        <Text style={[styles.modalTitle, { padding: 10, marginTop: 10 }]}>
                                                            {time ? time : timeSelected}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    {timeSelected !== "Set Time" && (
                                                        <TouchableOpacity onPress={() => resetTime()}
                                                            style={[styles.btn, { width: 30, height: 30, left: 110 }]}
                                                        >
                                                            <AntDesign name="close" size={20} color={theme.tabText} />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                )}

                                {/* duration picker */}
                                {showDurationPicker && (
                                    <TimerPickerModal
                                        visible={showDurationPicker}
                                        setIsVisible={setShowDurationPicker}
                                        initialValue={pickerField === "Time" ? initialTime : {
                                            hours: 0,
                                            minutes: 0
                                        }}
                                        onConfirm={(durationSelected) => {
                                            const hh = durationSelected.hours.toString().padStart(2, "0");
                                            const mm = durationSelected.minutes.toString().padStart(2, "0");
                                            if (pickerField === "Duration") {
                                                // make time 00:00 format
                                                setDuration(`${hh}:${mm}`);
                                                setShowDurationPicker(false);
                                                setPickerField("");
                                            } else if (pickerField === "Reminder") {
                                                updateTaskDetails("Reminder", `${hh}:${mm}`);
                                                setShowDurationPicker(false);
                                                setPickerField("");
                                            } else if (pickerField === "Time") {
                                                setTimeSelected(`${hh}:${mm}`);
                                                setShowDurationPicker(false);
                                            }
                                        }}
                                        modalTitle={pickerField === "Duration" ? "Set Duration" :
                                            pickerField === "Time" ? "Set Time" : "Set Reminder"}
                                        onCancel={() => setShowDurationPicker(false)}
                                        closeOnOverlayPress
                                        hideSeconds
                                        hourLimit={pickerField === "Duration" && { max: 2, min: 0 }}
                                        styles={{
                                            theme: theme.name === "light" ? "light" : "dark",
                                            pickerItem: {
                                                fontFamily: "monospace"
                                            },
                                            pickerLabel: {
                                                color: "#4B4697",
                                            },
                                            modalTitle: {
                                                fontFamily: "Zain-Regular",
                                                fontSize: 26
                                            },
                                            cancelButton: {
                                                color: theme.name === "light" ? "#4B4697" : "#FFFFFF",
                                                borderColor: theme.name === "light" ? "#4B4697" : "transparent"
                                            },
                                            confirmButton: {
                                                backgroundColor: "#4B4697",
                                                color: "#FFFFFF",
                                                borderWidth: 0
                                            }
                                        }}
                                        modalProps={{
                                            overlayOpacity: 0.2
                                        }}
                                    />
                                )}

                                {/* repeat modal */}
                                <RepeatSelection
                                    showRepeatModal={showRepeatModal}
                                    setShowRepeatModal={setShowRepeatModal}
                                    date={task?.date ? task.date : dayjs().format("YYYY-MM-DD")}
                                    setRepetition={setRepetition}
                                    repeat={repeat}
                                />
                            </>
                        ) : (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <ActivityIndicator size="large" color={theme.primary} />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
    );
};

const useStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "100%",
        height: "78%",
        padding: 20,
        backgroundColor: theme.modalNewTask,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: theme.tabText
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    input: {
        fontFamily: "Zain-Regular",
        textAlign: "center",
        fontSize: 20,
        width: "100%",
        height: 60,
        backgroundColor: theme.itemModal,
        color: theme.text,
        borderRadius: 10,
        padding: 15,
        marginTop: 20
    },
    deleteBtn: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.delete,
        width: 50,
        height: 50,
        borderRadius: 30
    },
    btn: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary,
        width: 200,
        height: 50,
        borderRadius: 30
    },
    textModal: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        color: theme.text
    },
    textModalBottom: {
        fontFamily: "Zain-Regular",
        fontSize: 16,
        color: theme.textTime
    }
});

export default ModalNewTask;