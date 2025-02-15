import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Tasks from './screens/TasksScreen';
import Emotions from './screens/EmotionsScreen';
import Meals from './screens/MealsScreen';
import Focus from './screens/FocusScreen';
import Progress from './screens/ProgressScreen';

const Tab = createBottomTabNavigator();

export default function Index(){
    return(
        <Tab.Navigator initialRouteName="Tasks">
            <Tab.Screen
                name="Tasks"
                component={Tasks}
            />
            <Tab.Screen
                name="Emotions"
                component={Emotions}
            />
            <Tab.Screen
                name="Meals"
                component={Meals}
            />
            <Tab.Screen
                name="Focus"
                component={Focus}
            />
            <Tab.Screen
                name="Progress"
                component={Progress}
            />
        </Tab.Navigator>
    )
}



