import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, ScrollView, SafeAreaView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { getTasks, deleteAllCompleted } from '../TasksDB';
import { LinearGradient } from 'expo-linear-gradient';
import ModalNewTask from "../Modals/ModalNewTask";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';
import TaskItem from '../Components/TaskItem';
import { ModalStart } from '../Modals/ModalStart';
import { ThemeContext } from '../../../contexts/ThemeContext';

export const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
        // create date time, if time exists append T to create time object (ISO format) / handle no dates with a further date
        const aDate = a.date ? dayjs(`${a.date}${a.time ? `T${a.time}` : ""}`) : dayjs("9999-12-31");
        const bDate = b.date ? dayjs(`${b.date}${b.time ? `T${b.time}` : ""}`) : dayjs("9999-12-31");

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

const ListTasks = ({ route, navigation }) => {
    const { listID } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [tasks, setTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showUpcoming, setShowUpcoming] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDeleteAll, setModalDeleteAll] = useState(false);
    const currentDay = dayjs().format("YYYY-MM-DD");
    const [loading, setLoading] = useState(true);
    const [modalStart, setModalStart] = useState(false);

    useEffect(() => {
        const unsuscribe = getTasks(listID, (newTasks) => {
            // order tasks by past, current, and upcoming
            const sortedTasks = sortTasks(newTasks);
            setTasks(sortedTasks);
            setLoading(false);
        });
        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, [listID]); // change every time listID change

    // use AsyncStorage to get and store showCompleted state
    useEffect(() => {
        const loadShowCompleted = async () => {
            try {
                const itemData = await AsyncStorage.getItem(`showCompleted${listID}`);
                if (itemData !== null) {
                    setShowCompleted(JSON.parse(itemData));
                }
            } catch (error) {
                console.log("Could not get showCompleted value: ", error);
            }
        };
        loadShowCompleted();
    }, [listID]);

    // to change if the user want to see or not the completed tasks
    const changeShowComplete = async () => {
        try {
            const newShow = !showCompleted;
            setShowCompleted(newShow);
            await AsyncStorage.setItem(`showCompleted${listID}`, JSON.stringify(newShow));
        } catch (error) {
            console.log("Could not save showCompleted: ", error);
        }
    };

    const changeShowUpcoming = async () => {
        try {
            const newShow = !showUpcoming;
            setShowUpcoming(newShow);
            await AsyncStorage.setItem(`showUpcoming${listID}`, JSON.stringify(newShow));
        } catch (error) {
            console.log("Could not save showUpcoming: ", error);
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
                                    deleteAllCompleted(listID)
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
        completed: tasks.filter(task => task.completed),
        upcoming: tasks.filter(task => !task.completed && task.date > currentDay)
    };

    // get all tasks that are completed (for daily, only past and current tasks)
    const dailyAllTasksCompleted = filteredTasks.pastAndCurrent.every(task => task.completed);
    const dailyBeforeEqual = filteredTasks.uncompleted.filter(task => task.date <= currentDay);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[theme.header, theme.linear2]}
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
                                style={{ flexDirection: "row" }}
                            >
                                {dailyBeforeEqual.length > 0 && (
                                    <View style={styles.number}>
                                        <Text style={{ fontSize: 12, color: theme.text }}>
                                            {dailyBeforeEqual.length}
                                        </Text>
                                    </View>
                                )}
                                <AntDesign style={{ right: 10 }} name="ellipsis1" size={25}
                                    color={
                                        filteredTasks.completed.length > 0 ? (theme.name === "light" ? "#404040" : "#FFFFFF") : (theme.name === "light" ? "#E0E0E0" : "#606060")
                                    } />
                            </TouchableOpacity>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#7D79C0" />
                        ) : (
                            // uncompleted tasks
                            <FlatList
                                style={styles.flatlist}
                                data={dailyBeforeEqual}
                                keyExtractor={item => `${item.id}-${item.date}`}
                                renderItem={({ item }) => (
                                    <TaskItem item={item} navigation={navigation} />
                                )}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    //  incompleted tasks
                                    dailyAllTasksCompleted ? (
                                        // image all completed!
                                        <Image
                                            source={require("../../../../assets/images/completed.png")}
                                            style={styles.img} />
                                    ) : (
                                        // image user has not added a task yet
                                        <Image
                                            source={require("../../../../assets/images/addTask.png")}
                                            style={styles.img} />
                                    )
                                }
                            />
                        )}

                        {listID !== "Daily" && (
                            // hide or show upcoming tasks 
                            <>
                                <View style={styles.touchShowComplete}>
                                    <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
                                    <TouchableOpacity onPress={changeShowUpcoming} style={{ flexDirection: "row" }}>
                                        {filteredTasks.upcoming.length > 0 && (
                                            <View style={styles.number}>
                                                <Text style={{ fontSize: 12, color: theme.text }}>
                                                    {filteredTasks.upcoming.length}
                                                </Text>
                                            </View>
                                        )}
                                        <AntDesign style={{ right: 10 }} name={showUpcoming ? "up" : "down"} size={22} color={theme.name === "light" ? "#404040" : "#FFFFFF"} />
                                    </TouchableOpacity>
                                </View>
                                {/* upcoming tasks */}
                                {showUpcoming && (
                                    <FlatList
                                        style={styles.flatlist}
                                        data={filteredTasks.uncompleted.filter(task => task.date > currentDay)}
                                        keyExtractor={item => `${item.id}-${item.date}`}
                                        renderItem={({ item }) => (
                                            <TaskItem item={item} navigation={navigation} />
                                        )}
                                        scrollEnabled={false}
                                        ListEmptyComponent={
                                            // image user has not added a task yet
                                            <Image
                                                source={require("../../../../assets/images/addTask.png")}
                                                style={styles.img} />
                                        }
                                    />
                                )}
                            </>
                        )}

                        {/* hide or show completed tasks */}
                        <View style={styles.touchShowComplete}>
                            <Text style={styles.sectionTitle}>Completed Tasks</Text>
                            <TouchableOpacity onPress={changeShowComplete} style={{ flexDirection: "row" }}>
                                {filteredTasks.completed.length > 0 && (
                                    <View style={styles.number}>
                                        <Text style={{ fontSize: 12, color: theme.text }}>
                                            {filteredTasks.completed.length}
                                        </Text>
                                    </View>
                                )}
                                <AntDesign style={{ right: 10 }} name={showCompleted ? "up" : "down"} size={22} color={theme.name === "light" ? "#404040" : "#FFFFFF"} />
                            </TouchableOpacity>
                        </View>

                        {/* completed tasks */}
                        {showCompleted && (
                            <FlatList
                                style={styles.flatlist}
                                data={filteredTasks.completed}
                                keyExtractor={item => `${item.id}-${item.date}`}
                                renderItem={({ item }) => (
                                    <TaskItem item={item} navigation={navigation} />
                                )}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <Image
                                        source={require("../../../../assets/images/tasksCompleted.png")}
                                        style={styles.img} />
                                }
                            />
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
                        source={require("../../../../assets/images/dice.png")}
                        style={styles.imgRandom} />
                </TouchableOpacity>

                <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible}
                    list={listID} task={null} />

                <ModalStart tasks={listID === "Daily" ? filteredTasks.pastAndCurrent.filter(task => !task.completed)
                    : filteredTasks.uncompleted} modalStart={modalStart} setModalStart={setModalStart} navigation={navigation} />

            </LinearGradient >
            {deleteAllCompletedModal()}
        </SafeAreaView>
    );
};

const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1
    },
    gradient: {
        flex: 1,
        justifyContent: "flex-start"
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: "center",
        padding: 10,
        paddingBottom: 0,
        width: "100%",
    },
    tasksContainer: {
        margin: 10,
        padding: 10,
        backgroundColor: theme.container,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 65,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Zain-Regular",
        color: theme.tabText,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    touchShowComplete: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 10,
        width: 360
    },
    addTaskButton: {
        borderRadius: 50,
        backgroundColor: theme.primary,
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
        backgroundColor: theme.primary,
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
        backgroundColor: theme.linear2,
        borderRadius: 15,
        alignItems: "center"
    },
    modalTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: theme.tabText,
        borderBottomWidth: 1,
        borderColor: "#C0C0C0"
    },
    topModal: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: 10
    },
    number: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        width: 25,
        height: 25,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        right: 20
    }
});

export default ListTasks;