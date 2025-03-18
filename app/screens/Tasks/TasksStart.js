import React, { useContext, useEffect, useState } from "react"
import { TouchableOpacity, Keyboard, StyleSheet, Text, View, Image, TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { ThemeContext } from "../../contexts/ThemeContext";

export default function TasksStart({ route, navigation }) {
    const tasks = route?.params?.tasks || [];
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [selectedTask, setSelectedTask] = useState(null);
    const [openTaskScreen, setOpenTaskScreen] = useState(false);
    const [timerCompleted, setTimerCompleted] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerStyle: {
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: theme.header
            },
        });
    }, [theme, navigation])

    // select a random task
    useEffect(() => {
        if (tasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * tasks.length);
            setSelectedTask(tasks[randomIndex]);
        }
    }, [tasks]);


    return (
        // to touch outside when input writing
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <LinearGradient
                    colors={[theme.header, theme.linear2]}
                    style={styles.gradient}>

                    {selectedTask && (
                        <>
                            <Text style={styles.title}>The task selected is...</Text>

                            <View style={styles.containerTitle}>
                                <Text style={styles.title}>{selectedTask.name}</Text>
                            </View>
                        </>)}

                    {/* if task has no duration */}
                    {selectedTask && !openTaskScreen && (
                        <>
                            <Image
                                source={require("../../../assets/images/timer.png")}
                                style={styles.img} />
                            <View style={styles.askContainer}>

                                <Text style={styles.textAsk}>Do you want to set a timer?</Text>
                                <TouchableOpacity style={styles.btn} onPress={() => setOpenTaskScreen(true)}>
                                    <Text style={styles.btnText}>No, I don't need a timer for this!</Text>
                                </TouchableOpacity>


                                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("TaskTimer", { task: selectedTask })}>
                                    <Text style={styles.btnText}>Yes, let's start a timer</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* screen for task without timer (show an image and checkbox) */}
                    {openTaskScreen && (
                        <View style={[styles.noDurationContainer, { backgroundColor: theme.name === "dark" && "rgba(255, 255, 255, 0.2)" }]}>
                            <Text style={styles.timerTitle}>When the timer stops <Text style={styles.timerTitleStart}>START</Text> your task!</Text>
                            <Text style={styles.timerText}>Even if you don't want to...</Text>
                            {!timerCompleted ? (

                                <CountdownCircleTimer
                                    isPlaying
                                    duration={5}
                                    colors={['#4B4697', '#7E4697', "#974674", "#CD0066", '#CC0000']}
                                    colorsTime={[5, 4, 3, 2, 0]}
                                    onComplete={() =>
                                        setTimerCompleted(true)
                                    }
                                    size={150}
                                    trailColor="#FFFFFF"
                                >
                                    {({ remainingTime }) => {
                                        let textCol;
                                        if (remainingTime === 5) {
                                            textCol = "#4B4697";
                                        } else if (remainingTime === 4) {
                                            textCol = "#7E4697";
                                        } else if (remainingTime === 3) {
                                            textCol = "#974674";
                                        } else if (remainingTime === 2) {
                                            textCol = "#CD0066";
                                        } else {
                                            textCol = "#CC0000";
                                        }
                                        return (
                                            <Text style={[styles.timeCountdown, { color: textCol }]}>{remainingTime}</Text>
                                        );
                                    }}
                                </CountdownCircleTimer>
                            ) : (
                                <TouchableOpacity style={[styles.btn, { marginTop: 20, backgroundColor: theme.name === "dark" && "#1C1C1C" }]} onPress={() => navigation.goBack()}>
                                    <Text style={styles.btnText}>Return To Tasks</Text>
                                </TouchableOpacity>
                            )}

                        </View>
                    )}
                </LinearGradient>
            </View>
        </TouchableWithoutFeedback>
    );
};


const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    containerTitle: {
        width: "90%",
        backgroundColor: theme.container,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4
    },
    title: {
        fontFamily: "Zain-Regular",
        fontSize: 30,
        width: "80%",
        textAlign: "center",
        color: theme.title
    },
    textAsk: {
        color: theme.text,
        fontFamily: "Zain-Regular",
        fontSize: 26,
    },
    askContainer: {
        padding: 20,
        backgroundColor: theme.container,
        width: "90%",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 5,
        borderColor: "#585F8C",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4
    },
    btn: {
        width: "100%",
        alignItems: "center",
        backgroundColor: "#4B4697",
        padding: 10,
        margin: 10,
        borderRadius: 10
    },
    btnText: {
        color: "#FFFFFF",
        fontFamily: "Zain-Regular",
        fontSize: 20
    },
    img: {
        width: 250,
        height: 250,
        marginTop: 20,
        top: 50
    },
    noDurationContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        borderRadius: 15,
        width: "90%",
        height: "85%",
        justifyContent: "center",
        alignItems: "center"
    },
    timeCountdown: {
        fontSize: 44,
        color: "#4B4697",
        fontFamily: "Zain-Regular"
    },
    timerTitle: {
        fontFamily: "Zain-Regular",
        fontSize: 30,
        width: "80%",
        textAlign: "center",
        color: theme.title
    },
    timerTitleStart: {
        fontFamily: "monospace",
        fontSize: 30,
        textAlign: "center",
        color: "#CC99FF",
        fontWeight: "bold"
    },
    timerText: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        textAlign: "center",
        color: theme.textTimer,
        marginBottom: 50
    }
});
