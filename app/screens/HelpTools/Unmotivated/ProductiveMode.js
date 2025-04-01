import { Text, StyleSheet, View } from "react-native";
import React from "react"
import { ThemeContext } from "../../../contexts/ThemeContext";
import { useContext } from "react";

const ProductiveMode = () => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);

    return (
        <View>
            <Text>ProductiveMode</Text>
        </View>
    )
}

const useStyles = (theme) => StyleSheet.create({})

export default ProductiveMode;