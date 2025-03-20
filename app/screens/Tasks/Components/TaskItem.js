import React, { useContext, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { setCompleted, setNotCompleted } from '../TasksDB';
import ModalNewTask from "../Modals/ModalNewTask";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { ThemeContext } from '../../../contexts/ThemeContext';

dayjs.extend(relativeTime); // to use fromNow()

const TaskItem = ({ item, navigation, colour = null }) => {
    const [checked, setChecked] = useState(item.completed);
    const [modalVisible, setModalVisible] = useState(false);
    const currentDay = dayjs().format("YYYY-MM-DD");
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const changeChecked = async () => {
        if (!checked) {
            await setCompleted(item);
        } else {
            await setNotCompleted(item);
        }
        setChecked(!checked);
    };

    const getTotalMinutes = (duration) => {
        // get duration ("hh:mm") and convert to minutes for timer
        const [hours, minutes] = duration.split(":").map(Number);
        return `${hours * 60 + minutes}`;
    };

    // to check if the task is past, current or upcoming
    const datePastCurrentUpcoming = () => {
        if (item.date === currentDay) {
            return "Today";
        }
        if (item.date === "") {
            return "No date"
        }
        if (item.date < currentDay) {
            const isYesterday = dayjs(item.date).isSame(dayjs().subtract(1, "day"), "day");
            if (isYesterday) {
                return "Yesterday"
            } else {
                return dayjs(item.date).fromNow();
            }
        }
        return dayjs(item.date).format("ddd DD MMMM");
    };

    const openChangeDelete = () => {
        setModalVisible(true);
    };

    return (
        <View style={[styles.taskItem, checked && styles.taskCompleted,
        {
            borderLeftWidth: colour && 6, borderColor: colour && `${colour}90`,
        }]}>
            <TouchableOpacity onLongPress={() => openChangeDelete()}>
                <View style={styles.taskItemLeft}>
                    {colour && (
                        <Text style={[styles.taskItemTime, { marginBottom: 5 }]}>{item.list}</Text>
                    )}
                    <Text style={styles.taskItemText}>{item.name}</Text>
                    <Text style={styles.taskItemTime}>
                        <Text style={[
                            styles.taskItemTime,
                            { // colours of date
                                color: item.completed ? "#626262" :  // task completed
                                    item.completed === false && item.date < currentDay ? "#A21D1D"
                                        : item.completed === false && datePastCurrentUpcoming() === dayjs(item.date).format("ddd DD MMMM") ?
                                            "#3F85FF" : "#4B4697"
                            }
                        ]}>{item.completed === false ? datePastCurrentUpcoming() + " " :
                            item.date !== "" ? dayjs(item.date).format("ddd DD MMMM") + " " :
                                "No Date "}</Text>
                        {item.time !== "" &&
                            "At " + dayjs(item.time, "HH:mm").format("HH:mm")
                        }
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.taskItemRight}>
                {item.duration !== "" && (
                    <View style={styles.taskTimer}>
                        <Text style={styles.taskItemTime}>{getTotalMinutes(item.duration)} mins</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (!checked) {
                                    navigation.navigate("TaskTimer", { task: item })
                                }
                            }}
                            disabled={checked}
                            style={{ opacity: checked ? 0.5 : 1 }}
                        >
                            <AntDesign name="play" size={30} color={theme.name === "light" ? "#4B4697" : (colour ? "#FFFFFF" : "#4B4697")} />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.checkbox}>
                    <BouncyCheckbox
                        size={28}
                        isChecked={checked}
                        fillColor="#4B4697"
                        iconStyle={styles.checkboxStyle}
                        bounceEffectIn={3}
                        onPress={() => changeChecked()}
                        innerIconStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.4)",
                        }}
                    />
                </View>
            </View>
            <ModalNewTask modalVisible={modalVisible} setModalVisible={setModalVisible}
                list={item.list} task={item} />
        </View>
    );
};

const useStyles = (theme) => StyleSheet.create({
    taskItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        padding: 10,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: "#E4E3F6"
    },
    taskItemLeft: {
        marginLeft: 10,
        width: "180%"
    },
    taskItemRight: {
        flexDirection: "row",
        marginRight: 10,
        alignItems: "center",
        gap: 10
    },
    taskItemText: {
        color: "#000000",
        fontFamily: "Zain-Regular",
        fontSize: 18,
        flexWrap: "wrap",
        maxWidth: 150
    },
    taskTimer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    taskItemTime: {
        color: theme.listText,
        fontFamily: "monospace",
        fontSize: 12,
        color: "#626262"
    },
    checkbox: {
        margin: 8,
        width: 24,
        height: 24
    },
    taskCompleted: {
        opacity: 0.5,
        backgroundColor: "#E4E3F6"
    },
    checkboxStyle: {
        borderWidth: 2,
        borderColor: "#FFFFFF"
    }
});

export default TaskItem;