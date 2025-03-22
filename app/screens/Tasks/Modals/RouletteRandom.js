import React from "react";
import { Image, View, StyleSheet, Text } from "react-native";

export default function RouletteRandom() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.text}>Selecting Task...</Text>
            <Image
                source={require("../../../../assets/images/roulette.gif")}
                style={styles.img} />
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: "Zain-Regular",
        fontSize: 30,
        color: "#FFFFFF",
        marginBottom: 20
    },
    img: {
        width: 300,
        height: 300
    }
})