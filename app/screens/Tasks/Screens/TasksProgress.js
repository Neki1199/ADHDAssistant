import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { getTasksProgress } from '../../../contexts/TasksDB';

const TasksProgress = () => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [progress, setProgress] = useState({});

    useEffect(() => {
        const unsubscribe = getTasksProgress(setProgress);

        return () => { if (unsubscribe && typeof unsubscribe === "function") { unsubscribe(); } }
    }, []);

    const listsProgress = Object.entries(progress).filter(([name, value]) => name !== "Total");
    const lastListName = listsProgress[listsProgress.length - 1][0];

    return (
        <View style={styles.container}>
            {Object.entries(progress).map(([name, value]) => (
                name === "Total" && (
                    <View key={name} style={styles.progressContainer}>
                        <View>
                            <Text style={styles.titleLists}>Total tasks completed to date</Text>
                        </View>
                        <View style={[styles.numberLists, { width: "100%", alignItems: "center" }]}>
                            <View style={[styles.number, { backgroundColor: theme.linear2 }]}>
                                <Text style={styles.title}>{value}</Text>
                            </View>
                        </View>
                    </View>
                )
            ))}
            <View style={styles.listsContainer}>
                <Text style={styles.titleLists}>To Do Lists Tasks Completed</Text>
                <FlatList
                    keyExtractor={item => item[0]}
                    data={listsProgress}
                    renderItem={({ item }) => {
                        const [name, value] = item;
                        return (
                            <View style={[styles.listsInside, { borderBottomWidth: lastListName === name ? 0 : 1 }]}>
                                <View style={styles.lists}>
                                    <Text style={styles.name}>{name}</Text>
                                </View>
                                <View style={styles.numberLists}>
                                    <View style={styles.number}>
                                        <Text style={styles.title}>{value}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
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
        flexDirection: "column",
        gap: 10,
        backgroundColor: theme.container,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        padding: 20
    },
    name: {
        fontFamily: "Zain-Regular",
        fontSize: 24,
        color: theme.text
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "monospace",
        color: theme.text
    },
    titleLists: {
        fontFamily: "monospace",
        fontSize: 17,
        color: theme.tabText,
        marginBottom: 10,
        textAlign: "center"
    },
    number: {
        padding: 10,
        alignItems: "center",
        backgroundColor: theme.numberTasks,
        borderRadius: 10
    },
    listsInside: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E1E1E1",
    },
    listsContainer: {
        backgroundColor: theme.container,
        padding: 20,
        width: "90%",
        marginTop: 20,
        justifyContent: "flex-start",
        borderRadius: 10
    },
    lists: {
        justifyContent: "center",
        alignItems: "flex-start",
        width: "48%"
    },
    numberLists: {
        alignItems: "flex-end",
        width: "50%",
    },
});

export default TasksProgress;