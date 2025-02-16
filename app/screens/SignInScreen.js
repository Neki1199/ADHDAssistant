import { Text, SafeAreaView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { collection, addDoc } from 'firebase/firestore';

export default function SignInScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        if (!email || !password){
            alert("Please enter email and password");
            return;
        }

        try{
            const user = await signInWithEmailAndPassword(auth, email, password);
            if(user) navigation.replace("Home");
          } catch (error) {
            console.log(error)
            alert('Sign in failed: ' + error.message);
        } 
    }
    

    const signUp = async () => {
        if(!email || !password){
            alert("Please enter email and password");
        }

        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // save user in firestore (email and date creation)
            await addDoc(collection(db, "users"), {
                email: user.email,
                created: new Date(),
            });

            // go to home screen after success sign up
            if(userCredential) navigation.replace("Home");
        } catch (error) {
            console.log(error)
            alert('Sign up failed: ' + error.message);
        } 
    }

    return (
        <SafeAreaView style={styles.container}>
          <Image 
            source={require('../../assets/images/logoADHD.png')}
            style={styles.img}/>
          <Text style={styles.title}>Welcome</Text>
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

          <TouchableOpacity style={[styles.button, styles.btnLogin]} onPress={signIn}>
            <Text style={styles.btnTextLogIn}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={signUp}>
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
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
  btnLogin: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.1
  },
  btnCreate: {
    backgroundColor: '#6D67BD',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  btnTextLogIn: {
    color: '#6D67BD',
    fontSize: 18,
    fontWeight: '600'
  },
  img: {
    width: '100%',
    height: '40%',
    marginBottom: 20
  }
});