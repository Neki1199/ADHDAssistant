import React, { useEffect, useState } from 'react';
import { View, Image, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() =>{
    const getUsername = async () => {
        try{
            const user = auth.currentUser; // get current user
            if(user){ // set username
              setUsername(user.displayName);
            }
        } catch(error) {
            console.error("Error fetching user name: ", error);
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
    <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
            <Text>Welcome {username ? username : 'User'}</Text>

            <TouchableOpacity onPress={()=> setShowMenu(!showMenu)}>
                <Image 
                    source={require('../../assets/images/userIcon.png')}
                    style={styles.img}/>
            </TouchableOpacity>
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={()=> setShowMenu(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalMenu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate("Settings")}>
                            <Text>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={handleSignOut}>
                            <Text>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
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
  topBar: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 50,
    width: '100%',
    backgroundColor: '#FFF000'
  },
  img: {
    width: 50,
    height: 50
  },
  midContainer: {

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMenu: {
    width: '50%',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center'
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC'
  }
});