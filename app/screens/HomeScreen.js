import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import EmotionsHome from "../screens/Emotions/EmotionsScreen";
import TasksHome from "../screens/Tasks/TasksScreen"

export default function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      <EmotionsHome />
      <TasksHome />
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#4B4697',
    paddingTop: 10,
    gap: 30
  }
});