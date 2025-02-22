import React, { createContext, useState, useContext } from 'react';

const EmotionContext = createContext();

export const EmotionProvider = ({children}) => {
    const [allEmotions, setAllEmotions] = useState([]);

    return(
        <EmotionContext.Provider value={{ allEmotions, setAllEmotions }}>
            {children}
        </EmotionContext.Provider>
    );
};

export const useEmotions = () => {
    return useContext(EmotionContext);
};