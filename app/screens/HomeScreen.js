import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
        
        <View style={styles.midContainer}>
            <View style={styles.emotionsView}>

            </View>
            <View style={styles.tasksView}>

            </View>
            <View style={styles.mealsView}>

            </View>
            <View style={styles.focusView}>

            </View>
            <View style={styles.progressView}>

            </View>            
        </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  img: {
    width: 50,
    height: 50
  },
  midContainer: {
    width: "100%",
    flex: 1
  },
  emotionsView: {

  },
  tasksView: {

  },
  mealsView: {

  },
  focusView: {

  },
  progressView: {

  },
});