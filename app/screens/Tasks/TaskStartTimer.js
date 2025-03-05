import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { getTasks } from './TasksDB';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from 'dayjs';

const TaskTimer = ({ route }) => {
    const { time } = route.params;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#7D79C0", "#EBEAF6"]}
                style={styles.gradient}>
                <Text>{time}</Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    gradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#4B4697"
    },
});

export default TaskTimer;