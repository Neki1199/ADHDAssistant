import React, { useContext, useEffect, useState } from "react"
import { TouchableOpacity, Keyboard, StyleSheet, Text, View, Image, TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { ThemeContext } from "../../../contexts/ThemeContext";
import RouletteRandom from "../Modals/RouletteRandom";

export default function TasksStart({ route, navigation }) {
    const { task } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const [showRoulette, setShowRoulette] = useState(false);

    const [openTaskScreen, setOpenTaskScreen] = useState(false);
    const [timerCompleted, setTimerCompleted] = useState(false);

    // roulette gif
    useEffect(() => {
        setShowRoulette(true);
        const timeOut = setTimeout(() => {
            setShowRoulette(false);
        }, 4000);

        return () => clearTimeout(timeOut);
    }, [task]);

    return (
        // to touch outside when input writing
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient
                colors={[theme.header, theme.linear2]}
                style={styles.gradient}>

                {showRoulette ? (<RouletteRandom />) : (
                    <>
                        {task && (
                            <>
                                <Text style={styles.title}>The task selected is...</Text>

                                <View style={styles.containerTitle}>
                                    <Text style={styles.title}>{task.name}</Text>
                                </View>
                            </>)}

                        {/* if task has no duration */}
                        {task && !openTaskScreen && (
                            <>
                                <Image
                                    source={require("../../../../assets/images/timer.png")}
                                    style={styles.img} />
                                <View style={styles.askContainer}>

                                    <Text style={styles.textAsk}>Do you want to set a timer?</Text>
                                    <TouchableOpacity style={styles.btn} onPress={() => setOpenTaskScreen(true)}>
                                        <Text style={styles.btnText}>No, I don't need a timer for this!</Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("DurationBreak", { task: task })}>
                                        <Text style={styles.btnText}>Yes, let's start a timer</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* screen for task without timer (show an image and checkbox) */}
                        {openTaskScreen && (
                            <View style={[styles.noDurationContainer, {
                                backgroundColor: theme.name === "dark"
                                    ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.8)"
                            }]}>
                                <Text style={styles.timerTitle}>When the timer stops <Text style={styles.timerTitleStart}>START</Text> your task!</Text>
                                <Text style={styles.timerText}>Even if you don't want to...</Text>
                                {!timerCompleted ? (

                                    <CountdownCircleTimer
                                        isPlaying
                                        duration={10}
                                        colors={
                                            theme.name === "light" ? ["#4B4697", "#7E4697", "#974674", "#CC0000"]
                                                : ["#9891FF", "#B26AD1", "#B34B4B", "#BD0000"]}
                                        colorsTime={[10, 4, 2, 0]}
                                        onComplete={() =>
                                            setTimerCompleted(true)
                                        }
                                        size={150}
                                        trailColor="#FFFFFF"
                                    >
                                        {({ remainingTime }) => {
                                            let textCol;
                                            if (remainingTime > 4) {
                                                textCol = theme.name === "light" ? "#4B4697" : "#9891FF";
                                            } else if (remainingTime === 4) {
                                                textCol = theme.name === "light" ? "#7E4697" : "#B26AD1";
                                            } else if (remainingTime === 3) {
                                                textCol = theme.name === "light" ? "#974674" : "#B34B4B";
                                            } else if (remainingTime < 3) {
                                                textCol = theme.name === "light" ? "#CC0000" : "#BD0000";
                                            }
                                            return (
                                                <Text style={[styles.timeCountdown, { color: textCol }]}>{remainingTime}</Text>
                                            );
                                        }}
                                    </CountdownCircleTimer>
                                ) : (
                                    <TouchableOpacity style={[styles.btn, { marginTop: 20, backgroundColor: theme.header }]} onPress={() => navigation.goBack()}>
                                        <Text style={styles.btnText}>Return To Tasks</Text>
                                    </TouchableOpacity>
                                )}

                            </View>
                        )}
                    </>
                )}
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};


const useStyles = (theme) => StyleSheet.create({
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
