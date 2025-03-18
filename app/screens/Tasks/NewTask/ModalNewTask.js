import React, { useState, useContext, useEffect } from "react";
import { Alert, View, ActivityIndicator, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { addTask, deleteTask, changeTask, deleteRepeatedTasks } from "../TasksDB"
import { ListsContext } from "../../../contexts/ListsContext";
import { AntDesign } from "@expo/vector-icons";
import { TimerPickerModal } from "react-native-timer-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import TaskDetails from "./TaskDetails";
import RepeatSelection from "./RepeatSelection";
import { ThemeContext } from "../../../contexts/ThemeContext";

// when added task, schedule notification
const scheduleNotification = (date, message, taskID) => {
    Notifications.scheduleNotificationAsync({
        content: {
            title: "🔔 Task Reminder",
            body: message,
            sound: true,
            data: { taskID }
        },
        trigger: { type: "date", timeStamp: date.getTime() }
    });
};

// remove one notification
const removeNotification = async (taskID) => {
    await Notifications.cancelScheduledNotificationAsync(taskID);
};

// remove all notifications from a task
const removeRepeatNotifications = async (taskID) => {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
        if (notification.data?.taskID === taskID) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }
}

// task = null, when long press the task to change or delete
// if null, is a new task, if not null, is being edited
const ModalNewTask = ({ modalVisible, setModalVisible, list, task = null }) => {
    const { allLists } = useContext(ListsContext);
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [loading, setLoading] = useState(false);
    // calendar, time ui
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState("date");
    const [pickerField, setPickerField] = useState("");

    // time picker for duration
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    // open repeat modal
    const [showRepeatModal, setShowRepeatModal] = useState(false);

    // open list selection
    const [showLists, setShowLists] = useState(false);
    const [listsItems, setListsItems] = useState([]);

    // when editing, it sets the current data, if new, all clear
    const [name, setName] = useState(task ? task.name : ""); // task name
    const [date, setDate] = useState(task ? task.date : dayjs().format("YYYY-MM-DD")); // date string "YYYY-MM-DD"
    const [repeat, setRepeat] = useState(task ? task.repeat : { type: "Once" });
    const [otherList, setOtherList] = useState(task ? task.list : list);
    const completed = (task ? task.completed : false);
    const completedDate = (task ? task.completedDate : "");

    // also fields, but have the cancel icon to reset
    const [taskDetails, setTaskDetails] = useState({ // !! makes null false, if data true
        Time: { value: task?.time || "", cancel: !!task?.time },
        Reminder: { value: task?.reminder || "", cancel: !!task?.reminder },
        Duration: { value: task?.duration || "", cancel: !!task?.duration },
    });

    useEffect(() => {
        setListsItems(getLists());
    }, [allLists]);

    const clearAll = () => {
        setName("");
        setDate(dayjs().format("YYYY-MM-DD"));
        setOtherList(list);
        setRepeat({})
        setTaskDetails({
            Time: { value: "", cancel: false },
            Reminder: { value: "", cancel: false },
            Duration: { value: "", cancel: false },
        })
    }

    const closeModal = () => {
        setModalVisible(false);
        if (task) {
            // reset task to what it was if closed
            setName(task.name);
            setDate(task.date);
            setOtherList(task.list);
            setRepeat(task.repeat);
            setTaskDetails({
                Time: { value: task?.time || "", cancel: !!task?.time },
                Reminder: { value: task?.reminder || "", cancel: !!task?.reminder },
                Duration: { value: task?.duration || "", cancel: !!task?.duration },
            });
        } else {
            // clear all for new task
            clearAll();
        }
    };

    const closeSave = (newData = null) => {
        setModalVisible(false);
        if (task) {
            setName(name);
            setDate(date);
            setOtherList(otherList);
            setRepeat(repeat);
            setTaskDetails({
                Time: { value: newData.time || "", cancel: !!newData.time },
                Reminder: { value: newData.reminder || "", cancel: !!newData.reminder },
                Duration: { value: newData.duration || "", cancel: !!newData.duration }
            });
        } else {
            clearAll();
        }
    }

    const saveTask = async () => {
        if (name.trim() === "") {
            Alert.alert(
                "⚠️ Ups!",
                "Enter Task Name",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }

        setLoading(true); // loading indicator after done add task

        try {
            // if its a parent task, get task.id, if its a repeated task, get its parent id
            let parentID = task ? task.parentID ? task.parentID : task.id : null;

            if (task) {
                const newData = {
                    name,
                    date,
                    time: taskDetails.Time.value,
                    reminder: taskDetails.Reminder.value,
                    repeat,
                    duration: taskDetails.Duration.value,
                    list: otherList,
                    completedDate
                };

                // if reminder changed, delete old notification and add new one
                if (taskDetails.Reminder.value && task.reminder !== taskDetails.Reminder.value) {
                    await removeNotification(parentID);
                    const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate();
                    scheduleNotification(reminderTime, `🔔 Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID);
                };

                // handle changes in repeat (delete previous, and add new ones)
                const prevRepeat = task.repeat; // get previous repeat
                if (prevRepeat.type !== repeat.type || prevRepeat.every !== repeat.every
                    || prevRepeat.days !== repeat.days || prevRepeat.dayMonth !== repeat.dayMonth
                    || prevRepeat.ends !== repeat.ends) {
                    await deleteRepeatedTasks(otherList, parentID); // delete all repeated tasks
                    // remove all repeated notifications
                    await removeRepeatNotifications(parentID);

                    if (repeat.type !== "Once") {
                        // get dates from new repeat
                        let datesRepeat = getDatesRepeat(date);
                        // add new tasks
                        for (const dateRepeat of datesRepeat) {
                            await addTask(name, dateRepeat, taskDetails.Time.value, taskDetails.Reminder.value,
                                repeat, taskDetails.Duration.value, completed,
                                otherList, completedDate, parentID);

                            if (taskDetails.Reminder.value) {
                                const reminderTime = dayjs(`${dateRepeat} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate(); // values: date and time
                                scheduleNotification(reminderTime, `🔔 Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID);
                            }
                        }
                    }
                }

                await changeTask(task, newData); // update task if already exist
                closeSave(newData);
            } else { // its a new task
                const newTask = await addTask(name, date, taskDetails.Time.value, taskDetails.Reminder.value,
                    repeat, taskDetails.Duration.value, completed,
                    otherList, completedDate); // create new

                parentID = newTask.id;

                // add reminder for the main task
                if (taskDetails.Reminder.value && (!task || task.reminder !== taskDetails.Reminder.value)) {
                    const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate();
                    scheduleNotification(reminderTime, `🔔 Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID);
                };

                // if repeat is set
                if (repeat.type !== "Once") {
                    let datesRepeat = getDatesRepeat(date);
                    for (const dateRepeat of datesRepeat) {
                        const newTask = await addTask(name, dateRepeat, taskDetails.Time.value, taskDetails.Reminder.value,
                            repeat, taskDetails.Duration.value, completed,
                            otherList, completedDate, parentID);

                        // add notification
                        if (taskDetails.Reminder.value) {
                            const reminderTime = dayjs(`${dateRepeat} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate(); // values: date and time
                            scheduleNotification(reminderTime, `🔔 Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID);
                        }
                    }
                }
                closeSave();
            }
        } catch (error) {
            console.log("Error saving task: ", error)
        } finally {
            setLoading(false);
        }
    };

    // get dates from repeat field, date is the selected date on the new task
    const getDatesRepeat = (date) => {
        const datesRepeat = [];
        const startDate = dayjs(date);
        let currentDate = dayjs(date);
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

        // add intervals
        while (true) {
            if (repeat.type === "Daily") {
                currentDate = currentDate.add(repeat.every, "day");
                datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            } else if (repeat.type === "Weekly") {
                days.forEach(day => {
                    const dayIndex = dayMap[day]; // get day index
                    // add one more day (so its exact)
                    const oneDayMore = currentDate.day(dayIndex).add(1, "day");
                    const dateDay = oneDayMore.format("YYYY-MM-DD");
                    // only add if its after the start
                    if (dayjs(dateDay).isAfter(startDate)) {
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
                currentDate = currentDate.add(repeat.every, "year");
                // break beforehand if year is after
                if (repeat.ends !== "Never" && currentDate.isAfter(dayjs(repeat.ends))) {
                    break;
                }
                datesRepeat.push(currentDate.format("YYYY-MM-DD"));
            }


            if (repeat.ends === "Never") {
                if (datesRepeat.length >= maxTasks) break;
            } else if (repeat.ends !== "Never" && currentDate > dayjs(repeat.ends)) {
                break;
            }
        }
        return datesRepeat;
    };

    // calendar and time pickers
    const showDatePicker = () => {
        setMode("date");
        setShowPicker(true);
    }

    const showTimePicker = () => {
        setMode("time");
        setShowPicker(true);
    }

    const showDuration = () => {
        setShowDurationPicker(true);
    }

    const onPickerChange = (event, selectedValue) => {
        if (event.type === "set" && selectedValue) {
            if (pickerField === "Reminder") {
                updateTaskDetails("Reminder", dayjs(selectedValue).format("HH:mm")) // set reminder "HH:mm"
            } else if (mode === "date") {
                setDate(dayjs(selectedValue).format("YYYY-MM-DD")); // set date "YYYY-MM-DD"
            } else {
                updateTaskDetails("Time", dayjs(selectedValue).format("HH:mm")) // set time "HH:mm"
            }
        }
        setShowPicker(false);
        setPickerField("");
    };

    const openReminder = () => {
        setMode("time");
        setPickerField("Reminder");
        setShowPicker(true);
    }

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
    }

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
        { nameInput: "Date", icon: "calendar", inputFunction: showDatePicker, setValue: date ? dayjs(date).format("dddd DD MMMM") : "None" },
        { nameInput: "Time", icon: "clockcircleo", inputFunction: showTimePicker, setValue: taskDetails.Time.value ? `Start at ${taskDetails.Time.value}` : "None" },
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
                            <>
                                <View style={styles.topModal}>
                                    <TouchableOpacity onPress={() => closeModal()}>
                                        <AntDesign name="close" size={30} color={theme.tabText} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>
                                        {task ? "Edit Task" : "New Task"}
                                    </Text>
                                    <TouchableOpacity onPress={() => saveTask()}>
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
                                <TaskDetails {...{ modalInputs, taskDetails, showLists, listsItems, setShowLists, resetTaskDetail, otherList, setOtherList }} />

                                {/* delete button if editing */}
                                {task && (
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => {
                                            deleteTask(task);
                                            if (task.repeat.type !== "Once") {
                                                deleteRepeatedTasks(list, task.id)
                                            }
                                        }}>
                                        <AntDesign name="delete" size={24} color={"#FFFFFF"} />
                                    </TouchableOpacity>
                                )}

                                {/* datetime pciker */}
                                {showPicker && (
                                    <DateTimePicker
                                        value={dayjs(date).toDate()}
                                        mode={mode}
                                        display="default"
                                        onChange={onPickerChange}
                                        design="default"
                                    />
                                )}

                                {/* duration picker */}
                                {showDurationPicker && (
                                    <TimerPickerModal
                                        visible={showDurationPicker}
                                        setIsVisible={setShowDurationPicker}
                                        onConfirm={(durationSelected) => {
                                            // make time 00:00 format
                                            const hh = durationSelected.hours.toString().padStart(2, "0");
                                            const mm = durationSelected.minutes.toString().padStart(2, "0");

                                            setDuration(`${hh}:${mm}`);
                                            setShowDurationPicker(false);
                                        }}
                                        modalTitle="Set Duration"
                                        onCancel={() => setShowDurationPicker(false)}
                                        closeOnOverlayPress
                                        hideSeconds
                                        hourLimit={{ max: 2, min: 0 }}
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
                                                borderColor: "#4B4697"
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
                                <RepeatSelection {...{ showRepeatModal, setShowRepeatModal, date, setRepetition, repeat }} />
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
});

export default ModalNewTask;