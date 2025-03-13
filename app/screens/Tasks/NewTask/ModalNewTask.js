import React, { useState, useContext, useEffect } from "react";
import { Alert, View, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { addTask, deleteTask, changeTask, deleteRepeatedTasks } from "../TasksDB"
import { ListsContext } from "../../../contexts/ListsContext";
import { AntDesign } from "@expo/vector-icons";
import { TimerPickerModal } from "react-native-timer-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import TaskDetails from "./TaskDetails";
import RepeatSelection from "./RepeatSelection";

// when added task, schedule notification
const scheduleNotification = async (time, message) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Task Reminder",
            body: message,
            sound: true,
        },
        trigger: { date: time }
    });
};

// task = null, when long press the task to change or delete
// if null, is a new task, if not null, is being edited
const ModalNewTask = ({ modalVisible, setModalVisible, list, task = null }) => {
    const { allLists } = useContext(ListsContext);

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
    const isPast = (task ? task.isPast : false);
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
            clearAll();
        }
    }

    const saveTask = async () => {
        // add repeated tasks if there are
        // add reminders from repeated if there are
        if (name.trim() === "") {
            Alert.alert(
                "⚠️ Ups!",
                "Enter Task Name",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        }

        try {
            let parentID = task ? task.id : null; // parent id to track repeated tasks

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

                // handle changes in repeat (delete previous, and add new ones)
                const prevRepeat = task.repeat; // get previous repeat
                if (prevRepeat.type !== repeat.type || prevRepeat.every !== repeat.every
                    || prevRepeat.days !== repeat.days || prevRepeat.dayMonth !== repeat.dayMonth
                    || prevRepeat.ends !== repeat.ends) {
                    await deleteRepeatedTasks(otherList, parentID); // delete all repeated tasks

                    // get dates from new repeat
                    let datesRepeat = getDatesRepeat(date);
                    // add new tasks
                    datesRepeat.forEach(async (dateRepeat) => {
                        await addTask(name, dateRepeat, taskDetails.Time.value, taskDetails.Reminder.value,
                            repeat, taskDetails.Duration.value, completed,
                            otherList, isPast, completedDate, parentID);
                    });
                }

                await changeTask(task, newData); // update task if already exist

            } else { // its a new task
                const newTask = await addTask(name, date, taskDetails.Time.value, taskDetails.Reminder.value,
                    repeat, taskDetails.Duration.value, completed,
                    otherList, isPast, completedDate); // create new

                parentID = newTask.id;

                // if repeat is set
                if (repeat.type !== "Once") {
                    let datesRepeat = getDatesRepeat(date);

                    datesRepeat.forEach(async (dateRepeat) => {
                        await addTask(name, dateRepeat, taskDetails.Time.value, taskDetails.Reminder.value,
                            repeat, taskDetails.Duration.value, completed,
                            otherList, isPast, completedDate, parentID);
                    });
                }
            }

            // TODO: add reminders for each task, repeated as well
            // if reminder changed, update the notification
            if (taskDetails.Reminder.value && (!task || task.reminder !== taskDetails.Reminder.value)) {
                const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate(); // values: date and time
                scheduleNotification(reminderTime, `Hey! Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`);
            };

            closeModal();
        } catch (error) {
            console.log("Error saving task: ", error)
        }
    };

    // get dates from repeat field, date is the selected date on the new task
    const getDatesRepeat = (date) => {
        const datesRepeat = [];
        const startDate = dayjs(date);
        let currentDate = startDate;

        if (repeat.type === "Daily") {
            // add the interval to the current day
            const maxTasks = 30; // limit of tasks for never
            let taskCount = 0;

            while (taskCount < maxTasks || repeat.ends === "Never") {
                // add interval to date
                currentDate = currentDate.add(repeat.every, "day");
                // if there is end date, check end date, and add date
                if (repeat.ends === "Never" || currentDate <= dayjs(repeat.ends)) {
                    datesRepeat.push(currentDate.format("YYYY-MM-DD"));
                    taskCount++;
                } else {
                    break;
                }
            }
        }
        // } else if(repeat.type === "Weekly"){

        // } else if(repeat.type === "Monthly"){

        // }else if(repeat.type === "Yearly"){

        // }
        console.log(datesRepeat)
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
        setRepeat((prev) => ({
            ...prev,
            ...newValue
        }));
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
                        <View style={styles.topModal}>
                            <TouchableOpacity onPress={() => closeModal()}>
                                <AntDesign name="close" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {task ? "Edit Task" : "New Task"}
                            </Text>
                            <TouchableOpacity onPress={() => saveTask()}>
                                <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                        </View>

                        {/* task name */}
                        <TextInput
                            style={styles.input}
                            placeholder="Task Name"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* other task details */}
                        <TaskDetails {...{ modalInputs, taskDetails, showLists, listsItems, setShowLists, resetTaskDetail, otherList, setOtherList }} />

                        {/* delete button if editing */}
                        {task && (
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => deleteTask(task)}>
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
                                LinearGradient={LinearGradient}
                                hourLimit={{ max: 2, min: 0 }}
                                styles={{
                                    theme: "light",
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
                                        color: "#4B4697",
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
                    </View>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: "#EBEAF6",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 10,
        color: "#4B4697"
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
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 15,
        marginTop: 20
    },
    deleteBtn: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#AC2121",
        width: 50,
        height: 50,
        borderRadius: 30
    },
});

export default ModalNewTask;