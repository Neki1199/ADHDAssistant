import React, { useState, useContext, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View, StyleSheet, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from "react-native-vector-icons/AntDesign";
import { ThemeContext } from '../../../contexts/ThemeContext';
import RouletteRandom from '../Modals/RouletteRandom';

const DurationBreak = ({ route, navigation }) => {
    const { task, fromButton = false, restart = false } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [showRoulette, setShowRoulette] = useState(false);

    const [hFormat, mFormat] = task.duration !== "" ? task.duration?.split(":") : ["", ""];
    const [durationH, setDurationH] = useState(hFormat);
    const [durationM, setDurationM] = useState(mFormat);

    const [taskBreak, setTaskBreak] = useState(""); // duration of break
    const [breakRepeat, setBreakRepeat] = useState("1"); // break repetitions

    // restart all
    useEffect(() => {
        if (restart) {
            restartTimer();
        };
    }, [restart]);

    const restartTimer = () => {
        setDurationH(hFormat);
        setDurationM(mFormat);
        setTaskBreak("");
        setBreakRepeat("1");
    };

    // roulette gif
    useEffect(() => {
        if (task.duration === "" || fromButton) {
            return;
        }

        setShowRoulette(true);
        const timeOut = setTimeout(() => {
            setShowRoulette(false);
        }, 4000);

        return () => clearTimeout(timeOut);
    }, [task, fromButton]);

    const formatHours = () => {
        // to be 00:00
        const formattedHours = (durationH || "0").padStart(2, "0");
        const formattedMins = (durationM || "0").padStart(2, "0");
        // change the duration
        if (formattedHours !== "00" && formattedMins !== "00") {
            setDurationH(formattedHours);
            setDurationM(formattedMins);
        }
    };

    const setBreak = () => {
        const breakMinutes = parseInt(taskBreak, 10);
        const repeatTimes = parseInt(breakRepeat, 10);

        if (breakMinutes > 0 && repeatTimes > 0) {
            return repeatTimes;
        } else {
            return 0;
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

        let counter = 0;
        if (taskBreak !== "" && breakRepeat > 0) {
            counter = setBreak(); // set counter of break
        };

        const hh = parseInt(durationH, 10) || 0;
        const mm = parseInt(durationM, 10) || 0;
        const totalMinutes = hh * 60 + mm;

        if (totalMinutes !== 0) {
            // if there is break time, set duration with break, else set the whole duration
            if (parseInt(taskBreak, 10) > 0 && parseInt(breakRepeat, 10) > 0) {
                const division = parseInt(breakRepeat, 10) + 1; // num or repeats + 1 to divide the duration by segments
                const dividedTaskMinutes = totalMinutes / division;
                return { duration: dividedTaskMinutes * 60, counter: counter };
            } else {
                return { duration: totalMinutes * 60, counter: counter };
            };
        } else {
            return { duration: 0, counter: 0 };
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

    const startCounter = () => {
        const { duration, counter } = setDurationBreak();

        if (duration === 0 && counter === 0) {
            Alert.alert(
                "⚠️ Ups!",
                "Please enter a duration",
                [{ text: "Try Again", style: "default" }]
            );
            return;
        } else {
            navigation.navigate("TaskTimer", {
                task: task,
                taskBreak: taskBreak,
                breakCounter: counter,
                durationWithBreak: duration
            });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <LinearGradient
                        colors={[theme.header, theme.linear2]}
                        style={styles.gradient}>

                        {showRoulette ? (<RouletteRandom />) : (
                            <View style={styles.containerInside}>
                                <View style={styles.containerName}>
                                    <Text style={styles.title}>{task.name}</Text>
                                </View>
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
                                        <Text style={[styles.taskText, { color: theme.tabText }]}>Break Minutes</Text>
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
                                            <Text style={[styles.taskText, { color: theme.tabText }]}>Repeat</Text>
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

                                {/* start button */}
                                <View style={styles.startBottom}>
                                    <TouchableOpacity onPress={startCounter}>
                                        <AntDesign name="play" size={50} color={theme.tabText} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
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
        alignItems: "center",
        backgroundColor: theme.container
    },
    containerName: {
        width: "100%",
        padding: 10,
        alignItems: "center",
        backgroundColor: theme.linear2,
        borderRadius: 10
    },
    startBottom: {
        paddingVertical: 20,
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
    }
});

export default DurationBreak;