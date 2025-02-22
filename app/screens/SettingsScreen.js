import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SettingEmotions from './SettingEmotions';

export default function Settings({ navigation }) {

  return (
    <View style={styles.container}>
      <SettingEmotions/>
      
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