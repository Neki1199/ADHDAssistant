import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import { ThemeContext } from "../../../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskItem from "./TaskItem";
import { ListsContext } from "../../../contexts/ListsContext";
import { setColour } from "../Screens/TabUpcoming";
import { TasksContext } from "../../../contexts/TasksContext";

const RewardsHome = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { allLists } = useContext(ListsContext);
    const { allTasks } = useContext(TasksContext);

    const styles = useStyles(theme);

    const [rewardTasks, setRewardTasks] = useState([]);
    const listColours = setColour(allLists);

    // add reward tasks if there are
    useEffect(() => {
        const retrieveRewards = async () => {
            const storedRewards = await AsyncStorage.getItem("rewardTasks");
            if (storedRewards) {
                setRewardTasks(JSON.parse(storedRewards));
            };
        };
        retrieveRewards();
    }, [navigation]);

    // update if a task has been changed, removed, or completed
    useEffect(() => {
        setRewardTasks((prevSet) => {
            const updated = prevSet.map(rewardSet => {
                const updatedTasks = rewardSet.tasks
                    .map(prevTask => {
                        const taskUpdated = allTasks[prevTask.list]?.find(task => task.id === prevTask.id); // find the task (if exists)
                        if (taskUpdated && taskUpdated !== prevTask) {
                            return { ...prevTask, ...taskUpdated }; // update its details if not the same
                        }
                        return prevTask; // return the prev task if it was not changed
                    })
                    .filter(task => task.completed === false) // remove completed tasks
                    .filter(task => allTasks[task.list]?.some(t => t.id === task.id)); // remove task does not exist
                return {
                    ...rewardSet,
                    tasks: updatedTasks, // update all tasks
                };
            }).filter(rewardSet => rewardSet.tasks.length > 0);
            AsyncStorage.setItem("rewardTasks", JSON.stringify(updated));
            return updated;
        });
    }, [allTasks]);

    return (
        rewardTasks.length > 0 && (
            <View style={styles.rewardsContainer}>
                <Text style={styles.textContainer}>Reward Sets</Text>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ borderRadius: 15 }}
                    data={rewardTasks}
                    keyExtractor={(item, index) => `${item.reward}-${index}`}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.textReward}>{item.reward}</Text>
                            {item.tasks.map((task, index) => (
                                <TaskItem key={`${task.id}-${index}`} item={task} navigation={navigation} colour={listColours[task.list]} />
                            ))}
                        </View>
                    )}
                />
            </View>
        )
    );
};

const useStyles = (theme) => StyleSheet.create({
    rewardsContainer: {
        width: "90%",
        height: 260,
        backgroundColor: theme.container,
        padding: 10,
        alignItems: "center",
        borderRadius: 15
    },
    textContainer: {
        fontFamily: "Zain-Regular",
        fontSize: 25,
        color: theme.tabText,
        marginBottom: 10
    },
    listItem: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 9
    },
    textReward: {
        color: theme.text,
        fontFamily: "monospace",
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10
    }
});

export default RewardsHome;