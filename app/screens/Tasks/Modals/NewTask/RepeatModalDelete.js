import React, { useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { deleteTask, deleteRepeatedTasks } from "../../../../contexts/TasksDB";
import { ThemeContext } from "../../../../contexts/ThemeContext";
import { removeNotification, removeRepeatNotifications } from "./Notifications";

export const RepeatModalDelete = ({ modalDelete, setModalDelete, task }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const deleteAll = async () => {
        const parentID = task.parentID ? task.parentID : task.id;
        deleteRepeatedTasks(task);
        removeRepeatNotifications(parentID);
        deleteTask(task, parentID);
        setModalDelete(false);
    };

    return (
        <Modal visible={modalDelete} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setModalDelete(false)} accessible={false}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalInside}>
                        {/* delete only task selected */}
                        <TouchableOpacity style={[styles.btn, { marginTop: 0 }]} onPress={() => {
                            deleteTask(task);
                            removeNotification(task.id);
                            setModalDelete(false);
                        }}>
                            <Text style={styles.textModal}>Delete Task</Text>
                        </TouchableOpacity>
                        {/* delete all tasks, including repeated */}
                        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.activetab }]} onPress={() =>
                            // remove all repeated tasks and notifications
                            deleteAll()
                        }>
                            <Text style={styles.textModal}>Delete All Tasks</Text>
                        </TouchableOpacity>
                        <Text style={styles.textModalBottom}>Included repeated tasks</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const useStyles = (theme) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalInside: {
        padding: 20,
        backgroundColor: theme.modalNewTask,
        alignItems: "center",
        height: "20%",
        width: "55%",
        borderRadius: 20
    },
    btn: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary,
        width: 200,
        height: 50,
        borderRadius: 15
    },
    textModal: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        color: "#FFFFFF"
    },
    textModalBottom: {
        fontFamily: "Zain-Regular",
        fontSize: 16,
        color: theme.textTime
    }
});
