import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { getTasks } from './TasksDB';
import { LinearGradient } from 'expo-linear-gradient';

const ListUpcoming = ({ route }) => {
    const { list } = route.params;
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsuscribe = getTasks(list, setTasks);
        return () => { if (unsuscribe && typeof unsuscribe === "function") { unsuscribe(); } }
    }, [list]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#7D79C0", "#EBEAF6"]}
                style={styles.gradient}>
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View>
                            <Text>{item.name}</Text>
                        </View>
                    )}
                />
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
        justifyContent: "center",
        backgroundColor: "#4B4697"
    }
});

export default ListUpcoming;