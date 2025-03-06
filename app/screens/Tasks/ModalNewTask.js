import React, { useState } from "react";
import { Alert, View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Platform } from "react-native";
import { addTask } from "./TasksDB"
import { AntDesign } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Notifications from "expo-notifications";

// when added task, schedule notification
const scheduleNotification = async (time, message) => {
    console.log("scheduling at: ", time);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "⏰ Task Reminder",
            body: message,
            sound: true,
        },
        trigger: { date: time }
    });
};


const ModalNewTask = ({ modalVisible, setModalVisible, list }) => {
    // calendar, time ui
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState("date");
    const [pickerField, setPickerField] = useState("");

    const [name, setName] = useState(""); // task name
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD")); // date string "YYYY-MM-DD"
    const [otherList, setOtherList] = useState(list);
    const completed = false;
    const isPast = false;
    // also fields, but have the cancel icon to reset
    const [taskDetails, setTaskDetails] = useState({
        Time: { value: "", cancel: false },
        Reminder: { value: "", cancel: false },
        Repeat: { value: "", cancel: false },
        Duration: { value: "", cancel: false },
    });

    const clearAll = () => {
        setName("");
        setDate(dayjs().format("YYYY-MM-DD"));
        setTaskDetails({
            Time: { value: "", cancel: false },
            Reminder: { value: "", cancel: false },
            Repeat: { value: "", cancel: false },
            Duration: { value: "", cancel: false },
        })
    }

    const closeModal = () => {
        setModalVisible(false);
        clearAll();
    }

    const addNewTask = async () => {
        try {
            if (name.trim() !== "") {
                await addTask(name, date, taskDetails.Time.value, taskDetails.Reminder.value,
                    taskDetails.Repeat.value, taskDetails.Duration.value, completed, otherList, isPast);

                if (taskDetails.Reminder.value) {
                    //const reminderTime = dayjs(`${date} ${taskDetails.Reminder.value}`, "YYYY-MM-DD HH:mm").toDate();
                    const reminderTime = new Date(new Date().getTime() + 10000);
                    scheduleNotification(reminderTime, `Hey! Remember your task "${name}". Starts at ${taskDetails.Reminder.value}`);
                }
                setModalVisible(false);
                clearAll();
            } else {
                Alert.alert(
                    "⚠️ Ups!",
                    "Enter Task Name",
                    [{ text: "Try Again", style: "default" }]
                );
            }
        } catch (error) {
            console.log("Error adding task: ", error)
        }
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
        //updateTaskDetails("Repeat", newValue)
    }

    const openDuration = () => {
        //updateTaskDetails("Duration", newValue)
    }

    const openList = () => {
        // setOtherList
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
        { nameInput: "Repeat", icon: "retweet", inputFunction: openRepeat, setValue: taskDetails.Repeat.value || "None" },
        { nameInput: "Duration", icon: "hourglass", inputFunction: openDuration, setValue: taskDetails.Duration.value || "None" },
        { nameInput: "List", icon: "bars", inputFunction: openList, setValue: otherList }
    ];

    return (
        <Modal visible={modalVisible} transparent={true} animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        <View style={styles.topModal}>
                            <TouchableOpacity onPress={() => closeModal()}>
                                <AntDesign name="close" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>New Task</Text>
                            <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={() => addNewTask()}>
                                <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                        </View>
                        {/* INPUTS: name, dateTime (show calendar or something smaller (?) HH:MM UI), reminder (show HH:MM UI ?), 
                    repeat (show days as checkboxs ?), duration(show HH:MM UI), 
                    list (set default the one is already on, but let the user choose another one if wants) */}
                        <TextInput
                            style={styles.input}
                            placeholder="Task Name"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* task details */}
                        <View style={styles.inputsContainer}>
                            {modalInputs.map((modalInput, index) => {
                                const { nameInput, icon, inputFunction, setValue } = modalInput;
                                const cancelSet = taskDetails[nameInput]?.cancel;

                                return (
                                    <View key={index} style={[styles.itemInput, nameInput === "List" && { borderBottomWidth: 0 }]}>
                                        <View style={styles.iconAndName}>
                                            <AntDesign name={icon} size={22} color={"#000000"} />
                                            <Text style={styles.inputText}>{nameInput}</Text>
                                        </View>
                                        {cancelSet ? (
                                            <TouchableOpacity style={styles.iconAndName} onPress={() => resetTaskDetail(nameInput)}>
                                                <Text style={[styles.inputText, { color: "#4B4697" }]}>{setValue}</Text>
                                                <AntDesign name="close" size={22} color={"#000000"} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={styles.iconAndName} onPress={inputFunction}>
                                                <Text style={[styles.inputText, { color: "#4B4697" }]}>{setValue}</Text>
                                                <AntDesign name="right" size={22} color={"#000000"} />
                                            </TouchableOpacity>
                                        )
                                        }
                                    </View>
                                )
                            })}
                        </View>

                        {/* datetime pciker */}
                        {showPicker && (
                            <DateTimePicker
                                value={dayjs(date).toDate()}
                                mode={mode}
                                display="default"
                                onChange={onPickerChange}
                            />
                        )}
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
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#F0F0F0",
        borderRadius: 20,
        padding: 15,
        marginTop: 20
    },
    inputsContainer: {
        marginTop: 40,
        paddingVertical: 10,
        width: "100%",
        backgroundColor: "#EBEAF6",
        borderRadius: 15
    },
    itemInput: {
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#C0C0C0"
    },
    iconAndName: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    inputText: {
        fontFamily: "Zain-Regular",
        fontSize: 22,
        color: '#000000'
    }
});

export default ModalNewTask;