import { ActivityIndicator, Text, View, Modal, TouchableOpacity, StyleSheet, Image, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [checkAuth, setCheckAuth] = useState(true); //track if user is auth
  const [logginIn, setLogginIn] = useState(false); // loading in login button

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          navigation.replace("Tabs"); // user is logged in, go to home
        } else {
          navigation.navigate("SignIn");
          setCheckAuth(false); // do not show loading, go to login
        }
      } else {
        setCheckAuth(false);
        navigation.navigate("SignIn");
      }
    });
    return unsubscribe; // clean up when auth change
  }, []);

  // to sign in
  const signIn = async () => {
    setLogginIn(true);
    try {
      // authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // check if user has verified the email
      if (!user.emailVerified) {
        Alert.alert(
          "⚠️ Ups!",
          "Please verify your email before logging in",
          [{ text: "Try Again", style: "default" }]
        );
        return;
      } else { // go home
        navigation.replace("Tabs");
      }
    } catch (error) {
      if (!email || !password) {
        Alert.alert(
          "⚠️ Ups!",
          "Enter email and password",
          [{ text: "Try Again", style: "default" }]
        );
      } else if (error.code === "auth/invalid-credential") {
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
      setLogginIn(false);
    }
  };

  // the forget password text
  const forgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert(
        "⚠️ Ups!",
        "Please enter your email to reset password",
        [{ text: "Try Again", style: "default" }]
      );
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert(
        "✅ Success!",
        "Password reset email sent",
        [{ text: "Close", style: "default" }]
      );
      setForgotPasswordVisible(false);
      setResetEmail("");
    } catch (error) {
      Alert.alert(
        "⚠️ Ups!",
        "Error sending reset email",
        [{ text: "Try Again", style: "default" }]
      );
    }
  }

  if (checkAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D67BD" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

      <View style={styles.container}>
        <Image
          source={require('../../assets/images/logoADHD.png')}
          style={styles.img} />
        <Text style={styles.title}>Welcome</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={[styles.button, styles.btnLogin]} onPress={signIn} disabled={logginIn}>
          {logginIn ? <ActivityIndicator size="small" color="#6D67BD" /> : <Text style={styles.btnTextLogIn}>Log In</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.btnCreate]} onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.btnText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgot} onPress={() => setForgotPasswordVisible(true)}>
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
              <TouchableOpacity onPress={() => setForgotPasswordVisible(false)}>
                <Text style={styles.closeModal}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF"
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
  modalContainer: {
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