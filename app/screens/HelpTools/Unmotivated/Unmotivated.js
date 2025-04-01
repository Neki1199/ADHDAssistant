import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from "../../../contexts/ThemeContext";

const Unmotivated = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>
            <View style={styles.container}>

                <View style={styles.containerHelp}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#CCFFCC" }]}
                        onPress={() => navigation.navigate("Reward")}>
                        <Text style={[styles.title, { color: "#3C3A5A" }]}>Set A Reward</Text>
                        <Text style={{ fontSize: 40, textAlign: "center" }}>🏅</Text>
                        <Text style={[styles.title, { fontSize: 16 }]}>Reward yourself for your hard work, someting to look forward to!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#FFFFCC" }]}
                        onPress={() => navigation.navigate("Productive")}>
                        <Text style={[styles.title, { color: "#3C3A5A" }]}>Get In Productivity Mode</Text>
                        <Text style={{ fontSize: 40, textAlign: "center" }}>🦸</Text>
                        <Text style={[styles.title, { fontSize: 16 }]}>Step away from distractions, choose a place, a task, and a time to focus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#CCE5FF" }]}
                        onPress={() => navigation.navigate("OnBed")}>
                        <Text style={[styles.title, { color: "#3C3A5A" }]}>Still on my bed or sofa</Text>
                        <Text style={{ fontSize: 40, textAlign: "center" }}>🛌</Text>
                        <Text style={[styles.title, { fontSize: 16 }]}>Awaken your senses and get moving!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    )
};

const useStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 10
    },
    container: {
        width: "90%",
        alignItems: "center"
    },
    title: {
        fontFamily: "Zain-Regular",
        fontSize: 22,
        color: theme.smallText,
        textAlign: "center",
        padding: 10
    },
    containerHelp: {
        height: 600,
        justifyContent: "space-around",
        marginTop: 20
    },
    btn: {
        borderRadius: 10,
        width: 250,
        height: 170
    }
});

export default Unmotivated;