import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings({ navigation }) {

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#7D79C0", "#EBEAF6"]}
        style={styles.gradient}
      >

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});