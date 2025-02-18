import { Text, SafeAreaView, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { updateProfile, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { collection, addDoc } from 'firebase/firestore';


export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signUp = async () => {
      if(!name || !password || !email){
        Alert.alert(
          "⚠️ Ups!",
          "Please enter all fields",
          [{ text: "Try Again", style: "default" }]
        );
        return; // to not execute anything else
      }

      try{
        // create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // set name in auth to then display in home
        await updateProfile(user, {
          displayName: name
        });

        // save user in firestore (email and date creation)
        await addDoc(collection(db, "users"), {
            name: name,
            email: user.email,
            created: new Date(),
        });

        // send email verification
        await sendEmailVerification(user);
        // confirm success
        Alert.alert(
          "✅ Succes!",
          "Verification email sent.\nPlease check your inbox to continue.",
          [{ text: "Close", style: "default" }]
        );

        // go to sign in screen after success sign up
        if(userCredential) navigation.navigate("SignIn");
      } catch (error) {
        if(error.code === "auth/email-already-in-use"){
          Alert.alert(
            "⚠️ Ups!",
            "Email already in use",
            [{ text: "Close", style: "default" }]
          );
        } else if(error.code === "auth/weak-password"){
          Alert.alert(
            "⚠️ Ups!",
            "Password should be at least 6 characters",
            [{ text: "Try Again", style: "default" }]
          );
        } else {
          Alert.alert(
            "⚠️ Ups!",
            "Sign Up failed",
            [{ text: "Try Again", style: "default" }]
          );
        }
      }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                style={styles.input} 
                placeholder="Name"
                value={name}
                onChangeText={setName}/>
            <TextInput
                style={styles.input} 
                placeholder="Email"
                value={email}
                onChangeText={setEmail}/>
            <TextInput 
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}/>

            <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={signUp}>
                <Text style={styles.btnText}>Create Account</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
      backgroundColor: '#FFFFFF'
    },
    title: {
      fontSize: 40,
      marginBottom: 40,
      fontWeight: '800',
      color: '#4B4697'
    },
    input: {
      width: '90%',
      height: 60,
      backgroundColor: '#F0F0F0',
      borderRadius: 20,
      marginBottom: 10,
      padding: 20
    },
    button: {
      width: '90%',
      alignItems: 'center',
      padding: 20,
      fontSize: 18,
      marginVertical: 10,
      borderRadius: 30,
      shadowColor: '#5C6BC0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 5
    },
    btnCreate: {
      backgroundColor: '#6D67BD',
    },
    btnText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600'
    }
  });