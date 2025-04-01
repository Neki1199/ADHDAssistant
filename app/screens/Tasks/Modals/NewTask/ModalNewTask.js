import React, { useState, useContext, useEffect } from "react";
import { View, ActivityIndicator, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { changeTask, deleteTask, addTask, deleteRepeatedTasks, addRepeatedTasks } from "../../../../contexts/TasksDB";
import { ListsContext } from "../../../../contexts/ListsContext";
import { AntDesign } from "@expo/vector-icons";
import dayjs from "dayjs";
import TaskDetails from "./TaskDetails";
import RepeatSelection from "./RepeatSelection";
import { ThemeContext } from "../../../../contexts/ThemeContext";
import { removeNotification, removeRepeatNotifications, scheduleNotification } from "./Notifications";
import { DurationPicker } from "./DurationPicker";
import { RepeatModalDelete } from "./RepeatModalDelete";
import { DateTimePicker } from "./DateTimePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatesRepeat, storeLastRepeat } from "../../../../contexts/TasksDB";

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
    // open modal to select if change one o all tasks
    const [changeModalVisible, setChangeModalVisible] = useState(false);

    // when editing, it sets the current data, if new, all clear
    const [name, setName] = useState(task ? task.name : ""); // task name
    const [time, setTime] = useState(task ? task.time : "");
    const [repeat, setRepeat] = useState(task ? task.repeat : { type: "Once" });
    const [otherList, setOtherList] = useState(task ? task.list : list);

    // also fields, but have the cancel icon to reset
    const [taskDetails, setTaskDetails] = useState({ // !! makes null false, if data true
        Date: { value: task?.date || "", cancel: !!task?.date },
        Reminder: { value: task?.reminder || "", cancel: !!task?.reminder },
        Duration: { value: task?.duration || "", cancel: !!task?.duration },
    });

    // update calendar theme when theme changes
    useEffect(() => {
        setCalendarKey((prev) => prev + 1);
    }, [theme]);

    // set lists
    useEffect(() => {
        setListsItems(getLists());
    }, [allLists]);

    const addNotification = async (date, parentID, taskID, taskDetails) => {
        // only if there is a date and reminder time set
        if (taskDetails.Reminder.value && taskDetails.Date.value) {
            const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate(); // values: date and time
            console.log(reminderTime);
            const trigger = new Date(Date.now() + 60 * 60 * 1000);
            trigger.setMinutes(0);
            trigger.setSeconds(0);
            console.log(trigger)
            scheduleNotification(reminderTime, `Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`, parentID, taskID);
        }
    };

    // lists for the list details
    const getLists = () => {
        const listsNoUpcoming = allLists;
        return listsNoUpcoming;
    };

    const clearAll = () => {
        setName("");
        setOtherList(list);
        setRepeat({ type: "Once" });
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

    const setRepetition = (newValue) => {
        setRepeat(newValue);
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

    const taskUpdate = async () => {
        const newData = {
            name,
            date: taskDetails.Date.value,
            time,
            reminder: taskDetails.Reminder.value,
            repeat,
            duration: taskDetails.Duration.value,
            list: otherList
        };
        await changeTask(task, newData);
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
                repeat, taskDetails.Duration.value, false,
                otherList, ""); // create new

            const parentID = newTask.id;
            // add reminder for the main task (the add notification already handles if there is date and reminder set)
            await addNotification(taskDetails.Date.value, parentID, parentID, taskDetails);

            if (repeat.type !== "Once") {
                const datesRepeat = getDatesRepeat(repeat.starts, repeat);

                const repeated = await addRepeatedTasks(datesRepeat, newTask.data);

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

    // change a task
    const change = async () => {
        const isTaskChanged = (prevTask, newData) => {
            return prevTask.name !== newData.name ||
                prevTask.date !== newData.date ||
                prevTask.time !== newData.time ||
                prevTask.reminder !== newData.reminder ||
                prevTask.repeat !== newData.repeat ||
                prevTask.duration !== newData.duration ||
                prevTask.list !== newData.list;
        };

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
                // if type is still once, change task (in parallel)
                await Promise.all([
                    changeTask(task, newData),
                    removeNotification(task.id),
                    addNotification(newData.date, parentID, task.id, taskDetails)
                ]);
            } else {
                // remove all repeated tasks and notif
                await Promise.all([
                    deleteRepeatedTasks(task),
                    await AsyncStorage.removeItem(`repeat_${parentID}`), // remove the last repeat stored
                    removeRepeatNotifications(parentID),
                    // remove main task
                    deleteTask(task, parentID)
                ]);
                // if now is once, and it wasnt
                if (newData.repeat.type === "Once") {
                    const newTask = await addTask(newData); // add new task
                    await addNotification(newData.date, newTask.id, newTask.id, taskDetails);
                } else { // add new repeated
                    await saveTask();
                }
            }
            setLoading(false);
            setModalVisible(false);
        } catch (error) {
            Alert.alert(
                "⚠️ Error",
                "Could not change the task.",
                [{ text: "Try Again", style: "default" }]
            );
            console.log("Error changing task: ", error);
            setLoading(false);
        }
    };

    return (
        <Modal visible={modalVisible} transparent={true} animationType="none">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalInside, task && { height: "78%" }]}>
                        {!loading ? (
                            // close / done buttons
                            <>
                                <View style={styles.topModal}>
                                    <TouchableOpacity onPress={() => closeModal()}>
                                        <AntDesign name="close" size={30} color={theme.tabText} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>
                                        {task ? "Edit Task" : "New Task"}
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        if (task && task.repeat.type !== "Once") {
                                            setChangeModalVisible(true);
                                        } else if (task && task.repeat.type === "Once") {
                                            change();
                                        } else {
                                            saveTask();
                                        }
                                    }}>
                                        <AntDesign name="checkcircle" size={30} color={theme.tabText} />
                                    </TouchableOpacity>
                                </View>

                                {/* if the task has repeating tasks, let user choose to change that task or all */}
                                {changeModalVisible && (
                                    <Modal visible={changeModalVisible} transparent={true} animationType="none">
                                        <TouchableWithoutFeedback onPress={() => setChangeModalVisible(false)} accessible={false}>
                                            <View style={[styles.modalContainer, { justifyContent: "center" }]}>
                                                <View style={[styles.modalInside, { height: 250, width: 300, borderRadius: 30 }]}>
                                                    <Text style={styles.modalTitle}>This is a recurring task. What do you want to change?</Text>
                                                    <TouchableOpacity style={styles.btn} onPress={() => {
                                                        taskUpdate();
                                                        setChangeModalVisible(false);
                                                    }}>
                                                        <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>This Task</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.title }]} onPress={() => {
                                                        change();
                                                        setChangeModalVisible(false);
                                                    }}>
                                                        <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>All Tasks</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </Modal >
                                )}

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
                                    taskDetails, showLists, listsItems, setShowLists, resetTaskDetail, otherList,
                                    setOtherList, resetTime, repeat, setShowRepeatModal, setPickerField, setShowDurationPicker,
                                    setModalDateTime, time
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
                                    <RepeatModalDelete modalDelete={modalDelete} setModalDelete={setModalDelete} task={task} />
                                )}

                                {/* datetime picker */}
                                {modalDateTime && (
                                    <DateTimePicker {...{
                                        modalDateTime, closeDateTime, changeDateTime, calendarKey, selectedDate,
                                        setSelectedDate, setShowDurationPicker, time, timeSelected
                                    }} />
                                )}

                                {/* duration picker */}
                                {showDurationPicker && (
                                    <DurationPicker {...{
                                        pickerField, setPickerField, setTimeSelected, initialTime, showDurationPicker, setShowDurationPicker,
                                        updateTaskDetails
                                    }} />
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
        height: "75%",
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
        color: theme.tabText,
        textAlign: "center"
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
        marginBottom: 20,
        backgroundColor: theme.header,
        width: 200,
        padding: 5,
        borderRadius: 10
    }
});

export default ModalNewTask;