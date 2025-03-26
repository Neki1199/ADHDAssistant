import React, { useState, useContext } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from "react-native-vector-icons/AntDesign";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { setCompleted } from "../../../contexts/TasksDB";
import { ThemeContext } from '../../../contexts/ThemeContext';

const TaskTimer = ({ route, navigation }) => {
    const { task, taskBreak, breakCounter, durationWithBreak } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    const [breakCounting, setBreakCounter] = useState(breakCounter);

    const [startCounterTask, setStartCounterTask] = useState(false);
    const [tenSecondsCounter, setTenSecondsCounter] = useState(true);
    const [taskCounterVisible, setTaskCounterVisible] = useState(false);
    const [startBreak, setStartBreak] = useState(false);
    const [breakCounterVisible, setBreakCounterVisible] = useState(false);

    const [taskCompleted, setTaskCompleted] = useState(false);

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>

            <View style={styles.containerInside}>
                {/* ten second counter */}
                {tenSecondsCounter && (
                    <>
                        <Text style={[styles.title, { fontSize: 30, padding: 20 }]}>Prepare Yourself</Text>
                        <CountdownCircleTimer
                            isPlaying={tenSecondsCounter}
                            duration={10}
                            colors={['#4B4697', '#7E4697', "#974674", "#CD0066", '#CC0000']}
                            colorsTime={[10, 4, 3, 2, 0]}
                            strokeWidth={20}
                            trailStrokeWidth={10}
                            onComplete={() => {
                                setTaskCounterVisible(true)
                                setStartCounterTask(true)
                                setTenSecondsCounter(false)
                            }}
                            size={250}
                            trailColor="#FFFFFF"
                        >
                            {({ remainingTime }) => {
                                let textCol;
                                if (remainingTime > 4) {
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
                    </>
                )}

                {/* task counter*/}
                {!tenSecondsCounter && taskCounterVisible && !breakCounterVisible && (
                    <>
                        <Text style={[styles.title, { fontSize: 30, padding: 20 }]}>In process...</Text>
                        <CountdownCircleTimer
                            isPlaying={startCounterTask}
                            duration={durationWithBreak}
                            colors={['#4B4697', '#7E4697', "#974674", "#CD0066", '#CC0000']}
                            colorsTime={[20, 10, 5, 2, 0]}
                            strokeWidth={20}
                            trailStrokeWidth={10}
                            onComplete={() => {
                                if (breakCounting > 0) {
                                    setTaskCounterVisible(false)
                                    setBreakCounterVisible(true)
                                    setStartBreak(true)
                                    // reset taskDuration
                                } else {
                                    setTaskCounterVisible(false);
                                    setBreakCounterVisible(false);
                                    setStartBreak(false);
                                    setTaskCompleted(true);
                                }
                            }}
                            size={250}
                            trailColor="#FFFFFF"
                        >
                            {({ remainingTime }) => {
                                const mm = Math.floor(remainingTime / 60).toString().padStart(2, "0");
                                const ss = (remainingTime % 60).toString().padStart(2, "0");

                                return (
                                    <Text style={styles.timeCountdown}>{`${mm}:${ss}`}</Text>
                                )
                            }}
                        </CountdownCircleTimer>
                        <Text style={[styles.title, , { padding: 20, color: theme.text }]}>
                            {taskBreak === "" ? "" :
                                (breakCounting === 0 ? "Final stretch!" :
                                    (breakCounting > 1 ? `${breakCounting} breaks left` : `${breakCounting} break left`))}
                        </Text>
                    </>
                )}

                {/* break counter */}
                {!taskCounterVisible && startBreak && (
                    <>
                        <Text style={[styles.title, { fontSize: 30, padding: 10 }]}>Break Time</Text>
                        <Image
                            source={require("../../../../assets/images/break.png")}
                            style={[styles.img, { position: "absolute", width: 850, height: 850, bottom: -160, left: -235 }]} />
                        <CountdownCircleTimer
                            isPlaying={startBreak}
                            duration={parseInt(taskBreak, 10) * 60}
                            colors={['#4B4697', '#7E4697', "#974674", "#CD0066", '#CC0000']}
                            colorsTime={[20, 10, 5, 2, 0]}
                            strokeWidth={20}
                            trailStrokeWidth={10}
                            onComplete={() => {
                                setBreakCounterVisible(false)
                                setTaskCounterVisible(true)
                                setStartCounterTask(true)

                                if (breakCounting > 0) {
                                    setBreakCounter(breakCounting - 1);
                                }
                            }}
                            size={250}
                            trailColor="#FFFFFF"
                        >
                            {({ remainingTime }) => {
                                const mm = Math.floor(remainingTime / 60).toString().padStart(2, "0");
                                const ss = (remainingTime % 60).toString().padStart(2, "0");

                                return (
                                    <Text style={[styles.timeCountdown, { color: theme.textTime }]}>{`${mm}:${ss}`}</Text>
                                )
                            }}
                        </CountdownCircleTimer>
                        <Text style={[styles.title, , { padding: 20, color: theme.textBreak }]}>
                            {breakCounting === 0 ? "" : breakCounter > 1 ? `${breakCounting} breaks left` : `${breakCounting} break left`}
                        </Text>
                    </>
                )}

                {/* bottom buttons whenn counter */}
                {(taskCounterVisible || breakCounterVisible) && (
                    <>
                        <View style={[styles.startBottom, { flexDirection: "row", justifyContent: "space-around", width: "80%" }]}>
                            {/* stop / start */}
                            {startCounterTask ? (
                                // stop
                                <TouchableOpacity onPress={() => setStartCounterTask(false)}
                                    style={{ opacity: breakCounterVisible ? 0.5 : 1 }}
                                    disabled={breakCounterVisible}>
                                    <AntDesign name="pausecircle" size={45} color={startBreak ? (theme.name === "light" ? "#7A74C9" : "#DDDBFF") : "#7A74C9"} />
                                </TouchableOpacity>
                            ) : (
                                // start
                                <TouchableOpacity onPress={() => setStartCounterTask(true)}>
                                    <AntDesign name="play" size={45} color={startBreak ? (theme.name === "light" ? "#7A74C9" : "#DDDBFF") : "#7A74C9"} />
                                </TouchableOpacity>
                            )}
                            {/* restart */}
                            <TouchableOpacity onPress={() => navigation.navigate("DurationBreak", { task: task, restart: true, fromButton: true })}>
                                <AntDesign name="reload1" size={45} color={startBreak ? (theme.name === "light" ? "#7A74C9" : "#DDDBFF") : "#7A74C9"} />
                            </TouchableOpacity>
                        </View>

                        {/* completed btn*/}
                        <TouchableOpacity style={styles.btn} onPress={async () => {
                            try {
                                // change task
                                await setCompleted(task);

                                setTaskCounterVisible(false);
                                setBreakCounterVisible(false);
                                setStartBreak(false);
                                navigation.navigate("Tasks", { listID: "Daily" })
                            } catch (error) {
                                console.error("Could not change task to completed: ", error)
                            }
                        }}>
                            <Text style={styles.btnText}>Completed</Text>
                        </TouchableOpacity>
                    </>
                )}

                {taskCompleted && (
                    <View style={styles.completionContainer}>
                        <Image
                            source={require("../../../../assets/images/completed.png")}
                            style={styles.img} />
                        <Text style={styles.title}>Have you finished your task?</Text>
                        <View style={styles.btnCompletedContainer}>
                            <TouchableOpacity style={[styles.btn, { width: 300, backgroundColor: theme.name === "light" ? "#211B75" : "#221D66" }]} onPress={restartTimer}>
                                <Text style={styles.btnText}>No, let me restart and change the timer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { width: 300, backgroundColor: theme.name === "light" ? "#3E5CB0" : "#4B4697" }]} onPress={() => {
                                navigation.navigate("Tasks", { lisID: "Daily" })
                                setCompleted(task);
                            }}>
                                <Text style={styles.btnText}>Yes! Mark task as completed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};

const useStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
    },
    title: {
        textAlign: "center",
        fontFamily: "Zain-Regular",
        fontSize: 24,
        color: theme.title,
    },
    containerInside: {
        marginVertical: 10,
        padding: 20,
        width: "90%",
        height: "auto",
        borderRadius: 15,
        alignItems: "center",
        backgroundColor: "transparent"
    },
    startBottom: {
        paddingVertical: 30,
        alignItems: "center",
        gap: 20
    },
    btnText: {
        color: "#FFFFFF",
        fontFamily: "Zain-Regular",
        fontSize: 18,
        textAlign: "center"
    },
    btn: {
        width: 200,
        height: 50,
        backgroundColor: "#4B4697",
        justifyContent: "center",
        borderRadius: 15
    },
    timeCountdown: {
        fontSize: 44,
        color: theme.tabText,
        fontFamily: "monospace"
    },
    timerCointainer: {
        alignItems: "center",
        height: "50%"
    },
    img: {
        width: 250,
        height: 250,
        marginTop: 20,
        alignSelf: "center"
    },
    btnCompletedContainer: {
        padding: 10,
        margin: 10,
        gap: 20
    }
});

export default TaskTimer;