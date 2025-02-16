import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from '@firebase/firestore';

export default function Tasks({ navigation }) {
  const [username, setUsername] = useState("");

  useEffect(() =>{
    const getUsername = async () => {
      const user = auth.currentUser; // get current user
      if(user){ // get user from firestore
        const userData = await getDoc(doc(db, "users", user.uid));
        if(userData.exists()) {
          setUsername(userData.data().name) // set the username
        }
      }
    };
    getUsername();
  }, [])

  // sign out function
  const handleSignOut = async () => {
    await signOut(auth);
    navigation.replace("SignIn");
  };

  return (
    <View style={styles.container}>
      <Text>Hello, {username ? username : 'User'}</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});