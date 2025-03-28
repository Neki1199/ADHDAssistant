import React, { useContext } from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';

import AntDesign from "react-native-vector-icons/AntDesign";

import DrawerHome from './Drawer';
import { ListsTabs } from "./TaskTabs";
import HelpScreen from "../screens/HelpTools/HelpScreen";

import { ThemeContext } from "../contexts/ThemeContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const CustomTab = ({ children, accessibilityState, onPress }) => {
    const focused = accessibilityState.selected;
    const { theme } = useContext(ThemeContext);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: focused ? theme.name === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.1)" : "transparent",
                borderTopWidth: 2,
                borderColor: focused ? theme.tabText : "transparent"
            }}>
            {children}
        </TouchableOpacity>
    )
}

const BottomTabs = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color }) => {
                    let icon;
                    if (route.name === "Home") icon = "home";
                    else if (route.name === "Tasks") icon = "checkcircleo"
                    else if (route.name === "HelpTools") {
                        return <Image source={require("../../assets/images/help.png")}
                            style={{ width: 34, height: 34 }} />;
                    }
                    return <AntDesign name={icon} size={22} color={color} />;
                },
                headerShown: false,
                swipeEnabled: false,
                animationEnabled: false,
                tabBarActiveTintColor: theme.textTabTasks,
                tabBarInactiveTintColor: theme.textTabTasks,
                tabBarActiveBackgroundColor: theme.linear3,
                tabBarStyle: {
                    backgroundColor: theme.linear2,
                    borderColor: "transparent",
                    height: 60,
                    elevation: 0,
                    shadowOpacity: 0
                },
                tabBarLabelStyle: {
                    fontFamily: "Zain-Regular",
                    fontSize: 14
                }
            })}
        >
            <Tab.Screen name="Home" component={DrawerHome}
                options={{
                    tabBarButton: (props) => <CustomTab {...props} />
                }}
            />
            <Tab.Screen name="Tasks" component={ListsTabs}
                initialParams={{ listID: "Daily" }}
                options={({ navigation }) => ({
                    headerShown: false,
                    title: "My Tasks",
                    tabBarButton: (props) => <CustomTab {...props} />
                })}
            />
            <Tab.Screen name="HelpTools" component={HelpScreen}
                options={{
                    title: "Help Tools",
                    headerShown: false,
                    tabBarButton: (props) => <CustomTab {...props} />
                }} />
        </Tab.Navigator>
    );
};

export default BottomTabs;