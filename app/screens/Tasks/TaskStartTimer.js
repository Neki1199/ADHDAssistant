import React, { useState, useContext, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Image, Platform, View, StyleSheet, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from "react-native-vector-icons/AntDesign";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { setCompleted } from "./TasksDB";
import { ThemeContext } from '../../contexts/ThemeContext';

// TASK TIMER SCREEN
const TaskTimer = ({ route, navigation }) => {
    const { task } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [hFormat, mFormat] = task.duration?.split(":");
    const [durationH, setDurationH] = useState(hFormat);
    const [durationM, setDurationM] = useState(mFormat);

    const [taskBreak, setTaskBreak] = useState(""); // duration of break
    const [breakRepeat, setBreakRepeat] = useState("1"); // break repetitions
    const [breakCounter, setBreakCounter] = useState(0);
    const [durationWithBreak, setDurationWithBreak] = useState(0);

    const [startCounterFive, setStartCounterFive] = useState(false);
    const [startCounterTask, setStartCounterTask] = useState(false);
    const [fiveCounterVisible, setFiveCounterVisible] = useState(false);
    const [taskCounterVisible, setTaskCounterVisible] = useState(false);
    const [startBreak, setStartBreak] = useState(false);
    const [breakCounterVisible, setBreakCounterVisible] = useState(false);

    const [taskCompleted, setTaskCompleted] = useState(false);
    const [initialSetup, setInitialSetup] = useState(true);

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


    const formatHours = () => {
        // to be 00:00
        const formattedHours = (durationH || "0").padStart(2, "0");
        const formattedMins = (durationM || "0").padStart(2, "0");

        if (formattedHours === "00" && formattedMins === "00") {
            Alert.alert(
                "⚠️ Ups!",
                "Please enter a duration",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        } else {
            // change the duration
            setDurationH(formattedHours);
            setDurationM(formattedMins);
        }
    };

    const setBreak = () => {
        const breakMinutes = parseInt(taskBreak, 10);
        const repeatTimes = parseInt(breakRepeat, 10);

        if (breakMinutes > 0 && repeatTimes > 0) {
            setBreakCounter(repeatTimes); // counter to know which repetition are we
        } else {
            setBreakCounter(0); // if no break set
        };
    };

    // handle incorrect inputs from user
    const handleInputChange = (value, type) => {
        // do not accept other chars
        const newVal = value.replace(/[^0-9]/g, ""); // only match from 0 to 9, g apply to all chars 
        if (type == "hh") {
            setDurationH(newVal.slice(0, 2)); // 2 digits max (again, just in case)
        } else {
            setDurationM(newVal.slice(0, 2));
        }
    };

    // calculate the duration depending on the breaks
    const setDurationBreak = () => {
        formatHours(); // format hours as 00:00
        if (taskBreak !== "" && breakRepeat > 0) {
            setBreak(); // set counter of break
        };

        const hh = parseInt(durationH, 10) || 0;
        const mm = parseInt(durationM, 10) || 0;
        const totalMinutes = hh * 60 + mm;

        if (totalMinutes !== 0) {
            // if there is break time, set duration with break, else set the whole duration
            if (parseInt(taskBreak, 10) > 0 && parseInt(breakRepeat, 10) > 0) {
                const division = parseInt(breakRepeat, 10) + 1; // num or repeats + 1 to divide the duration by segments
                const dividedTaskMinutes = totalMinutes / division;
                setDurationWithBreak(dividedTaskMinutes * 60); // convert to second for the counter
            } else {
                setDurationWithBreak(totalMinutes * 60);
            };
            setFiveCounterVisible(true)
            setStartCounterFive(true)
            setInitialSetup(false)
        }
    };

    const handleBreakRepeat = (value) => {
        const newVal = value.replace(/[^0-9]/g, "");
        if (newVal === "0" && taskBreak !== "") {
            setBreakRepeat("1"); // default 1
        } else {
            setBreakRepeat(newVal.slice(0, 1)); //limit to 1 digit
        }
    };

    // if the users click outside and the repeat is ""
    const handleRepeatBlur = () => {
        if (breakRepeat === "" && taskBreak !== "") {
            setBreakRepeat("1"); // default 1
        }
    };

    const restartTimer = () => {
        setDurationH(hFormat);
        setDurationM(mFormat);
        setTaskBreak("");
        setBreakRepeat("1");
        setBreakCounter(0);
        setDurationWithBreak(0);
        setStartCounterFive(false);
        setStartCounterTask(false);
        setFiveCounterVisible(false);
        setTaskCounterVisible(false);
        setStartBreak(false);
        setBreakCounterVisible(false);
        setTaskCompleted(false);
        setInitialSetup(true);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <LinearGradient
                        colors={[theme.header, theme.linear2]}
                        style={styles.gradient}>

                        <View style={[styles.containerInside, {
                            backgroundColor: initialSetup ? theme.container : "transparent"
                        }]}>

                            {/* only appear at the begining, or if user wants to reset the counter */}
                            {initialSetup && (
                                <>
                                    <Text style={styles.title}>{task.name}</Text>
                                    <View style={styles.durationContainer}>
                                        {/* duration of task input */}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="HH"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={durationH}
                                            onChangeText={(value) => handleInputChange(value, "hh")}
                                            placeholderTextColor={theme.text}
                                        />
                                        <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 20 }}>:</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="MM"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={durationM}
                                            onChangeText={(value) => handleInputChange(value, "mm")}
                                            placeholderTextColor={theme.text}
                                        />
                                    </View>
                                    <Text style={styles.taskText}>
                                        Duration set for {durationH === "" ? "00 h" : `${durationH} h`}
                                        {durationM === undefined ? " and 00 mins" : ` and ${durationM} mins`}</Text>

                                    <View style={styles.breakContainer}>
                                        <View style={styles.breakInsideContainer}>
                                            <Text style={styles.taskText}>Break Minutes</Text>
                                            {/* break duration and repeat inputs */}
                                            <TextInput
                                                style={styles.input}
                                                placeholder="00"
                                                value={taskBreak}
                                                keyboardType='numeric'
                                                onChangeText={setTaskBreak}
                                                placeholderTextColor={theme.text}
                                            />
                                        </View>
                                        {/* if break time is set, let user set repeats */}
                                        {parseInt(taskBreak, 10) > 0 && (
                                            <View style={styles.breakInsideContainer}>
                                                <Text style={styles.taskText}>Repeat</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder={breakRepeat}
                                                    value={breakRepeat}
                                                    keyboardType='numeric'
                                                    maxLength={1}
                                                    onChangeText={handleBreakRepeat}
                                                    onBlur={handleRepeatBlur}
                                                />
                                            </View>
                                        )}

                                    </View>
                                    <Text style={[styles.taskText, { padding: 5 }]}>
                                        {taskBreak === "" ? "" : `Break set for ${taskBreak} mins`}
                                        {taskBreak === "" ? "" : breakRepeat === 0 ? "" : breakRepeat > 1 ? ` and ${breakRepeat} repeats` : " and 1 repeat"}

                                    </Text>
                                    <Text style={styles.taskText}>If you leave, your progress will be lost </Text>
                                </>
                            )}

                            {/* five second counter */}
                            {fiveCounterVisible && (
                                <>
                                    <Text style={[styles.title, { fontSize: 30, padding: 20 }]}>Prepare Yourself</Text>
                                    <CountdownCircleTimer
                                        isPlaying={startCounterFive}
                                        duration={5}
                                        colors={['#4B4697', '#7E4697', "#974674", "#CD0066", '#CC0000']}
                                        colorsTime={[5, 4, 3, 2, 0]}
                                        strokeWidth={20}
                                        trailStrokeWidth={10}
                                        onComplete={() => {
                                            setTaskCounterVisible(true)
                                            setStartCounterTask(true)
                                            setFiveCounterVisible(false)
                                        }}
                                        size={250}
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
                                </>
                            )}

                            {/* task counter: when 5 sec false, break false */}
                            {!fiveCounterVisible && taskCounterVisible && !breakCounterVisible && (
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
                                            if (breakCounter > 0) {
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
                                            (breakCounter === 0 ? "Final stretch!" :
                                                (breakCounter > 1 ? `${breakCounter} breaks left` : `${breakCounter} break left`))}
                                    </Text>
                                </>
                            )}

                            {/* break counter */}
                            {!taskCounterVisible && startBreak && (
                                <>
                                    <Text style={[styles.title, { fontSize: 30, padding: 10 }]}>Break Time</Text>
                                    <Image
                                        source={require("../../../assets/images/break.png")}
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

                                            if (breakCounter > 0) {
                                                setBreakCounter(breakCounter - 1);
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
                                        {breakCounter === 0 ? "" : breakCounter > 1 ? `${breakCounter} breaks left` : `${breakCounter} break left`}
                                    </Text>
                                </>
                            )}

                            {/* start button on initial setup */}
                            {initialSetup && (
                                <View style={styles.startBottom}>
                                    <Text style={[styles.taskText, { fontSize: 26, color: theme.tabText }]}>When you are ready press the button</Text>
                                    <Text style={[styles.taskText, { fontSize: 20, color: "#404040" }]}>A five second counter will start!</Text>
                                    <TouchableOpacity onPress={() =>
                                        setDurationBreak()
                                    }>
                                        <AntDesign name="play" size={50} color={theme.tabText} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* bottom buttons whn counter */}
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
                                        <TouchableOpacity onPress={restartTimer}>
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
                                        source={require("../../../assets/images/completed.png")}
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
                </View>
            </TouchableWithoutFeedback >
        </KeyboardAvoidingView >
    );
};

const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
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
        alignItems: "center"
    },
    startBottom: {
        paddingVertical: 30,
        alignItems: "center",
        gap: 20
    },
    taskText: {
        fontFamily: "Zain-Regular",
        fontSize: 18,
        textAlign: "center",
        color: theme.textTimer,
        top: 10
    },
    btnText: {
        color: "#FFFFFF",
        fontFamily: "Zain-Regular",
        fontSize: 18,
        textAlign: "center"
    },
    durationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        paddingLeft: 10,
        gap: 16,
        alignItems: "center"
    },
    breakContainer: {
        flexDirection: "row",
        width: "100%",
        paddingLeft: 10,
        gap: 38,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#C0C0C0"
    },
    breakInsideContainer: {
        justifyContent: "center",
        alignItems: "center"
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
    input: {
        fontFamily: "Zain-Regular",
        textAlign: "center",
        fontSize: 20,
        width: 80,
        backgroundColor: theme.input,
        borderRadius: 20,
        padding: 15,
        marginTop: 20,
        color: theme.text
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