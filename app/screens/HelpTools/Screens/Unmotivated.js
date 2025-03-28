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
                <Text style={styles.title}>You may feel like not doing anything today</Text>
                <Text style={styles.title}>You may feel disinterested or uninspired</Text>
                <Text style={[styles.title, { color: theme.tab }]}>Imagine for a second how good you will feel when the tasks are done</Text>

                <View style={styles.containerHelp}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#CCFFCC" }]}>
                        <Text style={styles.title}>Set A Reward</Text>
                        <Text style={{ fontSize: 50, textAlign: "center" }}>🏅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#FFFFCC" }]}>
                        <Text style={styles.title}>Get In Productivity Mode</Text>
                        <Text style={{ fontSize: 50, textAlign: "center" }}>🦸</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "#CCE5FF" }]}>
                        <Text style={styles.title}>Still on my bed or sofa</Text>
                        <Text style={{ fontSize: 50, textAlign: "center" }}>🛌</Text>
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
        color: "#3C3A5A",
        textAlign: "center"
    },
    containerHelp: {
        height: 500,
        justifyContent: "space-around",
        marginTop: 20
    },
    btn: {
        borderRadius: 10,
        width: 250,
        padding: 20
    }
});

export default Unmotivated;