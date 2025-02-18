import { Text, View, Modal, SafeAreaView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';

export default function SignInScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState("")
    const [ loading, setLoading ] = useState(false); // loading if user already sign in

    // to sign in
    const signIn = async () => {
      setLoading(true);
      try{
        // authenticate user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // check if user has verified the email
        if(!user.emailVerified) {
          Alert.alert(
            "⚠️ Ups!",
            "Please verify your email before logging in",
            [{ text: "Try Again", style: "default" }]
          );
        } else { // go to home by reseting the stack
          navigation.replace("Home");
        }
      } catch (error) {
        if (!email || !password){
          Alert.alert(
            "⚠️ Ups!",
            "Enter email and password",
            [{ text: "Try Again", style: "default" }]
          );
        } else if(error.code === "auth/invalid-credential"){
          Alert.alert(
            "⚠️ Ups!",
            "Incorrect email or password",
            [{ text: "Try Again", style: "default" }]
          );
        } else {
          console.log(error);
          Alert.alert(
            "⚠️ Ups!",
            "Sign In failed",
            [{ text: "Try Again", style: "default" }]
          );
        }
      } finally {
        setLoading(false);
      }
    }
    
    // the forget password text
    const forgotPassword = async () => {
      if(!resetEmail) {
        Alert.alert(
          "⚠️ Ups!",
          "Please enter your email to reset password",
          [{ text: "Try Again", style: "default" }]
        );
      }

      try{
        await sendPasswordResetEmail(auth, resetEmail);
        Alert.alert(
          "✅ Success!",
          "Password reset email sent",
          [{ text: "Close", style: "default" }]
        );
        setForgotPasswordVisible(false);
        setResetEmail("");
      } catch(error){
        Alert.alert(
          "⚠️ Ups!",
          "Error sending reset email",
          [{ text: "Try Again", style: "default" }]
        );
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
              onChangeText={setPassword} secureTextEntry/>

          <TouchableOpacity style={[styles.button, styles.btnLogin]} onPress={signIn} disabled={loading}>
            <Text style={styles.btnTextLogIn}>{loading ? "Logging In..." : "Log In"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={()=> navigation.navigate("SignUp")}>
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgot} onPress={()=> setForgotPasswordVisible(true)}>
            <Text style={styles.textPassword} >Forgot Password?</Text>
          </TouchableOpacity>

          <Modal transparent={true} visible={forgotPasswordVisible} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalInside}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                />

                <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={forgotPassword}>
                  <Text style={styles.btnText}>Send Reset Link</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> setForgotPasswordVisible(false)}>
                  <Text style={styles.closeModal}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  },
  forgot: {
    marginTop: 10,
    textDecorationLine: 'underline'
  },
  textPassword: {
    color: '#6D67BD',
    fontSize: 12,
    fontWeight: '600'
  },
  modalContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  modalInside: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '800',
    color: '#4B4697'
  },
  closeModal: {
    color: '#4B4697',
    textDecorationLine: 'underline'
  }
});