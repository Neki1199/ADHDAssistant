import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import EmotionsHome from './EmotionsScreen';

export default function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      <EmotionsHome/>
      <View style={styles.tasksView}>

      </View>
      <View style={styles.mealsView}>

      </View>
      <View style={styles.focusView}>

      </View>
      <View style={styles.progressView}>

      </View>            
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#4B4697',
    paddingTop: 10
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