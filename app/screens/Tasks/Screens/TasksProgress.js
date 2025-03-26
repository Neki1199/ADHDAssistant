import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { getTasksProgress } from '../../../contexts/TasksDB';

const TasksProgress = () => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [progress, setProgress] = useState({});

    useEffect(() => {
        const unsuscribe = getTasksProgress(setProgress);

        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                {Object.entries(progress).map(([key, value]) => (
                    key === "Total" && (
                        <View key={key}>
                            <Text style={styles.title}>Total tasks completed to date</Text>
                            <View style={styles.number}>
                                <Text style={styles.title}>{value}</Text>
                            </View>
                        </View>
                    )
                ))}
            </View>
            <View>
                <Text>Lists Tasks Completed</Text>
                {Object.entries(progress).map(([key, value]) => (
                    key !== "Total" && (
                        <View key={key}>
                            <Text style={styles.title}>{key}: {value}</Text>
                        </View>
                    )
                ))}
            </View>
        </View>
    );
};

const useStyles = (theme) => StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },
    progressContainer: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: theme.container,
        padding: 10,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    title: {
        fontFamily: "Zain-Regular",
        fontSize: 24,
        color: theme.text
    },
    number: {
        padding: 10,
        width: 50,
        height: 50,
        alignItems: "center",
        backgroundColor: theme.numberTasks,
        borderRadius: 10
    }
});

export default TasksProgress;