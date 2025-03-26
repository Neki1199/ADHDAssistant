import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from "../../../contexts/ThemeContext";

const Stuck = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <LinearGradient
            colors={[theme.header, theme.linear2]}
            style={styles.gradient}>
            <Text>Stuck</Text>
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 10
    },
});

export default Stuck;