import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Switch, TouchableOpacity, Image } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { createDrawerNavigator, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import Progress from "../screens/ProgressScreen";
import HomeScreen from "../screens/HomeScreen";
import Settings from "../screens/SettingsScreen";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ThemeContext } from "../contexts/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerHome({ navigation }) {
    const [username, setUsername] = useState("");
    const { theme, changeTheme, isDark } = useContext(ThemeContext);

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
        <Drawer.Navigator
            initialRouteName="HomeScreen"
            detachInactiveScreens={false}
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}
                        style={{ marginLeft: 15 }}>
                        <AntDesign name="ellipsis1" size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                ),
                swipeEnabled: false,
                drawerType: "slide",
                headerTitle: `Welcome ${username}`,
                headerStyle: {
                    height: 70,
                    backgroundColor: theme.header
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontFamily: "Zain-Regular",
                    fontSize: 30
                },
                headerTitleAlign: "center",
                headerTintColor: "#FFFFFF",
                drawerItemStyle: {
                    borderRadius: 0
                },
                drawerStyle: {
                    backgroundColor: theme.container,
                    width: "60%",
                },
                drawerPosition: "left",
                drawerActiveTintColor: theme.drawerActive,
                drawerLabelStyle: {
                    color: theme.name === "dark" && "#C0C0C0",
                    fontFamily: "monospace",
                }
            })}
            backBehavior="initialRoute"
            drawerContent={(props) => (
                <View style={{ flex: 1 }}>
                    <View style={styles.headerInsideDrawer}>
                        <Image
                            source={require("../../assets/images/logoOnly.png")}
                            style={styles.img} />
                    </View>
                    <DrawerItemList {...props} />
                    <DrawerItem
                        label="Log Out"
                        onPress={handleSignOut}
                        style={{ borderRadius: 0 }}
                        labelStyle={{ color: "#FFFFFF", fontFamily: "monospace" }}
                        inactiveBackgroundColor={theme.drawerActive}
                        icon={() =>
                            <AntDesign color="#FFFFFF" size={25} name={"logout"} />}
                    />
                    <View style={{ flex: 1, justifyContent: "flex-end", bottom: 10 }}>
                        <DrawerItem
                            label={!isDark ? "Light Theme" : "Dark Theme"}
                            style={{ borderRadius: 0, borderTopWidth: 1, borderColor: "#C0C0C0" }}
                            labelStyle={{ color: theme.text, fontFamily: "monospace" }}
                            icon={() =>
                                <Switch
                                    trackColor={{ false: "#98CCFF", true: "#24214A" }}
                                    thumbColor={isDark ? "#E0E0E0" : "#FCE573"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={changeTheme}
                                    value={isDark}
                                />}
                        />
                    </View>
                </View>
            )}
        >
            <Drawer.Screen name="HomeScreen" component={HomeScreen}
                options={{
                    title: "Home",
                    drawerIcon: () => (
                        <AntDesign color={theme.tabText} size={25} name={"home"} />)
                }} />
            <Drawer.Screen name="Progress" component={Progress}
                options={{
                    headerTitle: "Progress",
                    drawerIcon: () => (
                        <AntDesign color={theme.tabText} size={25} name={"linechart"} />)
                }} />
            <Drawer.Screen name="Settings" component={Settings}
                options={{
                    headerTitle: "Settings",
                    drawerIcon: () => (
                        <AntDesign color={theme.tabText} size={26} name={"setting"} />)
                }} />
        </Drawer.Navigator>
    );
};


const styles = StyleSheet.create({
    img: {
        width: 100,
        height: 80
    },
    headerInsideDrawer: {
        height: 100,
        backgroundColor: "#CFAEA7",
        justifyContent: "center",
        alignItems: "center"
    }
});