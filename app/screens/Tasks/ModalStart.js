import React, { useState } from "react";
import { Modal, TouchableOpacity, StyleSheet, Text, FlatList, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export const ModalStart = ({ tasks, modalStart, setModalStart, navigation }) => {
    const [selectTasksModal, setSelectTasksModal] = useState(false);
    const [tasksToStart, setTasksToStart] = useState([]);

    const getRandomTask = (taskList) => {
        const randomIndex = Math.floor(Math.random() * taskList.length);
        return taskList[randomIndex];
    };

    const startAllWithTimer = () => {
        const tasksWithDuration = tasks.filter((task) => task.duration !== "");
        setModalStart(false);

        const task = getRandomTask(tasksWithDuration);
        // go directly to the timer screen with a random task
        navigation.navigate("TaskTimer", { task: task });
    };

    const startAllTasks = () => {
        // open screen TasksStart, pass all tasks
        setModalStart(false);

        const task = getRandomTask(tasks);
        // if the random task has duration, go directly to task timer
        // else go to task start to let the user again choose to set timer or not
        if (task?.duration === "") {
            navigation.navigate("TasksStart", { tasks });
        } else {
            navigation.navigate("TaskTimer", { task: task });
        }
    };

    const startSomeTasks = () => {
        const task = getRandomTask(tasksToStart);

        if (task.duration === "") {
            navigation.navigate("TasksStart", { tasks: tasksToStart });
            setTasksToStart([]);
        } else {
            navigation.navigate("TaskTimer", { task: task });
            setTasksToStart([]);
        }
    };

    // add or remove tasks to data
    const addTaskStart = (task) => {
        setTasksToStart((prev) =>
            prev.includes(task) ?
                prev.filter(prevTask => prevTask !== task)
                : [...prev, task]
        );
    };

    return (
        // modal after click TasksStart icon
        <Modal visible={modalStart} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalInside}>
                    <View style={styles.topModal}>
                        <TouchableOpacity onPress={() => setModalStart(false)}>
                            <AntDesign name="close" size={30} color={"#4B4697"} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            Start A Task Randomly
                        </Text>
                    </View>
                    <Text style={styles.bottomTitleText}>Once selected an option, do that task!</Text>
                    <Text style={styles.bottomTitleText}>If you don't want to do the random task selected...</Text>
                    <Text style={[styles.bottomTitleText, { marginBottom: 30 }]}>Do you <Text style={{ color: "#000000" }}>really</Text> want to come here again?</Text>

                    <TouchableOpacity
                        style={[styles.button,
                        { opacity: tasks.filter(task => task.duration).length > 1 ? 1 : 0.5 }]}
                        disabled={tasks.filter(task => task.duration).length <= 1}
                        onPress={startAllWithTimer}>
                        <Text style={styles.taskText}>Tasks With Timer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={startAllTasks}>
                        <Text style={styles.taskText}>All Tasks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={() => setSelectTasksModal(true)}>
                        <Text style={styles.taskText}>Select Which Tasks</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/*  modal for selecting tasks */}
            <Modal visible={selectTasksModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        <View style={styles.topModal}>
                            <TouchableOpacity onPress={() => {
                                setTasksToStart([]);
                                setSelectTasksModal(false);
                            }}>
                                <AntDesign name="close" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select Tasks</Text>
                            <TouchableOpacity
                                style={{ opacity: tasksToStart.length <= 1 ? 0.5 : 1 }}
                                disabled={tasksToStart.length <= 1}
                                onPress={() => {
                                    setSelectTasksModal(false);
                                    setModalStart(false);
                                    startSomeTasks();
                                }}>
                                <AntDesign name="checkcircle" size={30} color={"#4B4697"} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            style={{ width: "100%" }}
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.taskStyle, {
                                        backgroundColor: tasksToStart.includes(item) ?
                                            "#4B4697" : "#A0A0A0"
                                    }]}
                                    onPress={() => addTaskStart(item)}>
                                    <Text style={styles.taskText}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </Modal >
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        width: "100%",
        height: "70%",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        marginBottom: 5,
        color: "#4B4697",
        flex: 1,
        textAlign: "center"
    },
    bottomTitleText: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: "#A0A0A0",
        width: "100%",
        textAlign: "center"
    },
    topModal: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        padding: 10
    },
    button: {
        backgroundColor: "#4B4697",
        padding: 14,
        width: "80%",
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 20
    },
    taskText: {
        fontFamily: "Zain-Regular",
        fontSize: 22,
        color: "#FFFFFF",
        padding: 10
    },
    selectedTask: {
        backgroundColor: "#99CCFF"
    },
    taskStyle: {
        margin: 10,
        borderRadius: 15,
        padding: 10,
        alignItems: "center"
    }
});