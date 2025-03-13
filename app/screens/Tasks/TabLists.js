import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { getTasks, deleteAllCompleted } from './TasksDB';
import { LinearGradient } from 'expo-linear-gradient';
import ModalNewTask from "./NewTask/ModalNewTask";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';
import TaskItem from './TaskItem';
import { ModalStart } from './ModalStart';

const ListTasks = ({ route, navigation }) => {
    const { list } = route.params;
    const [tasks, setTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDeleteAll, setModalDeleteAll] = useState(false);
    const currentDay = dayjs().format("YYYY-MM-DD");
    const [loading, setLoading] = useState(true);
    const [modalStart, setModalStart] = useState(false);

    useEffect(() => {
        const unsuscribe = getTasks(list, (newTasks) => {
            // order tasks by past, current, and upcoming
            const sortedTasks = sortTasks(newTasks);
            setTasks(sortedTasks);
            setLoading(false);
        });
        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, [list]); // change every time list change

    // use AsyncStorage to get and store showCompleted state
    useEffect(() => {
        const loadShowCompleted = async () => {
            try {
                const itemData = await AsyncStorage.getItem(`showCompleted${list}`);
                if (itemData !== null) {
                    setShowCompleted(JSON.parse(itemData));
                }
            } catch (error) {
                console.log("Could not get showCompleted value: ", error);
            }
        };
        loadShowCompleted();
    }, [list]);

    const sortTasks = (tasks) => {
        return tasks.sort((a, b) => {
            // create date time, if time exists append T to create time object (ISO format)
            const aDate = dayjs(`${a.date}${a.time ? `T${a.time}` : ""}`);
            const bDate = dayjs(`${b.date}${b.time ? `T${a.time}` : ""}`);

            // if a and b are the same date
            if (aDate.isSame(bDate, "day")) {
                if (!a.time) return 1; // if no time, a after b
                if (!b.time) return -1; // if no time, b after a
                return aDate.isBefore(bDate) ? -1 : 1; // if both have time compare complete dates
            }
            // if dates not the same compare directly (-1 a before b, 1 a after b)
            return aDate.isBefore(bDate) ? -1 : 1;
        })
    };

    // to change if the user want to see or not the completed tasks
    const changeShowComplete = async () => {
        try {
            const newShow = !showCompleted;
            setShowCompleted(newShow);
            await AsyncStorage.setItem(`showCompleted${list}`, JSON.stringify(newShow));
        } catch (error) {
            console.log("Could not save showCompleted: ", error);
        }
    };

    const deleteAllCompletedModal = () => {
        return (
            <Modal visible={modalDeleteAll} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setModalDeleteAll(false)} accessible={false}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInside}>
                            <TouchableOpacity style={styles.btnModal}
                                onPress={() => {
                                    deleteAllCompleted(list)
                                    setModalDeleteAll(false)
                                }}>
                                <Text style={styles.modalTitle}>Delete all completed tasks</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    const filteredTasks = {
        pastAndCurrent: tasks.filter(task => task.date <= currentDay),
        uncompleted: tasks.filter(task => !task.completed),
        completed: tasks.filter(task => task.completed)
    };

    // get all tasks that are completed (for daily, only past and current tasks)
    const dailyAllTasksCompleted = filteredTasks.pastAndCurrent.every(task => task.completed);
    const hasUncompletedTasks = filteredTasks.uncompleted.length > 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#7D79C0", "#EBEAF6"]}
                style={styles.gradient}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}>

                    <View style={styles.tasksContainer}>
                        {/* uncompleted tasks */}
                        <View style={styles.touchShowComplete}>
                            <Text style={styles.sectionTitle}>Uncompleted Tasks</Text>
                            <TouchableOpacity
                                onPress={() => setModalDeleteAll(true)}
                                disabled={filteredTasks.completed.length === 0}
                            >
                                <AntDesign style={{ right: 10 }} name="ellipsis1" size={22}
                                    color={filteredTasks.completed.length > 0 ? "#404040" : "#E0E0E0"} />
                            </TouchableOpacity>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#7D79C0" />
                        ) : (
                            //  incompleted tasks
                            tasks.length === 0 ? (
                                // image user has not added a task yet
                                <Image
                                    source={require("../../../assets/images/addTask.png")}
                                    style={styles.img} />
                            ) : dailyAllTasksCompleted ? (
                                // image all completed!
                                <Image
                                    source={require("../../../assets/images/completed.png")}
                                    style={styles.img} />
                            ) : hasUncompletedTasks && ( // there are uncompleted tasks?
                                <FlatList
                                    style={styles.flatlist}
                                    data={list === "Daily" ?
                                        filteredTasks.uncompleted.filter(task => task.date <= currentDay)
                                        : filteredTasks.uncompleted
                                    }
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => (
                                        <TaskItem item={item} navigation={navigation} />
                                    )}
                                    scrollEnabled={false}
                                />
                            )
                        )}

                        {/* hide or show completed tasks */}
                        <TouchableOpacity onPress={changeShowComplete} style={styles.touchShowComplete}>
                            <Text style={styles.sectionTitle}>Completed Tasks</Text>
                            <AntDesign style={{ right: 10 }} name={showCompleted ? "up" : "down"} size={22} color="#404040" />
                        </TouchableOpacity>

                        {/* completed tasks */}
                        {showCompleted && (
                            <>
                                {filteredTasks.completed.length > 0 ? (
                                    <FlatList
                                        style={styles.flatlist}
                                        data={filteredTasks.completed}
                                        keyExtractor={item => item.id}
                                        renderItem={({ item }) => (
                                            <TaskItem item={item} navigation={navigation} />
                                        )}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <Image
                                        source={require("../../../assets/images/tasksCompleted.png")}
                                        style={styles.img} />
                                )}
                            </>
                        )}
                    </View>
                </ScrollView >

                {/* modal view add new task btn*/}
                <TouchableOpacity
                    style={[styles.addTaskButton]}
                    onPress={() => setModalVisible(true)}>
                    <AntDesign name="plus" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pickRandomButton,
                    { opacity: filteredTasks.pastAndCurrent.filter(task => !task.completed).length > 1 ? 1 : 0.5 }]}
                    disabled={filteredTasks.pastAndCurrent.filter(task => !task.completed).length <= 1}
                    onPress={() => setModalStart(true)}>
                    <Image
                        source={require("../../../assets/images/dice.png")}
                        style={styles.imgRandom} />
                </TouchableOpacity>

                <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible}
                    list={list} task={null} />

                <ModalStart tasks={list === "Daily" ? filteredTasks.pastAndCurrent.filter(task => !task.completed)
                    : filteredTasks.uncompleted} modalStart={modalStart} setModalStart={setModalStart} navigation={navigation} />

            </LinearGradient >
            {deleteAllCompletedModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    gradient: {
        flex: 1,
        justifyContent: "flex-start"
    },
    scrollViewContent: {
        alignItems: "center",
        padding: 10,
        width: "100%",
    },
    tasksContainer: {
        margin: 10,
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
    addTaskButton: {
        borderRadius: 50,
        backgroundColor: "#4B4697",
        width: 50,
        height: 50,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 20,
        right: 28
    },
    pickRandomButton: {
        borderRadius: 50,
        backgroundColor: "#4B4697",
        width: 50,
        height: 50,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 20,
        left: 28
    },
    img: {
        margin: 20,
        alignSelf: "center",
        width: 250,
        height: 250
    },
    imgRandom: {
        width: 40,
        height: 40,
        position: "absolute",
        borderRadius: 50
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-start",
        paddingVertical: 200,
        paddingHorizontal: 10,
        alignItems: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalInside: {
        width: "70%",
        padding: 20,
        backgroundColor: "#EBEAF6",
        borderRadius: 15,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: "#4B4697",
        borderBottomWidth: 1,
        borderColor: "#C0C0C0"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
});

export default ListTasks;