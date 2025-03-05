import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { createDrawerNavigator, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Progress from '../screens/ProgressScreen';
import HomeScreen from '../screens/HomeScreen';
import Settings from '../screens/SettingsScreen';
import AntDesign from "react-native-vector-icons/AntDesign";

const Drawer = createDrawerNavigator();

export default function TopDrawer({ navigation }) {
    const [username, setUsername] = useState("");

    useEffect(() => {
        const getUsername = async () => {
            try {
                const user = auth.currentUser; // get current user
                if (user) { // set username to display on screen
                    setUsername(user.displayName || "User");
                }
            } catch (error) {
                console.error("Error fetching user name: ", error);
            }
        };
        getUsername();
    }, [])

    // sign out function
    const handleSignOut = async () => {
        await signOut(auth);
        navigation.reset({
            index: 0,
            routes: [{ name: "SignIn" }]
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Drawer.Navigator
                initialRouteName="HomeScreen"
                screenOptions={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()}
                            style={{ marginLeft: 15 }}>
                            <AntDesign name="ellipsis1" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                    ),
                    swipeEnabled: false,
                    drawerType: 'back',
                    headerTitle: `Welcome ${username}`,
                    headerStyle: {
                        height: 70,
                        backgroundColor: '#7D79C0',
                        elevation: 0, // android
                        shadowOpacity: 0, // ios
                    },
                    headerShadowVisible: false, // ios
                    headerTitleStyle: {
                        fontFamily: 'Zain-Regular',
                        fontSize: 30
                    },
                    headerTitleAlign: 'center',
                    headerTintColor: '#FFFFFF',
                    drawerItemStyle: {
                        borderRadius: 0
                    },
                    drawerStyle: {
                        backgroundColor: '#FFFFFF',
                        width: "60%",
                    },
                    drawerPosition: 'left',
                    drawerActiveTintColor: '#6D67BD',
                    drawerLabelStyle: {
                        fontFamily: 'monospace',
                    }
                })}
                backBehavior='initialRoute'
                drawerContent={(props) => (
                    <View style={{ flex: 1 }}>
                        <View style={styles.headerInsideDrawer}>
                            <Image
                                source={require('../../assets/images/logoOnly.png')}
                                style={styles.img} />
                        </View>
                        <DrawerItemList {...props} />
                        <DrawerItem
                            label="Log Out"
                            onPress={handleSignOut}
                            style={{ borderRadius: 0 }}
                            labelStyle={{ color: '#FFFFFF', fontFamily: 'monospace' }}
                            inactiveBackgroundColor='#6D67BD'
                            icon={({ color, size }) =>
                                <AntDesign color='#FFFFFF' size={25} name={'logout'} />}
                        />
                    </View>
                )}
            >
                <Drawer.Screen name="HomeScreen" component={HomeScreen}
                    options={{
                        title: "Home",
                        drawerIcon: () => (
                            <AntDesign color='#4B4697' size={25} name={'home'} />)
                    }} />
                <Drawer.Screen name="Progress" component={Progress}
                    options={{
                        headerTitle: "Progress",
                        drawerIcon: () => (
                            <AntDesign color='#4B4697' size={25} name={'linechart'} />)
                    }} />
                <Drawer.Screen name="Settings" component={Settings}
                    options={{
                        headerTitle: "Settings",
                        drawerIcon: () => (
                            <AntDesign color='#4B4697' size={26} name={'setting'} />)
                    }} />
            </Drawer.Navigator>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    img: {
        width: 100,
        height: 80,
    },
    headerInsideDrawer: {
        height: 100,
        backgroundColor: '#CFAEA7',
        justifyContent: 'center',
        alignItems: 'center',
    }
});