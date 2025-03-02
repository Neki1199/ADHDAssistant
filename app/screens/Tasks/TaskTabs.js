import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from "../../../firebaseConfig";

export default function TasksTabs({ navigation }) {
    const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);

    return (
        <View style={styles.tasksView}>
            <Text style={styles.textTasks}>Tasks</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tasksView: {
        backgroundColor: "#FFFFFF",
        width: "90%",
        height: "18%",
        borderRadius: 10,
        alignItems: 'center',
        padding: 10
    },
    textTasks: {
        fontFamily: "Zain-Regular",
        fontSize: 25
    },
});