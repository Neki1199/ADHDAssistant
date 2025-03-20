import React, { useContext, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeContext } from '../../../contexts/ThemeContext';

const TasksProgress = () => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <View style={styles.container}>

        </View>
    );
};

const useStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,

    },
    gradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    }
});

export default TasksProgress;