import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

const TasksProgress = () => {

    return (
        <View style={styles.container}>
            <Text>Hello</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B4697"
    },
});

export default TasksProgress;