import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmotionsProgress from './EmotionsProgress';

const Progress = () => {
  return (
    <View style={styles.container}>
      <EmotionsProgress />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4B4697",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default Progress;