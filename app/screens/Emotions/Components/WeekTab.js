import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemeContext } from '../../../contexts/ThemeContext';

export const WeekView = ({ allEmotions, countEmotions, chartConfig, pieChart }) => {
    const { theme } = useContext(ThemeContext);
    const styles = useStyles(theme);
    const countedEmotions = countEmotions(allEmotions);

    return (
        <View style={styles.dataContainer}>
            {Object.keys(allEmotions).length > 0 ? (
                <PieChart
                    data={pieChart(countedEmotions)}
                    width={320}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"30"}
                    center={[0, 0]}
                    absolute
                />
            ) : (
                <Text style={styles.text}>No emotions found for this week!</Text>
            )}
        </View >
    );
};

const useStyles = (theme) => StyleSheet.create({
    dataContainer: {
        backgroundColor: theme.container,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "70%",
        elevation: 1,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.88,
        shadowRadius: 2,
    },
    text: {
        fontFamily: "Zain-Regular",
        fontSize: 20,
        color: theme.tabText
    }
});