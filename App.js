import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Index from './app/index';
 
export default function App(){
    return(
        <NavigationContainer>
            <Index />
        </NavigationContainer>
    ); 
}